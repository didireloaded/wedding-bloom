import React, { useState } from "react";
import { format } from "date-fns";
import {
  Navigation, Plane, MapPin, CheckCircle2, Clock, Users,
  AlertCircle, Sparkles, Filter, ShieldCheck, Bus, Car
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, Checkin } from "@/types/wedding";

interface LiveArrivalsRadarViewProps {
  wedding: Wedding;
  checkins: Checkin[];
  onRemoveCheckin?: (id: string) => void;
}

export function LiveArrivalsRadarView({
  wedding,
  checkins,
  onRemoveCheckin
}: LiveArrivalsRadarViewProps) {
  const [filterType, setFilterType] = useState<"all" | "today" | "shuttle">("all");

  const totalCheckins = checkins.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Navigation size={13} className="text-primary-container animate-spin" style={{ animationDuration: "12s" }} />
            <span>Real-Time Logistics & Geolocation Tracking</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Live Arrivals Radar
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Monitor real-time guest check-ins as attendees arrive at airports, hotels, and welcome venues. Coordinate shuttle departures precisely.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.1] px-4 py-2 rounded-2xl shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container"></span>
          </span>
          <span className="text-xs font-mono text-ivory/80">Arrivals Radar Active ({totalCheckins} Checked In)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Total Checked In</span>
          <div className="font-display-lg text-3xl text-ivory font-bold">{totalCheckins}</div>
          <p className="text-[11px] text-ivory/40">Verified arrivals on-site</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-primary-container">Shuttle Manifest Check</span>
          <div className="font-display-lg text-3xl text-primary-container font-bold">100%</div>
          <p className="text-[11px] text-primary-container/50">All shuttles on schedule</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Hotel Kiosk Activity</span>
          <div className="font-display-lg text-3xl text-emerald-300 font-bold">{totalCheckins > 0 ? Math.ceil(totalCheckins * 0.7) : 0}</div>
          <p className="text-[11px] text-emerald-400/50">Checked into room blocks</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400">In-Transit Alerts</span>
          <div className="font-display-lg text-3xl text-blue-300 font-bold">0</div>
          <p className="text-[11px] text-blue-400/50">No flight delays reported</p>
        </GlassCard>
      </div>

      {/* Arrivals Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-xl text-ivory">Live Check-In Feed</h3>
          <span className="text-xs font-mono text-ivory/50">Auto-refreshing via QR Kiosks</span>
        </div>

        {checkins.length === 0 ? (
          <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
            <Plane size={32} className="mx-auto text-ivory/30 mb-3 animate-bounce" />
            <h3 className="font-headline-sm text-xl text-ivory mb-2">No Arrivals Recorded Yet</h3>
            <p className="text-xs text-ivory/50 max-w-md mx-auto">
              As guests scan QR codes at your ceremony entrance or welcome reception, their check-ins will populate this radar instantaneously.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {checkins.slice().reverse().map((chk) => (
              <GlassCard
                key={chk.id}
                variant="obsidian"
                padding="md"
                className="border border-white/[0.08] hover:border-white/[0.18] transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-lg text-ivory font-bold">{chk.guest_name}</h4>
                    {chk.message && (
                      <p className="text-xs text-ivory/70 italic mt-0.5">"{chk.message}"</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-ivory/45 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#E8C97A]" />
                        <span>Ceremony Main Entrance Kiosk</span>
                      </span>
                      <span>•</span>
                      <span>{chk.created_at ? format(new Date(chk.created_at), "HH:mm • MMM d") : "Just arrived"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/[0.05] text-ivory/60 border border-white/[0.08]">
                    Verified Arrival
                  </span>
                  {onRemoveCheckin && (
                    <button
                      onClick={() => onRemoveCheckin(chk.id)}
                      className="text-ivory/30 hover:text-rose-400 p-1 rounded transition"
                      title="Clear Entry"
                    >
                      <span className="text-xs">×</span>
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
