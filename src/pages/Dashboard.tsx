import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WaveBackground } from "@/components/WaveBackground";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, formatDateIN } from "@/lib/format";
import emptyInvoices from "@/assets/empty-invoices.png";
import {
  Plus, TrendingUp, Clock, AlertCircle, CheckCircle2, ArrowUpRight, Wallet, Receipt,
  IndianRupee, Bell as BellIcon, Sparkles,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  amount_paid: number;
  due_date: string;
  issue_date: string;
  status: string;
  client?: { name: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  invoice?: { invoice_number: string; client?: { name: string } | null } | null;
}

const statusStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2; label: string }> = {
  paid: { bg: "bg-status-paid-bg", text: "text-status-paid", icon: CheckCircle2, label: "Paid" },
  sent: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Sent" },
  partial: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Partial" },
  overdue: { bg: "bg-status-overdue-bg", text: "text-status-overdue", icon: AlertCircle, label: "Overdue" },
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Receipt, label: "Draft" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [{ data: invs }, { data: pays }, { data: prof }] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, total, amount_paid, due_date, issue_date, status, client:clients(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("id, amount, payment_date, invoice:invoices(invoice_number, client:clients(name))")
          .order("payment_date", { ascending: false })
          .limit(5),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);
      setInvoices((invs as unknown as Invoice[]) || []);
      setPayments((pays as unknown as Payment[]) || []);
      setProfileName(prof?.full_name || user.user_metadata?.full_name || "");
      setLoading(false);
    };
    load();
  }, [user]);

  const today = new Date();
  const totalEarnings = payments.length === 0
    ? invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount_paid || 0), 0)
    : invoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0);

  const pendingTotal = invoices
    .filter((i) => ["sent", "partial", "draft"].includes(i.status))
    .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid || 0)), 0);
  const pendingCount = invoices.filter((i) => ["sent", "partial"].includes(i.status)).length;

  const overdueInvs = invoices.filter(
    (i) => ["sent", "partial", "overdue"].includes(i.status) && new Date(i.due_date) < today && Number(i.total) > Number(i.amount_paid || 0)
  );
  const overdueTotal = overdueInvs.reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid || 0)), 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEarnings = invoices
    .filter((i) => i.status === "paid" && new Date(i.issue_date) >= monthStart)
    .reduce((s, i) => s + Number(i.amount_paid || 0), 0);

  // Monthly chart data — last 6 months earnings
  const chartData: { label: string; value: number }[] = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const next = new Date(today.getFullYear(), today.getMonth() - m + 1, 1);
    const sum = invoices
      .filter((i) => {
        const id = new Date(i.issue_date);
        return id >= d && id < next && i.status === "paid";
      })
      .reduce((s, i) => s + Number(i.amount_paid || 0), 0);
    chartData.push({ label: d.toLocaleString("en-IN", { month: "short" }), value: sum });
  }
  const maxVal = Math.max(1, ...chartData.map((c) => c.value));
  const points = chartData.map((c, i) => {
    const x = (i / (chartData.length - 1)) * 600;
    const y = 200 - (c.value / maxVal) * 160;
    return [x, y];
  });
  const linePath = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const areaPath = `${linePath} L600,220 L0,220 Z`;

  // Status breakdown
  const grouped = {
    paid: invoices.filter((i) => i.status === "paid"),
    pending: invoices.filter((i) => ["sent", "partial", "draft"].includes(i.status)),
    overdue: overdueInvs,
  };
  const totalAll = invoices.reduce((s, i) => s + Number(i.total), 0) || 1;
  const breakdown = [
    {
      label: "Paid", value: Math.round((grouped.paid.reduce((s, i) => s + Number(i.amount_paid || 0), 0) / totalAll) * 100),
      color: "bg-status-paid", text: "text-status-paid",
      amount: formatINR(grouped.paid.reduce((s, i) => s + Number(i.amount_paid || 0), 0)),
    },
    {
      label: "Pending", value: Math.round((pendingTotal / totalAll) * 100),
      color: "bg-status-pending", text: "text-status-pending",
      amount: formatINR(pendingTotal),
    },
    {
      label: "Overdue", value: Math.round((overdueTotal / totalAll) * 100),
      color: "bg-status-overdue", text: "text-status-overdue",
      amount: formatINR(overdueTotal),
    },
  ];

  const upcomingFollowUps = invoices
    .filter((i) => ["sent", "partial", "overdue"].includes(i.status) && Number(i.total) > Number(i.amount_paid || 0))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 4);

  const recentInvoices = invoices.slice(0, 6);
  const firstName = (profileName || user?.email || "there").split(" ")[0].split("@")[0];
  const greeting =
    today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    { label: "Total earnings", value: formatINR(totalEarnings), delta: `${invoices.filter(i => i.status === "paid").length} paid`, deltaLabel: "invoices", icon: Wallet, accent: "text-status-paid", bg: "bg-status-paid-bg" },
    { label: "Pending payments", value: formatINR(pendingTotal), delta: `${pendingCount} invoice${pendingCount === 1 ? "" : "s"}`, deltaLabel: "awaiting payment", icon: Clock, accent: "text-status-pending", bg: "bg-status-pending-bg" },
    { label: "Overdue", value: formatINR(overdueTotal), delta: `${overdueInvs.length} invoice${overdueInvs.length === 1 ? "" : "s"}`, deltaLabel: "needs follow-up", icon: AlertCircle, accent: "text-status-overdue", bg: "bg-status-overdue-bg" },
    { label: "This month", value: formatINR(thisMonthEarnings), delta: today.toLocaleString("en-IN", { month: "long" }), deltaLabel: "earnings", icon: TrendingUp, accent: "text-primary", bg: "bg-accent" },
  ];

  return (
    <AppShell>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/40">
        <WaveBackground variant="subtle" />
        <div className="relative z-10 px-4 md:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Welcome back</div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Here's how your flow is looking today.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="wave-outline" size="lg" asChild>
                <Link to="/work-logs"><Sparkles className="w-4 h-4" /> Log work</Link>
              </Button>
              <Button variant="wave" size="lg" asChild>
                <Link to="/invoices/new"><Plus className="w-4 h-4" /> New invoice</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
            : kpis.map((kpi, i) => (
                <div
                  key={kpi.label}
                  className="rounded-2xl bg-card border border-border/60 p-5 md:p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-smooth animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.accent}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{kpi.label}</div>
                  <div className="text-2xl md:text-3xl font-bold mb-2">{kpi.value}</div>
                  <div className="flex items-baseline gap-1.5 text-xs">
                    <span className={`font-semibold ${kpi.accent}`}>{kpi.delta}</span>
                    <span className="text-muted-foreground">{kpi.deltaLabel}</span>
                  </div>
                </div>
              ))}
        </div>

        {/* Earnings flow + breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border/60 p-5 md:p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold">Earnings flow</h3>
                <p className="text-xs text-muted-foreground">Last 6 months · paid invoices</p>
              </div>
            </div>
            <div className="h-56 relative">
              <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="chartStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                  </linearGradient>
                </defs>
                {[40, 90, 140, 190].map((y) => (
                  <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="3 5" />
                ))}
                <path d={areaPath} fill="url(#chartFill)" />
                <path d={linePath} fill="none" stroke="url(#chartStroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {points.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
                ))}
              </svg>
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
                {chartData.map((c) => (
                  <span key={c.label}>{c.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/60 p-5 md:p-6 shadow-soft">
            <h3 className="text-base font-semibold mb-1">Status breakdown</h3>
            <p className="text-xs text-muted-foreground mb-6">All invoices</p>
            {invoices.length === 0 && !loading ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-accent mx-auto flex items-center justify-center mb-3">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">No invoices yet — create your first to see this chart come alive.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {breakdown.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${row.color}`} />
                        <span className="text-sm font-medium">{row.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${row.text}`}>{row.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-flow`} style={{ width: `${Math.min(100, Math.max(0, row.value))}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">{row.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent invoices + Follow-ups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
            <div className="px-5 md:px-6 py-5 flex items-center justify-between border-b border-border/60">
              <div>
                <h3 className="text-base font-semibold">Recent invoices</h3>
                <p className="text-xs text-muted-foreground">Your latest billing activity</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/invoices">View all <ArrowUpRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentInvoices.length === 0 ? (
              <EmptyState
                image={emptyInvoices}
                title="No invoices yet"
                description="Generate your first invoice in under a minute. Add a client, add work, hit send."
                action={
                  <Button variant="wave" asChild>
                    <Link to="/invoices/new"><Plus className="w-4 h-4" /> Create invoice</Link>
                  </Button>
                }
              />
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                        <th className="text-left font-medium px-6 py-3">Invoice</th>
                        <th className="text-left font-medium px-6 py-3">Client</th>
                        <th className="text-left font-medium px-6 py-3">Due</th>
                        <th className="text-left font-medium px-6 py-3">Status</th>
                        <th className="text-right font-medium px-6 py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((inv) => {
                        const s = statusStyles[inv.status] ?? statusStyles.draft;
                        return (
                          <tr key={inv.id} className="border-t border-border/40 hover:bg-muted/40 transition-smooth">
                            <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
                            <td className="px-6 py-4">{inv.client?.name ?? "—"}</td>
                            <td className="px-6 py-4 text-muted-foreground">{formatDateIN(inv.due_date)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                                <s.icon className="w-3 h-3" /> {s.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold">{formatINR(inv.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-border/40">
                  {recentInvoices.map((inv) => {
                    const s = statusStyles[inv.status] ?? statusStyles.draft;
                    return (
                      <div key={inv.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold truncate">{inv.client?.name ?? inv.invoice_number}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
                              <s.icon className="w-2.5 h-2.5" /> {s.label}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{inv.invoice_number} · Due {formatDateIN(inv.due_date)}</div>
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap">{formatINR(inv.total)}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Follow-ups */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 md:p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Follow-ups</h3>
                <p className="text-xs text-muted-foreground">A gentle nudge can do wonders</p>
              </div>
              <BellIcon className="w-4 h-4 text-primary" />
            </div>

            {upcomingFollowUps.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-status-paid mx-auto mb-2" />
                You're all caught up.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingFollowUps.map((inv) => {
                  const s = statusStyles[inv.status] ?? statusStyles.sent;
                  const isOverdue = new Date(inv.due_date) < today;
                  return (
                    <div key={inv.id} className="rounded-xl border border-border/60 p-3 hover:bg-muted/30 transition-smooth">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{inv.client?.name ?? inv.invoice_number}</span>
                        <span className={`text-xs font-semibold ${isOverdue ? "text-status-overdue" : "text-status-pending"}`}>
                          {formatINR(Number(inv.total) - Number(inv.amount_paid || 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{inv.invoice_number}</span>
                        <span className={isOverdue ? "text-status-overdue" : "text-muted-foreground"}>
                          {isOverdue ? "Overdue · " : "Due "}
                          {formatDateIN(inv.due_date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
          <div className="px-5 md:px-6 py-5 border-b border-border/60">
            <h3 className="text-base font-semibold">Recent payments</h3>
            <p className="text-xs text-muted-foreground">Money that landed in your account</p>
          </div>
          {payments.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No payments recorded yet — mark an invoice as paid to see it here.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {payments.map((p) => (
                <div key={p.id} className="px-5 md:px-6 py-3 flex items-center justify-between hover:bg-muted/30 transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-status-paid-bg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-status-paid" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{p.invoice?.client?.name ?? p.invoice?.invoice_number ?? "Payment"}</div>
                      <div className="text-xs text-muted-foreground">{p.invoice?.invoice_number} · {formatDateIN(p.payment_date)}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-status-paid">+{formatINR(p.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
