import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  try {
    const { wedding_id, device_token, category, delivery_mode, enabled = true } = await req.json();
    if (!wedding_id || !device_token || !category || !["immediate", "grouped", "off"].includes(delivery_mode)) return json({ error: "Invalid preference" }, 400);
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Authentication required" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
    const { data: userData } = await authDb.auth.getUser();
    if (!userData.user) return json({ error: "Authentication required" }, 401);
    const { data: member } = await db.from("wedding_members").select("id").eq("wedding_id", wedding_id).eq("user_id", userData.user.id).maybeSingle();
    if (!member) return json({ error: "Wedding membership required" }, 403);
    const tokenHash = await hash(device_token);
    const { data: session, error: sessionError } = await db.from("couple_device_sessions").upsert({ wedding_id, device_token_hash: tokenHash, last_seen_at: new Date().toISOString() }, { onConflict: "device_token_hash" }).select("id").single();
    if (sessionError) return json({ error: sessionError.message }, 500);
    const { error } = await db.from("notification_preferences").upsert({ couple_device_session_id: session.id, category, delivery_mode, enabled, updated_at: new Date().toISOString() }, { onConflict: "couple_device_session_id,category" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  } catch { return json({ error: "Unable to update preferences" }, 500); }
});
