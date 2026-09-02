import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Radio, Clock } from "lucide-react";

interface LiveUpdate {
  id: string;
  message: string;
  update_type: string;
  created_at: string;
}

interface LiveWeddingModeProps {
  weddingId: string;
}

const LiveWeddingMode = ({ weddingId }: LiveWeddingModeProps) => {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);

  useEffect(() => {
    const fetchUpdates = async () => {
      const { data } = await supabase
        .from("live_updates")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setUpdates(data);
    };
    fetchUpdates();

    const channel = supabase
      .channel(`live-${weddingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_updates", filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          setUpdates((prev) => [payload.new as LiveUpdate, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [weddingId]);

  if (updates.length === 0) return null;

  const typeColors: Record<string, string> = {
    ceremony: "bg-wedding-blush",
    reception: "bg-wedding-sage/30",
    alert: "bg-destructive/10",
    info: "bg-wedding-champagne",
  };

  return (
    <section className="wedding-section bg-foreground text-primary-foreground">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <p className="wedding-label text-primary-foreground/70">LIVE NOW</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-light">Wedding Day Updates</h2>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence>
            {updates.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -30, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4 p-5 bg-primary-foreground/10 border border-primary-foreground/20"
              >
                <div className={`shrink-0 w-2 h-2 rounded-full mt-2 ${typeColors[u.update_type] || "bg-wedding-champagne"}`} />
                <div className="flex-1">
                  <p className="font-body text-sm text-primary-foreground">{u.message}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-primary-foreground/50" />
                    <p className="font-body text-[10px] tracking-widest uppercase text-primary-foreground/50">
                      {new Date(u.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LiveWeddingMode;
