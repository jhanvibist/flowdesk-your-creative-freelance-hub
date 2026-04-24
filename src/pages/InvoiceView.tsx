import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, formatDateIN, toDateInputValue } from "@/lib/format";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Receipt, Pencil, Plus, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { InvoiceAttachmentsCard, ClientPortalCard } from "@/components/InvoiceExtras";

interface Profile { full_name: string | null; business_name: string | null; gstin: string | null; pan: string | null; phone: string | null }
interface Client { id: string; name: string; company: string | null; email: string | null; phone: string | null; gstin: string | null; address: string | null }
interface Invoice {
  id: string; invoice_number: string; issue_date: string; due_date: string;
  subtotal: number; tax_rate: number; tax_amount: number; total: number; amount_paid: number;
  status: string; notes: string | null; client_id: string | null;
}
interface Item { id: string; description: string; quantity: number; rate: number; amount: number }
interface Payment { id: string; amount: number; payment_date: string; method: string | null }

const statusStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2; label: string }> = {
  paid: { bg: "bg-status-paid-bg", text: "text-status-paid", icon: CheckCircle2, label: "Paid" },
  sent: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Sent" },
  partial: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Partial" },
  overdue: { bg: "bg-status-overdue-bg", text: "text-status-overdue", icon: AlertCircle, label: "Overdue" },
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Receipt, label: "Draft" },
};

const InvoiceView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", payment_date: toDateInputValue(new Date()), method: "UPI" });

  const load = async () => {
    setLoading(true);
    const { data: inv } = await supabase.from("invoices").select("*").eq("id", id!).single();
    if (!inv) { setLoading(false); return; }
    setInvoice(inv as unknown as Invoice);

    const [{ data: its }, { data: cl }, { data: pr }, { data: pays }] = await Promise.all([
      supabase.from("invoice_items").select("*").eq("invoice_id", id!),
      inv.client_id ? supabase.from("clients").select("*").eq("id", inv.client_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("profiles").select("full_name, business_name, gstin, pan, phone").eq("id", user!.id).maybeSingle(),
      supabase.from("payments").select("id, amount, payment_date, method").eq("invoice_id", id!).order("payment_date", { ascending: false }),
    ]);
    setItems((its as Item[]) || []);
    setClient((cl as unknown as Client) || null);
    setProfile((pr as Profile) || null);
    setPayments((pays as Payment[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (user && id) load(); }, [user, id]);

  const recordPayment = async () => {
    const amt = parseFloat(payForm.amount);
    if (isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");
    const { error } = await supabase.from("payments").insert({
      user_id: user!.id, invoice_id: id!, amount: amt,
      payment_date: payForm.payment_date, method: payForm.method,
    });
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setPayOpen(false);
    setPayForm({ amount: "", payment_date: toDateInputValue(new Date()), method: "UPI" });
    load();
  };

  const markStatus = async (newStatus: "draft" | "sent" | "paid" | "partial" | "overdue") => {
    const { error } = await supabase.from("invoices").update({ status: newStatus }).eq("id", id!);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  if (loading) {
    return <AppShell><div className="p-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full rounded-2xl" /></div></AppShell>;
  }
  if (!invoice) {
    return <AppShell><div className="p-8">Invoice not found.</div></AppShell>;
  }

  const today = new Date();
  const isOverdueByDate = ["sent", "partial"].includes(invoice.status) && new Date(invoice.due_date) < today;
  const effective = isOverdueByDate ? "overdue" : invoice.status;
  const s = statusStyles[effective] ?? statusStyles.draft;
  const remaining = Number(invoice.total) - Number(invoice.amount_paid || 0);

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild><Link to="/invoices"><ArrowLeft className="w-4 h-4" /></Link></Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{invoice.invoice_number}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${s.bg} ${s.text}`}>
                <s.icon className="w-3 h-3" /> {s.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {invoice.status === "draft" && (
              <Button variant="wave-outline" onClick={() => markStatus("sent")}>Mark as sent</Button>
            )}
            {remaining > 0 && (
              <Button variant="wave" onClick={() => { setPayForm({ ...payForm, amount: String(remaining) }); setPayOpen(true); }}>
                <IndianRupee className="w-4 h-4" /> Record payment
              </Button>
            )}
            <Button variant="ghost" asChild><Link to={`/invoices/${invoice.id}/edit`}><Pencil className="w-4 h-4" /> Edit</Link></Button>
          </div>
        </div>

        {/* Invoice card */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
          <div className="gradient-wave px-6 md:px-10 py-8 text-primary-foreground">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80">From</div>
                <div className="text-xl font-bold">{profile?.business_name || profile?.full_name || "Your business"}</div>
                {profile?.gstin && <div className="text-xs opacity-90 mt-1">GSTIN: {profile.gstin}</div>}
                {profile?.pan && <div className="text-xs opacity-90">PAN: {profile.pan}</div>}
                {profile?.phone && <div className="text-xs opacity-90">📞 {profile.phone}</div>}
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider opacity-80">Total</div>
                <div className="text-3xl md:text-4xl font-bold">{formatINR(invoice.total)}</div>
                {remaining > 0 && remaining < invoice.total && (
                  <div className="text-xs opacity-90 mt-1">Remaining: {formatINR(remaining)}</div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 py-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bill to</div>
                <div className="font-semibold">{client?.name ?? "—"}</div>
                {client?.company && <div className="text-muted-foreground">{client.company}</div>}
                {client?.email && <div className="text-muted-foreground">{client.email}</div>}
                {client?.phone && <div className="text-muted-foreground">{client.phone}</div>}
                {client?.gstin && <div className="text-muted-foreground text-xs mt-1">GSTIN: {client.gstin}</div>}
                {client?.address && <div className="text-muted-foreground text-xs mt-1 whitespace-pre-line">{client.address}</div>}
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Issue date</div>
                <div className="font-semibold">{formatDateIN(invoice.issue_date)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Due date</div>
                <div className="font-semibold">{formatDateIN(invoice.due_date)}</div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-xs text-muted-foreground uppercase">
                    <th className="text-left font-medium px-4 py-3">Description</th>
                    <th className="text-right font-medium px-4 py-3">Qty</th>
                    <th className="text-right font-medium px-4 py-3">Rate</th>
                    <th className="text-right font-medium px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t border-border/40">
                      <td className="px-4 py-3">{it.description}</td>
                      <td className="px-4 py-3 text-right">{Number(it.quantity)}</td>
                      <td className="px-4 py-3 text-right">{formatINR(it.rate)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatINR(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full md:w-72 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(invoice.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST ({invoice.tax_rate}%)</span><span>{formatINR(invoice.tax_amount)}</span></div>
                <div className="flex justify-between border-t border-border/40 pt-2"><span className="font-semibold">Total</span><span className="font-bold">{formatINR(invoice.total)}</span></div>
                {Number(invoice.amount_paid) > 0 && (
                  <>
                    <div className="flex justify-between text-status-paid"><span>Paid</span><span>−{formatINR(invoice.amount_paid)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Remaining</span><span>{formatINR(remaining)}</span></div>
                  </>
                )}
              </div>
            </div>

            {invoice.notes && (
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</div>
                <div className="text-sm whitespace-pre-line">{invoice.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Payments</h3>
            {remaining > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setPayForm({ ...payForm, amount: String(remaining) }); setPayOpen(true); }}>
                <Plus className="w-3.5 h-3.5" /> Record payment
              </Button>
            )}
          </div>
          {payments.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">No payments yet.</div>
          ) : (
            <div className="divide-y divide-border/40">
              {payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-status-paid-bg flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-status-paid" /></div>
                    <div>
                      <div className="text-sm font-medium">{formatINR(p.amount)}</div>
                      <div className="text-xs text-muted-foreground">{formatDateIN(p.payment_date)} · {p.method ?? "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InvoiceAttachmentsCard invoiceId={invoice.id} />
          <ClientPortalCard invoiceId={invoice.id} />
        </div>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input type="number" step="1" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment date</Label>
              <Input type="date" value={payForm.payment_date} onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={payForm.method} onValueChange={(v) => setPayForm({ ...payForm, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button variant="wave" onClick={recordPayment}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default InvoiceView;
