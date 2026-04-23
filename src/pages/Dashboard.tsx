import { Logo } from "@/components/Logo";
import { WaveBackground } from "@/components/WaveBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  MoreHorizontal,
  Wallet,
} from "lucide-react";

const kpis = [
  {
    label: "Total earnings",
    value: "$24,580",
    delta: "+12.4%",
    deltaLabel: "vs last month",
    icon: Wallet,
    accent: "text-status-paid",
    bg: "bg-status-paid-bg",
  },
  {
    label: "Pending payments",
    value: "$3,240",
    delta: "4 invoices",
    deltaLabel: "awaiting payment",
    icon: Clock,
    accent: "text-status-pending",
    bg: "bg-status-pending-bg",
  },
  {
    label: "Overdue",
    value: "$890",
    delta: "1 invoice",
    deltaLabel: "needs follow-up",
    icon: AlertCircle,
    accent: "text-status-overdue",
    bg: "bg-status-overdue-bg",
  },
  {
    label: "This month",
    value: "$8,420",
    delta: "+24%",
    deltaLabel: "trending up",
    icon: TrendingUp,
    accent: "text-primary",
    bg: "bg-accent",
  },
];

const invoices = [
  { id: "INV-1042", client: "Acme Studios", project: "Brand redesign", amount: "$1,200", due: "Apr 12", status: "paid" },
  { id: "INV-1041", client: "Lunar Agency", project: "Website redesign", amount: "$2,450", due: "Apr 18", status: "pending" },
  { id: "INV-1040", client: "Northwind Co.", project: "Mobile app icons", amount: "$890", due: "Apr 02", status: "overdue" },
  { id: "INV-1039", client: "Helix Labs", project: "Landing page copy", amount: "$640", due: "Apr 22", status: "pending" },
  { id: "INV-1038", client: "Pinecone", project: "Logo refresh", amount: "$450", due: "Mar 30", status: "paid" },
  { id: "INV-1037", client: "Driftly", project: "Social templates", amount: "$320", due: "Apr 25", status: "pending" },
];

const statusStyles = {
  paid: { bg: "bg-status-paid-bg", text: "text-status-paid", icon: CheckCircle2, label: "Paid" },
  pending: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Pending" },
  overdue: { bg: "bg-status-overdue-bg", text: "text-status-overdue", icon: AlertCircle, label: "Overdue" },
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-card">
        <div className="p-6">
          <Link to="/"><Logo className="h-9" /></Link>
        </div>
        <nav className="px-3 flex-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: FileText, label: "Invoices" },
            { icon: Users, label: "Clients" },
            { icon: TrendingUp, label: "Analytics" },
            { icon: Settings, label: "Settings" },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-smooth ${
                item.active
                  ? "gradient-wave text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-accent to-secondary border border-border/40">
          <div className="text-sm font-semibold mb-1">Upgrade to Pro</div>
          <p className="text-xs text-muted-foreground mb-3">Unlock recurring invoices and team seats.</p>
          <Button variant="wave" size="sm" className="w-full">Upgrade</Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="relative h-16 border-b border-border/60 bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20">
          <div className="lg:hidden">
            <Logo className="h-8" />
          </div>
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices, clients..." className="pl-9 h-10 rounded-full bg-muted/40 border-transparent focus-visible:bg-background" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="w-9 h-9 rounded-full gradient-wave flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-soft">
              A
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Hero with subtle wave */}
          <div className="relative overflow-hidden border-b border-border/40">
            <WaveBackground variant="subtle" />
            <div className="relative z-10 px-4 md:px-8 py-8 md:py-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Welcome back</div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Good morning, Alex 👋</h1>
                  <p className="text-sm text-muted-foreground mt-1">Here's how your flow is looking today.</p>
                </div>
                <Button variant="wave" size="lg">
                  <Plus className="w-4 h-4" /> New invoice
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpis.map((kpi, i) => (
                <div
                  key={kpi.label}
                  className="rounded-2xl bg-card border border-border/60 p-5 md:p-6 shadow-soft hover:shadow-card transition-smooth animate-fade-in-up"
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
                    <p className="text-xs text-muted-foreground">Last 6 months</p>
                  </div>
                  <div className="flex gap-1 text-xs">
                    {["6M", "1Y", "All"].map((p, i) => (
                      <button
                        key={p}
                        className={`px-3 py-1.5 rounded-full font-medium transition-smooth ${
                          i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Wave chart */}
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
                    {/* Grid */}
                    {[40, 90, 140, 190].map((y) => (
                      <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="3 5" />
                    ))}
                    {/* Wave area */}
                    <path
                      d="M0,160 C80,120 160,180 240,140 C320,100 400,150 480,90 C540,60 580,80 600,70 L600,220 L0,220 Z"
                      fill="url(#chartFill)"
                    />
                    <path
                      d="M0,160 C80,120 160,180 240,140 C320,100 400,150 480,90 C540,60 580,80 600,70"
                      fill="none"
                      stroke="url(#chartStroke)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Points */}
                    {[
                      [0, 160], [120, 138], [240, 140], [360, 118], [480, 90], [600, 70],
                    ].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
                    ))}
                  </svg>
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
                    {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border/60 p-5 md:p-6 shadow-soft">
                <h3 className="text-base font-semibold mb-1">Status breakdown</h3>
                <p className="text-xs text-muted-foreground mb-6">All invoices this quarter</p>
                <div className="space-y-5">
                  {[
                    { label: "Paid", value: 78, color: "bg-status-paid", text: "text-status-paid", amount: "$24,580" },
                    { label: "Pending", value: 14, color: "bg-status-pending", text: "text-status-pending", amount: "$3,240" },
                    { label: "Overdue", value: 8, color: "bg-status-overdue", text: "text-status-overdue", amount: "$890" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.color}`} />
                          <span className="text-sm font-medium">{row.label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${row.text}`}>{row.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full transition-flow`} style={{ width: `${row.value}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5">{row.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoice table */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="px-5 md:px-6 py-5 flex items-center justify-between border-b border-border/60">
                <div>
                  <h3 className="text-base font-semibold">Recent invoices</h3>
                  <p className="text-xs text-muted-foreground">Your latest billing activity</p>
                </div>
                <Button variant="ghost" size="sm">View all <ArrowUpRight className="w-3.5 h-3.5" /></Button>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="text-left font-medium px-6 py-3">Invoice</th>
                      <th className="text-left font-medium px-6 py-3">Client</th>
                      <th className="text-left font-medium px-6 py-3">Project</th>
                      <th className="text-left font-medium px-6 py-3">Due</th>
                      <th className="text-left font-medium px-6 py-3">Status</th>
                      <th className="text-right font-medium px-6 py-3">Amount</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const s = statusStyles[inv.status as keyof typeof statusStyles];
                      return (
                        <tr key={inv.id} className="border-t border-border/40 hover:bg-muted/40 transition-smooth">
                          <td className="px-6 py-4 font-medium">{inv.id}</td>
                          <td className="px-6 py-4">{inv.client}</td>
                          <td className="px-6 py-4 text-muted-foreground">{inv.project}</td>
                          <td className="px-6 py-4 text-muted-foreground">{inv.due}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                              <s.icon className="w-3 h-3" /> {s.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold">{inv.amount}</td>
                          <td className="px-2 py-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border/40">
                {invoices.map((inv) => {
                  const s = statusStyles[inv.status as keyof typeof statusStyles];
                  return (
                    <div key={inv.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold truncate">{inv.client}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
                            <s.icon className="w-2.5 h-2.5" /> {s.label}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{inv.project} · Due {inv.due}</div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">{inv.amount}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
