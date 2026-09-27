import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Pencil } from "lucide-react";

interface AIStoryGeneratorProps {
  coupleNames: string;
  onGenerated: (story: string) => void;
}

const AIStoryGenerator = ({ coupleNames, onGenerated }: AIStoryGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ howMet: "", firstDate: "", proposal: "" });

  const generate = async () => {
    if (!form.howMet) { toast.error("Please tell us how you met."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_story", ...form, coupleNames },
      });
      if (error) throw error;
      if (data?.result) {
        onGenerated(data.result);
        toast.success("Story draft ready.");
        setOpen(false);
      }
    } catch {
      toast.error("Could not prepare the story draft. Please try again.");
    }
    setLoading(false);
  };

  const inputClass = "w-full rounded-xl border border-black/10 bg-[#f3f3f5] px-4 py-3 text-sm outline-none focus:border-black/30";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-black/5">
        <Pencil className="w-4 h-4" /> Polish story
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-[#f7f7f8] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-[#ff6245]" />
        <h4 className="text-sm font-semibold">Story draft</h4>
      </div>
      <div>
        <label className="wedding-label block mb-1">How did you meet?</label>
        <textarea value={form.howMet} onChange={(e) => setForm({ ...form, howMet: e.target.value })} rows={2} placeholder="We met at a café in Florence..." className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className="wedding-label block mb-1">First date (optional)</label>
        <input value={form.firstDate} onChange={(e) => setForm({ ...form, firstDate: e.target.value })} placeholder="Our first date was..." className={inputClass} />
      </div>
      <div>
        <label className="wedding-label block mb-1">The proposal (optional)</label>
        <textarea value={form.proposal} onChange={(e) => setForm({ ...form, proposal: e.target.value })} rows={2} placeholder="He proposed under the stars..." className={`${inputClass} resize-none`} />
      </div>
      <div className="flex gap-3">
        <button onClick={generate} disabled={loading} className="flex min-h-11 items-center gap-2 rounded-full bg-black px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">
          <Pencil className="w-4 h-4" /> {loading ? "Preparing..." : "Prepare draft"}
        </button>
        <button onClick={() => setOpen(false)} className="min-h-11 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold">Cancel</button>
      </div>
    </div>
  );
};

export default AIStoryGenerator;
