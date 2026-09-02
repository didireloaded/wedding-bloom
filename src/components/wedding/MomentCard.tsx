import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MomentCardProps {
  moment: {
    id: string;
    guest_name: string;
    message: string | null;
    photo_url: string | null;
    highlighted: boolean;
    created_at: string;
    reaction_counts?: { heart: number; applause: number };
  };
  isNew?: boolean;
}

const formatTime = (dateStr: string) => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

const ReactionButton = ({
  momentId,
  type,
  count,
  emoji,
  label,
}: {
  momentId: string;
  type: "heart" | "applause";
  count: number;
  emoji: string;
  label: string;
}) => {
  const key = `reacted-${momentId}-${type}`;
  const [reacted, setReacted] = useState(() => localStorage.getItem(key) === "1");
  const [localCount, setLocalCount] = useState(count);
  const [burst, setBurst] = useState(false);

  const handleReact = async () => {
    if (reacted) return;
    setReacted(true);
    setLocalCount((c) => c + 1);
    setBurst(true);
    setTimeout(() => setBurst(false), 800);
    localStorage.setItem(key, "1");
    await supabase.from("moment_reactions").insert({ moment_id: momentId, reaction_type: type } as any);
  };

  return (
    <div className="relative overflow-visible">
      <button
        onClick={handleReact}
        className={`flex items-center gap-1.5 px-3 py-1.5 font-body text-xs border transition-all min-h-[36px] ${
          reacted
            ? "border-wedding-gold/40 bg-wedding-champagne/20 text-foreground"
            : "border-border/40 text-muted-foreground hover:border-foreground/20"
        }`}
      >
        <span>{emoji}</span>
        <span>{localCount > 0 ? localCount : label}</span>
      </button>
      <AnimatePresence>
        {burst && [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 1, y: 0, x: (i - 1) * 14, scale: 1 }}
            animate={{ opacity: 0, y: -40, scale: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
            className="absolute bottom-full pointer-events-none select-none text-base"
            style={{ left: "50%" }}
          >
            {type === "heart" ? "♥" : "👏"}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

const MomentCard = ({ moment, isNew }: MomentCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative border p-5 sm:p-6 ${
        moment.highlighted
          ? "border-wedding-gold/40 bg-wedding-champagne/20"
          : "border-border bg-background"
      }`}
    >
      {/* New moment ring flash */}
      {isNew && (
        <motion.div
          className="absolute inset-0 ring-2 ring-wedding-gold/60 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-wedding-champagne flex items-center justify-center shrink-0">
            <span className="font-display text-sm font-light">
              {moment.guest_name[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-medium">{moment.guest_name}</p>
            <p className="font-body text-[10px] text-muted-foreground">
              {formatTime(moment.created_at)}
            </p>
          </div>
        </div>
        {moment.highlighted && (
          <span className="font-body text-[8px] tracking-[0.2em] uppercase text-wedding-gold border border-wedding-gold/30 px-2 py-1">
            ✦ Featured
          </span>
        )}
      </div>

      {/* Message */}
      {moment.message && (
        <p className="font-body text-sm leading-relaxed text-foreground mb-4">
          {moment.message}
        </p>
      )}

      {/* Photo */}
      {moment.photo_url && (
        <div className="mb-4 overflow-hidden">
          <img
            src={moment.photo_url}
            alt={`Photo by ${moment.guest_name}`}
            className="w-full max-h-80 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-3 pt-3 border-t border-border/40">
        <ReactionButton
          momentId={moment.id}
          type="heart"
          count={moment.reaction_counts?.heart ?? 0}
          emoji="♥"
          label="Love"
        />
        <ReactionButton
          momentId={moment.id}
          type="applause"
          count={moment.reaction_counts?.applause ?? 0}
          emoji="👏"
          label="Applause"
        />
      </div>
    </motion.div>
  );
};

export default MomentCard;
