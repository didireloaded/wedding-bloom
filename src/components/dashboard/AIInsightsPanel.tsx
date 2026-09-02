import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Sparkles, Users, Utensils, Clock, MessageSquare, Camera, 
  TrendingUp, AlertCircle, CheckCircle, RefreshCw 
} from "lucide-react";

interface AIInsightsPanelProps {
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
  users: Users,
  utensils: Utensils,
  clock: Clock,
  message: MessageSquare,
  camera: Camera,
  trend: TrendingUp,
  alert: AlertCircle,
  check: CheckCircle,
};

const AIInsightsPanel = ({ weddingId, weddingData }: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const CACHE_KEY = `ai_insights_${weddingId}`;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_insights", weddingId },
      });
      if (error) throw error;
      if (data?.result?.insights) {
        setInsights(data.result.insights);
        const now = new Date().toLocaleTimeString();
        setLastGenerated(now);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ insights: data.result.insights, time: now, ts: Date.now() })); } catch {}
      }
    } catch (e) {
      console.error("Failed to generate insights:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < CACHE_TTL) {
          setInsights(parsed.insights);
          setLastGenerated(parsed.time);
          return;
        }
      }
    } catch {}
    generateInsights();
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-wedding-sage/50 bg-wedding-sage/5";
      case "warning":
        return "border-amber-400/50 bg-amber-50/30 dark:bg-amber-900/10";
      default:
        return "border-border bg-background";
    }
  };

  return (
    <div className="border border-border bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-wedding-gold" />
          <h3 className="font-body text-xs tracking-[0.15em] uppercase">Your Wedding at a Glance</h3>
          {lastGenerated && (
            <span className="font-body text-[9px] text-muted-foreground ml-2">
              Updated {lastGenerated}
            </span>
          )}
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4">
        {loading && insights.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted/30 animate-pulse rounded" />
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, i) => {
              const Icon = iconMap[insight.icon] || CheckCircle;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 border ${getTypeStyles(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-wedding-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-display text-sm font-light">{insight.title}</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
            <p className="font-body text-sm text-muted-foreground">
              Add more RSVP and guest data to generate insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
