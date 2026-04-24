import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Waves,
  Receipt,
  UserCircle2,
  Timer,
  IndianRupee,
  Settings2,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Waves },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/clients", label: "Clients", icon: UserCircle2 },
  { to: "/work-logs", label: "Work logs", icon: Timer },
  { to: "/payments", label: "Payments", icon: IndianRupee },
  { to: "/settings", label: "Settings", icon: Settings2 },
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
        <div className="px-4 py-4">
          <Link to="/" className="inline-block transition-smooth hover:scale-105">
            <Logo className="h-16" />
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-1">
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
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "" : "group-hover:rotate-3"
                    }`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  {item.label}
                  {isActive && (
                    <Sparkles className="ml-auto w-3 h-3 opacity-80" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-accent to-secondary border border-border/40">
          <div className="text-sm font-semibold mb-1">Pro tip 💡</div>
          <p className="text-xs text-muted-foreground mb-3">
            Generate invoices straight from your work logs in one tap.
          </p>
          <Button variant="wave" size="sm" className="w-full" asChild>
            <Link to="/work-logs">Log work</Link>
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
              <Logo className="h-14" />
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
            <Logo className="h-12" />
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
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:inline-flex">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSignOut} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="w-9 h-9 rounded-full gradient-wave flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-soft">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
