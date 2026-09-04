import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const digest = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, token, email, wedding_id } = await req.json();
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (action === "accept") {
      if (!token || !email) return json({ error: "Token and email are required" }, 400);
      const { data: invite } = await db.from("couple_invites").select("*").eq("token_hash", await digest(token)).eq("email", email.toLowerCase().trim()).eq("status", "pending").gt("expires_at", new Date().toISOString()).maybeSingle();
      if (!invite) return json({ error: "Invite is invalid or expired" }, 400);
      const { data: auth } = await db.auth.admin.createUser({ email: email.toLowerCase().trim(), email_confirm: false });
      if (!auth.user) return json({ error: "Unable to create account" }, 500);
      await db.from("wedding_members").insert({ wedding_id: invite.wedding_id, user_id: auth.user.id, role: "owner", joined_at: new Date().toISOString() });
      await db.from("couple_invites").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("id", invite.id);
      return json({ accepted: true });
    }
    if (!email || !wedding_id) return json({ error: "Email and wedding are required" }, 400);
    const bearer = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!bearer) return json({ error: "Authentication required" }, 401);
    const { data: caller } = await db.auth.getUser(bearer);
    if (!caller.user) return json({ error: "Authentication required" }, 401);
    const { data: adminRole } = await db.from("user_roles").select("role").eq("user_id", caller.user.id).eq("role", "admin").maybeSingle();
    if (!adminRole) return json({ error: "Admin access required" }, 403);
    const rawToken = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    const { data, error } = await db.from("couple_invites").insert({ email: email.toLowerCase().trim(), wedding_id, token_hash: await digest(rawToken), created_by: caller.user.id }).select("id, expires_at").single();
    if (error) return json({ error: error.message }, 500);
    return json({ invite_id: data.id, token: rawToken, expires_at: data.expires_at });
  } catch { return json({ error: "Invite request failed" }, 500); }
});
