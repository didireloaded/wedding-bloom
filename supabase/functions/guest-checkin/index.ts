import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { wedding_id, guest_session, verification_token, method = "geolocation" } = await req.json();
    if (!wedding_id || !guest_session || !verification_token) return json({ error: "Arrival verification is required" }, 400);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: session } = await db.from("guest_sessions").select("id, rsvp_id").eq("wedding_id", wedding_id).eq("session_token_hash", await hash(guest_session)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!session) return json({ error: "Guest session expired" }, 401);
    const { data: rsvp } = session.rsvp_id ? await db.from("rsvps").select("guest_name, guest_count").eq("id", session.rsvp_id).maybeSingle() : { data: null };
    if (!rsvp) return json({ error: "RSVP identity not found" }, 400);
    const { data: existing } = await db.from("checkins").select("id").eq("wedding_id", wedding_id).eq("guest_name", rsvp.guest_name).maybeSingle();
    if (existing) return json({ checked_in: true, checkin_id: existing.id });
    const { data, error } = await db.from("checkins").insert({ wedding_id, guest_name: rsvp.guest_name, party_size: rsvp.guest_count || 1, checkin_method: method, verified: true }).select("id").single();
    if (error) return json({ error: error.message }, 500);
    await db.from("notification_events").insert({ wedding_id, event_type: "guest_arrived", actor_type: "guest", subject_id: session.rsvp_id, payload: { guest_name: rsvp.guest_name, party_size: rsvp.guest_count || 1 }, priority: "high" });
    return json({ checked_in: true, checkin_id: data.id });
  } catch { return json({ error: "Unable to complete check-in" }, 500); }
});
