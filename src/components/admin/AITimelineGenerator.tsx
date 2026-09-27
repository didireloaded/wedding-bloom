import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarDays, Clock } from "lucide-react";

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
        toast.success("Timeline draft ready.");
      }
    } catch {
      toast.error("Failed to generate timeline.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[#ff6245]" />
        <h4 className="text-base font-semibold">Timeline builder</h4>
      </div>
      <p className="font-body text-xs text-muted-foreground">Prepare a wedding day timeline from your event times.</p>
      <div>
        <label className="wedding-label block mb-1">Dinner time (optional)</label>
        <input value={dinnerTime} onChange={(e) => setDinnerTime(e.target.value)} placeholder="e.g. 7:00 PM" className="w-full rounded-xl border border-black/10 bg-[#f3f3f5] px-4 py-3 text-sm outline-none focus:border-black/30" />
      </div>
      <button onClick={generate} disabled={loading} className="flex min-h-11 items-center gap-2 rounded-full bg-black px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">
        <CalendarDays className="w-4 h-4" /> {loading ? "Preparing..." : "Prepare timeline"}
      </button>
    </div>
  );
};

export default AITimelineGenerator;
