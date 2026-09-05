import { useState } from "react";
import { Bell, X } from "lucide-react";
import { isPushSupported, registerPushSubscription, requestPushPermission } from "@/lib/pushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { getGuestSessionToken } from "@/lib/guestSession";
import { toast } from "sonner";
export default function NotificationPrompt({ weddingId, coupleNames, guestSession }: { weddingId: string; coupleNames: string; guestSession?: string | null }) {
  const [visible, setVisible] = useState(() => localStorage.getItem(`forevervow-notification-dismissed-${weddingId}`) !== "true");
  const [busy, setBusy] = useState(false);
  if (!visible || !isPushSupported()) return null;
  const enable = async () => {
    setBusy(true);
    try {
      const session = guestSession || getGuestSessionToken(weddingId);
      if (!session) throw new Error("Please respond to the RSVP first, then enable notifications.");
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Notifications are not available yet. Check the wedding page for updates.");
      const permission = await requestPushPermission();
      if (permission !== "granted") throw new Error("Notifications are blocked. You can allow them in your browser settings.");
      const subscription = await registerPushSubscription(publicKey);
      if (!subscription) throw new Error("This browser could not register notifications.");
      const { data, error } = await supabase.functions.invoke("register-push-subscription", { body: { wedding_id: weddingId, audience_type: "guest", guest_session: session, subscription: subscription.toJSON() } });
      if (error || !data?.id) throw new Error("Notifications could not be saved. Please try again.");
      setVisible(false);
      toast.success("Wedding updates are enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not enable notifications.");
    } finally { setBusy(false); }
  };
  return <div className="mx-5 mb-4 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm"><div className="flex gap-3"><div className="rounded-full bg-[#202020] p-2 text-white"><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="font-body text-sm font-semibold">Stay updated for {coupleNames}</p><button onClick={() => { localStorage.setItem(`forevervow-notification-dismissed-${weddingId}`, "true"); setVisible(false); }} aria-label="Dismiss notifications"><X className="h-4 w-4" /></button></div><p className="mt-1 font-body text-xs text-muted-foreground">Get important schedule, venue, and wedding-day updates.</p><button onClick={enable} disabled={busy} className="mt-3 rounded-full bg-[#202020] px-4 py-2 font-body text-xs font-semibold text-white">{busy ? "Enabling..." : "Enable Notifications"}</button></div></div></div>;
}
