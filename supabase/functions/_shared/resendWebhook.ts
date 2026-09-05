import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "npm:svix@1.76.1";

type ResendAudience = "admin" | "couple";

type ResendEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    subject?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const handleResendWebhook = async (
  req: Request,
  audience: ResendAudience,
  secretName: "RESEND_ADMIN_WEBHOOK_SECRET" | "RESEND_COUPLE_WEBHOOK_SECRET",
) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get(secretName);
  if (!webhookSecret) {
    console.error(`Missing required secret: ${secretName}`);
    return json({ error: "Webhook is not configured" }, 503);
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return json({ error: "Missing webhook signature headers" }, 400);
  }

  // Resend signatures cover the exact request bytes, so verify before parsing.
  const payload = await req.text();
  let event: ResendEvent;
  try {
    event = new Webhook(webhookSecret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendEvent;
  } catch {
    return json({ error: "Invalid webhook signature" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase service credentials are unavailable");
    return json({ error: "Webhook storage is not configured" }, 503);
  }

  const db = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await db.from("resend_webhook_events").upsert(
    {
      svix_id: svixId,
      audience,
      event_type: event.type ?? "unknown",
      event_created_at: event.created_at ?? null,
      email_id: event.data?.email_id ?? null,
      payload: event,
    },
    { onConflict: "svix_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("Unable to persist Resend webhook event", {
      audience,
      svixId,
      code: error.code,
    });
    return json({ error: "Unable to process webhook" }, 500);
  }

  return json({ received: true });
};
