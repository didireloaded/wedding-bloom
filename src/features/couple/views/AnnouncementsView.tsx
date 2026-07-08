import React, { useState } from "react";
import { format } from "date-fns";
import {
  Radio, Megaphone, Plus, Trash2, Bell, Sparkles, Send,
  AlertCircle, CheckCircle2, Clock, ShieldCheck, Users
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, WeddingUpdate } from "@/types/wedding";

interface AnnouncementsViewProps {
  wedding: Wedding;
  updates: WeddingUpdate[];
  onAddUpdate: (updateData: { title: string; message: string }) => void;
  onRemoveUpdate: (id: string) => void;
}

export function AnnouncementsView({
  wedding,
  updates,
  onAddUpdate,
  onRemoveUpdate
}: AnnouncementsViewProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    onAddUpdate({
      title: priority === "urgent" ? `🚨 ${title.trim()}` : title.trim(),
      message: message.trim()
    });
    setTitle("");
    setMessage("");
    setPriority("normal");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Radio size={13} className="text-primary-container animate-pulse" />
            <span>InstantANEOUS Push & Broadcast Feed</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Live Announcements
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Transmit real-time alerts across all active guest mobile screens, digital itineraries, and live check-in kiosks.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.1] px-4 py-2 rounded-2xl shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-ivory/80">Realtime Channel Active</span>
        </div>
      </div>

      {/* Broadcast Creation Module */}
      <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container">
              <Megaphone size={16} />
            </div>
            <div>
              <h3 className="font-headline-sm text-lg text-ivory">Dispatch Live Alert</h3>
              <p className="text-xs text-ivory/60">Broadcasts appear immediately on the guest portal feed</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setPriority("normal")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                priority === "normal" ? "bg-primary-container text-obsidian font-semibold shadow-sm" : "text-ivory/60 hover:text-ivory"
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setPriority("urgent")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                priority === "urgent" ? "bg-rose-500 text-white font-semibold shadow-sm" : "text-ivory/60 hover:text-rose-400"
              }`}
            >
              <AlertCircle size={12} /> Urgent
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Alert Headline *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Shuttle Bus #2 departing Hotel Lobby in 15 minutes"
              className="fv-input w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Detailed Announcement *</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Provide exact pickup instructions, weather fallback directions, or cocktail hour room numbers..."
              className="fv-input w-full resize-none text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-ivory/50 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary-container" />
              <span>Broadcasts are logged permanently to your celebration timeline.</span>
            </span>
            <button
              type="submit"
              className="fv-btn-primary !py-3 !px-6 text-xs inline-flex items-center gap-2 shadow-lg hover:shadow-primary-container/25 self-end sm:self-auto"
            >
              <Send size={14} />
              <span>Dispatch Broadcast Now</span>
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Broadcast History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-xl text-ivory">Transmission Log ({updates.length})</h3>
          <span className="text-xs font-mono text-ivory/50">Chronological feed (newest first)</span>
        </div>

        {updates.length === 0 ? (
          <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.12] text-center py-12">
            <Bell size={24} className="mx-auto text-ivory/30 mb-3" />
            <div className="text-ivory/70 font-medium mb-1">No announcements transmitted yet</div>
            <p className="text-xs text-ivory/50 max-w-sm mx-auto">
              When schedule changes occur or room turns are ready, send an alert here to notify all your guests simultaneously.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {updates.slice().reverse().map((u) => {
              const isUrgent = u.title.startsWith("🚨");
              return (
                <GlassCard
                  key={u.id}
                  variant="obsidian"
                  padding="md"
                  className={`border transition duration-200 flex flex-col sm:flex-row justify-between items-start gap-4 ${
                    isUrgent ? "border-rose-500/30 bg-rose-950/10" : "border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isUrgent ? "bg-rose-500 animate-pulse" : "bg-primary-container"}`} />
                      <h4 className="font-headline-sm text-lg text-ivory font-semibold truncate">{u.title}</h4>
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Urgent Priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ivory/75 leading-relaxed pl-4 border-l-2 border-white/[0.1] my-2">
                      {u.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-ivory/50 pt-1 pl-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {u.created_at ? format(new Date(u.created_at), "HH:mm • d MMM yyyy") : "Just now"}
                      </span>
                      <span>•</span>
                      <span>Delivered via Realtime WS</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveUpdate(u.id)}
                    className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-ivory/40 hover:text-rose-400 border border-white/[0.06] hover:border-rose-500/30 flex items-center justify-center transition shrink-0 self-end sm:self-center"
                    title="Delete Announcement"
                  >
                    <Trash2 size={15} />
                  </button>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
