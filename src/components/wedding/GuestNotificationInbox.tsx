import { useEffect, useState } from "react";
import { Bell, Check, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type GuestNotification = { id: string; title: string; body: string; target_url: string; read_at: string | null; created_at: string };

export default function GuestNotificationInbox({ weddingId, guestSession }: { weddingId: string; guestSession?: string | null }) {
  const [items, setItems] = useState<GuestNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!guestSession || weddingId === "preview-wedding") return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.functions.invoke("get-guest-notifications", { body: { wedding_id: weddingId, guest_session: guestSession } });
      if (!cancelled && Array.isArray(data?.notifications)) setItems(data.notifications);
    };
    void load();
    const handler = () => void load();
    window.addEventListener("forevervow:guest-realtime", handler);
    return () => { cancelled = true; window.removeEventListener("forevervow:guest-realtime", handler); };
  }, [weddingId, guestSession]);

  if (!guestSession || weddingId === "preview-wedding" || items.length === 0) return null;
  const unread = items.filter((item) => !item.read_at).length;
  const markRead = async (item: GuestNotification) => {
    if (!item.read_at) {
      await supabase.functions.invoke("get-guest-notifications", { body: { wedding_id: weddingId, guest_session: guestSession, notification_id: item.id } });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
    }
    if (item.target_url) window.location.href = item.target_url;
  };

  return <section className="mx-5 mb-4 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm">
    <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 text-left" aria-expanded={open}>
      <span className="relative rounded-full bg-[#202020] p-2 text-white"><Bell className="h-4 w-4" />{unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d9f06e] px-1 text-[9px] font-bold text-black">{unread}</span>}</span>
      <span className="min-w-0 flex-1"><span className="block font-body text-sm font-semibold">Wedding updates</span><span className="block font-body text-xs text-muted-foreground">{unread ? `${unread} new update${unread === 1 ? "" : "s"}` : "All caught up"}</span></span>
      <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
    </button>
    {open && <div className="mt-3 space-y-2 border-t border-black/5 pt-3">{items.map((item) => <button key={item.id} onClick={() => void markRead(item)} className="flex w-full items-start gap-3 rounded-2xl bg-black/[0.03] p-3 text-left"><span className="mt-0.5 text-muted-foreground">{item.read_at ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</span><span className="min-w-0"><span className="block font-body text-sm font-semibold">{item.title}</span><span className="mt-1 block font-body text-xs leading-5 text-muted-foreground">{item.body}</span></span></button>)}</div>}
  </section>;
}
