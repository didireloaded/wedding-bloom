import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";

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
        toast.success("Story generated!");
        setOpen(false);
      }
    } catch {
      toast.error("Failed to generate story. Please try again.");
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-transparent border-b border-foreground/20 py-2 font-body text-sm focus:outline-none focus:border-foreground";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-wedding-gold/30 text-wedding-gold font-body text-xs tracking-[0.2em] uppercase hover:bg-wedding-gold/10 transition-colors">
        <Wand2 className="w-4 h-4" /> Generate with AI
      </button>
    );
  }

  return (
    <div className="p-6 border border-wedding-gold/30 bg-wedding-champagne/10 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-wedding-gold" />
        <h4 className="wedding-label">AI STORY GENERATOR</h4>
      </div>
      <div>
        <label className="wedding-label block mb-1">HOW DID YOU MEET?</label>
        <textarea value={form.howMet} onChange={(e) => setForm({ ...form, howMet: e.target.value })} rows={2} placeholder="We met at a café in Florence..." className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className="wedding-label block mb-1">FIRST DATE (OPTIONAL)</label>
        <input value={form.firstDate} onChange={(e) => setForm({ ...form, firstDate: e.target.value })} placeholder="Our first date was..." className={inputClass} />
      </div>
      <div>
        <label className="wedding-label block mb-1">THE PROPOSAL (OPTIONAL)</label>
        <textarea value={form.proposal} onChange={(e) => setForm({ ...form, proposal: e.target.value })} rows={2} placeholder="He proposed under the stars..." className={`${inputClass} resize-none`} />
      </div>
      <div className="flex gap-3">
        <button onClick={generate} disabled={loading} className="px-6 py-2 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase min-h-[44px] disabled:opacity-50 flex items-center gap-2">
          <Wand2 className="w-4 h-4" /> {loading ? "GENERATING..." : "GENERATE STORY"}
        </button>
        <button onClick={() => setOpen(false)} className="px-4 py-2 border border-foreground/20 font-body text-xs tracking-[0.2em] uppercase min-h-[44px]">CANCEL</button>
      </div>
    </div>
  );
};

export default AIStoryGenerator;
