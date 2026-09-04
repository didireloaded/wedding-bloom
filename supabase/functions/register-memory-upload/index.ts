import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  try { const { wedding_id, guest_session, file_name, mime_type, file_size } = await req.json(); if (!wedding_id || !guest_session || !file_name || !mime_type?.startsWith("image/") || Number(file_size) > 15 * 1024 * 1024) return json({ error: "Invalid memory upload" }, 400); const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!); const { data: session } = await db.from("guest_sessions").select("id").eq("wedding_id", wedding_id).eq("session_token_hash", await hash(guest_session)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle(); if (!session) return json({ error: "Guest session expired" }, 401); return json({ guest_session_id: session.id, storage_path: `${wedding_id}/photos/${crypto.randomUUID()}.jpg`, max_size: 15 * 1024 * 1024 }); } catch { return json({ error: "Unable to authorize upload" }, 500); }
});
