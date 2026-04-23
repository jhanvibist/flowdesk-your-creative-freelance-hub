import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, formatDateIN } from "@/lib/format";
import { CheckCircle2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import emptyInvoices from "@/assets/empty-invoices.png";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  method: string | null;
  invoice_id: string;
  invoice?: { invoice_number: string; client?: { name: string } | null } | null;
}

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payments")
      .select("id, amount, payment_date, method, invoice_id, invoice:invoices(invoice_number, client:clients(name))")
      .order("payment_date", { ascending: false })
      .then(({ data }) => {
        setPayments((data as unknown as Payment[]) || []);
        setLoading(false);
      });
  }, [user]);

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonth = payments.filter(p => new Date(p.payment_date) >= monthStart).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Every rupee that landed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total received</div>
            <div className="text-2xl font-bold text-status-paid">{formatINR(total)}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">This month</div>
            <div className="text-2xl font-bold">{formatINR(thisMonth)}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : payments.length === 0 ? (
            <EmptyState
              image={emptyInvoices}
              title="No payments yet"
              description="Record payments from invoice pages — they'll show here."
              action={<Button variant="wave" asChild><Link to="/invoices"><IndianRupee className="w-4 h-4" /> Go to invoices</Link></Button>}
            />
          ) : (
            <div className="divide-y divide-border/40">
              {payments.map((p) => (
                <Link
                  to={`/invoices/${p.invoice_id}`}
                  key={p.id}
                  className="flex items-center justify-between px-5 md:px-6 py-4 hover:bg-muted/30 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-status-paid-bg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-status-paid" />
                    </div>
                    <div>
                      <div className="font-medium">{p.invoice?.client?.name ?? p.invoice?.invoice_number ?? "Payment"}</div>
                      <div className="text-xs text-muted-foreground">{p.invoice?.invoice_number} · {formatDateIN(p.payment_date)} · {p.method ?? "—"}</div>
                    </div>
                  </div>
                  <div className="text-status-paid font-semibold">+{formatINR(p.amount)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Payments;
