import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Sparkles, Users, Utensils, Clock, MessageSquare, Camera, 
  TrendingUp, AlertCircle, CheckCircle, Lightbulb, Mail, 
  Map, Bell, Calendar, RefreshCw 
} from "lucide-react";

interface AIInsightsProps {
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
  lightbulb: Lightbulb,
  mail: Mail,
  map: Map,
  bell: Bell,
  calendar: Calendar,
};

const AIInsights = ({ weddingData }: AIInsightsProps) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_insights", weddingData },
      });
      if (error) throw error;
      if (data?.result?.insights) {
        setInsights(data.result.insights);
        setLastGenerated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Failed to generate insights:", e);
    }
    setLoadingInsights(false);
  };

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_suggestions", weddingData },
      });
      if (error) throw error;
      if (data?.result?.suggestions) {
        setSuggestions(data.result.suggestions);
      }
    } catch (e) {
      console.error("Failed to generate suggestions:", e);
    }
    setLoadingSuggestions(false);
  };

  useEffect(() => {
    generateInsights();
    generateSuggestions();
  }, []);

  const refreshAll = () => {
    generateInsights();
    generateSuggestions();
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success": return "border-wedding-sage/50 bg-wedding-sage/5";
      case "warning": return "border-amber-400/50 bg-amber-50/30";
      default: return "border-border bg-background";
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high": return "border-wedding-gold/60 bg-wedding-champagne/20";
      case "medium": return "border-foreground/20 bg-muted/30";
      default: return "border-border/50 bg-background";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-wedding-champagne flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-wedding-gold" />
          </div>
          <div>
            <h2 className="font-body text-xl font-semibold">Wedding overview</h2>
            {lastGenerated && (
              <p className="font-body text-[10px] text-muted-foreground tracking-wide">
                Last updated at {lastGenerated}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={refreshAll}
          disabled={loadingInsights || loadingSuggestions}
          className="flex items-center gap-2 px-4 py-2 border border-foreground/20 font-body text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors min-h-[44px] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${(loadingInsights || loadingSuggestions) ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-wedding-gold" />
          <p className="wedding-label">CURRENT OVERVIEW</p>
        </div>

        {loadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 border border-border animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => {
              const Icon = iconMap[insight.icon] || CheckCircle;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-5 border ${getTypeStyles(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-wedding-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-display text-base font-light mb-1">{insight.title}</p>
                      <p className="font-body text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground font-body text-sm py-8">
            Add more RSVP and guest data to generate insights
          </p>
        )}
      </div>

      {/* AI Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-wedding-gold" />
          <p className="wedding-label">RECOMMENDED NEXT</p>
        </div>

        {loadingSuggestions ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 border border-border animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => {
              const Icon = iconMap[suggestion.icon] || Lightbulb;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-5 border ${getPriorityStyles(suggestion.priority)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-wedding-champagne/50 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-wedding-gold" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display text-base font-light">{suggestion.title}</p>
                        {suggestion.priority === "high" && (
                          <span className="font-body text-[9px] tracking-widest uppercase px-2 py-0.5 bg-wedding-gold/20 text-wedding-gold">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{suggestion.description}</p>
                      {suggestion.action && (
                        <p className="font-body text-xs text-wedding-gold mt-2">{suggestion.action}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground font-body text-sm py-8">
            Suggestions will appear as you add wedding data
          </p>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="p-6 border border-border bg-muted/10">
        <p className="wedding-label mb-4">QUICK SUMMARY</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-body text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Total RSVPs</p>
            <p className="font-display text-2xl font-light">{weddingData.rsvps?.length || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Confirmed</p>
            <p className="font-display text-2xl font-light">
              {weddingData.rsvps?.filter((r: any) => r.attending === true).length || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Guestbook Messages</p>
            <p className="font-display text-2xl font-light">{weddingData.guestbookMessages?.length || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Guest Photos</p>
            <p className="font-display text-2xl font-light">{weddingData.guestPhotos?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
