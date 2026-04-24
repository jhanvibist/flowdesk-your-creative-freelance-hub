import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { formatINR, formatDateIN } from "@/lib/format";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const PORTAL_URL = `https://sntpmcfimtsmzcknzrft.supabase.co/functions/v1/portal-view-invoice`;

const PortalInvoice = () => {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${PORTAL_URL}?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(String(e)));
  }, [token]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link unavailable</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading invoice…</div>;

  const { invoice, items, client, profile } = data;
  const balance = Number(invoice.total) - Number(invoice.amount_paid);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-md">
        <div className="container py-4 flex items-center justify-between">
          <Logo className="h-12" />
          <span className="text-xs text-muted-foreground">Secure client portal</span>
        </div>
      </header>

      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="rounded-3xl bg-card shadow-elevated overflow-hidden">
          <div className="gradient-wave p-8 text-primary-foreground">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Invoice</div>
                <div className="text-2xl font-bold">{invoice.invoice_number}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80 mb-1">Amount due</div>
                <div className="text-3xl font-bold">{formatINR(balance)}</div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">From</div>
                <div className="font-semibold">{profile?.business_name || profile?.full_name || "—"}</div>
                {profile?.gstin && <div className="text-muted-foreground text-xs">GSTIN: {profile.gstin}</div>}
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Bill to</div>
                <div className="font-semibold">{client?.name || "—"}</div>
                {client?.company && <div className="text-muted-foreground text-xs">{client.company}</div>}
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Issue date</div>
                <div>{formatDateIN(invoice.issue_date)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Due date</div>
                <div>{formatDateIN(invoice.due_date)}</div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr><th className="text-left pb-2">Description</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Rate</th><th className="text-right pb-2">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="py-3">{it.description}</td>
                      <td className="text-right py-3">{it.quantity}</td>
                      <td className="text-right py-3">{formatINR(it.rate)}</td>
                      <td className="text-right py-3 font-medium">{formatINR(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border/60 pt-4 ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(invoice.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST ({invoice.tax_rate}%)</span><span>{formatINR(invoice.tax_amount)}</span></div>
              <div className="flex justify-between font-semibold text-base border-t border-border/60 pt-2"><span>Total</span><span>{formatINR(invoice.total)}</span></div>
              {Number(invoice.amount_paid) > 0 && (
                <div className="flex justify-between text-status-paid"><span>Paid</span><span>− {formatINR(invoice.amount_paid)}</span></div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-border/60 pt-2"><span>Balance</span><span>{formatINR(balance)}</span></div>
            </div>

            {invoice.status === "paid" && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-status-paid-bg text-status-paid">
                <CheckCircle2 className="w-5 h-5" /> This invoice has been paid in full.
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">Powered by FlowDesk</p>
      </div>
    </div>
  );
};

export default PortalInvoice;
