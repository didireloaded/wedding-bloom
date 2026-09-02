import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lightbulb, Mail, Camera, MapPin, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface AISuggestionsProps {
  weddingId: string;
  weddingData: {
    wedding: any;
    rsvps: any[];
    guestbookMessages: any[];
    checkins: any[];
    guestPhotos: any[];
  };
}

const iconMap: Record<string, any> = {
  mail: Mail,
  camera: Camera,
  map: MapPin,
  alert: AlertCircle,
  check: CheckCircle,
  lightbulb: Lightbulb,
};

const AISuggestions = ({ weddingId, weddingData }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const CACHE_KEY = `ai_suggestions_${weddingId}`;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_suggestions", weddingId },
      });
      if (error) throw error;
      if (data?.result?.suggestions) {
        setSuggestions(data.result.suggestions);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ suggestions: data.result.suggestions, ts: Date.now() })); } catch {}
      }
    } catch (e) {
      console.error("Failed to generate suggestions:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < CACHE_TTL) {
          setSuggestions(parsed.suggestions);
          return;
        }
      }
    } catch {}
    generateSuggestions();
  }, []);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-wedding-gold bg-wedding-champagne/10";
      case "medium":
        return "border-l-4 border-l-foreground/30";
      default:
        return "border-l-4 border-l-border";
    }
  };

  return (
    <div className="border border-border bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-wedding-gold" />
          <h3 className="font-body text-xs tracking-[0.15em] uppercase">Things to Take Care Of</h3>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {loading && suggestions.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 animate-pulse rounded" />
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, i) => {
            const Icon = iconMap[suggestion.icon] || Lightbulb;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 border border-border ${getPriorityStyles(suggestion.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-wedding-gold" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display text-sm font-light">{suggestion.title}</p>
                      {suggestion.priority === "high" && (
                        <span className="font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-wedding-gold/20 text-wedding-gold">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-6 text-center">
            <Lightbulb className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
            <p className="font-body text-sm text-muted-foreground">Add more wedding data to get suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;
