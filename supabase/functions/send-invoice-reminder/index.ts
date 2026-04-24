// Logs a reminder as "sent" for an invoice. Email delivery is stubbed —
// to actually send emails, add a RESEND_API_KEY secret and uncomment the Resend call.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const body = await req.json().catch(() => ({}));
    const invoiceId = body.invoice_id;
    const reminderType = body.reminder_type || "before_due";
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: "invoice_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, due_date, client_id")
      .eq("id", invoiceId)
      .eq("user_id", userId)
      .single();
    if (invErr || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let clientEmail: string | null = null;
    if (invoice.client_id) {
      const { data: c } = await supabase.from("clients").select("email, name").eq("id", invoice.client_id).single();
      clientEmail = c?.email ?? null;
    }

    // TODO: integrate Resend / SMTP. For now we record the reminder.
    const { error: rErr } = await supabase.from("invoice_reminders").insert({
      user_id: userId,
      invoice_id: invoiceId,
      reminder_type: reminderType,
      scheduled_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      status: "sent",
    });
    if (rErr) throw rErr;

    return new Response(JSON.stringify({ ok: true, recipient: clientEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
