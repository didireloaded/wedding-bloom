import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { uuidPattern } from "../_shared/guest-content-validation.ts";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body.wedding_id !== "string" || !uuidPattern.test(body.wedding_id)
    || typeof body.guest_session !== "string" || body.guest_session.length < 16 || body.guest_session.length > 512
    || typeof body.verification_token !== "string" || !uuidPattern.test(body.verification_token)) return json({ error: "Arrival verification required" }, 400);
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.guest_session));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await db.rpc("complete_verified_guest_checkin", { p_wedding_id: body.wedding_id, p_session_hash: hash, p_verification_token: body.verification_token });
    if (error) return json({ error: error.code === "28000" ? "Verify your RSVP and arrival again." : "Unable to save check-in" }, error.code === "28000" ? 401 : 500);
    return json(data);
  } catch { return json({ error: "Unable to complete check-in" }, 500); }
});
