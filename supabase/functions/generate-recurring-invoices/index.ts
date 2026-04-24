// Generates due recurring invoices. Can be called manually or by a scheduler.
// Auth: requires the caller's JWT — operates on rows owned by that user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function addInterval(date: Date, interval: string): Date {
  const d = new Date(date);
  switch (interval) {
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "biweekly": d.setDate(d.getDate() + 14); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
    default: d.setMonth(d.getMonth() + 1);
  }
  return d;
}

function genInvoiceNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yy}${mm}-${rand}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    const today = new Date().toISOString().slice(0, 10);
    const { data: due, error: dueErr } = await supabase
      .from("recurring_invoices")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .lte("next_run_date", today);

    if (dueErr) throw dueErr;

    const generated: string[] = [];

    for (const tpl of due ?? []) {
      const items = Array.isArray(tpl.line_items) ? tpl.line_items : [];
      const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.amount) || (Number(it.quantity || 1) * Number(it.rate || 0))), 0)
        || Number(tpl.amount || 0);
      const taxAmount = subtotal * (Number(tpl.tax_rate || 0) / 100);
      const total = subtotal + taxAmount;

      const issue = new Date();
      const due = new Date(issue); due.setDate(due.getDate() + 15);

      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_id: tpl.client_id,
          invoice_number: genInvoiceNumber(),
          issue_date: issue.toISOString().slice(0, 10),
          due_date: due.toISOString().slice(0, 10),
          status: "draft",
          subtotal,
          tax_rate: Number(tpl.tax_rate || 0),
          tax_amount: taxAmount,
          total,
          notes: tpl.notes ?? null,
        })
        .select("id")
        .single();

      if (invErr) { console.error("Invoice insert failed", invErr); continue; }

      if (items.length > 0) {
        const itemsPayload = items.map((it: any) => ({
          user_id: userId,
          invoice_id: inv.id,
          description: String(it.description ?? "Service"),
          quantity: Number(it.quantity ?? 1),
          rate: Number(it.rate ?? 0),
          amount: Number(it.amount ?? Number(it.quantity ?? 1) * Number(it.rate ?? 0)),
        }));
        await supabase.from("invoice_items").insert(itemsPayload);
      }

      const next = addInterval(new Date(tpl.next_run_date), tpl.interval).toISOString().slice(0, 10);
      await supabase
        .from("recurring_invoices")
        .update({ next_run_date: next, last_generated_at: new Date().toISOString() })
        .eq("id", tpl.id);

      generated.push(inv.id);
    }

    return new Response(JSON.stringify({ generated_count: generated.length, invoice_ids: generated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
