import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
serve(async (req) => { if (req.method === "OPTIONS") return new Response(null, { headers }); try {
  const { wedding_id, audience_type, guest_session, subscription, platform, user_agent } = await req.json();
  if (!wedding_id || !["guest", "couple"].includes(audience_type) || !subscription?.endpoint) return json({ error: "Invalid subscription" }, 400);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let guestId = null;
  if (audience_type === "guest") {
    if (!guest_session) return json({ error: "Guest session required" }, 401);
    const { data } = await db.from("guest_sessions").select("id, rsvp_id").eq("wedding_id", wedding_id).eq("session_token_hash", await hash(guest_session)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!data) return json({ error: "Guest session expired" }, 401);
    guestId = data.rsvp_id;
  } else {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Couple authentication required" }, 401);
    const authDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await authDb.auth.getUser();
    if (!userData.user) return json({ error: "Couple authentication required" }, 401);
    const { data: member } = await db.from("wedding_members").select("id").eq("wedding_id", wedding_id).eq("user_id", userData.user.id).maybeSingle();
    if (!member) return json({ error: "Wedding membership required" }, 403);
  }
  const { data, error } = await db.from("push_subscriptions").upsert({ wedding_id, audience_type, guest_id: guestId, endpoint: subscription.endpoint, p256dh_key: subscription.keys?.p256dh || "", auth_key: subscription.keys?.auth || "", platform, user_agent, enabled: true, last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "wedding_id,endpoint" }).select("id").single();
  if (error) return json({ error: error.message }, 500);
  return json({ id: data.id });
} catch { return json({ error: "Unable to register subscription" }, 500); } });
