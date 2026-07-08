import React, { useState } from "react";
import { format } from "date-fns";
import {
  Camera, Check, X, ShieldCheck, Heart, Sparkles, AlertCircle,
  Trash2, Upload, Filter, Users, Eye, CheckCircle2, Award
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, GuestPhoto } from "@/types/wedding";

interface GuestPhotoVaultViewProps {
  wedding: Wedding;
  guestPhotos: GuestPhoto[];
  onModeratePhoto: (id: string, action: "approve" | "reject" | "promote") => void;
  onRemovePhoto: (id: string) => void;
}

export function GuestPhotoVaultView({
  wedding,
  guestPhotos,
  onModeratePhoto,
  onRemovePhoto
}: GuestPhotoVaultViewProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "promoted">("all");

  const totalPhotos = guestPhotos.length;
  const pendingCount = guestPhotos.filter(p => p.status === "pending" || !p.status).length;
  const approvedCount = guestPhotos.filter(p => p.status === "approved" || p.is_promoted).length;
  const promotedCount = guestPhotos.filter(p => p.is_promoted).length;

  const filteredPhotos = guestPhotos.filter(p => {
    if (filterStatus === "pending") return p.status === "pending" || !p.status;
    if (filterStatus === "approved") return p.status === "approved" && !p.is_promoted;
    if (filterStatus === "promoted") return p.is_promoted;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Camera size={13} className="text-primary-container" />
            <span>Candid Media Capture & Moderation Queue</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Guest Photo Vault
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Audit high-volume candid uploads from guest mobile cameras and check-in kiosks. Approve for live gallery stream or promote to your master portfolio.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs font-mono">
            <AlertCircle size={16} className="shrink-0 animate-pulse" />
            <span>{pendingCount} Candid Uploads Awaiting Review</span>
          </div>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Total Guest Uploads</span>
          <div className="font-display-lg text-3xl text-ivory font-bold">{totalPhotos}</div>
          <p className="text-[11px] text-ivory/40">Realtime kiosk & mobile feed</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Review Queue</span>
          <div className="font-display-lg text-3xl text-amber-300 font-bold">{pendingCount}</div>
          <p className="text-[11px] text-amber-400/50">Needs moderation decision</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Approved Stream</span>
          <div className="font-display-lg text-3xl text-emerald-300 font-bold">{approvedCount}</div>
          <p className="text-[11px] text-emerald-400/50">Live on memory wall</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-primary-container">Promoted to Portfolio</span>
          <div className="font-display-lg text-3xl text-primary-container font-bold">{promotedCount}</div>
          <p className="text-[11px] text-primary-container/50">Featured in Master Gallery</p>
        </GlassCard>
      </div>

      {/* Moderation Filter Tabs */}
      <div className="flex items-center justify-between pt-2 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08]">
          {[
            { id: "all" as const, label: "All Candid Shots", count: totalPhotos },
            { id: "pending" as const, label: "Review Queue", count: pendingCount },
            { id: "approved" as const, label: "Approved Feed", count: approvedCount - promotedCount },
            { id: "promoted" as const, label: "Promoted to Master", count: promotedCount },
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
      </div>

      {/* Moderation Grid (Stitch Inspiration) */}
      {filteredPhotos.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <Camera size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Candid Photos in this Queue</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto">
            When guests upload photos via QR codes or kiosk stands during your wedding, they will appear here instantly.
          </p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => {
            const isPending = photo.status === "pending" || !photo.status;
            const isPromoted = photo.is_promoted;
            return (
              <GlassCard
                key={photo.id}
                variant="obsidian"
                padding="none"
                className={`border transition duration-300 rounded-2xl overflow-hidden group flex flex-col justify-between shadow-xl ${
                  isPending ? "border-amber-500/40 ring-1 ring-amber-500/20" :
                  isPromoted ? "border-primary-container ring-1 ring-primary-container/30" :
                  "border-white/[0.08]"
                }`}
              >
                <div>
                  <div className="relative h-64 w-full overflow-hidden bg-white/[0.02]">
                    <img
                      src={photo.photo_url}
                      alt={`Photo by ${photo.guest_name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {isPending && (
                        <span className="bg-amber-500 text-obsidian px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shadow">
                          Pending Review
                        </span>
                      )}
                      {isPromoted && (
                        <span className="bg-primary-container text-obsidian px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shadow flex items-center gap-1">
                          <Award size={11} /> Promoted Master
                        </span>
                      )}
                      {!isPending && !isPromoted && (
                        <span className="bg-emerald-500/85 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
                          Approved Stream
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between text-xs border-b border-white/[0.06]">
                    <div className="font-bold text-ivory truncate max-w-[150px]">
                      📸 {photo.guest_name}
                    </div>
                    <div className="flex items-center gap-1 text-[#E8C97A] font-mono">
                      <Heart size={12} className="fill-[#E8C97A]" />
                      <span>{photo.likes || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions Toolbar */}
                <div className="p-3 bg-white/[0.02] flex items-center justify-between gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => onModeratePhoto(photo.id, "approve")}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => onModeratePhoto(photo.id, "reject")}
                        className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono text-xs flex items-center justify-center transition"
                        title="Reject & Hide"
                      >
                        <X size={13} />
                      </button>
                    </>
                  )}
                  {!isPending && !isPromoted && (
                    <button
                      onClick={() => onModeratePhoto(photo.id, "promote")}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-primary-container/20 hover:bg-primary-container text-primary-container hover:text-obsidian font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Award size={13} /> Promote to Portfolio
                    </button>
                  )}
                  {isPromoted && (
                    <span className="text-[11px] font-mono text-primary-container/80 italic flex-1 text-center">
                      Featured in Master Gallery
                    </span>
                  )}
                  <button
                    onClick={() => onRemovePhoto(photo.id)}
                    className="p-1.5 rounded-xl text-ivory/30 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                    title="Delete Permanently"
                  >
                    <Trash2 size={14} />
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
