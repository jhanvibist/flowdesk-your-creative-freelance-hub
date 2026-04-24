import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { TrendingUp, AlertCircle, Users, IndianRupee } from "lucide-react";

const Analytics = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: i }, { data: p }, { data: c }] = await Promise.all([
        supabase.from("invoices").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("clients").select("*"),
      ]);
      setInvoices(i ?? []); setPayments(p ?? []); setClients(c ?? []);
    })();
  }, []);

  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = 0;
    }
    payments.forEach(p => {
      const d = new Date(p.payment_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in months) months[key] += Number(p.amount);
    });
    return Object.entries(months);
  }, [payments]);

  const maxRev = Math.max(1, ...monthlyRevenue.map(([, v]) => v));

  const clientPerf = useMemo(() => {
    const map: Record<string, { name: string; total: number; paid: number; count: number }> = {};
    invoices.forEach(inv => {
      if (!inv.client_id) return;
      const cl = clients.find(c => c.id === inv.client_id);
      if (!cl) return;
      if (!map[cl.id]) map[cl.id] = { name: cl.name, total: 0, paid: 0, count: 0 };
      map[cl.id].total += Number(inv.total);
      map[cl.id].paid += Number(inv.amount_paid);
      map[cl.id].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [invoices, clients]);

  const overdueTrend = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return invoices.filter(i => i.status !== "paid" && new Date(i.due_date) < today).length;
  }, [invoices]);

  const forecast = useMemo(() => {
    const total = invoices.reduce((s, i) => s + Number(i.total), 0);
    const paid = invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
    return total - paid;
  }, [invoices]);

  return (
    <AppShell>
      <div className="container py-8 md:py-12 space-y-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Insights</div>
          <h1 className="text-3xl md:text-4xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue, performance, and forecasts.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: IndianRupee, label: "Forecast (outstanding)", value: formatINR(forecast), tint: "primary" },
            { icon: TrendingUp, label: "Total invoices", value: invoices.length },
            { icon: Users, label: "Active clients", value: clients.length },
            { icon: AlertCircle, label: "Overdue", value: overdueTrend },
          ].map((k, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2"><k.icon className="w-3.5 h-3.5" /> {k.label}</div>
              <div className="text-2xl font-bold">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
          <div className="font-semibold mb-4">Monthly revenue (12 months)</div>
          <div className="flex items-end gap-2 h-48">
            {monthlyRevenue.map(([key, val]) => (
              <div key={key} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg gradient-wave shadow-soft transition-smooth hover:opacity-80"
                  style={{ height: `${(val / maxRev) * 100}%`, minHeight: 4 }}
                  title={formatINR(val)}
                />
                <div className="text-[10px] text-muted-foreground">{key.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
          <div className="font-semibold mb-4">Client performance</div>
          {clientPerf.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data yet.</div>
          ) : (
            <div className="space-y-3">
              {clientPerf.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{formatINR(c.paid)} / {formatINR(c.total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-wave" style={{ width: `${Math.min(100, (c.paid / Math.max(1, c.total)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Analytics;
