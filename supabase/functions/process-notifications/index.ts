import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const targetFor = (eventType: string, slug: string) => eventType === "guest_arrived" ? "/couple-dashboard?tab=guests&view=arrivals" : eventType === "photo_uploaded" || eventType === "moment_created" || eventType === "wall_message_created" ? "/couple-dashboard?tab=moments" : `/wedding/${slug}#events`;
const messageFor = (event: any) => event.event_type === "guest_arrived" ? `${event.payload?.guest_name || "A guest"} +${Math.max(0, Number(event.payload?.party_size || 1) - 1)} arrived.` : event.event_type === "photo_uploaded" ? `${event.payload?.guest_name || "A guest"} shared a wedding photo.` : "Your wedding has a new update.";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  try {
    const engineSecret = Deno.env.get("NOTIFICATION_ENGINE_SECRET");
    if (!engineSecret || req.headers.get("x-notification-engine-secret") !== engineSecret) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT") || "mailto:hello@forevervow.app", Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);
    const { data: events, error } = await db.from("notification_events").select("*").eq("status", "pending").order("created_at", { ascending: true }).limit(50);
    if (error) return json({ error: error.message }, 500);
    let processed = 0;
    for (const event of events || []) {
      const { data: wedding } = await db.from("weddings").select("slug, couple_names").eq("id", event.wedding_id).single();
      if (!wedding) continue;
      const isReminder = event.event_type === "rsvp_reminder";
      const title = isReminder ? `${wedding.couple_names} are waiting for your RSVP` : event.event_type === "guest_arrived" ? "Guest arrival" : event.event_type === "photo_uploaded" ? "New wedding photo" : "Wedding update";
      const body = isReminder ? "Please let the couple know whether you can celebrate with them." : messageFor(event);
      const target_url = isReminder ? `/wedding/${wedding.slug}?view=rsvp` : targetFor(event.event_type, wedding.slug);
      let subscriptionsQuery = db.from("push_subscriptions").select("*").eq("wedding_id", event.wedding_id).eq("audience_type", isReminder ? "guest" : "couple").eq("enabled", true);
      if (isReminder && event.payload?.target_rsvp_id) subscriptionsQuery = subscriptionsQuery.eq("guest_id", event.payload.target_rsvp_id);
      const { data: rawSubscriptions } = await subscriptionsQuery;
      let subscriptions = rawSubscriptions || [];
      if (isReminder && !event.payload?.target_rsvp_id) {
        const { data: pendingRsvps } = await db.from("rsvps").select("id").eq("wedding_id", event.wedding_id).is("attending", null);
        const pendingIds = new Set((pendingRsvps || []).map((rsvp) => rsvp.id));
        subscriptions = subscriptions.filter((subscription) => subscription.guest_id && pendingIds.has(subscription.guest_id));
      }
      for (const subscription of subscriptions || []) {
        const recipientType = isReminder ? "guest" : "couple";
        const { data: delivery } = await db.from("notification_deliveries").upsert({ wedding_id: event.wedding_id, notification_event_id: event.id, push_subscription_id: subscription.id, recipient_type: recipientType, category: event.event_type, title, body, target_url, delivery_status: "pending" }, { onConflict: "notification_event_id,push_subscription_id,category" }).select("id").single();
        await db.from("in_app_notifications").insert({ wedding_id: event.wedding_id, recipient_type: recipientType, recipient_device_id: isReminder ? subscription.guest_id : subscription.couple_device_id, category: event.event_type, title, body, target_url });
        try { await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh_key, auth: subscription.auth_key } }, JSON.stringify({ title, body, target_url })); await db.from("notification_deliveries").update({ sent_at: new Date().toISOString(), delivery_status: "sent" }).eq("id", delivery?.id); }
        catch (pushError) { const statusCode = (pushError as any)?.statusCode; await db.from("notification_deliveries").update({ delivery_status: "failed", error_code: String(statusCode || "push_failed") }).eq("id", delivery?.id); if (statusCode === 404 || statusCode === 410) await db.from("push_subscriptions").update({ enabled: false }).eq("id", subscription.id); }
      }
      await db.from("notification_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", event.id);
      processed += 1;
    }
    return json({ processed });
  } catch (error) { return json({ error: String(error) }, 500); }
});
