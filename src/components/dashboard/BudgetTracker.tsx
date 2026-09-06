import { useMemo, useState } from 'react';
import { Camera, Car, CircleEllipsis, Download, MapPin, Pencil, Plus, ReceiptText, Shirt, Trash2, Utensils, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BudgetEntry = { id: string; title: string; category: string; amount: number; spent_on: string; notes: string; receipt_url: string | null };
const categories = ['Venue', 'Catering', 'Attire', 'Photography', 'Decor', 'Transport', 'Other'];
const categoryStyles = [
  { color: '#67abf8', icon: MapPin }, { color: '#ff6b5d', icon: Utensils },
  { color: '#31bf94', icon: Shirt }, { color: '#f6ae3c', icon: Camera },
  { color: '#9b7cf6', icon: CircleEllipsis }, { color: '#f08eb5', icon: Car },
  { color: '#9ca3af', icon: ReceiptText },
];
const money = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
const previewEntries: BudgetEntry[] = [
  { id: 'preview-venue', title: 'Venue deposit', category: 'Venue', amount: 18000, spent_on: '2026-08-20', notes: '', receipt_url: null },
  { id: 'preview-catering', title: 'Catering deposit', category: 'Catering', amount: 9500, spent_on: '2026-08-28', notes: '', receipt_url: null },
  { id: 'preview-photo', title: 'Photographer', category: 'Photography', amount: 6500, spent_on: '2026-09-02', notes: '', receipt_url: null },
];

export function summarizeBudget(entries: BudgetEntry[]) {
  const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  return categories.map((category, index) => {
    const amount = entries.filter(entry => entry.category === category).reduce((sum, entry) => sum + Number(entry.amount), 0);
    return { category, amount, percent: total ? Math.round((amount / total) * 100) : 0, ...categoryStyles[index] };
  }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
}

export default function BudgetTracker({ weddingId, coupleNames, slug }: { weddingId: string; coupleNames: string; slug: string }) {
  const [adding, setAdding] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [busy, setBusy] = useState(false);
  const preview = weddingId === 'preview-wedding';
  const [planned, setPlanned] = useState(preview ? '100000' : '');
  const [form, setForm] = useState({ title: '', category: 'Venue', amount: '', spent_on: new Date().toISOString().slice(0, 10), notes: '' });
  const q = useQuery({ queryKey: ['budget', weddingId], enabled: weddingId !== 'preview-wedding', queryFn: async () => {
    const [budget, entries] = await Promise.all([supabase.from('wedding_budgets').select('*').eq('wedding_id', weddingId).maybeSingle(), supabase.from('wedding_budget_entries').select('*').eq('wedding_id', weddingId).order('spent_on', { ascending: false })]);
    if (budget.error || entries.error) throw budget.error || entries.error;
    setPlanned(String(budget.data?.planned_amount || ''));
    return { currency: budget.data?.currency || 'NAD', entries: (entries.data || []) as BudgetEntry[] };
  } });
  const data = q.data || { currency: 'NAD', entries: preview ? previewEntries : [] as BudgetEntry[] };
  const spent = useMemo(() => data.entries.reduce((sum, entry) => sum + Number(entry.amount), 0), [data.entries]);
  const breakdown = useMemo(() => summarizeBudget(data.entries), [data.entries]);
  const budget = Number(planned || 0);
  const remaining = budget - spent;
  const usedPercent = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const saveBudget = async () => { if (preview) return toast.info('Open your wedding workspace to save a budget.'); const amount = Number(planned); if (!Number.isFinite(amount) || amount < 0) return toast.error('Enter a valid budget.'); setBusy(true); const { error } = await supabase.from('wedding_budgets').upsert({ wedding_id: weddingId, planned_amount: amount, currency: data.currency }); setBusy(false); if (error) return toast.error('Budget could not be saved.'); toast.success('Budget updated.'); setEditingBudget(false); await q.refetch(); };
  const addEntry = async (event: React.FormEvent) => { event.preventDefault(); if (preview) return toast.info('Open your wedding workspace to add expenses.'); const amount = Number(form.amount); if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return toast.error('Add a title and a positive amount.'); setBusy(true); const { error } = await supabase.from('wedding_budget_entries').insert({ wedding_id: weddingId, ...form, title: form.title.trim(), amount }); setBusy(false); if (error) return toast.error('Expense could not be added.'); setForm({ title: '', category: 'Venue', amount: '', spent_on: new Date().toISOString().slice(0, 10), notes: '' }); setAdding(false); await q.refetch(); };
  const remove = async (entry: BudgetEntry) => { if (!window.confirm(`Remove ${entry.title} from your budget?`)) return; const { error } = await supabase.from('wedding_budget_entries').delete().eq('id', entry.id).eq('wedding_id', weddingId); if (error) return toast.error('Expense could not be removed.'); await q.refetch(); };
  const download = () => { const lines = [`${coupleNames} budget report`, `Planned: ${money(budget, data.currency)}`, `Spent: ${money(spent, data.currency)}`, `Remaining: ${money(remaining, data.currency)}`, '', ...data.entries.map(entry => `${entry.spent_on} | ${entry.category} | ${entry.title} | ${money(Number(entry.amount), data.currency)}`)]; const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' })); const link = document.createElement('a'); link.href = url; link.download = `${slug}-budget-report.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };

  if (q.isLoading && !preview) return <section className="fv-budget-empty" role="status"><Wallet className="animate-pulse" size={24} /><p>Loading your budget...</p></section>;

  return <section className="fv-budget">
    <div className="fv-budget-balance">
      <div className="fv-budget-balance-head"><span>Wedding budget</span><button onClick={() => setEditingBudget(value => !value)} aria-label="Edit total budget"><Pencil size={16} /></button></div>
      <p>{remaining < 0 ? 'Over budget' : 'Left to spend'}</p>
      <h2 className={remaining < 0 ? 'is-over' : ''}>{money(Math.abs(remaining), data.currency)}</h2>
      <div className="fv-budget-progress"><span style={{ width: `${usedPercent}%` }} /></div>
      <div className="fv-budget-balance-foot"><span><strong>{money(spent, data.currency)}</strong> spent</span><span>{usedPercent}% of {money(budget, data.currency)}</span></div>
    </div>

    <div className="fv-budget-actions"><button onClick={() => setAdding(value => !value)}><span><Plus size={19} /></span>Add expense</button><button onClick={() => setEditingBudget(value => !value)}><span><Pencil size={18} /></span>Edit budget</button><button onClick={download}><span><Download size={18} /></span>Export</button></div>

    {editingBudget && <div className="fv-budget-editor"><label htmlFor="total-wedding-budget">Total wedding budget</label><div><input id="total-wedding-budget" inputMode="decimal" value={planned} onChange={event => setPlanned(event.target.value)} placeholder="Total budget" /><button disabled={busy} onClick={() => void saveBudget()}>{busy ? 'Saving...' : 'Save'}</button></div></div>}
    {adding && <form onSubmit={addEntry} className="fv-expense-form"><div className="flex items-center justify-between"><h2>Add expense</h2><button type="button" onClick={() => setAdding(false)}>Cancel</button></div><label>Purchase<input required maxLength={200} placeholder="What was purchased?" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><div className="grid grid-cols-2 gap-2"><label>Category<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label>Amount<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} /></label></div><label>Date<input required type="date" value={form.spent_on} onChange={event => setForm({ ...form, spent_on: event.target.value })} /></label><label>Notes<textarea maxLength={2000} placeholder="Optional notes or receipt details" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label><button disabled={busy}>{busy ? 'Saving...' : 'Add expense'}</button></form>}

    {q.error && <p role="alert" className="fv-budget-error">Budget could not be loaded. <button onClick={() => void q.refetch()}>Retry</button></p>}
    <section className="fv-budget-section"><div className="fv-budget-section-title"><h2>Where it went</h2><span>{breakdown.length} categor{breakdown.length === 1 ? 'y' : 'ies'}</span></div>
      {breakdown.length ? <><div className="fv-budget-segments">{breakdown.map(item => <span key={item.category} style={{ width: `${item.percent}%`, background: item.color }} />)}</div><div className="fv-budget-categories">{breakdown.map(item => <div key={item.category} style={{ background: item.color }}><span><item.icon size={19} /></span><p><strong>{item.category}</strong><small>{item.percent}% of spending</small></p><b>{money(item.amount, data.currency)}</b></div>)}</div></> : <div className="fv-budget-empty compact"><ReceiptText size={22} /><p>Add your first expense to see where the money is going.</p></div>}
    </section>

    <section className="fv-budget-section"><div className="fv-budget-section-title"><h2>Recent expenses</h2><span>{data.entries.length} total</span></div>
      {data.entries.length ? <ul className="fv-expense-list">{data.entries.map(entry => { const style = categoryStyles[categories.indexOf(entry.category)] || categoryStyles[6]; const Icon = style.icon; return <li key={entry.id}><span className="fv-expense-icon" style={{ background: style.color }}><Icon size={18} /></span><div><strong>{entry.title}</strong><small>{entry.category} · {new Date(`${entry.spent_on}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</small></div><b>-{money(Number(entry.amount), data.currency)}</b><button aria-label={`Remove ${entry.title}`} onClick={() => void remove(entry)}><Trash2 size={16} /></button></li>;})}</ul> : <p className="fv-budget-no-expenses">No expenses recorded yet.</p>}
    </section>
  </section>;
}
