import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => { const r = 6371000; const rad = Math.PI / 180; const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2; return 2 * r * Math.asin(Math.sqrt(a)); };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { wedding_id, guest_session, latitude, longitude, accuracy } = await req.json();
    if (!wedding_id || !guest_session || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return json({ error: "Missing location or guest session" }, 400);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [{ data: session }, { data: settings }] = await Promise.all([
      db.from("guest_sessions").select("id, rsvp_id").eq("wedding_id", wedding_id).eq("session_token_hash", await hash(guest_session)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle(),
      db.from("wedding_checkin_settings").select("latitude, longitude, radius_meters, checkin_enabled, geolocation_enabled").eq("wedding_id", wedding_id).maybeSingle(),
    ]);
    if (!session) return json({ error: "Guest session expired" }, 401);
    if (!settings?.checkin_enabled || !settings.geolocation_enabled || settings.latitude == null || settings.longitude == null) return json({ error: "Location check-in is unavailable", qr_fallback: true }, 400);
    const distance_meters = distance(Number(latitude), Number(longitude), Number(settings.latitude), Number(settings.longitude));
    const verified = Number.isFinite(accuracy) && Number(accuracy) <= 250 && distance_meters <= Number(settings.radius_meters) + Number(accuracy);
    return json({ verified, distance_meters: Math.round(distance_meters), accuracy: Number(accuracy), verification_token: verified ? crypto.randomUUID() : null, qr_fallback: !verified });
  } catch { return json({ error: "Unable to verify arrival" }, 500); }
});
