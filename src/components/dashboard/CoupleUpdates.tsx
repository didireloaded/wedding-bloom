import { useEffect, useState } from "react";
import { Megaphone, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Update = { id: string; message: string; created_at: string };

export default function CoupleUpdates({ weddingId }: { weddingId: string }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setUpdates([]);
    if (weddingId === 'preview-wedding') {
      setLoading(false);
      setError('');
      return () => { active = false; };
    }
    supabase.from("wedding_updates").select("id,message,created_at").eq("wedding_id", weddingId)
      .order("created_at", { ascending: false }).then(({ data, error }) => {
        if (!active) return;
        setError(error ? "Updates could not be loaded." : "");
        setUpdates(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [weddingId]);

  async function post(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim() || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("wedding_updates")
        .insert({ wedding_id: weddingId, message: message.trim() }).select("id,message,created_at").single();
      if (error) throw error;
      setUpdates(items => [data, ...items]);
      setMessage("");
      toast.success("Update added to your wedding page.");
    } catch { toast.error("Your update was not saved. Please try again."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this update from your wedding page?")) return;
    const { error } = await supabase.from("wedding_updates").delete()
      .eq("wedding_id", weddingId).eq("id", id).select("id").single();
    if (error) { toast.error("The update could not be removed."); return; }
    setUpdates(items => items.filter(item => item.id !== id));
  }

  return <section className="space-y-4 font-body">
    <form onSubmit={post} className="fv-update-composer">
      <div className="fv-update-composer-title"><span><Megaphone size={18} /></span><div><h2>Share with your guests</h2><p>This appears on your wedding page</p></div></div>
      <label className="sr-only" htmlFor="guest-update">Message for your guests</label>
      <textarea id="guest-update" required maxLength={2000} rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="What would you like everyone to know?" />
      <div className="fv-update-compose-foot"><span>{message.length}/2000</span><button disabled={busy || !message.trim()}><Send size={16} />{busy ? "Posting..." : "Post update"}</button></div>
    </form>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="fv-published-updates"><h2>Shared updates</h2>
    {loading ? <p role="status" className="fv-update-empty">Loading updates...</p> : !updates.length && !error ? <div className="fv-update-empty"><Megaphone size={22} /><strong>No updates yet</strong><span>Your first message will appear here.</span></div> : updates.map(update => <article key={update.id} className="fv-update-card">
      <div className="flex items-center justify-between gap-3"><time>{new Date(update.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</time><button onClick={() => remove(update.id)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/10" aria-label="Delete update" title="Delete update"><Trash2 className="h-4 w-4" /></button></div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6">{update.message}</p>
    </article>)}</div>
  </section>;
}
