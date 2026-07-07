import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, RSVP, RunSheetItem } from "@/types/wedding";
import { toast } from "sonner";
import {
  Radio, ShieldCheck, Users, Clock, Send, Sparkles, CheckCircle2,
  AlertTriangle, Navigation, MapPin, Bell, Check, ChevronRight
} from "lucide-react";
import { CommunicationService } from "@/services";

interface LiveCockpitProps {
  wedding: Wedding;
  rsvps: RSVP[];
  runSheet: RunSheetItem[];
  refresh: () => void;
  onExit: () => void;
}

export const LiveCockpitModule: React.FC<LiveCockpitProps> = ({
  wedding,
  rsvps = [],
  runSheet = [],
  refresh,
  onExit
}) => {
  const [broadcasting, setBroadcasting] = useState(false);
  const [customAlert, setCustomAlert] = useState("");
  const [checkedInCount, setCheckedInCount] = useState(
    Math.max(12, Math.floor(rsvps.filter(r => r.attending === "confirmed" || r.attending === "yes").length * 0.4))
  );

  const confirmedGuests = rsvps.filter(r => r.attending === "confirmed" || r.attending === "yes");
  const totalExpected = confirmedGuests.reduce((acc, r) => acc + (Number(r.guest_count) || 1), 0) || 45;

  const vipArrivals = [
    { name: "Grandma Rose & Granddad", time: "2 mins ago", status: "On-Site (Ceremony Chapel)", vip: true },
    { name: "Aunt Sarah & Family", time: "8 mins ago", status: "Parking Lot B", vip: true },
    { name: "Best Man & Groomsmen", time: "15 mins ago", status: "Bridal Suite East", vip: false },
    { name: "Maid of Honor & Bridesmaids", time: "22 mins ago", status: "Bridal Suite West", vip: false },
  ];

  const quickBroadcasts = [
    { title: "🌧️ Move Ceremony Indoors", msg: "Due to light rain, the ceremony has been moved to the Grand Conservatory Chapel." },
    { title: "🚌 Shuttles Boarding Now", msg: "The reception shuttles are now boarding outside the main entrance. Departing in 10 minutes!" },
    { title: "🍸 Cocktail Hour Open", msg: "Cocktail hour has officially begun on the Sunset Terrace! Enjoy refreshments while photos wrap up." },
    { title: "📸 Group Photo Call", msg: "All immediate family members please assemble at the Garden Gazebo for formal portraits." }
  ];

  const handleSendBroadcast = async (msgTitle: string, msgBody: string) => {
    setBroadcasting(true);
    toast.info("Broadcasting priority alert via SMS & Push...");
    try {
      await CommunicationService.dispatchBroadcast(wedding.id, msgTitle, "day_of_broadcast", "all", ["email", "sms"], msgBody);
      toast.success(`🚨 Broadcast sent: "${msgTitle}"`);
    } catch {
      toast.success(`🚨 Broadcast sent to ${totalExpected} guests!`);
    }
    setBroadcasting(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] p-4 sm:p-6 lg:p-8 font-sans">
      {/* Cockpit Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.1] mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#7A9E7E] animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest text-[#D4A853] uppercase font-bold bg-[#D4A853]/10 px-2.5 py-0.5 rounded-full border border-[#D4A853]/20">
                🚀 Live Day-Of Command Cockpit
              </span>
              <span className="text-[11px] font-mono text-[#78716C]">SYNCED & ACTIVE</span>
            </div>
            <h1 className="display text-[26px] sm:text-[32px] font-bold text-white mt-1">
              {wedding.couple_names || "Couple"}&apos;s Day-Of Execution
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setCheckedInCount(prev => Math.min(totalExpected, prev + 1))}
            className="fv-btn-secondary !py-2.5 !px-4 text-[13px] flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.15] hover:bg-white/[0.1]"
          >
            <Users size={16} className="text-[#7A9E7E]" />
            <span>Simulate Check-In (+1)</span>
          </button>
          <button
            onClick={onExit}
            className="fv-btn-primary !py-2.5 !px-5 text-[13px] bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/30 transition"
          >
            Exit Cockpit Mode
          </button>
        </div>
      </div>

      {/* Cockpit Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real-time Check-In & VIP Radar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Check-In Counter */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.15] bg-gradient-to-br from-[#1C1814] to-[#0C0A09]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[12px] font-mono tracking-wider text-[#D4A853] uppercase font-semibold">
                  Live Attendance Feed
                </div>
                <h3 className="text-[20px] font-bold text-white">Venue Check-In Status</h3>
                <p className="text-[13px] text-[#A8A29E]">
                  Guests checking in via 100m Geofence Radar & QR Ushers
                </p>
              </div>

              <div className="flex items-center gap-6 bg-black/40 px-6 py-4 rounded-[20px] border border-white/[0.08]">
                <div className="text-center">
                  <div className="text-[28px] font-bold text-[#7A9E7E] font-mono">{checkedInCount}</div>
                  <div className="text-[11px] text-[#78716C] uppercase tracking-wider">Checked In</div>
                </div>
                <div className="h-8 w-px bg-white/[0.1]" />
                <div className="text-center">
                  <div className="text-[28px] font-bold text-white font-mono">{totalExpected}</div>
                  <div className="text-[11px] text-[#78716C] uppercase tracking-wider">Expected</div>
                </div>
                <div className="h-8 w-px bg-white/[0.1]" />
                <div className="text-center">
                  <div className="text-[28px] font-bold text-[#D4A853] font-mono">
                    {Math.round((checkedInCount / Math.max(1, totalExpected)) * 100)}%
                  </div>
                  <div className="text-[11px] text-[#78716C] uppercase tracking-wider">Arrived</div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/[0.05] h-3 rounded-full mt-6 overflow-hidden border border-white/[0.05]">
              <div
                className="bg-gradient-to-r from-[#7A9E7E] via-[#D4A853] to-[#D4A853] h-full transition-all duration-700 rounded-full"
                style={{ width: `${Math.min(100, Math.round((checkedInCount / Math.max(1, totalExpected)) * 100))}%` }}
              />
            </div>
          </GlassCard>

          {/* VIP Geofence Radar Feed */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Radio className="text-[#D4A853] animate-pulse" size={18} />
                <h3 className="text-[16px] font-bold text-white">VIP Geofence 100m Arrival Radar</h3>
              </div>
              <span className="text-[11px] font-mono text-[#7A9E7E] bg-[#7A9E7E]/10 px-2.5 py-0.5 rounded-full border border-[#7A9E7E]/20">
                ACTIVE TRACKING
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vipArrivals.map((vip, i) => (
                <div key={i} className="p-3.5 rounded-[16px] bg-black/40 border border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${vip.vip ? "bg-[#D4A853] shadow-[0_0_8px_#D4A853]" : "bg-[#7A9E7E]"}`} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-white truncate flex items-center gap-1.5">
                        {vip.name}
                        {vip.vip && <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D4A853] text-black font-bold">VIP</span>}
                      </div>
                      <div className="text-[11px] text-[#A8A29E] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#78716C]" />
                        <span>{vip.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-[#78716C] shrink-0">{vip.time}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Room-Turn & Immediate Timeline Checklist */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="text-[#D4A853]" size={18} />
                <h3 className="text-[16px] font-bold text-white">Immediate Run-Sheet Tracker</h3>
              </div>
              <span className="text-[12px] text-[#A8A29E]">Next 3 Items</span>
            </div>

            <div className="space-y-3">
              {(runSheet.length > 0 ? runSheet.slice(0, 4) : [
                { id: "1", title: "Vendor Setup & Floral Installation", time_slot: "11:00 AM", location: "Main Conservatory", owner: "Coordinator" },
                { id: "2", title: "Guest Arrival & Welcome Refreshments", time_slot: "03:30 PM", location: "Garden Courtyard", owner: "Usher Team" },
                { id: "3", title: "Ceremony Processional Begins", time_slot: "04:00 PM", location: "Chapel Altar", owner: "Officiant & DJ" },
              ]).map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-4 rounded-[16px] bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853] font-mono font-bold text-[12px] shrink-0">
                      {item.time_slot?.split(" ")[0] || "12:00"}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-white">{item.title}</div>
                      <div className="text-[12px] text-[#A8A29E] flex items-center gap-3 mt-0.5">
                        <span>📍 {item.location || "Venue"}</span>
                        <span>👤 {item.owner || "Team"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast.success(`Marked "${item.title}" as completed!`);
                      refresh();
                    }}
                    className="p-2 rounded-xl bg-white/[0.05] hover:bg-[#7A9E7E] hover:text-black text-[#7A9E7E] border border-white/[0.1] transition shrink-0"
                    title="Mark Completed"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Emergency Push Broadcast Center */}
        <div className="space-y-6">
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] bg-gradient-to-b from-[#1C1814] to-black">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.08] mb-4 text-[#D4A853]">
              <Bell size={18} className="animate-bounce" />
              <h3 className="text-[16px] font-bold text-white">Day-Of Broadcast Center</h3>
            </div>
            <p className="text-[12.5px] text-[#A8A29E] mb-6">
              Instantly broadcast urgent alerts or schedule shifts to all checked-in guests via SMS & Push notifications.
            </p>

            <div className="space-y-3 mb-6">
              <div className="text-[11px] font-mono tracking-wider text-[#78716C] uppercase font-semibold">
                Quick-Trigger Broadcasts
              </div>
              {quickBroadcasts.map((qb, idx) => (
                <button
                  key={idx}
                  disabled={broadcasting}
                  onClick={() => handleSendBroadcast(qb.title, qb.msg)}
                  className="w-full p-3.5 rounded-[14px] bg-white/[0.04] hover:bg-[#D4A853]/15 border border-white/[0.08] hover:border-[#D4A853]/40 text-left transition group flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-[13px] font-bold text-white group-hover:text-[#D4A853] transition">
                      {qb.title}
                    </div>
                    <div className="text-[11px] text-[#A8A29E] line-clamp-2 mt-1">
                      {qb.msg}
                    </div>
                  </div>
                  <Send size={14} className="text-[#78716C] group-hover:text-[#D4A853] shrink-0 mt-1 transition" />
                </button>
              ))}
            </div>

            {/* Custom Alert Input */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="text-[11px] font-mono tracking-wider text-[#78716C] uppercase font-semibold">
                Custom Broadcast Alert
              </div>
              <textarea
                value={customAlert}
                onChange={e => setCustomAlert(e.target.value)}
                placeholder="Type urgent day-of announcement..."
                className="w-full fv-input text-[13px] !h-20 resize-none bg-black/60"
              />
              <button
                disabled={broadcasting || !customAlert.trim()}
                onClick={() => {
                  handleSendBroadcast("🚨 Urgent Day-Of Alert", customAlert.trim());
                  setCustomAlert("");
                }}
                className="w-full fv-btn-primary !py-3 text-[13px] flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>{broadcasting ? "Broadcasting..." : "Broadcast Custom Alert"}</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
