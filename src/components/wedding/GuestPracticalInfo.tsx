import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Bus, Accessibility, Baby, Mail, Phone, Shirt, Info, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fields = [
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'transport', label: 'Transport', icon: Bus },
  { key: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { key: 'children', label: 'Children', icon: Baby },
  { key: 'other_details', label: 'Other questions and answers', icon: Info },
] as const;
const empty = { parking: '', transport: '', accessibility: '', children: '', contact_name: '', contact_email: '', contact_phone: '', other_details: '' };

export default function GuestPracticalInfo({ weddingId, dressCode, editable = false }: { weddingId: string; dressCode?: string | null; editable?: boolean }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const query = useQuery({ queryKey: ['guest-details', weddingId], enabled: weddingId !== 'preview-wedding', queryFn: async () => {
    const { data, error } = await supabase.from('wedding_guest_details').select('*').eq('wedding_id', weddingId).maybeSingle();
    if (error) throw error;
    return data;
  } });
  useEffect(() => { if (!dirty) setForm({ ...empty, ...query.data }); }, [query.data, dirty]);
  const update = (key: keyof typeof empty, value: string) => { setDirty(true); setForm(current => ({ ...current, [key]: value })); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (weddingId === 'preview-wedding') { toast.info('Sign in to save guest information.'); return; }
    setSaving(true);
    const { error } = await supabase.from('wedding_guest_details').upsert({ ...form, wedding_id: weddingId });
    setSaving(false);
    if (error) { toast.error('Guest information could not be saved.'); return; }
    await query.refetch(); setDirty(false); toast.success('Guest information saved.');
  };
  if (editable) return <section className="space-y-4 font-body">
    <h2 className="text-xl font-semibold">Helpful details for guests</h2>
    {query.error && <p role="alert" className="text-sm text-red-700">Details could not be loaded. <button className="underline" onClick={() => void query.refetch()}>Retry</button></p>}
    <form onSubmit={save} className="space-y-4">
      {fields.map(field => <label key={field.key} className="block text-sm font-medium"><span className="mb-2 flex items-center gap-2"><field.icon className="h-4 w-4" />{field.label}</span><textarea maxLength={field.key === 'other_details' ? 4000 : 2000} rows={2} value={form[field.key]} onChange={e => update(field.key, e.target.value)} className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm font-normal" /></label>)}
      <h3 className="text-sm font-semibold">Guest contact</h3>
      {(['contact_name','contact_email','contact_phone'] as const).map(key => <label key={key} className="block text-sm">{key === 'contact_name' ? 'Contact name' : key === 'contact_email' ? 'Contact email' : 'Contact phone'}<input type={key === 'contact_email' ? 'email' : key === 'contact_phone' ? 'tel' : 'text'} maxLength={key === 'contact_name' ? 150 : key === 'contact_email' ? 254 : 80} value={form[key]} onChange={e => update(key, e.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-black/10 bg-white px-3" /></label>)}
      <button disabled={saving || query.isLoading || Boolean(query.error)} className="flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save guest details'}</button>
    </form>
  </section>;
  const details = query.data;
  if (!dressCode && !details && !query.error) return null;
  return <section className="mx-auto max-w-xl space-y-3 px-5 py-6 font-body">
    <h2 className="text-xl font-semibold">Before you arrive</h2>
    {query.error && <p role="alert" className="text-sm text-muted-foreground">Guest details are unavailable. <button onClick={() => void query.refetch()} className="underline">Retry</button></p>}
    {dressCode && <article className="rounded-3xl bg-white p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Shirt className="h-4 w-4" />Dress code</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm">{dressCode}</p></article>}
    {fields.filter(field => details?.[field.key]).map(field => <details key={field.key} className="rounded-3xl bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">{field.label}</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{details?.[field.key]}</p></details>)}
    {(details?.contact_name || details?.contact_email || details?.contact_phone) && <article className="rounded-3xl bg-white p-4"><h3 className="text-sm font-semibold">Need a hand?</h3><p className="mt-2 text-sm">{details.contact_name}</p>{details.contact_email && <a className="mt-2 flex min-h-11 items-center gap-2 break-all text-sm underline" href={`mailto:${encodeURIComponent(details.contact_email)}`}><Mail className="h-4 w-4 shrink-0" />{details.contact_email}</a>}{details.contact_phone && <a className="flex min-h-11 items-center gap-2 text-sm underline" href={`tel:${details.contact_phone.replace(/[^+\d]/g,'')}`}><Phone className="h-4 w-4" />{details.contact_phone}</a>}</article>}
  </section>;
}
