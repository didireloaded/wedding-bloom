import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { wedding_id, guest_session, notification_id } = await req.json();
    if (typeof wedding_id !== 'string' || typeof guest_session !== 'string' || guest_session.length > 512) return json({ error: "Guest session required" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: session } = await db.from("guest_sessions").select("rsvp_id").eq("wedding_id", wedding_id).eq("session_token_hash", await hash(guest_session)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!session?.rsvp_id) return json({ error: "Guest session expired" }, 401);

    if (notification_id) {
      const { data, error } = await db.from("in_app_notifications").update({ read_at: new Date().toISOString() }).eq("id", notification_id).eq("wedding_id", wedding_id).eq("recipient_type", "guest").eq("recipient_rsvp_id", session.rsvp_id).select('id').maybeSingle();
      if (error || !data) return json({ error: 'Notification not found' }, 404);
      return json({ ok: true });
    }

    const [inbox, rsvp, checkin] = await Promise.all([
      db.from("in_app_notifications").select("id,category,title,body,target_url,read_at,created_at").eq("wedding_id", wedding_id).eq("recipient_type", "guest").eq("recipient_rsvp_id", session.rsvp_id).order("created_at", { ascending: false }).limit(50),
      db.from('rsvps').select('id,guest_name,attending,guest_count,email,phone,dietary_preference,dietary_note,message').eq('id', session.rsvp_id).eq('wedding_id', wedding_id).single(),
      db.from('checkins').select('id').eq('wedding_id', wedding_id).eq('rsvp_id', session.rsvp_id).eq('verified', true).limit(1),
    ]);
    if (inbox.error || rsvp.error || checkin.error) return json({ error: 'Your wedding details could not be loaded' }, 500);
    return json({ notifications: inbox.data || [], response: rsvp.data, checked_in: Boolean(checkin.data?.length) });
  } catch {
    return json({ error: "Unable to load notifications" }, 500);
  }
});
