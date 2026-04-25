import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Waves,
  Receipt,
  UserCircle2,
  IndianRupee,
  Settings2,
  Search,
  LogOut,
  Menu,
  X,
  Sparkles,
  Repeat,
  Bell,
  Mail,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  Calculator,
  FolderKanban,
  Flag,
  CheckCircle2,
  Paperclip,
  Link2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Waves },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/clients", label: "Clients", icon: UserCircle2 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/payments", label: "Payments", icon: IndianRupee },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

const proGroups = [
  {
    title: "Automation",
    icon: Repeat,
    items: [
      { to: "/recurring", label: "Recurring invoices", icon: Repeat },
      { to: "/reminders", label: "Automatic reminders", icon: Bell },
      { to: "/reminders", label: "Overdue follow-up emails", icon: Mail },
      { to: "/reminders", label: "Auto payment alerts", icon: AlertCircle },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    items: [
      { to: "/analytics", label: "Monthly revenue charts", icon: TrendingUp },
      { to: "/analytics", label: "Client performance", icon: Users },
      { to: "/analytics", label: "Overdue trends", icon: Activity },
      { to: "/analytics", label: "Payment forecasting", icon: Calculator },
    ],
  },
  {
    title: "Advanced project tools",
    icon: FolderKanban,
    items: [
      { to: "/projects", label: "Milestones", icon: Flag },
      { to: "/projects", label: "Team collaboration", icon: Users },
      { to: "/projects", label: "Task assignment", icon: CheckCircle2 },
      { to: "/projects", label: "File attachments", icon: Paperclip },
      { to: "/invoices", label: "Client portal", icon: Link2 },
    ],
  },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = (user?.user_metadata?.full_name || user?.email || "F")
    .toString()
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-card">
        <div className="px-3 py-4">
          <Link to="/" className="inline-block transition-smooth hover:scale-105">
            <Logo className="h-24" />
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth relative overflow-hidden ${
                  isActive
                    ? "gradient-wave text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "" : "group-hover:rotate-3"}`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  {item.label}
                  {isActive && <Sparkles className="ml-auto w-3 h-3 opacity-80" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-accent to-secondary border border-border/40">
          <div className="text-sm font-semibold mb-1">Pro tip 💡</div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock automation, analytics &amp; advanced project tools with Pro.
          </p>
          <Button variant="wave" size="sm" className="w-full" asChild>
            <Link to="/analytics">Explore Pro</Link>
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-card border-r border-border/60 p-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Logo className="h-20" />
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                      isActive
                        ? "gradient-wave text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-secondary">
              <Menu className="w-5 h-5" />
            </button>
            <Logo className="h-16" />
          </div>
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, clients…"
                className="pl-9 h-10 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Pro plan dropdown — replaces sidebar Pro items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="wave-outline" size="sm" className="rounded-full gap-1.5 hidden sm:inline-flex">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Pro plan</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <DropdownMenuLabel className="px-2 py-1.5 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs uppercase tracking-wider">Pro plan</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {proGroups.map((g, gi) => (
                  <div key={g.title} className={gi > 0 ? "mt-2 pt-2 border-t border-border/40" : ""}>
                    <div className="px-2 py-1.5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md gradient-wave flex items-center justify-center">
                        <g.icon className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide">{g.title}</span>
                    </div>
                    {g.items.map((it, idx) => (
                      <DropdownMenuItem key={`${g.title}-${idx}`} asChild>
                        <Link to={it.to} className="cursor-pointer text-sm pl-9">
                          <it.icon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                          {it.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSignOut} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-9 h-9 rounded-full gradient-wave flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-soft transition-smooth hover:scale-105"
                  aria-label="Profile menu"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings2 className="w-4 h-4 mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
