import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function NextUp({ weddingId, onTabChange }: { weddingId: string; onTabChange: (tab: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [tab, setTab] = useState('calendar');
  const [busy, setBusy] = useState(false);
  const query = useQuery({ queryKey: ['wedding-tasks', weddingId], enabled: weddingId !== 'preview-wedding', queryFn: async () => {
    const { data, error } = await supabase.from('wedding_tasks').select('*').eq('wedding_id', weddingId).order('due_date', { nullsFirst: false }).order('created_at');
    if (error) throw error;
    return data || [];
  } });
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (weddingId === 'preview-wedding') return toast.info('Sign in to save your next steps.');
    setBusy(true);
    const { error } = await supabase.from('wedding_tasks').insert({ wedding_id: weddingId, title: title.trim(), due_date: date || null, target_tab: tab });
    setBusy(false);
    if (error) return toast.error('Your next step could not be saved.');
    setTitle(''); setDate(''); setAdding(false); await query.refetch();
  };
  const complete = async (id: string, completed: boolean) => {
    const { error } = await supabase.from('wedding_tasks').update({ completed_at: completed ? null : new Date().toISOString() }).eq('id', id).eq('wedding_id', weddingId).select('id').single();
    if (error) return toast.error('This step could not be updated.');
    await query.refetch();
  };
  const remove = async (id: string) => {
    if (!window.confirm('Remove this next step?')) return;
    const { error } = await supabase.from('wedding_tasks').delete().eq('id', id).eq('wedding_id', weddingId).select('id').single();
    if (error) return toast.error('This step could not be removed.');
    await query.refetch();
  };
  const rows = query.data || [];
  const sorted = [...rows].sort((a,b) => Number(Boolean(a.completed_at)) - Number(Boolean(b.completed_at)));
  return <section className="space-y-3 font-body">
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Next up</h2><p className="text-xs text-muted-foreground">{rows.length ? `${rows.filter(row => row.completed_at).length} of ${rows.length} done` : 'Your next wedding steps'}</p></div><button aria-label="Add next step" onClick={() => setAdding(!adding)} className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"><Plus className="h-4 w-4" /></button></div>
    {adding && <form onSubmit={save} className="space-y-3 rounded-3xl bg-white p-4">
      <label className="block text-sm">Next step<input required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border p-3" /></label>
      <label className="block text-sm">Due date<input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 min-h-11 w-full min-w-0 rounded-xl border p-3" /></label>
      <label className="block text-sm">Related to<select value={tab} onChange={e => setTab(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border p-3">{['guests','calendar','updates','profile','moments'].map(value => <option key={value} value={value}>{value === 'moments' ? 'Memories' : value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label>
      <button disabled={busy || !title.trim()} className="min-h-11 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save step'}</button>
    </form>}
    {query.error ? <p role="alert" className="text-sm text-red-700">Next steps could not be loaded. <button className="underline" onClick={() => void query.refetch()}>Retry</button></p> : query.isLoading ? <p className="text-sm">Loading next steps...</p> : !rows.length && <p className="py-3 text-sm text-muted-foreground">Nothing added yet.</p>}
    {sorted.map(row => <article key={row.id} className="flex items-center gap-2 rounded-3xl bg-white p-3">
      <label className="grid h-11 w-9 shrink-0 place-items-center"><input aria-label={`Complete ${row.title}`} type="checkbox" checked={Boolean(row.completed_at)} onChange={() => void complete(row.id, Boolean(row.completed_at))} className="h-5 w-5 accent-black" /></label>
      <button onClick={() => onTabChange(row.target_tab)} className="min-w-0 flex-1 text-left"><span className={`block break-words text-sm font-medium ${row.completed_at ? 'line-through text-muted-foreground' : ''}`}>{row.title}</span><span className="mt-1 block text-xs text-muted-foreground">{row.due_date ? new Date(`${row.due_date}T12:00:00`).toLocaleDateString() : 'No due date'} <ArrowUpRight className="inline h-3 w-3" /></span></button>
      <button aria-label={`Remove ${row.title}`} onClick={() => void remove(row.id)} className="grid h-11 w-9 shrink-0 place-items-center rounded-full text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
    </article>)}
  </section>;
}
