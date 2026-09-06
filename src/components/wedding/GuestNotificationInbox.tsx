import { useState } from 'react';
import { Bell, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { GuestNotification } from '@/hooks/useGuestContext';

export default function GuestNotificationInbox({ weddingId, guestSession, items, onRefresh, onAction }: {
  weddingId: string; guestSession: string | null; items: GuestNotification[]; onRefresh: () => unknown; onAction: (view: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  if (!guestSession) return null;
  const unread = items.filter(item => !item.read_at).length;
  const visit = async (item: GuestNotification) => {
    setBusy(item.id);
    if (!item.read_at) {
      const { data, error } = await supabase.functions.invoke('get-guest-notifications', { body: { wedding_id: weddingId, guest_session: guestSession, notification_id: item.id } });
      if (error || !data?.ok) { toast.error('Could not mark this update as read. Please retry.'); setBusy(null); return; }
      onRefresh();
    }
    setBusy(null);
    const target = new URL(item.target_url, window.location.origin);
    if (target.origin === window.location.origin && target.pathname === window.location.pathname) onAction(target.searchParams.get('view') || 'home');
  };
  return <section className="mx-auto mb-4 w-full max-w-xl px-5">
    <button onClick={() => setOpen(!open)} className="flex min-h-14 w-full items-center gap-3 rounded-3xl bg-white/90 p-4 text-left shadow-sm" aria-expanded={open}>
      <Bell className="h-5 w-5 shrink-0" /><span className="flex-1 text-sm font-semibold">Your updates</span>
      <span className="rounded-full bg-[#d9f06e] px-2 py-1 text-xs">{unread ? `${unread} new` : 'All read'}</span><ChevronDown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="mt-3 space-y-2">{items.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No updates yet.</p> : items.map(item => <button disabled={busy !== null} key={item.id} onClick={() => void visit(item)} className="flex w-full gap-3 rounded-3xl bg-white p-4 text-left disabled:opacity-60">
      {item.read_at ? <Check className="mt-1 h-4 w-4 shrink-0" /> : <Bell className="mt-1 h-4 w-4 shrink-0" />}<span className="min-w-0"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block break-words text-sm text-muted-foreground">{item.body}</span><time className="mt-2 block text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</time></span>
    </button>)}</div>}
  </section>;
}
