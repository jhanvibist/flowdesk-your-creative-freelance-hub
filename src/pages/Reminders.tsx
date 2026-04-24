import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDateIN } from "@/lib/format";
import { Bell, Send } from "lucide-react";

interface Settings {
  auto_reminders_enabled: boolean;
  days_before_due: number;
  overdue_cadence_days: number;
  reply_to_email: string | null;
  signature: string | null;
}

interface Reminder {
  id: string;
  invoice_id: string;
  reminder_type: string;
  status: string;
  sent_at: string | null;
  scheduled_at: string;
}

const Reminders = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    auto_reminders_enabled: true,
    days_before_due: 3,
    overdue_cadence_days: 7,
    reply_to_email: "",
    signature: "",
  });
  const [history, setHistory] = useState<Reminder[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: s }, { data: h }, { data: invs }] = await Promise.all([
      supabase.from("reminder_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("invoice_reminders").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("invoices").select("id, invoice_number, total, due_date, status").in("status", ["sent", "overdue", "partial"]).order("due_date"),
    ]);
    if (s) setSettings(s as any);
    setHistory((h as Reminder[]) ?? []);
    setInvoices(invs ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("reminder_settings").upsert({
      user_id: user.id, ...settings,
    });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const sendNow = async (invoiceId: string, type = "before_due") => {
    setSending(invoiceId);
    const { error } = await supabase.functions.invoke("send-invoice-reminder", {
      body: { invoice_id: invoiceId, reminder_type: type },
    });
    setSending(null);
    if (error) toast.error(error.message); else { toast.success("Reminder logged"); load(); }
  };

  return (
    <AppShell>
      <div className="container py-8 md:py-12 space-y-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Automation</div>
          <h1 className="text-3xl md:text-4xl font-bold">Automatic reminders</h1>
          <p className="text-sm text-muted-foreground mt-1">Gentle nudges that get you paid faster.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2 font-semibold"><Bell className="w-4 h-4 text-primary" /> Settings</div>
            <div className="flex items-center justify-between">
              <Label>Enable auto reminders</Label>
              <Switch checked={settings.auto_reminders_enabled} onCheckedChange={(v) => setSettings({ ...settings, auto_reminders_enabled: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Days before due</Label><Input type="number" value={settings.days_before_due} onChange={(e) => setSettings({ ...settings, days_before_due: Number(e.target.value) })} /></div>
              <div><Label>Overdue cadence (days)</Label><Input type="number" value={settings.overdue_cadence_days} onChange={(e) => setSettings({ ...settings, overdue_cadence_days: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Reply-to email</Label><Input value={settings.reply_to_email ?? ""} onChange={(e) => setSettings({ ...settings, reply_to_email: e.target.value })} /></div>
            <div><Label>Signature</Label><Textarea value={settings.signature ?? ""} onChange={(e) => setSettings({ ...settings, signature: e.target.value })} /></div>
            <Button variant="wave" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
          </div>

          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
            <div className="font-semibold mb-3">Send now</div>
            {invoices.length === 0 ? (
              <div className="text-sm text-muted-foreground">No outstanding invoices.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto">
                {invoices.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
                    <div>
                      <div className="text-sm font-medium">{i.invoice_number}</div>
                      <div className="text-xs text-muted-foreground">Due {formatDateIN(i.due_date)}</div>
                    </div>
                    <Button size="sm" variant="wave-outline" onClick={() => sendNow(i.id, i.status === "overdue" ? "overdue" : "before_due")} disabled={sending === i.id}>
                      <Send className="w-3 h-3" /> {sending === i.id ? "…" : "Remind"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
          <div className="font-semibold mb-3">Recent activity</div>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reminders sent yet.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {history.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium capitalize">{r.reminder_type.replace("_", " ")}</span>
                    <span className="text-muted-foreground ml-2">{r.sent_at ? formatDateIN(r.sent_at) : formatDateIN(r.scheduled_at)}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-status-paid-bg text-status-paid capitalize">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Reminders;
