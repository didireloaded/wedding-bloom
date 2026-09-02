import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Clock, Image, Star, Trash2, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MomentsManagerProps {
  weddingId: string;
  moments: any[];
  isLiveMode: boolean;
  onRefresh: () => void;
}

const MomentsManager = ({ weddingId, moments, isLiveMode, onRefresh }: MomentsManagerProps) => {
  const [aiLoading, setAiLoading] = useState(false);

  const pending = moments.filter((m) => !m.approved);
  const approved = moments.filter((m) => m.approved);
  const withPhotos = moments.filter((m) => !!m.photo_url);

  const callManageMoments = async (action: string, momentId?: string) => {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-moments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wedding_id: weddingId,
        access_code: sessionStorage.getItem("couple_access_code") || "",
        action,
        moment_id: momentId,
      }),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  const approveMoment = async (id: string, highlight = false) => {
    try {
      await callManageMoments(highlight ? "highlight" : "approve", id);
      toast.success(highlight ? "Moment highlighted ✦" : "Moment approved");
      onRefresh();
    } catch {
      toast.error("Failed to update moment");
    }
  };

  const deleteMoment = async (id: string) => {
    try {
      await callManageMoments("delete", id);
      toast.success("Moment deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete moment");
    }
  };

  const toggleLiveMode = async () => {
    try {
      await callManageMoments("toggle_live_mode");
      toast.success(isLiveMode ? "Reception Mode disabled" : "Reception Mode enabled — moments auto-approved!");
      onRefresh();
    } catch {
      toast.error("Failed to toggle Reception Mode");
    }
  };

  const toggleHighlight = async (id: string, currentlyHighlighted: boolean) => {
    try {
      await callManageMoments("highlight", id);
      toast.success(currentlyHighlighted ? "Highlight removed" : "Moment highlighted ✦");
      onRefresh();
    } catch {
      toast.error("Failed to update moment");
    }
  };

  const suggestHighlights = async () => {
    if (approved.length === 0) {
      toast.info("No approved moments to analyze.");
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: {
          type: "suggest_highlights",
          moments: approved.map((m) => ({
            id: m.id,
            guest_name: m.guest_name,
            message: m.message,
            has_photo: !!m.photo_url,
            highlighted: m.highlighted,
          })),
        },
      });
      if (error) throw error;
      const ids = data?.result?.highlight_ids || [];
      if (ids.length > 0) {
        for (const id of ids) {
          await callManageMoments("highlight", id);
        }
        toast.success(`${ids.length} moment${ids.length > 1 ? "s" : ""} highlighted by AI ✨`);
        onRefresh();
      } else {
        toast.info("AI didn't find any new moments to highlight.");
      }
    } catch {
      toast.error("Failed to get AI suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl sm:text-2xl font-light">Wedding Moments</h2>
        <button
          onClick={suggestHighlights}
          disabled={aiLoading || approved.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-foreground/15 font-body text-[10px] tracking-[0.2em] uppercase hover:bg-muted transition-colors disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {aiLoading ? "Analyzing..." : "AI Highlights"}
        </button>
      </div>

      {/* Reception Mode Toggle */}
      <div className="flex items-center justify-between p-4 border border-border">
        <div>
          <p className="font-body text-xs tracking-[0.15em] uppercase">Reception Mode</p>
          <p className="font-body text-[10px] text-muted-foreground mt-1">
            Instantly approves new moments and activates live visual effects
          </p>
        </div>
        <button
          onClick={toggleLiveMode}
          className={`w-12 h-6 rounded-full transition-colors relative ${isLiveMode ? "bg-wedding-gold" : "bg-muted"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${
              isLiveMode ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: moments.length, icon: MessageSquare },
          { label: "Pending", value: pending.length, icon: Clock },
          { label: "With Photos", value: withPhotos.length, icon: Image },
        ].map((stat) => (
          <div key={stat.label} className="p-4 border border-border bg-background">
            <stat.icon className="w-4 h-4 text-muted-foreground mb-2" strokeWidth={1.5} />
            <p className="font-display text-2xl font-light">{stat.value}</p>
            <p className="font-body text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Pending moments */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="wedding-label text-amber-600">PENDING APPROVAL ({pending.length})</p>
          {pending.map((m) => (
            <MomentRow
              key={m.id}
              moment={m}
              formatTime={formatTime}
              onApprove={() => approveMoment(m.id)}
              onHighlight={() => approveMoment(m.id, true)}
              onDelete={() => deleteMoment(m.id)}
              isPending
            />
          ))}
        </div>
      )}

      {/* Approved moments */}
      {approved.length > 0 && (
        <div className="space-y-3">
          <p className="wedding-label">APPROVED ({approved.length})</p>
          {approved.slice(0, 10).map((m) => (
            <MomentRow
              key={m.id}
              moment={m}
              formatTime={formatTime}
              onHighlight={() => toggleHighlight(m.id, m.highlighted)}
              onDelete={() => deleteMoment(m.id)}
            />
          ))}
        </div>
      )}

      {moments.length === 0 && (
        <div className="py-12 text-center border border-dashed border-border">
          <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="font-body text-sm text-muted-foreground">No moments yet. They'll appear here when guests start posting.</p>
        </div>
      )}
    </div>
  );
};

const MomentRow = ({
  moment,
  formatTime,
  onApprove,
  onHighlight,
  onDelete,
  isPending,
}: {
  moment: any;
  formatTime: (d: string) => string;
  onApprove?: () => void;
  onHighlight?: () => void;
  onDelete?: () => void;
  isPending?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`flex items-start gap-4 p-4 border ${
      isPending ? "border-amber-200/60 bg-amber-50/20 dark:bg-amber-900/10" : "border-border bg-background"
    }`}
  >
    {moment.photo_url && (
      <img
        src={moment.photo_url}
        alt=""
        className="w-12 h-12 object-cover shrink-0"
      />
    )}
    <div className="flex-1 min-w-0">
      <p className="font-body text-sm font-medium">{moment.guest_name}</p>
      {moment.message && (
        <p className="font-body text-xs text-muted-foreground truncate">
          {moment.message.slice(0, 80)}
        </p>
      )}
      <p className="font-body text-[10px] text-muted-foreground mt-1">
        {formatTime(moment.created_at)}
        {moment.highlighted && (
          <span className="ml-2 text-wedding-gold">✦ Featured</span>
        )}
      </p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      {isPending && onApprove && (
        <button
          onClick={onApprove}
          className="p-2 bg-foreground text-background hover:bg-foreground/80 transition-colors"
          title="Approve"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
      {onHighlight && (
        <button
          onClick={onHighlight}
          className={`p-2 border transition-colors ${
            moment.highlighted
              ? "border-wedding-gold/40 text-wedding-gold bg-wedding-champagne/20"
              : "border-foreground/15 text-muted-foreground hover:text-foreground"
          }`}
          title={moment.highlighted ? "Remove highlight" : "Highlight"}
        >
          <Star className="w-3.5 h-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 border border-foreground/15 text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </motion.div>
);

export default MomentsManager;
