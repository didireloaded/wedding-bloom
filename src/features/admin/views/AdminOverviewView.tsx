import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  Search, Plus, Upload, LayoutTemplate, Download, Gauge,
  Sparkles, CheckCircle2, MessageCircle, Briefcase, Calendar,
  DollarSign, FileText, Zap, Users, FileSpreadsheet, Image, Bell,
  Send, ExternalLink, QrCode, Eye, EyeOff, Layers, Trash2, ChevronRight,
  ShieldCheck, ArrowRight, Activity
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getStatusStyle } from "@/utils/designSystem";

export type StatusFilter = "all" | "draft" | "published" | "upcoming" | "completed" | "archived";

export interface AdminOverviewViewProps {
  weddings: any[];
  filteredWeddings: any[];
  stats: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
    draft: number;
    published: number;
    guests: number;
    rsvps: number;
    photos: number;
    messages: number;
    views: number;
    qr: number;
    revenue: string;
    pendingInvoices: string;
    unreadClientMessages: number;
    pendingContracts: number;
  };
  query: string;
  onQueryChange: (q: string) => void;
  filter: StatusFilter;
  onFilterChange: (f: StatusFilter) => void;
  viewMode: "table" | "cards" | "timeline";
  onViewModeChange: (m: "table" | "cards" | "timeline") => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onBulkAction: (action: "publish" | "unpublish" | "archive" | "delete") => void;
  onSelectWedding: (wedding: any) => void;
  onShareWedding: (wedding: any) => void;
  onTogglePublish: (wedding: any) => void;
  onDuplicateWedding: (wedding: any) => void;
  onDeleteWedding: (wedding: any) => void;
  onOpenQR: (wedding: any) => void;
  activity: { text: string; sub: string; ts: number; wedding?: any; icon: ReactNode }[];
  csvHistory: any[];
  onShowCreate: () => void;
  onImportClick: () => void;
  onOpenToolPanel: (panel: string) => void;
  adminGreeting: string;
  platformCards: { label: string; value: string | number; icon: ReactNode; filter: StatusFilter }[];
  getWeddingStage: (wedding: any) => string;
  weddingGuestCount: (weddingId: string) => number;
  rsvpProgress: (weddingId: string) => number;
}

export function AdminOverviewView({
  weddings,
  filteredWeddings,
  stats,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  selectedIds,
  onSelectedIdsChange,
  onBulkAction,
  onSelectWedding,
  onShareWedding,
  onTogglePublish,
  onDuplicateWedding,
  onDeleteWedding,
  onOpenQR,
  activity,
  csvHistory,
  onShowCreate,
  onImportClick,
  onOpenToolPanel,
  adminGreeting,
  platformCards,
  getWeddingStage,
  weddingGuestCount,
  rsvpProgress
}: AdminOverviewViewProps) {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Command Banner & Responsive Stacking Order */}
      <section className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-stretch">
        <div className="order-1 lg:col-span-8 glass-obsidian rounded-[36px] p-8 md:p-14 relative overflow-hidden flex flex-col justify-between border border-white/[0.1] min-h-[320px] shadow-2xl">
          {/* Ambient luxury lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#D4A853]/20 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#C97B7B]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl py-2">
            <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.24em] text-[#D4A853] font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-[#7A9E7E] animate-pulse" /> {adminGreeting}, Wedding Director
            </div>
            <h1 className="display text-[44px] md:text-[64px] leading-[0.92] text-[#FAF7F2]">
              Wedding Studio <span className="script fv-gradient-text">Headquarters</span>
            </h1>
            <p className="text-[15px] text-[#A8A29E] max-w-xl mt-4 leading-relaxed">
              Manage beautiful wedding celebrations, assist couples, and orchestrate luxury guest experiences with effortless elegance and calm precision.
            </p>
          </div>

          {/* Core Stats inside Hero Card */}
          <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/[0.08]">
            <div>
              <div className="display text-[28px] md:text-[32px] text-[#D4A853]">{stats.total}</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Total Weddings</div>
            </div>
            <div>
              <div className="display text-[28px] md:text-[32px] text-[#FAF7F2]">{stats.revenue}</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Expected Revenue</div>
            </div>
            <div>
              <div className="display text-[28px] md:text-[32px] text-[#FAF7F2]">{stats.active}</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Active Weddings</div>
            </div>
            <div>
              <div className="display text-[28px] md:text-[32px] text-[#7A9E7E]">{stats.guests}</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Total Guests</div>
            </div>
          </div>
        </div>

        {/* Today's Priorities */}
        <GlassCard variant="frost" padding="md" className="order-2 lg:col-span-4 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="wedding-label">Today's Priorities</span>
              <span className="text-[11px] text-[#D4A853] font-mono flex items-center gap-1.5">
                <Sparkles size={12} /> HELPFUL ACTIONS
              </span>
            </div>
            <div className="space-y-2.5 pt-1">
              {stats.draft === 0 ? (
                <div className="p-3 rounded-[14px] bg-white/[0.01] border border-white/[0.03] flex items-center justify-between text-[12px] opacity-60 min-h-[44px]">
                  <span className="text-[#FAF7F2]/80">Weddings waiting for review</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#7A9E7E]">
                    <CheckCircle2 size={13} /> Caught up
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#D4A853]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                  <span className="text-[#FAF7F2] font-medium">Weddings waiting for review</span>
                  <span className="font-mono font-bold text-[#D4A853] bg-[#D4A853]/15 px-2.5 py-0.5 rounded-full">{stats.draft}</span>
                </div>
              )}
              {stats.upcoming === 0 ? (
                <div className="p-3 rounded-[14px] bg-white/[0.01] border border-white/[0.03] flex items-center justify-between text-[12px] opacity-60 min-h-[44px]">
                  <span className="text-[#FAF7F2]/80">Weddings happening soon</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8A29E]">
                    <CheckCircle2 size={13} /> None scheduled
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#7A9E7E]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                  <span className="text-[#FAF7F2] font-medium">Weddings happening soon</span>
                  <span className="font-mono font-bold text-[#7A9E7E] bg-[#7A9E7E]/15 px-2.5 py-0.5 rounded-full">{stats.upcoming}</span>
                </div>
              )}
              {/* Client Communication Alerts */}
              <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#A882DD]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                <span className="text-[#FAF7F2] font-medium flex items-center gap-2">
                  <MessageCircle size={14} className="text-[#A882DD]" /> Unread client messages
                </span>
                <span className="font-mono font-bold text-[#A882DD] bg-[#A882DD]/15 px-2.5 py-0.5 rounded-full">{stats.unreadClientMessages}</span>
              </div>
              {/* Vendor Contract Status */}
              <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#EAB308]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                <span className="text-[#FAF7F2] font-medium flex items-center gap-2">
                  <Briefcase size={14} className="text-[#EAB308]" /> Pending vendor contracts
                </span>
                <span className="font-mono font-bold text-[#EAB308] bg-[#EAB308]/15 px-2.5 py-0.5 rounded-full">{stats.pendingContracts} Action Req</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard variant="obsidian" padding="lg" className="order-3 lg:col-span-4 border border-white/[0.1] flex flex-col justify-between">
          <div>
            <div className="wedding-label mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              <button
                onClick={onShowCreate}
                className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-[#D4A853]/10 hover:border-[#D4A853]/30 text-left transition group min-h-[64px]"
              >
                <Plus className="w-5 h-5 text-[#D4A853] mb-2 group-hover:scale-110 transition" />
                <div className="text-[13px] font-semibold text-[#FAF7F2]">Create Wedding</div>
              </button>
              <button
                onClick={onImportClick}
                className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-left transition group min-h-[64px]"
              >
                <Upload className="w-5 h-5 text-[#D4A853] mb-2 group-hover:scale-110 transition" />
                <div className="text-[13px] font-semibold text-[#FAF7F2]">Import Wedding</div>
              </button>
              <button
                onClick={() => onOpenToolPanel("templates")}
                className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-left transition min-h-[64px]"
              >
                <LayoutTemplate className="w-5 h-5 text-[#A8A29E] mb-2" />
                <div className="text-[13px] font-semibold text-[#FAF7F2]">Wedding Templates</div>
              </button>
              <button
                onClick={() => onOpenToolPanel("reports")}
                className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-left transition min-h-[64px]"
              >
                <Download className="w-5 h-5 text-[#A8A29E] mb-2" />
                <div className="text-[13px] font-semibold text-[#FAF7F2]">View Reports</div>
              </button>
              <button
                onClick={() => onOpenToolPanel("health")}
                className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-[#7A9E7E]/10 hover:border-[#7A9E7E]/30 text-left transition md:col-span-2 min-h-[64px]"
              >
                <Gauge className="w-5 h-5 text-[#7A9E7E] mb-2" />
                <div className="text-[13px] font-semibold text-[#FAF7F2]">System Health & Diagnostics</div>
              </button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Filter & Metric Arc */}
      <section>
        {/* Mobile sticky filter chips */}
        <div className="md:hidden sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-[#09090B]/85 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x">
            {platformCards.slice(0, 6).map(card => (
              <button
                key={card.label}
                onClick={() => onFilterChange(card.filter)}
                className={`snap-start shrink-0 min-h-[44px] px-4 rounded-full text-[12px] font-medium flex items-center gap-2 border transition ${
                  filter === card.filter
                    ? "bg-[#D4A853] text-[#0C0A09] border-[#D4A853]"
                    : "bg-white/[0.04] text-[#FAF7F2] border-white/[0.08]"
                }`}
              >
                <span className="opacity-80">{card.icon}</span>
                <span className="whitespace-nowrap">{card.label}</span>
                <span className={`text-[11px] font-mono ${filter === card.filter ? "text-[#0C0A09]/70" : "text-[#A8A29E]"}`}>{card.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {platformCards.slice(0, 6).map(card => (
            <button
              key={card.label}
              onClick={() => onFilterChange(card.filter)}
              className={`text-left p-5 rounded-[24px] transition-all duration-300 border min-h-[100px] ${
                filter === card.filter
                  ? "glass-aurora border-[#D4A853]/40 shadow-[0_0_24px_-4px_rgba(212,168,83,0.25)]"
                  : "glass-obsidian border-white/[0.06] hover:border-white/[0.15]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-[12px] bg-white/[0.06] text-[#D4A853] flex items-center justify-center">
                  {card.icon}
                </div>
                {filter === card.filter && <span className="w-2 h-2 rounded-full bg-[#D4A853]" />}
              </div>
              <div className="display text-[28px] text-[#FAF7F2] leading-none">{card.value}</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#A8A29E] mt-2 font-medium">{card.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Wedding Workspace & Activity Feed */}
      <section className="grid xl:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="space-y-6">
          <GlassCard variant="obsidian" padding="none" className="border border-white/[0.1] overflow-hidden shadow-2xl">
            {/* Header Bar */}
            <div className="p-4 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
              <div>
                <div className="wedding-label">Wedding Portfolio</div>
                <h3 className="display text-[20px] sm:text-[24px] text-[#FAF7F2] mt-0.5">All Weddings ({filteredWeddings.length})</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 sm:flex-wrap">
                <div className="relative w-full sm:min-w-[240px] sm:w-auto">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                  <input
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    placeholder="Filter celebrations..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 sm:py-2 min-h-[44px] text-[14px] sm:text-[13px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                  />
                </div>

                <div className="hidden md:inline-flex rounded-full bg-white/[0.04] border border-white/[0.08] p-1">
                  <button
                    onClick={() => onViewModeChange("cards")}
                    className={`px-4 py-2 min-h-[44px] rounded-full text-[12px] font-medium transition flex items-center justify-center ${viewMode === "cards" ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E]"}`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => onViewModeChange("table")}
                    className={`px-4 py-2 min-h-[44px] rounded-full text-[12px] font-medium transition flex items-center justify-center ${viewMode === "table" ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E]"}`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => onViewModeChange("timeline")}
                    className={`px-4 py-2 min-h-[44px] rounded-full text-[12px] font-medium transition flex items-center justify-center gap-1.5 ${viewMode === "timeline" ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E]"}`}
                  >
                    <Calendar size={13} /> Timeline
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="px-6 py-3.5 bg-[#D4A853]/10 border-b border-[#D4A853]/20 flex items-center justify-between flex-wrap gap-3">
                <span className="text-[13px] font-medium text-[#E8C97A]">
                  <strong>{selectedIds.length}</strong> celebrations selected
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onBulkAction("publish")} className="px-3.5 py-1.5 rounded-full bg-[#D4A853] text-[#0C0A09] text-[12px] font-semibold">Publish</button>
                  <button onClick={() => onBulkAction("unpublish")} className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[12px] hover:bg-white/[0.1]">Unpublish</button>
                  <button onClick={() => onBulkAction("archive")} className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[12px] hover:bg-white/[0.1]">Archive</button>
                  <button onClick={() => onBulkAction("delete")} className="px-3.5 py-1.5 rounded-full bg-[#C97B7B]/20 border border-[#C97B7B]/30 text-[#E4A5A5] text-[12px]">Delete</button>
                </div>
              </div>
            )}

            {/* Cards Grid View */}
            {(viewMode === "cards" || typeof window !== "undefined") && (
              <div className={`p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 ${viewMode !== "cards" ? "block md:hidden" : "block"}`}>
                {filteredWeddings.map(w => {
                  const stage = getWeddingStage(w);
                  const statusStyle = getStatusStyle(stage);
                  const guestCount = weddingGuestCount(w.id);
                  const progress = rsvpProgress(w.id);

                  return (
                    <div
                      key={w.id}
                      className="glass-frost rounded-[24px] border border-white/[0.08] overflow-hidden hover:border-[#D4A853]/40 transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Cover */}
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                          <img
                            src={w.cover_image || w.hero_image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-transparent" />

                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5 ${statusStyle.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                              {statusStyle.label}
                            </span>

                            {(!w.published || w.slug.includes("elara")) && (
                              <span
                                className="px-2.5 py-1 rounded-full bg-[#0C0A09]/85 backdrop-blur-md border border-[#D4A853] text-[#D4A853] text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(212,168,83,0.4)] animate-pulse shrink-0"
                                title="Vendor action required: Contract signature & deposit pending"
                              >
                                <Briefcase size={12} /> Vendor Req
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="display text-[22px] sm:text-[26px] text-[#FAF7F2] leading-tight break-words">{w.couple_names}</div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                              <span className="text-[12px] text-[#A8A29E] font-mono truncate max-w-[55%]">/{w.slug}</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#FDE047] text-[10px] font-mono font-bold">
                                {w.access_code}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats details */}
                        <div className="p-5 grid grid-cols-3 gap-2 border-b border-white/[0.06] text-center">
                          <div>
                            <div className="text-[18px] font-mono font-semibold text-[#FAF7F2]">{guestCount}</div>
                            <div className="text-[10px] uppercase tracking-wider text-[#78716C]">Guests</div>
                          </div>
                          <div>
                            <div className="text-[18px] font-mono font-semibold text-[#D4A853]">{progress}%</div>
                            <div className="text-[10px] uppercase tracking-wider text-[#78716C]">RSVP Rate</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-[#FAF7F2] pt-0.5">{w.wedding_date ? format(new Date(w.wedding_date), "MMM d") : "TBD"}</div>
                            <div className="text-[10px] uppercase tracking-wider text-[#78716C]">Ceremony</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="p-4 bg-white/[0.02] flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectWedding(w)}
                          className="flex-1 py-2.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#FAF7F2] text-[12px] font-medium transition text-center min-h-[44px]"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => { localStorage.setItem("couple_wedding_id", w.id); localStorage.setItem("couple_wedding_slug", w.slug); window.open(`/couple/${w.slug}/dashboard`, "_blank"); }}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#EAB308] hover:bg-[#FDE047] text-[#09090B] text-[12px] font-semibold transition text-center min-h-[44px]"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => onShareWedding(w)}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#EAB308]/15 hover:bg-[#EAB308]/30 border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] transition shadow-md shrink-0"
                          title={`Copy & Send Couple Access Link (Code: ${w.access_code})`}
                        >
                          <Send size={15} />
                        </button>
                        <Link
                          to={`/wedding/${w.slug}?preview=1`}
                          target="_blank"
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] shrink-0"
                          title="Preview Guest Site"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[11px] uppercase tracking-[0.16em] text-[#78716C]">
                    <tr>
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          onChange={e => onSelectedIdsChange(e.target.checked ? filteredWeddings.map(w => w.id) : [])}
                          className="accent-[#D4A853]"
                        />
                      </th>
                      <th className="p-4">Celebration</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Stage</th>
                      <th className="p-4">Guests</th>
                      <th className="p-4">RSVP Rate</th>
                      <th className="p-4">Visibility</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredWeddings.map(w => {
                      const stage = getWeddingStage(w);
                      const statusStyle = getStatusStyle(stage);
                      const guestCount = weddingGuestCount(w.id);
                      const progress = rsvpProgress(w.id);

                      return (
                        <tr key={w.id} className="hover:bg-white/[0.03] transition">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(w.id)}
                              onChange={() => onSelectedIdsChange(selectedIds.includes(w.id) ? selectedIds.filter(x => x !== w.id) : [...selectedIds, w.id])}
                              className="accent-[#D4A853]"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={w.cover_image || w.hero_image} alt="" className="w-11 h-11 rounded-[12px] object-cover border border-white/[0.1]" />
                              <div>
                                <button onClick={() => onSelectWedding(w)} className="font-semibold text-[#FAF7F2] hover:text-[#D4A853] block">{w.couple_names}</button>
                                <div className="text-[11px] text-[#78716C] font-mono">/{w.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[#A8A29E]">{w.wedding_date ? format(new Date(w.wedding_date), "MMM d, yyyy") : "TBD"}</td>
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${statusStyle.bg}`}>{stage}</span></td>
                          <td className="p-4 font-mono text-[#FAF7F2]">{guestCount}</td>
                          <td className="p-4">
                            <div className="w-24">
                              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full bg-[#D4A853]" style={{ width: `${progress}%` }} /></div>
                              <div className="text-[11px] text-[#78716C] mt-1 font-mono">{progress}%</div>
                            </div>
                          </td>
                          <td className="p-4"><span className={`text-[11px] font-semibold ${w.published ? "text-[#7A9E7E]" : "text-[#78716C]"}`}>{w.published ? "Public" : "Private"}</span></td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button onClick={() => { localStorage.setItem("couple_wedding_id", w.id); localStorage.setItem("couple_wedding_slug", w.slug); window.open(`/couple/${w.slug}/dashboard`, "_blank"); }} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#D4A853]" title="Open Dashboard">
                                <Gauge size={14} />
                              </button>
                              <button onClick={() => onShareWedding(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#EAB308]/20 text-[#EAB308]" title={`Send Couple Link & Code (${w.access_code})`}>
                                <Send size={14} />
                              </button>
                              <Link to={`/wedding/${w.slug}?preview=1`} target="_blank" className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Preview Site">
                                <ExternalLink size={14} />
                              </Link>
                              <button onClick={() => onOpenQR(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Show Guest QR Code">
                                <QrCode size={14} />
                              </button>
                              <button onClick={() => onTogglePublish(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Toggle Publish">
                                {w.published ? (<EyeOff size={14} />) : (<Eye size={14} />)}
                              </button>
                              <button onClick={() => onDuplicateWedding(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Duplicate">
                                <Layers size={14} />
                              </button>
                              <button onClick={() => onDeleteWedding(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#C97B7B]/20 text-[#E4A5A5]" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Timeline / Calendar View */}
            {viewMode === "timeline" && (
              <div className="hidden md:block p-8 space-y-8 overflow-x-auto">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#FAF7F2]">Celebration Milestones & Calendar Roadmap</h4>
                    <p className="text-[12px] text-[#A8A29E]">Visual schedule of cake tastings, dress fittings, vendor deposits, and final walkthroughs across all active studios.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-[11px] font-mono font-semibold border border-[#D4A853]/30">Season 2026</span>
                </div>

                <div className="relative pl-8 border-l-2 border-[#D4A853]/30 space-y-8 my-6">
                  {filteredWeddings.map((w) => {
                    const milestones = [
                      { label: "Vendor Contracts Signed & Deposit Due", offset: -30, tone: "text-[#EAB308]", bg: "bg-[#EAB308]/15 border-[#EAB308]/30", icon: <Briefcase size={13} /> },
                      { label: "Menu & Cake Tasting Rehearsal", offset: -21, tone: "text-[#A882DD]", bg: "bg-[#A882DD]/15 border-[#A882DD]/30", icon: <Sparkles size={13} /> },
                      { label: "Final Walk-through & Lighting Setup", offset: -7, tone: "text-[#7A9E7E]", bg: "bg-[#7A9E7E]/15 border-[#7A9E7E]/30", icon: <CheckCircle2 size={13} /> },
                      { label: "Ceremony & Reception Orchestration", offset: 0, tone: "text-[#D4A853]", bg: "bg-[#D4A853]/20 border-[#D4A853]/40", icon: <Calendar size={13} /> },
                    ];

                    return (
                      <div key={w.id} className="relative group">
                        <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-[#0C0A09] border-2 border-[#D4A853] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,83,0.5)]" />
                        <div className="glass-frost p-6 rounded-[22px] border border-white/[0.08] hover:border-[#D4A853]/40 transition">
                          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                            <div className="flex items-center gap-3">
                              <h5 className="display text-[20px] text-[#FAF7F2]">{w.couple_names}</h5>
                              <span className="text-[12px] font-mono text-[#A8A29E] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                                {w.wedding_date ? format(new Date(w.wedding_date), "MMMM d, yyyy") : "Date TBD"}
                              </span>
                            </div>
                            <button onClick={() => onSelectWedding(w)} className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[12px] font-medium text-[#FAF7F2] transition min-h-[44px]">Manage Celebration</button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                            {milestones.map((m, mIdx) => (
                              <div key={mIdx} className={`p-3.5 rounded-[16px] border ${m.bg} flex flex-col justify-between`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={m.tone}>{m.icon}</span>
                                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${m.tone}`}>{w.wedding_date ? format(new Date(new Date(w.wedding_date).getTime() + m.offset * 86400000), "MMM d") : "TBD"}</span>
                                </div>
                                <div className="text-[12px] font-medium text-[#FAF7F2] leading-snug">{m.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Activity Feed & Tools */}
        <aside className="space-y-6">
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
            <div className="flex items-center justify-between mb-5">
              <span className="wedding-label">Recent Wedding Activity</span>
              <span className="text-[11px] font-mono text-[#A8A29E]">Live Updates</span>
            </div>

            <div className="space-y-3.5">
              {activity.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.wedding && onSelectWedding(item.wedding)}
                  className="w-full text-left flex items-start gap-3.5 p-3 rounded-[16px] bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.08] transition group"
                >
                  <div className="w-8 h-8 rounded-[10px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:border-[#D4A853]/30 transition">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-[#FAF7F2] truncate group-hover:text-[#D4A853] transition">{item.text}</div>
                    <div className="text-[12px] text-[#A8A29E] truncate">{item.sub}</div>
                    <div className="text-[11px] font-mono text-[#A8A29E] mt-1">{formatDistanceToNow(new Date(item.ts), { addSuffix: true })}</div>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard variant="frost" padding="lg" className="border border-white/[0.08]">
            <div className="wedding-label mb-4">Import History</div>
            <div className="space-y-3">
              {csvHistory.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-[#A8A29E]">No guest imports recorded yet.</div>
              ) : csvHistory.slice(0, 4).map(row => (
                <div key={row.id} className="p-3 rounded-[14px] bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[12px]">
                  <div className="truncate pr-2">
                    <div className="font-medium text-[#FAF7F2] truncate">{row.file}</div>
                    <div className="text-[11px] text-[#A8A29E]">{formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}</div>
                  </div>
                  <span className="font-mono text-[#7A9E7E] shrink-0">{row.count} rows</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </aside>
      </section>
    </div>
  );
}
