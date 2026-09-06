import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
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
    <h1 className="text-2xl font-semibold">Updates</h1>
    <form onSubmit={post} className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="guest-update">A message for your guests</label>
      <textarea id="guest-update" required maxLength={2000} rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full resize-y rounded-3xl border border-border bg-card p-4 text-sm" placeholder="Share a change of plans or something to look forward to..." />
      <button disabled={busy || !message.trim()} className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" />{busy ? "Posting..." : "Post update"}</button>
    </form>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {loading ? <p role="status" className="text-sm">Loading updates...</p> : !updates.length && !error ? <p className="py-4 text-sm text-muted-foreground">No updates yet.</p> : updates.map(update => <article key={update.id} className="rounded-3xl bg-card p-4">
      <div className="flex items-center justify-between gap-3"><time className="text-xs text-muted-foreground">{new Date(update.created_at).toLocaleDateString()}</time><button onClick={() => remove(update.id)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted" aria-label="Delete update" title="Delete update"><Trash2 className="h-4 w-4" /></button></div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6">{update.message}</p>
    </article>)}
  </section>;
}
