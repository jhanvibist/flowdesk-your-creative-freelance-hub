import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, generateInvoiceNumber, toDateInputValue } from "@/lib/format";
import { ArrowLeft, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; name: string }
interface Item { description: string; quantity: number; rate: number }
interface WorkLog { id: string; project: string | null; work_date: string; hours: number; hourly_rate: number; description: string | null }

const InvoiceEditor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [unbilledLogs, setUnbilledLogs] = useState<WorkLog[]>([]);

  const [clientId, setClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [issueDate, setIssueDate] = useState(toDateInputValue(new Date()));
  const [dueDate, setDueDate] = useState(toDateInputValue(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)));
  const [taxRate, setTaxRate] = useState(18); // GST default 18%
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, rate: 0 }]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: c } = await supabase.from("clients").select("id, name").order("name");
      setClients((c as Client[]) || []);

      if (isEdit) {
        const [{ data: inv }, { data: its }] = await Promise.all([
          supabase.from("invoices").select("*").eq("id", id!).single(),
          supabase.from("invoice_items").select("description, quantity, rate").eq("invoice_id", id!),
        ]);
        if (inv) {
          setClientId(inv.client_id ?? "");
          setInvoiceNumber(inv.invoice_number);
          setIssueDate(inv.issue_date);
          setDueDate(inv.due_date);
          setTaxRate(Number(inv.tax_rate));
          setNotes(inv.notes ?? "");
          setStatus(inv.status);
        }
        if (its && its.length) {
          setItems(its.map((i) => ({ description: i.description, quantity: Number(i.quantity), rate: Number(i.rate) })));
        }
      }
      setLoading(false);
    };
    if (user) init();
  }, [user, id, isEdit]);

  // Load unbilled logs when client picked (for "fill from work logs")
  useEffect(() => {
    if (!clientId || isEdit) { setUnbilledLogs([]); return; }
    supabase.from("work_logs")
      .select("id, project, work_date, hours, hourly_rate, description")
      .eq("client_id", clientId).eq("billed", false)
      .then(({ data }) => setUnbilledLogs(data || []));
  }, [clientId, isEdit]);

  const fillFromWorkLogs = () => {
    if (unbilledLogs.length === 0) {
      toast.info("No unbilled work logs for this client");
      return;
    }
    const newItems: Item[] = unbilledLogs.map((l) => ({
      description: `${l.project ?? "Work"} — ${new Date(l.work_date).toLocaleDateString("en-IN")}${l.description ? ` (${l.description})` : ""}`,
      quantity: Number(l.hours),
      rate: Number(l.hourly_rate),
    }));
    setItems(newItems);
    toast.success(`Added ${newItems.length} entries from work logs`);
  };

  const updateItem = (idx: number, key: keyof Item, value: string | number) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [key]: typeof value === "string" && key !== "description" ? parseFloat(value) || 0 : value } : it));
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.rate || 0), 0);
  const taxAmount = subtotal * (Number(taxRate) || 0) / 100;
  const total = subtotal + taxAmount;

  const save = async () => {
    if (!clientId) return toast.error("Pick a client");
    if (items.length === 0 || items.some(i => !i.description.trim())) return toast.error("Add at least one valid line item");

    setSaving(true);
    const payload = {
      user_id: user!.id,
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal, tax_rate: taxRate, tax_amount: taxAmount, total,
      notes: notes || null,
      status: status as "draft" | "sent" | "paid" | "partial" | "overdue",
      currency: "INR",
    };

    let invoiceId = id;
    if (isEdit) {
      const { error } = await supabase.from("invoices").update(payload).eq("id", id!);
      if (error) { setSaving(false); return toast.error(error.message); }
      await supabase.from("invoice_items").delete().eq("invoice_id", id!);
    } else {
      const { data, error } = await supabase.from("invoices").insert(payload).select("id").single();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "Failed"); }
      invoiceId = data.id;
    }

    const { error: itemsErr } = await supabase.from("invoice_items").insert(
      items.map((it) => ({
        invoice_id: invoiceId!,
        user_id: user!.id,
        description: it.description,
        quantity: it.quantity,
        rate: it.rate,
        amount: Number(it.quantity) * Number(it.rate),
      }))
    );
    if (itemsErr) { setSaving(false); return toast.error(itemsErr.message); }

    // Mark linked work logs billed (only on create)
    if (!isEdit && unbilledLogs.length > 0 && items.length === unbilledLogs.length) {
      await supabase.from("work_logs").update({ billed: true, invoice_id: invoiceId }).in("id", unbilledLogs.map(l => l.id));
    }

    setSaving(false);
    toast.success(isEdit ? "Invoice updated" : "Invoice created");
    navigate(`/invoices/${invoiceId}`);
  };

  if (loading) {
    return <AppShell><div className="p-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full rounded-2xl" /></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild><Link to="/invoices"><ArrowLeft className="w-4 h-4" /></Link></Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit invoice" : "New invoice"}</h1>
              <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/invoices")}>Cancel</Button>
            <Button variant="wave" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save invoice"}</Button>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-5 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No clients yet — <Link to="/clients" className="text-primary">add one</Link></div>
                  ) : clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice number</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Issue date</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {!isEdit && unbilledLogs.length > 0 && (
            <div className="rounded-xl border border-dashed border-primary/30 bg-accent/30 p-4 flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">{unbilledLogs.length} unbilled work {unbilledLogs.length === 1 ? "log" : "logs"} for this client</div>
                <div className="text-xs text-muted-foreground">Auto-fill the items below from your tracked hours.</div>
              </div>
              <Button variant="wave-outline" size="sm" onClick={fillFromWorkLogs}><Wand2 className="w-4 h-4" /> Fill from work logs</Button>
            </div>
          )}

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Line items</Label>
              <Button variant="ghost" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add line</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                  <Input
                    className="col-span-12 md:col-span-6"
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                  />
                  <Input
                    className="col-span-4 md:col-span-2"
                    type="number" step="0.01"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  />
                  <Input
                    className="col-span-4 md:col-span-2"
                    type="number" step="1"
                    placeholder="Rate"
                    value={it.rate}
                    onChange={(e) => updateItem(idx, "rate", e.target.value)}
                  />
                  <div className="col-span-3 md:col-span-1 text-right text-sm font-medium pt-2.5">
                    {formatINR(Number(it.quantity || 0) * Number(it.rate || 0))}
                  </div>
                  <Button variant="ghost" size="icon" className="col-span-1 text-destructive" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/40">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Notes (terms, thank you, bank details…)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Bank: HDFC · A/c: XXXX1234 · IFSC: HDFC0000123&#10;Thank you for the work!" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">GST</span>
                  <Input
                    type="number" step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="h-7 w-16 text-xs"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <span className="font-medium">{formatINR(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-border/40">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default InvoiceEditor;
