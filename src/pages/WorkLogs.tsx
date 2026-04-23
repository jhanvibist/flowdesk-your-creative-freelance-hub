import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, formatDateIN, toDateInputValue } from "@/lib/format";
import { Plus, Pencil, Trash2, Timer, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import emptyWork from "@/assets/empty-work.png";

interface Client { id: string; name: string }
interface WorkLog {
  id: string; client_id: string | null; project: string | null; work_date: string;
  hours: number; hourly_rate: number; description: string | null; billed: boolean;
  client?: { name: string } | null;
}

const emptyForm = {
  client_id: "", project: "", work_date: toDateInputValue(new Date()),
  hours: "", hourly_rate: "", description: "",
};

const WorkLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from("work_logs").select("*, client:clients(name)").order("work_date", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    setLogs((l as unknown as WorkLog[]) || []);
    setClients((c as Client[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (l: WorkLog) => {
    setEditingId(l.id);
    setForm({
      client_id: l.client_id ?? "",
      project: l.project ?? "",
      work_date: l.work_date,
      hours: String(l.hours),
      hourly_rate: String(l.hourly_rate),
      description: l.description ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    const hours = parseFloat(form.hours);
    const rate = parseFloat(form.hourly_rate);
    if (!form.work_date || isNaN(hours) || isNaN(rate)) {
      toast.error("Date, hours and rate are required");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user!.id,
      client_id: form.client_id || null,
      project: form.project || null,
      work_date: form.work_date,
      hours, hourly_rate: rate,
      description: form.description || null,
    };
    const { error } = editingId
      ? await supabase.from("work_logs").update(payload).eq("id", editingId)
      : await supabase.from("work_logs").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Work log updated" : "Work logged");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this work log?")) return;
    const { error } = await supabase.from("work_logs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const totalHours = logs.reduce((s, l) => s + Number(l.hours), 0);
  const totalAmount = logs.reduce((s, l) => s + Number(l.hours) * Number(l.hourly_rate), 0);
  const unbilledAmount = logs.filter(l => !l.billed).reduce((s, l) => s + Number(l.hours) * Number(l.hourly_rate), 0);

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Work logs</h1>
            <p className="text-sm text-muted-foreground mt-1">Every billable hour, beautifully tracked.</p>
          </div>
          <Button variant="wave" onClick={openNew}><Plus className="w-4 h-4" /> Log work</Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total hours</div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total billable</div>
            <div className="text-2xl font-bold">{formatINR(totalAmount)}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Unbilled</div>
            <div className="text-2xl font-bold text-status-pending">{formatINR(unbilledAmount)}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : logs.length === 0 ? (
            <EmptyState
              image={emptyWork}
              title="No work logged yet"
              description="Log your hours as you go — turn them into invoices in one tap."
              action={<Button variant="wave" onClick={openNew}><Plus className="w-4 h-4" /> Log first entry</Button>}
            />
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="text-left font-medium px-6 py-3">Date</th>
                      <th className="text-left font-medium px-6 py-3">Client / project</th>
                      <th className="text-right font-medium px-6 py-3">Hours</th>
                      <th className="text-right font-medium px-6 py-3">Rate</th>
                      <th className="text-right font-medium px-6 py-3">Amount</th>
                      <th className="text-left font-medium px-6 py-3">Status</th>
                      <th className="w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-t border-border/40 hover:bg-muted/40 transition-smooth">
                        <td className="px-6 py-4">{formatDateIN(l.work_date)}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{l.client?.name ?? "—"}</div>
                          {l.project && <div className="text-xs text-muted-foreground">{l.project}</div>}
                        </td>
                        <td className="px-6 py-4 text-right">{Number(l.hours).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{formatINR(l.hourly_rate)}</td>
                        <td className="px-6 py-4 text-right font-semibold">{formatINR(Number(l.hours) * Number(l.hourly_rate))}</td>
                        <td className="px-6 py-4">
                          {l.billed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-status-paid-bg text-status-paid">
                              <CheckCircle2 className="w-3 h-3" /> Billed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              <Timer className="w-3 h-3" /> Unbilled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-border/40">
                {logs.map((l) => (
                  <div key={l.id} className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium">{l.client?.name ?? "—"}</div>
                      <div className="font-semibold">{formatINR(Number(l.hours) * Number(l.hourly_rate))}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateIN(l.work_date)} · {l.hours}h × {formatINR(l.hourly_rate)}
                    </div>
                    {l.project && <div className="text-xs text-muted-foreground mt-0.5">{l.project}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit work log" : "Log work"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Project</Label>
              <Input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} placeholder="Brand redesign" />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.work_date} onChange={(e) => setForm({ ...form, work_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Hours</Label>
              <Input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="2.5" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Hourly rate (₹)</Label>
              <Input type="number" step="1" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} placeholder="1500" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>
          {form.hours && form.hourly_rate && (
            <div className="text-sm text-muted-foreground border-t border-border/40 pt-3">
              Total: <span className="font-semibold text-foreground">
                {formatINR(parseFloat(form.hours || "0") * parseFloat(form.hourly_rate || "0"))}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="wave" onClick={save} disabled={saving}>{saving ? "Saving…" : editingId ? "Update" : "Save log"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default WorkLogs;
