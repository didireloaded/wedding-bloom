import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  X, Send, ExternalLink, QrCode, Eye, EyeOff, Layers, Trash2,
  Gauge, KeyRound, Calendar, MapPin, Users, Heart, CheckCircle2,
  Briefcase, Sparkles, AlertTriangle, ArrowUpRight
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getStatusStyle } from "@/utils/designSystem";

export interface AdminWeddingDetailsViewProps {
  wedding: any;
  onClose: () => void;
  onShareAccess: (wedding: any) => void;
  onTogglePublish: (wedding: any) => void;
  onDuplicate: (wedding: any) => void;
  onDelete: (wedding: any) => void;
  onOpenQR: (wedding: any) => void;
  getStage: (wedding: any) => string;
  guestCount: number;
  rsvpRate: number;
}

export function AdminWeddingDetailsView({
  wedding,
  onClose,
  onShareAccess,
  onTogglePublish,
  onDuplicate,
  onDelete,
  onOpenQR,
  getStage,
  guestCount,
  rsvpRate
}: AdminWeddingDetailsViewProps) {
  if (!wedding) return null;

  const stage = getStage(wedding);
  const statusStyle = getStatusStyle(stage);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex justify-end animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl glass-obsidian h-[100dvh] overflow-y-auto overscroll-contain border-l border-white/[0.1] shadow-2xl flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        <div>
          {/* Top Sticky Header */}
          <div className="sticky top-0 z-20 bg-[#0C0A09]/90 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-white/[0.08]">
            <div className="min-w-0">
              <div className="wedding-label flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                {stage} Celebration
              </div>
              <h2 className="display text-[26px] sm:text-[32px] text-[#FAF7F2] truncate leading-tight mt-0.5">
                {wedding.couple_names}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center shrink-0 ml-4 transition"
              title="Close Inspector"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Cover Hero */}
            <div className="relative h-56 sm:h-64 rounded-[26px] overflow-hidden border border-white/[0.1] shadow-xl">
              <img
                src={wedding.cover_image || wedding.hero_image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 ${statusStyle.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0C0A09]/80 backdrop-blur-md border border-white/[0.1] text-[11px] font-mono text-[#FAF7F2]">
                  {wedding.wedding_date ? format(new Date(wedding.wedding_date), "MMMM d, yyyy") : "Date TBD"}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <div className="text-[12px] uppercase tracking-widest text-[#A8A29E]">Access Security Code</div>
                  <div className="font-mono text-[20px] font-bold text-[#D4A853] flex items-center gap-1.5 mt-0.5">
                    <KeyRound size={16} /> {wedding.access_code}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] uppercase tracking-widest text-[#A8A29E]">Slug</div>
                  <div className="font-mono text-[14px] text-[#FAF7F2]">/{wedding.slug}</div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="display text-[26px] text-[#FAF7F2]">{guestCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#78716C] mt-0.5">Total Guests</div>
              </div>
              <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="display text-[26px] text-[#D4A853]">{rsvpRate}%</div>
                <div className="text-[10px] uppercase tracking-wider text-[#78716C] mt-0.5">RSVP Completion</div>
              </div>
              <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="display text-[26px] text-[#7A9E7E]">{wedding.published ? "Active" : "Private"}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#78716C] mt-0.5">Visibility</div>
              </div>
            </div>

            {/* Links & Portal URLs */}
            <div className="p-5 rounded-[22px] bg-white/[0.03] border border-white/[0.08] space-y-3.5">
              <div className="wedding-label text-[#D4A853]">Celebration Portal Links</div>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#A8A29E] font-medium flex items-center gap-2">
                    <ExternalLink size={14} className="text-[#78716C]" /> Guest Website
                  </span>
                  <code className="text-[#D4A853] font-mono text-[12px] break-all bg-black/40 px-2.5 py-1 rounded">/wedding/{wedding.slug}</code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#A8A29E] font-medium flex items-center gap-2">
                    <Gauge size={14} className="text-[#78716C]" /> Couple Cockpit
                  </span>
                  <code className="text-[#D4A853] font-mono text-[12px] break-all bg-black/40 px-2.5 py-1 rounded">/couple/{wedding.slug}/dashboard</code>
                </div>
              </div>
            </div>

            {/* Action Buttons Stack */}
            <div className="space-y-3">
              <button
                onClick={() => onShareAccess(wedding)}
                className="w-full fv-btn-primary !bg-[#EAB308] !text-[#09090B] min-h-[48px] py-3.5 text-[13px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition"
              >
                <Send size={16} /> Copy & Dispatch Couple Access Kit ({wedding.access_code})
              </button>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem("couple_wedding_id", wedding.id);
                    localStorage.setItem("couple_wedding_slug", wedding.slug);
                    window.open(`/couple/${wedding.slug}/dashboard`, "_blank");
                  }}
                  className="fv-btn-ghost min-h-[44px] py-3 text-[13px] flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1]"
                >
                  <Gauge size={15} className="text-[#D4A853]" /> Launch Couple Dashboard
                </button>
                <Link
                  to={`/wedding/${wedding.slug}?preview=1`}
                  target="_blank"
                  className="fv-btn-ghost min-h-[44px] py-3 text-[13px] flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-center"
                >
                  <Eye size={15} className="text-[#A8A29E]" /> Preview Guest Experience
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => onOpenQR(wedding)}
                  className="p-3 rounded-[16px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-[12px] font-medium text-[#FAF7F2] transition min-h-[64px]"
                >
                  <QrCode size={18} className="text-[#D4A853]" /> Guest QR Code
                </button>
                <button
                  onClick={() => onTogglePublish(wedding)}
                  className="p-3 rounded-[16px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-[12px] font-medium text-[#FAF7F2] transition min-h-[64px]"
                >
                  {wedding.published ? <EyeOff size={18} className="text-[#EAB308]" /> : <Eye size={18} className="text-[#7A9E7E]" />}
                  {wedding.published ? "Unpublish Site" : "Publish Live"}
                </button>
                <button
                  onClick={() => onDuplicate(wedding)}
                  className="p-3 rounded-[16px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-[12px] font-medium text-[#FAF7F2] transition min-h-[64px] col-span-2 sm:col-span-1"
                >
                  <Layers size={18} className="text-[#A882DD]" /> Duplicate Studio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Danger Zone */}
        <div className="p-6 bg-[#C97B7B]/10 border-t border-[#C97B7B]/20 flex items-center justify-between mt-auto">
          <div>
            <div className="text-[13px] font-bold text-[#FCA5A5] flex items-center gap-1.5">
              <AlertTriangle size={15} /> Delete Celebration
            </div>
            <div className="text-[11px] text-[#E4A5A5]/80">Permanently removes RSVPs, guest photos, and data.</div>
          </div>
          <button
            onClick={() => onDelete(wedding)}
            className="px-4 py-2 rounded-full bg-[#C97B7B]/20 hover:bg-[#C97B7B]/40 border border-[#C97B7B]/40 text-[#FCA5A5] text-[12px] font-semibold transition flex items-center gap-1.5 shrink-0 min-h-[40px]"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
