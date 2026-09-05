import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  try {
    const { wedding_id, guest_session, notification_id } = await req.json();
    if (!wedding_id || !guest_session) return json({ error: "Guest session required" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: session } = await db.from("guest_sessions").select("rsvp_id").eq("wedding_id", wedding_id).eq("session_token_hash", await hash(guest_session)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!session?.rsvp_id) return json({ error: "Guest session expired" }, 401);

    if (notification_id) {
      await db.from("in_app_notifications").update({ read_at: new Date().toISOString() }).eq("id", notification_id).eq("wedding_id", wedding_id).eq("recipient_type", "guest").eq("recipient_device_id", session.rsvp_id);
      return json({ ok: true });
    }

    const { data, error } = await db.from("in_app_notifications").select("id,category,title,body,target_url,read_at,created_at").eq("wedding_id", wedding_id).eq("recipient_type", "guest").eq("recipient_device_id", session.rsvp_id).order("created_at", { ascending: false }).limit(20);
    if (error) return json({ error: error.message }, 500);
    return json({ notifications: data || [] });
  } catch {
    return json({ error: "Unable to load notifications" }, 500);
  }
});
