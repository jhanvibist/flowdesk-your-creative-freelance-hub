import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, formatDateIN } from "@/lib/format";
import {
  Plus, Search, CheckCircle2, Clock, AlertCircle, Receipt, Trash2, Eye, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import emptyInvoices from "@/assets/empty-invoices.png";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

const statusStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2; label: string }> = {
  paid: { bg: "bg-status-paid-bg", text: "text-status-paid", icon: CheckCircle2, label: "Paid" },
  sent: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Sent" },
  partial: { bg: "bg-status-pending-bg", text: "text-status-pending", icon: Clock, label: "Partial" },
  overdue: { bg: "bg-status-overdue-bg", text: "text-status-overdue", icon: AlertCircle, label: "Overdue" },
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Receipt, label: "Draft" },
};

const Invoices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, amount_paid, due_date, issue_date, status, client:clients(name)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setInvoices((data as unknown as Invoice[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invoice deleted");
    load();
  };

  const today = new Date();
  const filtered = invoices.filter((i) => {
    const matchSearch = (i.invoice_number + " " + (i.client?.name ?? "")).toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchSearch;
    if (filter === "overdue")
      return matchSearch && ["sent", "partial"].includes(i.status) && new Date(i.due_date) < today && Number(i.total) > Number(i.amount_paid || 0);
    return matchSearch && i.status === filter;
  });

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">Send. Track. Get paid.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="wave-outline" asChild>
              <Link to="/recurring">Recurring</Link>
            </Button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 h-10 rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="wave" asChild>
              <Link to="/invoices/new"><Plus className="w-4 h-4" /> New invoice</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              image={emptyInvoices}
              title={invoices.length === 0 ? "No invoices yet" : "Nothing matches"}
              description={invoices.length === 0 ? "Create your first invoice — your future self will thank you." : "Try a different search or filter."}
              action={invoices.length === 0 ? <Button variant="wave" asChild><Link to="/invoices/new"><Plus className="w-4 h-4" /> New invoice</Link></Button> : undefined}
            />
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="text-left font-medium px-6 py-3">Invoice</th>
                      <th className="text-left font-medium px-6 py-3">Client</th>
                      <th className="text-left font-medium px-6 py-3">Issued</th>
                      <th className="text-left font-medium px-6 py-3">Due</th>
                      <th className="text-left font-medium px-6 py-3">Status</th>
                      <th className="text-right font-medium px-6 py-3">Amount</th>
                      <th className="w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => {
                      const isOverdueByDate = ["sent", "partial"].includes(inv.status) && new Date(inv.due_date) < today;
                      const effective = isOverdueByDate ? "overdue" : inv.status;
                      const s = statusStyles[effective] ?? statusStyles.draft;
                      return (
                        <tr key={inv.id} className="border-t border-border/40 hover:bg-muted/40 transition-smooth">
                          <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
                          <td className="px-6 py-4">{inv.client?.name ?? "—"}</td>
                          <td className="px-6 py-4 text-muted-foreground">{formatDateIN(inv.issue_date)}</td>
                          <td className="px-6 py-4 text-muted-foreground">{formatDateIN(inv.due_date)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                              <s.icon className="w-3 h-3" /> {s.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold">{formatINR(inv.total)}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/invoices/${inv.id}`)}><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/invoices/${inv.id}/edit`)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(inv.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-border/40">
                {filtered.map((inv) => {
                  const isOverdueByDate = ["sent", "partial"].includes(inv.status) && new Date(inv.due_date) < today;
                  const effective = isOverdueByDate ? "overdue" : inv.status;
                  const s = statusStyles[effective] ?? statusStyles.draft;
                  return (
                    <Link key={inv.id} to={`/invoices/${inv.id}`} className="block p-4 hover:bg-muted/30">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="font-medium">{inv.client?.name ?? inv.invoice_number}</div>
                          <div className="text-xs text-muted-foreground">{inv.invoice_number} · Due {formatDateIN(inv.due_date)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatINR(inv.total)}</div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
                            <s.icon className="w-2.5 h-2.5" /> {s.label}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Invoices;
