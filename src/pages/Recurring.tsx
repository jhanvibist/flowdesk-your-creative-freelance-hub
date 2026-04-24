import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatINR, formatDateIN } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { Repeat, Plus, Play, Trash2 } from "lucide-react";
import emptyImg from "@/assets/empty-invoices.png";

interface Recurring {
  id: string;
  template_name: string;
  client_id: string | null;
  interval: string;
  next_run_date: string;
  active: boolean;
  amount: number;
  tax_rate: number;
  notes: string | null;
  last_generated_at: string | null;
}

interface Client { id: string; name: string }

const Recurring = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Recurring[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const [form, setForm] = useState({
    template_name: "",
    client_id: "",
    interval: "monthly",
    next_run_date: new Date().toISOString().slice(0, 10),
    amount: 0,
    tax_rate: 18,
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: recs }, { data: cls }] = await Promise.all([
      supabase.from("recurring_invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    setItems((recs as Recurring[]) ?? []);
    setClients((cls as Client[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    if (!form.template_name) { toast.error("Template name required"); return; }
    const { error } = await supabase.from("recurring_invoices").insert({
      user_id: user.id,
      template_name: form.template_name,
      client_id: form.client_id || null,
      interval: form.interval as any,
      next_run_date: form.next_run_date,
      amount: Number(form.amount),
      tax_rate: Number(form.tax_rate),
      notes: form.notes || null,
      line_items: [{ description: form.template_name, quantity: 1, rate: Number(form.amount), amount: Number(form.amount) }],
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Recurring invoice created");
    setOpen(false);
    setForm({ template_name: "", client_id: "", interval: "monthly", next_run_date: new Date().toISOString().slice(0, 10), amount: 0, tax_rate: 18, notes: "" });
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("recurring_invoices").update({ active }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("recurring_invoices").delete().eq("id", id);
    toast.success("Removed");
    load();
  };

  const runNow = async () => {
    setRunning(true);
    const { data, error } = await supabase.functions.invoke("generate-recurring-invoices");
    setRunning(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${(data as any)?.generated_count ?? 0} invoice(s) generated`);
    load();
  };

  return (
    <AppShell>
      <div className="container py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Automation</div>
            <h1 className="text-3xl md:text-4xl font-bold">Recurring invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">Set it once. We'll bill it on schedule.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="wave-outline" onClick={runNow} disabled={running}>
              <Play className="w-4 h-4" /> {running ? "Running…" : "Run now"}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="wave"><Plus className="w-4 h-4" /> New</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>New recurring invoice</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Template name</Label><Input value={form.template_name} onChange={(e) => setForm({ ...form, template_name: e.target.value })} placeholder="Monthly retainer — Acme" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Client</Label>
                      <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Interval</Label>
                      <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Next run</Label><Input type="date" value={form.next_run_date} onChange={(e) => setForm({ ...form, next_run_date: e.target.value })} /></div>
                    <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                    <div><Label>GST %</Label><Input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} /></div>
                  </div>
                  <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
                <DialogFooter><Button variant="wave" onClick={create}>Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <EmptyState image={emptyImg} title="No recurring invoices yet" description="Create a template to auto-bill clients on a schedule." />
        ) : (
          <div className="grid gap-4">
            {items.map((r) => (
              <div key={r.id} className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-xl gradient-wave flex items-center justify-center text-primary-foreground"><Repeat className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.template_name}</div>
                  <div className="text-xs text-muted-foreground">Every {r.interval} • Next: {formatDateIN(r.next_run_date)} • {formatINR(r.amount)}</div>
                </div>
                <Switch checked={r.active} onCheckedChange={(v) => toggle(r.id, v)} />
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Recurring;
