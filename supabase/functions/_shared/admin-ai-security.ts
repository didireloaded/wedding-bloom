import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { sha256 } from "./ai-security.ts";

export const aiJson = (body: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { ...headers, "Content-Type": "application/json" },
});

export async function authorizeAdminAi(req: Request, action: string, headers: HeadersInit) {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return { error: aiJson({ error: "Sign in required" }, 401, headers) };
  const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return { error: aiJson({ error: "Sign in required" }, 401, headers) };
  const { data: role } = await db.from("user_roles").select("role").eq("user_id", auth.user.id).eq("role", "admin").maybeSingle();
  if (!role) return { error: aiJson({ error: "Admin access required" }, 403, headers) };
  const { data: allowed, error } = await db.rpc("consume_ai_quota", {
    p_subject_hash: await sha256(`user:${auth.user.id}`),
    p_action: action,
    p_limit: 30,
  });
  if (error) return { error: aiJson({ error: "Assistant quota unavailable" }, 503, headers) };
  if (!allowed) return { error: aiJson({ error: "Too many assistant requests. Please try again after the hour." }, 429, headers) };
  return { user: auth.user };
}
