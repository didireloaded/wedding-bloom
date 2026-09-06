import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ReminderHistory({ weddingId }: { weddingId: string }) {
  const query = useQuery({ queryKey: ['reminder-history', weddingId], enabled: weddingId !== 'preview-wedding', refetchInterval: 15000, queryFn: async () => {
    const { data, error } = await supabase.from('in_app_notifications').select('id,created_at,read_at,rsvps(guest_name)').eq('wedding_id', weddingId).eq('category', 'rsvp_reminder').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data || [];
  } });
  return <section className="space-y-3 font-body"><h3 className="text-lg font-semibold">Recent reminders</h3>
    {query.error ? <p role="alert" className="text-sm">Reminders could not be loaded. <button className="underline" onClick={() => void query.refetch()}>Retry</button></p> : query.isLoading ? <p className="text-sm">Loading reminders...</p> : !query.data?.length ? <p className="text-sm text-muted-foreground">No reminders sent yet.</p> : <ul className="divide-y divide-border">{query.data.map(item => <li key={item.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{item.rsvps?.guest_name || 'Guest'}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p></div><span className="shrink-0 rounded-full bg-card px-3 py-2 text-xs">{item.read_at ? 'Opened' : 'In guest inbox'}</span></li>)}</ul>}
  </section>;
}
