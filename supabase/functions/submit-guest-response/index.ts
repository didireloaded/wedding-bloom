import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))))
  .map((byte) => byte.toString(16).padStart(2, "0")).join("");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  const allowedHostnames = Deno.env.get("TURNSTILE_ALLOWED_HOSTNAMES")?.split(",").map((host) => host.trim()).filter(Boolean);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret || !allowedHostnames?.length || !url || !serviceKey) return json({ error: "RSVP verification is unavailable" }, 503);
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 16000) return json({ error: "Response is too long" }, 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid request" }, 400);
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const { wedding_id, response, guest_session, challenge_token } = body;
  if (typeof wedding_id !== "string" || !uuid.test(wedding_id) || !response || typeof response !== "object" || Array.isArray(response)
    || (guest_session !== null && guest_session !== undefined && (typeof guest_session !== "string" || guest_session.length > 512))
    || typeof challenge_token !== "string" || challenge_token.length < 1 || challenge_token.length > 2048) {
    return json({ error: "Invalid RSVP request" }, 400);
  }

  try {
    const validation = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: challenge_token, idempotency_key: crypto.randomUUID() }),
      signal: AbortSignal.timeout(10000),
    });
    if (!validation.ok) return json({ error: "Verification is temporarily unavailable" }, 503);
    const result = await validation.json();
    if (result.success !== true || result.action !== "wedding_rsvp" || !allowedHostnames.includes(result.hostname)) {
      return json({ error: "Verification expired. Please try again" }, 403);
    }

    const db = createClient(url, serviceKey);
    const { data: allowed, error: limitError } = await db.rpc("consume_ai_quota", {
      p_subject_hash: await hash(wedding_id), p_action: "public-rsvp", p_limit: 500,
    });
    if (limitError) return json({ error: "RSVP service is temporarily unavailable" }, 503);
    if (!allowed) return json({ error: "Too many RSVP requests. Please try again later" }, 429);

    const { data, error } = await db.rpc("submit_guest_response", {
      p_wedding_id: wedding_id,
      p_response: response,
      p_session_token: guest_session || null,
    });
    if (error) {
      const messages = [
        "This wedding is not available", "RSVPs are closed. Please contact the couple", "Enter your name",
        "Choose your response", "Response is too long", "Party size must be between 1 and 20",
        "Your guest session expired. Please contact the couple",
        "The wedding has reached its guest capacity. Please contact the couple",
      ];
      return json({ error: messages.includes(error.message) ? error.message : "Your response could not be saved" }, 400);
    }
    return json(data);
  } catch {
    return json({ error: "RSVP service is temporarily unavailable" }, 503);
  }
});
