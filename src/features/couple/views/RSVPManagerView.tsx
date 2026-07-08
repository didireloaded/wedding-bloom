import React, { useState } from "react";
import { format } from "date-fns";
import {
  Users, CheckCircle2, XCircle, Clock, Search, Download,
  Filter, Sparkles, AlertCircle, Utensils, Music, Mail, Phone
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, RSVP } from "@/types/wedding";

interface RSVPManagerViewProps {
  wedding: Wedding;
  rsvps: RSVP[];
  onRemoveRSVP?: (id: string) => void;
  onExportCSV?: () => void;
}

export function RSVPManagerView({
  wedding,
  rsvps,
  onRemoveRSVP,
  onExportCSV
}: RSVPManagerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "declined" | "pending">("all");
  const [dietaryOnly, setDietaryOnly] = useState(false);

  const totalGuests = rsvps.reduce((acc, r) => acc + (Number(r.guest_count) || 1), 0);
  const confirmedGuests = rsvps
    .filter(r => r.attending === "confirmed" || r.attending === "yes")
    .reduce((acc, r) => acc + (Number(r.guest_count) || 1), 0);
  const declinedGuests = rsvps
    .filter(r => r.attending === "declined" || r.attending === "no")
    .reduce((acc, r) => acc + (Number(r.guest_count) || 1), 0);
  const dietaryCount = rsvps.filter(r => (r.dietary_preference && r.dietary_preference !== "none") || r.dietary_requirements).length;

  const filteredRsvps = rsvps.filter(r => {
    if (filterStatus === "confirmed" && r.attending !== "confirmed" && r.attending !== "yes") return false;
    if (filterStatus === "declined" && r.attending !== "declined" && r.attending !== "no") return false;
    if (filterStatus === "pending" && r.attending !== "pending") return false;
    if (dietaryOnly && !((r.dietary_preference && r.dietary_preference !== "none") || r.dietary_requirements)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.guest_name.toLowerCase().includes(q);
      const matchEmail = (r.email || "").toLowerCase().includes(q);
      const matchSong = (r.song_request || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSong) return false;
    }
    return true;
  });

  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    // Fallback client-side CSV export
    const headers = ["Guest Name", "Email", "Phone", "Attending", "Guest Count", "Dietary", "Song Request", "Notes", "Submitted At"];
    const rows = filteredRsvps.map(r => [
      `"${r.guest_name}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.attending}"`,
      r.guest_count || 1,
      `"${r.dietary_preference || r.dietary_requirements || "None"}"`,
      `"${r.song_request || ""}"`,
      `"${r.notes || r.message || ""}"`,
      `"${r.submitted_at || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RSVP-List-${wedding.slug || "wedding"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Users size={13} className="text-primary-container" />
            <span>Attendance & Culinary Requirements</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            RSVP & Meal Manager
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Audit guest confirmations, extract allergy profiles for catering teams, and export verified headcount ledgers.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Download size={15} />
          <span>Export Catering CSV</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Total Headcount</span>
          <div className="font-display-lg text-3xl text-ivory font-bold">{totalGuests}</div>
          <p className="text-[11px] text-ivory/40">Across {rsvps.length} parties</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400/80">Confirmed Yes</span>
          <div className="font-display-lg text-3xl text-emerald-300 font-bold">{confirmedGuests}</div>
          <p className="text-[11px] text-emerald-400/50">Attending celebration</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400/80">Regretfully Declined</span>
          <div className="font-display-lg text-3xl text-rose-300 font-bold">{declinedGuests}</div>
          <p className="text-[11px] text-rose-400/50">Unable to attend</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400/80">Dietary Needs</span>
          <div className="font-display-lg text-3xl text-amber-300 font-bold">{dietaryCount}</div>
          <p className="text-[11px] text-amber-400/50">Special meal prep</p>
        </GlassCard>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            placeholder="Search by guest name, email, or song request..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="fv-input w-full pl-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08]">
            {[
              { id: "all" as const, label: "All" },
              { id: "confirmed" as const, label: "Attending" },
              { id: "declined" as const, label: "Declined" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  filterStatus === tab.id ? "bg-primary-container text-obsidian font-bold" : "text-ivory/60 hover:text-ivory"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDietaryOnly(!dietaryOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition ${
              dietaryOnly ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold" : "bg-white/[0.03] border-white/[0.08] text-ivory/60 hover:text-ivory"
            }`}
          >
            <Utensils size={14} />
            <span>Dietary Alerts Only</span>
          </button>
        </div>
      </div>

      {/* RSVP Table / List */}
      {filteredRsvps.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <Users size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No RSVPs Matching Criteria</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto">
            Try adjusting your search keywords or filter status above.
          </p>
        </GlassCard>
      ) : (
        <GlassCard variant="obsidian" padding="none" className="border border-white/[0.08] overflow-hidden rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-ivory/60">
                  <th className="py-3.5 px-5">Guest / Party</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Headcount</th>
                  <th className="py-3.5 px-4">Dietary Profile</th>
                  <th className="py-3.5 px-4">Song Request / Notes</th>
                  <th className="py-3.5 px-5 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm text-ivory/85">
                {filteredRsvps.map((r) => {
                  const isConfirmed = r.attending === "confirmed" || r.attending === "yes";
                  const hasDietary = (r.dietary_preference && r.dietary_preference !== "none") || r.dietary_requirements;
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.03] transition duration-150">
                      <td className="py-4 px-5">
                        <div className="font-bold text-ivory flex items-center gap-2">
                          <span>{r.guest_name}</span>
                          {r.vip_status && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary-container/20 text-primary-container font-mono border border-primary-container/30">
                              VIP
                            </span>
                          )}
                        </div>
                        {r.email && (
                          <div className="text-xs text-ivory/50 font-mono flex items-center gap-1 mt-0.5">
                            <Mail size={11} /> {r.email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border inline-flex items-center gap-1.5 ${
                          isConfirmed ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}>
                          {isConfirmed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span className="capitalize">{r.attending}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-base font-bold text-ivory">
                        {r.guest_count || 1}
                      </td>
                      <td className="py-4 px-4">
                        {hasDietary ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs">
                            <Utensils size={13} />
                            <span>{r.dietary_preference || r.dietary_requirements}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-ivory/40 font-mono">Standard</span>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        {r.song_request && (
                          <div className="text-xs text-[#E8C97A] flex items-center gap-1.5 mb-1 truncate" title={r.song_request}>
                            <Music size={12} className="shrink-0" />
                            <span className="truncate">"{r.song_request}"</span>
                          </div>
                        )}
                        {(r.notes || r.message) && (
                          <div className="text-xs text-ivory/70 italic truncate" title={r.notes || r.message || ""}>
                            {r.notes || r.message}
                          </div>
                        )}
                        {!r.song_request && !r.notes && !r.message && (
                          <span className="text-xs text-ivory/30">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-xs text-ivory/50">
                        {r.submitted_at ? format(new Date(r.submitted_at), "MMM d, yyyy") : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
