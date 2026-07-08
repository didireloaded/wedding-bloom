import React, { useState } from "react";
import { format } from "date-fns";
import {
  QrCode, UserCheck, Search, Users, Sparkles, CheckCircle2,
  Clock, ShieldCheck, MapPin, Smartphone, ExternalLink, RefreshCw
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, Checkin } from "@/types/wedding";

interface DayOfCheckinsViewProps {
  wedding: Wedding;
  checkins: Checkin[];
  onRemoveCheckin?: (id: string) => void;
}

export function DayOfCheckinsView({
  wedding,
  checkins,
  onRemoveCheckin
}: DayOfCheckinsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [kioskActive, setKioskActive] = useState(true);

  const filteredCheckins = checkins.filter(chk => {
    if (!searchQuery.trim()) return true;
    return chk.guest_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <QrCode size={13} className="text-primary-container" />
            <span>Digital Kiosk & QR Verification Engine</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Day-Of Kiosk Check-Ins
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Configure welcome check-in stations for your ceremony or reception entrance. Track arrivals and verify guest badges instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setKioskActive(!kioskActive)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-medium border flex items-center gap-2 transition ${
              kioskActive ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-rose-500/20 border-rose-500/40 text-rose-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${kioskActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
            <span>{kioskActive ? "Kiosk Engine: ONLINE" : "Kiosk Engine: PAUSED"}</span>
          </button>
        </div>
      </div>

      {/* Kiosk Station Bento Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 lg:col-span-1 flex flex-col justify-between items-center text-center p-6 shadow-2xl">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-primary-container/20 text-primary-container border border-primary-container/30">
              Active Kiosk Station #1
            </span>
            <h3 className="font-headline-sm text-xl text-ivory font-bold">Main Ceremony Gateway</h3>
            <p className="text-xs text-ivory/60">
              Display this QR code at your entrance table for self-service guest check-in and instant table assignment lookup.
            </p>
          </div>

          <div className="my-6 p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(212,175,55,0.25)] border-4 border-primary-container">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://weddingbloom.app/checkin/${wedding.slug || "wedding"}&color=11141A&bgcolor=FFFFFF`}
              alt="Check-in Kiosk QR"
              className="w-40 h-40 object-contain"
            />
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => window.open(`/checkin/${wedding.slug || "wedding"}`, "_blank")}
              className="fv-btn-primary w-full !py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Launch Fullscreen Kiosk Mode</span>
              <ExternalLink size={14} />
            </button>
            <p className="text-[10px] font-mono text-ivory/40">URL: /checkin/{wedding.slug || "wedding"}</p>
          </div>
        </GlassCard>

        {/* Check-ins Live Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-headline-sm text-xl text-ivory flex items-center gap-2">
              <UserCheck size={20} className="text-primary-container" />
              <span>Verified Check-In Manifest ({checkins.length})</span>
            </h3>
            <div className="relative max-w-xs w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40" />
              <input
                placeholder="Search check-ins by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="fv-input w-full pl-9 text-xs py-1.5"
              />
            </div>
          </div>

          {filteredCheckins.length === 0 ? (
            <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
              <Users size={32} className="mx-auto text-ivory/30 mb-3" />
              <h3 className="font-headline-sm text-xl text-ivory mb-2">No Kiosk Check-Ins Logged Yet</h3>
              <p className="text-xs text-ivory/50 max-w-md mx-auto">
                Once guests scan the kiosk QR code upon arrival at your celebration, their verification badges will populate here.
              </p>
            </GlassCard>
          ) : (
            <GlassCard variant="obsidian" padding="none" className="border border-white/[0.08] overflow-hidden rounded-2xl shadow-xl">
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-obsidian z-10">
                    <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-ivory/60">
                      <th className="py-3.5 px-5">Attendee / Party Name</th>
                      <th className="py-3.5 px-4">Verification Station</th>
                      <th className="py-3.5 px-4">Badge Status</th>
                      <th className="py-3.5 px-5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-sm text-ivory/85">
                    {filteredCheckins.slice().reverse().map((chk) => (
                      <tr key={chk.id} className="hover:bg-white/[0.03] transition duration-150">
                        <td className="py-4 px-5">
                          <div className="font-bold text-ivory flex items-center gap-2">
                            <span>{chk.guest_name}</span>
                          </div>
                          {chk.message && (
                            <div className="text-xs text-ivory/60 italic mt-0.5">"{chk.message}"</div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-primary-container">
                          Main Entrance Gateway #1
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5">
                            <CheckCircle2 size={13} /> Checked In
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right font-mono text-xs text-ivory/50">
                          {chk.created_at ? format(new Date(chk.created_at), "HH:mm:ss • MMM d") : "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
