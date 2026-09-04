import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ChevronLeft, ChevronRight, RefreshCw, Sparkles, Calendar } from "lucide-react";
import { format, subDays, isToday, parseISO } from "date-fns";

interface DailyReportProps {
  weddingId: string;
}

interface Report {
  id: string;
  report_date: string;
  report_text: string;
  highlights: string[];
  action_items: string[];
  stats: Record<string, number>;
  created_at: string;
}

const DailyReport = ({ weddingId }: DailyReportProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [weddingId]);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("wedding_reports")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("report_date", { ascending: false })
      .limit(7);
    
    if (data) {
      setReports(data as Report[]);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "daily_report", weddingId },
      });
      
      if (error) throw error;
      
      if (data?.result) {
        const today = format(new Date(), "yyyy-MM-dd");
        
        // Upsert the report
        await supabase.from("wedding_reports").upsert({
          wedding_id: weddingId,
          report_date: today,
          report_text: data.result.summary || data.result.greeting,
          highlights: data.result.highlights || [],
          action_items: data.result.actionItems || [],
          stats: {},
        }, {
          onConflict: "wedding_id,report_date",
        });
        
        await fetchReports();
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error("Failed to generate report:", e);
    }
    setGenerating(false);
  };

  const currentReport = reports[currentIndex];
  
  const formatReportDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    const yesterday = subDays(new Date(), 1);
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  if (loading) {
    return (
      <div className="border border-border bg-gradient-to-br from-wedding-champagne/20 to-background p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-wedding-champagne animate-pulse" />
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  // No reports yet - show generate button
  if (reports.length === 0) {
    return (
      <div className="border border-border bg-gradient-to-br from-wedding-champagne/20 to-background p-6">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-wedding-champagne flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-6 h-6 text-wedding-gold" />
          </div>
          <h3 className="font-display text-lg font-light mb-2">Daily Wedding Report</h3>
          <p className="font-body text-sm text-muted-foreground mb-4">
            Get a simple summary of recent wedding activity
          </p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-body text-xs tracking-[0.15em] uppercase min-h-[44px] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating..." : "Generate Today's Report"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-gradient-to-br from-wedding-champagne/20 to-background overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-wedding-champagne flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-wedding-gold" />
          </div>
          <div>
            <h3 className="font-display text-lg font-light">Daily Report</h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span className="font-body text-[10px] tracking-wider uppercase">
                {currentReport ? formatReportDate(currentReport.report_date) : "No reports"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation */}
          {reports.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setCurrentIndex(Math.min(currentIndex + 1, reports.length - 1))}
                disabled={currentIndex === reports.length - 1}
                className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-body text-xs text-muted-foreground w-12 text-center">
                {currentIndex + 1}/{reports.length}
              </span>
              <button
                onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
                disabled={currentIndex === 0}
                className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Regenerate */}
          <button
            onClick={generateReport}
            disabled={generating}
            className="p-2 hover:bg-muted rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Generate new report"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${generating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentReport?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-4 sm:p-6"
        >
          {/* Main Summary */}
          <p className="font-body text-sm sm:text-base leading-relaxed mb-4">
            {currentReport?.report_text}
          </p>

          {/* Highlights */}
          {currentReport?.highlights && currentReport.highlights.length > 0 && (
            <div className="mb-4">
              <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
                Highlights
              </p>
              <ul className="space-y-1.5">
                {currentReport.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-wedding-gold shrink-0 mt-2" />
                    <span className="font-body text-sm text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {currentReport?.action_items && currentReport.action_items.length > 0 && (
            <div className="p-3 bg-muted/30 border border-border/50">
              <p className="font-body text-[10px] tracking-[0.15em] uppercase text-wedding-gold mb-2">
                To-Do
              </p>
              <ul className="space-y-1">
                {currentReport.action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-body text-xs text-muted-foreground">•</span>
                    <span className="font-body text-xs">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyReport;
