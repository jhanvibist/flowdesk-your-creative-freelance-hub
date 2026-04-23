import { ArrowUpRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Glow */}
      <div className="absolute -inset-4 gradient-wave opacity-20 blur-3xl rounded-[2rem]" aria-hidden="true" />

      <div className="relative rounded-2xl bg-card border border-border/60 shadow-elevated overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-overdue/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-status-pending/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-status-paid/40" />
          </div>
          <div className="ml-4 text-xs text-muted-foreground font-medium">app.flowdesk.io / dashboard</div>
        </div>

        <div className="p-6 md:p-8 bg-gradient-to-br from-background to-accent/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Welcome back</div>
              <div className="text-lg font-semibold">Good morning, Alex 👋</div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full gradient-wave text-primary-foreground text-xs font-medium shadow-soft">
              + New invoice
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            {[
              { label: "Earnings", value: "₹2,45,800", trend: "+12.4%", color: "text-status-paid" },
              { label: "Pending", value: "₹32,400", trend: "4 invoices", color: "text-status-pending" },
              { label: "Overdue", value: "₹8,900", trend: "1 invoice", color: "text-status-overdue" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl bg-card border border-border/60 p-3 md:p-4 shadow-soft">
                <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</div>
                <div className="text-base md:text-2xl font-bold mt-1">{kpi.value}</div>
                <div className={`text-[10px] md:text-xs mt-1 font-medium ${kpi.color}`}>{kpi.trend}</div>
              </div>
            ))}
          </div>

          {/* Invoice rows */}
          <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <div className="text-sm font-semibold">Recent invoices</div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            {[
              { client: "Acme Studios", amount: "₹1,20,000", status: "paid", icon: CheckCircle2 },
              { client: "Lunar Agency", amount: "₹24,500", status: "pending", icon: Clock },
              { client: "Northwind Co.", amount: "₹8,900", status: "overdue", icon: AlertCircle },
            ].map((row) => (
              <div key={row.client} className="px-4 py-3 flex items-center justify-between border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-status-${row.status}-bg flex items-center justify-center`}>
                    <row.icon className={`w-4 h-4 text-status-${row.status}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{row.client}</div>
                    <div className="text-xs text-muted-foreground capitalize">{row.status}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold">{row.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
