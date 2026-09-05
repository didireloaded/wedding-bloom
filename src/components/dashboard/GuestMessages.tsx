import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, EyeOff, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GuestMessagesProps {
  weddingId: string;
  accessCode: string;
  messages: any[];
  onRefresh: () => void;
}

const GuestMessages = ({ weddingId, accessCode, messages, onRefresh }: GuestMessagesProps) => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const moderateMessage = async (messageId: string, action: "approve" | "hide" | "delete") => {
    const query = action === "delete"
      ? supabase.from("guestbook").delete()
      : supabase.from("guestbook").update({ approved: action === "approve" });
    const { error } = await query.eq("wedding_id", weddingId).eq("id", messageId).select("id").single();
    if (!error) {
      toast.success(action === "approve" ? "Message approved!" : action === "hide" ? "Message hidden from page" : "Message deleted");
      onRefresh();
    } else {
      toast.error("Failed to moderate message");
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "pending") return !m.approved;
    if (filter === "approved") return m.approved;
    return true;
  });

  const pendingCount = messages.filter((m) => !m.approved).length;
  const approvedCount = messages.filter((m) => m.approved).length;

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white/80">
      <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-wedding-gold" />
          <h3 className="font-body text-sm font-semibold">What guests are saying</h3>
        </div>
        <div className="flex items-center gap-1">
          {[
            { key: "all", label: `All (${messages.length})` },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "approved", label: `Approved (${approvedCount})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`rounded-full px-3 py-2 font-body text-xs transition-colors min-h-10 ${
                filter === f.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`p-4 space-y-3 ${
                  msg.approved
                    ? "bg-wedding-sage/5 border-l-2 border-l-wedding-sage/20"
                    : "bg-amber-50/30 dark:bg-amber-900/5 border-l-2 border-l-amber-200/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm leading-6 break-words">{msg.message}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <p className="font-body text-xs text-muted-foreground">{msg.guest_name}</p>
                      {!msg.approved && (
                        <span className="font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          Awaiting review
                        </span>
                      )}
                    </div>
                    <p className="font-body text-[9px] text-muted-foreground/50 mt-1">
                      {new Date(msg.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {msg.photo_url && (
                    <img src={msg.photo_url} alt="" className="w-12 h-12 object-cover shrink-0" />
                  )}
                </div>
                <div className="flex gap-2">
                  {!msg.approved && (
                    <button
                      onClick={() => moderateMessage(msg.id, "approve")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background font-body text-[9px] tracking-[0.1em] uppercase min-h-[32px]"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  )}
                  {msg.approved && (
                    <button
                      onClick={() => moderateMessage(msg.id, "hide")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-foreground/15 font-body text-[9px] tracking-[0.1em] uppercase min-h-[32px] hover:border-foreground/30"
                    >
                      <EyeOff className="w-3 h-3" /> Hide from page
                    </button>
                  )}
                  <button
                    onClick={() => moderateMessage(msg.id, "delete")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/20 text-destructive font-body text-[9px] tracking-[0.1em] uppercase min-h-[32px] hover:bg-destructive/5"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
              <p className="font-body text-sm text-muted-foreground">
                {filter === "all" ? "No messages yet" : `No ${filter} messages`}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GuestMessages;
