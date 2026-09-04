import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { wedding_id, rsvp_id, guest_name, email } = await req.json();
    if (!wedding_id || (!rsvp_id && !guest_name)) return json({ error: "Wedding and RSVP identity are required" }, 400);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const query = db.from("rsvps").select("id, wedding_id").eq("wedding_id", wedding_id);
    const { data: rsvp } = rsvp_id ? await query.eq("id", rsvp_id).maybeSingle() : await query.eq("guest_name", guest_name).eq("email", email || "").maybeSingle();
    if (!rsvp) return json({ error: "RSVP not found" }, 404);
    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    const { error } = await db.from("guest_sessions").insert({ wedding_id, rsvp_id, session_token_hash: await hash(token) });
    if (error) return json({ error: error.message }, 500);
    return json({ guest_session: token });
  } catch { return json({ error: "Unable to create guest session" }, 500); }
});
