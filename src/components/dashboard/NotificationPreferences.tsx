import { useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPushSubscription } from "@/lib/pushNotifications";
import { toast } from "sonner";

const categories = ["arrivals", "rsvp", "photos", "moments"];
export default function NotificationPreferences({ weddingId }: { weddingId: string }) {
  const [saving, setSaving] = useState<string | null>(null);
  const [modes, setModes] = useState<Record<string, string>>({ arrivals: "immediate", rsvp: "grouped", photos: "grouped", moments: "grouped" });
  const update = async (category: string, mode: string) => {
    setModes((current) => ({ ...current, [category]: mode })); setSaving(category);
    const subscription = await getPushSubscription();
    if (!subscription) { toast.info("Enable notifications on this device first."); setSaving(null); return; }
    const { error } = await supabase.functions.invoke("update-notification-preferences", { body: { wedding_id: weddingId, device_token: subscription.endpoint, category, delivery_mode: mode, enabled: mode !== "off" } });
    if (error) toast.error("Could not save notification preference."); else toast.success("Notification preference saved.");
    setSaving(null);
  };
  return <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="rounded-full bg-[#202020] p-2 text-white"><Bell className="h-4 w-4" /></div><div><p className="font-body text-sm font-semibold">Notification preferences</p><p className="font-body text-xs text-muted-foreground">Choose what reaches you on this device.</p></div></div><div className="space-y-3">{categories.map((category) => <div key={category} className="flex items-center justify-between gap-3"><span className="font-body text-sm capitalize">{category}</span><select value={modes[category]} disabled={saving === category} onChange={(event) => update(category, event.target.value)} className="rounded-full border border-black/10 bg-muted/40 px-3 py-2 font-body text-xs"><option value="immediate">Immediate</option><option value="grouped">Grouped</option><option value="off">Off</option></select></div>)}</div></div>;
}
