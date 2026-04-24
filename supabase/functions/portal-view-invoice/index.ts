// Public read-only invoice view for client portal.
// Validates a share token and returns the invoice + items + client info.
// Uses the SERVICE ROLE key on the server (token is the auth).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "token required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: tokenRow, error: tErr } = await admin
      .from("client_portal_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tErr || !tokenRow) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invoice } = await admin.from("invoices").select("*").eq("id", tokenRow.invoice_id).single();
    const { data: items } = await admin.from("invoice_items").select("*").eq("invoice_id", tokenRow.invoice_id);
    let client: any = null;
    if (invoice?.client_id) {
      const { data: c } = await admin.from("clients").select("name, company, email, phone, address, gstin").eq("id", invoice.client_id).single();
      client = c;
    }
    const { data: profile } = await admin.from("profiles").select("full_name, business_name, gstin, pan, phone").eq("id", tokenRow.user_id).single();

    await admin
      .from("client_portal_tokens")
      .update({ view_count: (tokenRow.view_count ?? 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq("id", tokenRow.id);

    return new Response(JSON.stringify({ invoice, items, client, profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
