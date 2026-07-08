import React, { useState } from "react";
import { format } from "date-fns";
import {
  MessageSquare, Heart, CheckCircle2, ShieldAlert, Sparkles,
  Trash2, Filter, Eye, Award, Check, X, Users, MessageCircle
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, Moment } from "@/types/wedding";

interface MemoryWallViewProps {
  wedding: Wedding;
  moments: Moment[];
  onModerateMoment: (id: string, isApproved: boolean) => void;
  onRemoveMoment: (id: string) => void;
}

export function MemoryWallView({
  wedding,
  moments,
  onModerateMoment,
  onRemoveMoment
}: MemoryWallViewProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");

  const totalMoments = moments.length;
  const pendingCount = moments.filter(m => !m.is_approved).length;
  const approvedCount = moments.filter(m => m.is_approved).length;

  const filteredMoments = moments.filter(m => {
    if (filterStatus === "pending") return !m.is_approved;
    if (filterStatus === "approved") return m.is_approved;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <MessageSquare size={13} className="text-primary-container" />
            <span>Real-Time Digital Guestbook & Audio Notes</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Live Memory Wall
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Audit heartfelt blessings, written wishes, and digital guestbook entries before broadcasting them onto your reception venue display.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs font-mono">
            <ShieldAlert size={16} className="shrink-0 animate-pulse" />
            <span>{pendingCount} Messages Awaiting Approval</span>
          </div>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Total Guestbook Notes</span>
          <div className="font-display-lg text-3xl text-ivory font-bold">{totalMoments}</div>
          <p className="text-[11px] text-ivory/40">From portal & QR table cards</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Moderation Queue</span>
          <div className="font-display-lg text-3xl text-amber-300 font-bold">{pendingCount}</div>
          <p className="text-[11px] text-amber-400/50">Unreviewed wishes</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Live on Memory Wall</span>
          <div className="font-display-lg text-3xl text-emerald-300 font-bold">{approvedCount}</div>
          <p className="text-[11px] text-emerald-400/50">Streaming on projection screens</p>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08] w-fit">
        {[
          { id: "all" as const, label: "All Wishes", count: totalMoments },
          { id: "pending" as const, label: "Pending Moderation", count: pendingCount },
          { id: "approved" as const, label: "Approved Wall Feed", count: approvedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
              filterStatus === tab.id ? "bg-primary-container text-obsidian font-bold shadow-sm" : "text-ivory/60 hover:text-ivory"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === tab.id ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory/60"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Memory Wall Masonry Feed */}
      {filteredMoments.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <MessageCircle size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Guestbook Entries Found</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto">
            When your guests submit blessings and digital guestbook wishes via the public celebration site, they will land in this queue.
          </p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMoments.map((moment) => {
            const isApproved = moment.is_approved;
            return (
              <GlassCard
                key={moment.id}
                variant="obsidian"
                padding="lg"
                className={`border transition duration-300 rounded-2xl flex flex-col justify-between shadow-xl ${
                  !isApproved ? "border-amber-500/40 bg-amber-500/[0.02]" : "border-white/[0.08]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container font-mono font-bold text-xs">
                        {(moment.guest_name || "G")[0]}
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-sm text-ivory font-bold">{moment.guest_name}</h4>
                        <span className="text-[10px] font-mono text-ivory/45">
                          {moment.created_at ? format(new Date(moment.created_at), "MMM d • HH:mm") : "Recently"}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      isApproved ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {isApproved ? "Live on Wall" : "Pending Approval"}
                    </span>
                  </div>

                  <p className="text-sm text-ivory/90 font-serif italic leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                    "{moment.message}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  {!isApproved ? (
                    <button
                      onClick={() => onModerateMoment(moment.id, true)}
                      className="flex-1 py-1.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Check size={14} /> Approve for Wall
                    </button>
                  ) : (
                    <button
                      onClick={() => onModerateMoment(moment.id, false)}
                      className="py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-ivory/60 hover:text-ivory font-mono text-xs transition flex items-center gap-1"
                    >
                      <X size={13} /> Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveMoment(moment.id)}
                    className="p-1.5 rounded-xl text-ivory/30 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                    title="Delete Entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
