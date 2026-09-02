import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Clock, Wand2 } from "lucide-react";

interface AITimelineGeneratorProps {
  ceremonyTime: string;
  receptionTime: string;
  venue: string;
  onGenerated: (events: { time: string; title: string; description?: string }[]) => void;
}

const AITimelineGenerator = ({ ceremonyTime, receptionTime, venue, onGenerated }: AITimelineGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [dinnerTime, setDinnerTime] = useState("");

  const generate = async () => {
    if (!ceremonyTime) { toast.error("Set a ceremony time first."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_timeline", ceremonyTime, receptionTime, dinnerTime, venue },
      });
      if (error) throw error;
      if (data?.result?.events) {
        onGenerated(data.result.events);
        toast.success("Timeline generated!");
      }
    } catch {
      toast.error("Failed to generate timeline.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border border-wedding-gold/30 bg-wedding-champagne/10 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-wedding-gold" />
        <h4 className="wedding-label">AI TIMELINE GENERATOR</h4>
      </div>
      <p className="font-body text-xs text-muted-foreground">Generate a professional wedding day timeline based on your times.</p>
      <div>
        <label className="wedding-label block mb-1">DINNER TIME (OPTIONAL)</label>
        <input value={dinnerTime} onChange={(e) => setDinnerTime(e.target.value)} placeholder="e.g. 7:00 PM" className="w-full bg-transparent border-b border-foreground/20 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
      </div>
      <button onClick={generate} disabled={loading} className="px-6 py-2 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase min-h-[44px] disabled:opacity-50 flex items-center gap-2">
        <Wand2 className="w-4 h-4" /> {loading ? "GENERATING..." : "GENERATE TIMELINE"}
      </button>
    </div>
  );
};

export default AITimelineGenerator;
