import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import {
  Heart, Users, MessageCircle, Camera, Eye, QrCode, Sparkles, Bell,
  ArrowRight, TrendingUp, Activity, Calendar, MapPin,
  Send, ExternalLink, Image, BarChart3, Zap, ShieldCheck, Check, Clock
} from "lucide-react";
import { store } from "@/store/weddingStore";
import { calculateWeddingStage } from "@/store/workflowEngine";
import { GlassCard } from "@/components/ui/GlassCard";

/* ─────────────────────────────────────────────
   GREETING + COUNTDOWN HEADER (MISSION CONTROL)
   ───────────────────────────────────────────── */
export function CommandCenter({ wedding, rsvps, moments, guestPhotos }: any) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const days = wedding.wedding_date ? differenceInDays(new Date(wedding.wedding_date + "T16:00:00"), new Date()) : null;

  const confirmed = rsvps.filter((r: any) => r.attending === "confirmed").length;
  const pending = rsvps.filter((r: any) => r.attending === "pending" || r.attending === "maybe").length;

  const latestAct = buildNotifications(wedding, rsvps, moments, guestPhotos)[0];
  const stageInfo = calculateWeddingStage(wedding);

  const stages = [
    { num: 1, label: "Created" },
    { num: 2, label: "Details" },
    { num: 3, label: "Published" },
    { num: 4, label: "RSVPs" },
    { num: 5, label: "Wedding Week" },
    { num: 6, label: "Married ❤️" },
  ];

  return (
    <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.12] relative overflow-hidden shadow-2xl">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4A853]/25 via-[#B8872E]/10 to-transparent rounded-full -mr-28 -mt-28 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C97B7B]/10 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${stageInfo.isLegacyMode ? "bg-[#C97B7B]" : wedding.published ? "bg-[#7A9E7E]" : "bg-[#D4A853]"}`} />
            <div className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#A8A29E]">
              Stage {stageInfo.stageNumber} of 6: <span className="text-[#FAF7F2] font-bold">{stageInfo.stageName}</span>
            </div>
          </div>

          <div className="text-[13px] uppercase tracking-[0.15em] text-[#D4A853] font-semibold mb-1">{greet},</div>
          <h1 className="display text-[44px] sm:text-[58px] leading-[0.9] text-[#FAF7F2] mb-6">{wedding.couple_names}</h1>

          {/* Progress Bar */}
          <div className="mb-8 p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[12px] text-[#FAF7F2]/90 font-medium mb-3">
              <span>Celebration Readiness</span>
              <span className="font-mono text-[#D4A853] font-semibold">{stageInfo.progressPercent}%</span>
            </div>
            <div className="grid grid-cols-6 gap-2 mb-2.5">
              {stages.map((s) => (
                <div
                  key={s.num}
                  title={s.label}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    s.num <= stageInfo.stageNumber
                      ? "bg-gradient-to-r from-[#D4A853] to-[#E8C97A] shadow-[0_0_12px_rgba(212,168,83,0.5)]"
                      : "bg-white/[0.08]"
                  }`}
                />
              ))}
            </div>
            <div className="hidden sm:flex justify-between text-[10px] uppercase tracking-wider text-[#78716C]">
              {stages.map((s) => (
                <span key={s.num} className={s.num === stageInfo.stageNumber ? "text-[#D4A853] font-bold" : ""}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] px-5 py-4">
              <div className="display text-[32px] text-[#D4A853] leading-none">{days !== null ? Math.abs(days) : "—"}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#A8A29E] font-medium mt-1.5">
                {days !== null && days >= 0 ? "Days Remaining" : "Days Married"}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] px-5 py-4">
              <div className="display text-[32px] text-[#FAF7F2] leading-none">{confirmed}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#A8A29E] font-medium mt-1.5">Confirmed Guests</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] px-5 py-4">
              <div className="display text-[32px] text-[#FAF7F2]/75 leading-none">{pending}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#A8A29E] font-medium mt-1.5">Pending RSVPs</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <GlassCard variant="aurora" padding="lg" className="border border-[#EAB308]/30 shadow-xl rounded-[28px]">
            <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#EAB308] mb-2 flex items-center gap-2">
              <Sparkles size={14} /> Recommended Next Step
            </div>
            <div className="text-[16px] font-medium leading-relaxed text-[#FAFAFA]">{stageInfo.recommendation}</div>
            <button
              onClick={() => {
                const el = document.getElementById("mission-actions");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-5 text-[13px] inline-flex items-center gap-2 font-bold hover:gap-3 transition-all bg-[#EAB308] text-[#09090B] px-5 py-2.5 rounded-full shadow-md"
            >
              {stageInfo.actionLabel} <ArrowRight size={15} />
            </button>
          </GlassCard>

          {latestAct && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[24px] p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] font-semibold mb-2">Latest Guest Activity</div>
              <div className="text-[13.5px] text-[#FAFAFA] font-medium truncate">{latestAct.text}</div>
              <div className="text-[11px] text-[#EAB308] mt-1 font-mono">{formatDistanceToNow(new Date(latestAct.ts), { addSuffix: true })}</div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   COUNTDOWN WIDGET
   ───────────────────────────────────────────── */
export function CountdownWidget({ wedding }: { wedding: any }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!wedding.wedding_date) return null;
  const target = new Date(wedding.wedding_date + "T16:00:00").getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
      <div className="wedding-label mb-4 flex items-center gap-2">
        <Clock size={14} className="text-[#D4A853]" /> Real-Time Countdown
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[["Days", days], ["Hrs", hours], ["Min", minutes], ["Sec", seconds]].map(([l, v]) => (
          <div key={l as string} className="bg-white/[0.03] border border-white/[0.08] rounded-[18px] py-4 text-center">
            <div className="display text-[30px] md:text-[36px] leading-none text-[#FAF7F2] font-mono">{String(v).padStart(2, "0")}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A8A29E] mt-1.5">{l}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   WEDDING HEALTH / PROGRESS
   ───────────────────────────────────────────── */
export function HealthWidget({ wedding, gallery, events, accommodations }: any) {
  const categories = [
    {
      name: "Wedding Details",
      score: [!!wedding.couple_names, !!wedding.wedding_date, !!wedding.story].filter(Boolean).length / 3
    },
    {
      name: "Guest Experience",
      score: [events.length >= 1, !!wedding.ceremony_venue, accommodations.length >= 1].filter(Boolean).length / 3
    },
    {
      name: "Gallery & Theme",
      score: [!!wedding.hero_image, gallery.length >= 1, !!wedding.theme].filter(Boolean).length / 3
    },
    {
      name: "Invitations",
      score: [!!wedding.published, !!wedding.dress_code, !!wedding.hashtag].filter(Boolean).length / 3
    }
  ];

  const overall = Math.round((categories.reduce((s, c) => s + c.score, 0) / categories.length) * 100);

  return (
    <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="wedding-label">Health Score</div>
          <div className="display text-[26px] text-[#FAF7F2] mt-0.5">{overall}% Optimized</div>
        </div>
        <span className={`fv-badge ${overall > 80 ? "fv-badge-sage" : "fv-badge-gold"}`}>
          {overall > 80 ? "Prime Readiness" : "In Preparation"}
        </span>
      </div>

      <div className="space-y-4">
        {categories.map(c => (
          <div key={c.name}>
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-[#A8A29E] font-medium">{c.name}</span>
              <span className="font-mono text-[#D4A853] font-semibold">{Math.round(c.score * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${c.score * 100}%` }}
                className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]"
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   SUMMARY STATS GRID
   ───────────────────────────────────────────── */
export function SummaryGrid({ rsvps, moments, guestPhotos, wedding, onNavigate }: any) {
  const confirmed = rsvps.filter((r: any) => r.attending === "confirmed").length;
  const pending = rsvps.filter((r: any) => r.attending === "pending" || r.attending === "maybe").length;
  const declined = rsvps.filter((r: any) => r.attending === "declined").length;
  const views = Number(localStorage.getItem(`wb_viewed_${wedding.id}`) || 0);
  const qrScans = Number(localStorage.getItem(`wb_qr_${wedding.id}`) || 0);

  const cards = [
    { icon: <Users size={18} />, label: "Confirmed", value: confirmed, tab: "rsvp", color: "#7A9E7E", bg: "rgba(122,158,126,0.12)", sub: `Expecting ~${rsvps.length}` },
    { icon: <Heart size={18} />, label: "Pending", value: pending, tab: "rsvp", color: "#D4A853", bg: "rgba(212,168,83,0.12)", sub: `${Math.round((pending/rsvps.length)||0)}% remaining` },
    { icon: <Activity size={18} />, label: "Declined", value: declined, tab: "rsvp", color: "#C97B7B", bg: "rgba(201,123,123,0.12)", sub: "Guest list updated" },
    { icon: <MessageCircle size={18} />, label: "Messages", value: moments.length, tab: "moments", color: "#A882DD", bg: "rgba(168,130,221,0.12)", sub: "In Guestbook" },
    { icon: <Image size={18} />, label: "Guest Photos", value: guestPhotos.length, tab: "guest_photos", color: "#E8C97A", bg: "rgba(232,201,122,0.12)", sub: "New uploads" },
    { icon: <Eye size={18} />, label: "Page Views", value: views, tab: "overview", color: "#6EA4B8", bg: "rgba(110,164,184,0.12)", sub: "Live traffic" },
    { icon: <QrCode size={18} />, label: "QR Scans", value: qrScans, tab: "share", color: "#FAF7F2", bg: "rgba(250,247,242,0.08)", sub: "Invitations opened" },
    { icon: <Sparkles size={18} />, label: "Exp. Score", value: "94%", tab: "overview", color: "#D4A853", bg: "rgba(212,168,83,0.15)", sub: "Guest sentiment" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <GlassCard
          key={c.label}
          variant="obsidian"
          padding="md"
          hoverEffect
          onClick={() => onNavigate?.(c.tab)}
          className="cursor-pointer flex flex-col justify-between border border-white/[0.08]"
        >
          <div>
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-3"
              style={{ backgroundColor: c.bg, color: c.color }}
            >
              {c.icon}
            </div>
            <div className="display text-[30px] text-[#FAF7F2] leading-none">{c.value}</div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-[#A8A29E] mt-2 font-bold">{c.label}</div>
          </div>
          <div className="text-[11px] text-[#78716C] mt-3 font-mono pt-2 border-t border-white/[0.04]">{c.sub}</div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUICK ACTIONS
   ───────────────────────────────────────────── */
export function QuickActionsWidget({ wedding, onNavigate, onCopyLink }: any) {
  const slug = wedding.slug;
  const actions = [
    { icon: <Send size={16} />, label: "Share Invitation", onClick: onCopyLink },
    { icon: <ExternalLink size={16} />, label: "Preview Site", onClick: () => window.open(`/wedding/${slug}`, "_blank") },
    { icon: <QrCode size={16} />, label: "Get QR Code", onClick: () => onNavigate("share") },
    { icon: <Calendar size={16} />, label: "Add Event", onClick: () => onNavigate("events") },
    { icon: <Image size={16} />, label: "Official Gallery", onClick: () => onNavigate("gallery") },
    { icon: <MessageCircle size={16} />, label: "Post Update", onClick: () => onNavigate("updates") },
    { icon: <MapPin size={16} />, label: "Venue Map", onClick: () => onNavigate("map") },
    { icon: <Heart size={16} />, label: "Hotels & Stay", onClick: () => onNavigate("accommodations") },
  ];

  return (
    <GlassCard variant="obsidian" padding="lg" id="mission-actions" className="border border-white/[0.1]">
      <div className="wedding-label mb-4">Command Center Shortcuts</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-3 px-4 py-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-[#D4A853]/40 transition text-[13px] text-[#FAF7F2] text-left font-medium group"
          >
            <span className="text-[#D4A853] bg-white/[0.06] w-9 h-9 rounded-[12px] flex items-center justify-center border border-white/[0.08] group-hover:scale-110 transition">{a.icon}</span>
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   RECENT ACTIVITY TIMELINE
   ───────────────────────────────────────────── */
export function ActivityTimeline({ rsvps, moments, guestPhotos, updates }: any) {
  const items = useMemo(() => {
    const list: { ts: number; icon: any; text: string; sub: string }[] = [];
    rsvps.forEach((r: any) => {
      list.push({
        ts: new Date(r.submitted_at).getTime(),
        icon: <Heart size={14} className="text-[#D4A853]" />,
        text: `${r.guest_name} ${r.attending === "confirmed" ? "confirmed attendance" : r.attending === "declined" ? "declined" : "submitted an RSVP"}`,
        sub: r.guest_count > 1 ? `${r.guest_count} guests` : "",
      });
    });
    moments.forEach((m: any) => list.push({
      ts: new Date(m.created_at).getTime(),
      icon: <MessageCircle size={14} className="text-[#A882DD]" />,
      text: `${m.guest_name} shared a moment`,
      sub: `"${m.message.slice(0, 60)}${m.message.length > 60 ? "…" : ""}"`,
    }));
    guestPhotos.forEach((p: any) => list.push({
      ts: new Date(p.created_at).getTime(),
      icon: <Camera size={14} className="text-[#E8C97A]" />,
      text: `${p.guest_name} uploaded a photo`,
      sub: "",
    }));
    updates.forEach((u: any) => list.push({
      ts: new Date(u.created_at).getTime(),
      icon: <Bell size={14} className="text-[#7A9E7E]" />,
      text: `Announcement: ${u.title}`,
      sub: u.message.slice(0, 60),
    }));
    return list.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [rsvps, moments, guestPhotos, updates]);

  return (
    <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
      <div className="wedding-label mb-5">Activity River</div>
      {items.length === 0 ? (
        <div className="text-[13px] text-[#78716C] text-center py-8">No events logged yet. Share your guest portal to start collecting activity.</div>
      ) : (
        <div className="relative pl-6 border-l border-white/[0.1] space-y-6">
          {items.map((it, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-[#0C0A09] border border-white/[0.2] flex items-center justify-center group-hover:border-[#D4A853] transition">
                {it.icon}
              </div>
              <div className="text-[14px] text-[#FAF7F2] font-medium">{it.text}</div>
              {it.sub && <div className="text-[12px] text-[#A8A29E] mt-0.5 italic">{it.sub}</div>}
              <div className="text-[10px] text-[#78716C] font-mono mt-1">{formatDistanceToNow(new Date(it.ts), { addSuffix: true })}</div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   WEDDING INSIGHTS
   ───────────────────────────────────────────── */
export function InsightsWidget({ wedding, rsvps, guestPhotos, moments }: any) {
  const totalInvited = rsvps.length;
  const responded = rsvps.filter((r: any) => r.attending === "confirmed" || r.attending === "declined").length;
  const responseRate = totalInvited > 0 ? Math.round((responded / totalInvited) * 100) : 0;
  const todayMs = new Date(); todayMs.setHours(0,0,0,0);
  const photosToday = guestPhotos.filter((p: any) => new Date(p.created_at) >= todayMs).length;
  const latestRsvp = rsvps.slice().sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0];

  const guestCounts: Record<string, number> = {};
  [...moments, ...guestPhotos].forEach((x: any) => {
    if (x.guest_name) guestCounts[x.guest_name] = (guestCounts[x.guest_name] || 0) + 1;
  });
  const mostActive = Object.entries(guestCounts).sort((a, b) => b[1] - a[1])[0];

  const views = Number(localStorage.getItem(`wb_viewed_${wedding.id}`) || 0);
  const engagement = totalInvited > 0 ? Math.min(100, Math.round(((responded + moments.length + guestPhotos.length) / (totalInvited * 1.5)) * 100)) : 0;

  const insights = [
    { label: "RSVP Completion", value: `${responseRate}%`, icon: <TrendingUp size={15} /> },
    { label: "Traffic Volume", value: views, icon: <Eye size={15} /> },
    { label: "Photos Today", value: photosToday, icon: <Camera size={15} /> },
    { label: "Guest Engagement", value: `${engagement}%`, icon: <BarChart3 size={15} /> },
    { label: "MVP Guest", value: mostActive ? mostActive[0] : "—", icon: <Users size={15} /> },
    { label: "Latest RSVP", value: latestRsvp ? latestRsvp.guest_name : "—", icon: <Sparkles size={15} /> },
  ];

  return (
    <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
      <div className="wedding-label mb-4">Intelligence Metrics</div>
      <div className="grid grid-cols-2 gap-4">
        {insights.map(i => (
          <div key={i.label} className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-4 group hover:border-[#D4A853]/40 transition">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#A8A29E] mb-2 font-bold">
              <span className="text-[#D4A853] group-hover:scale-110 transition">{i.icon}</span>{i.label}
            </div>
            <div className="display text-[24px] text-[#FAF7F2] truncate leading-none">{i.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   NOTIFICATIONS
   ───────────────────────────────────────────── */
const NOTIF_READ_KEY = (wid: string) => `fv_notifs_read_${wid}`;

export function buildNotifications(wedding: any, rsvps: any[], moments: any[], guestPhotos: any[]) {
  const items: { id: string; type: string; text: string; ts: number; dataId?: string; tab?: string; icon?: any }[] = [];
  rsvps.forEach((r: any) => items.push({
    id: `rsvp_${r.id}`,
    type: "rsvp",
    text: `${r.guest_name} ${r.attending === "confirmed" ? "confirmed attendance" : r.attending === "declined" ? "declined" : "sent an RSVP"}`,
    ts: new Date(r.submitted_at).getTime(),
    tab: "rsvp",
    icon: <Heart size={14} className="text-[#D4A853]" />
  }));
  moments.forEach((m: any) => items.push({
    id: `mom_${m.id}`,
    type: "moment",
    text: `${m.guest_name} shared a moment`,
    ts: new Date(m.created_at).getTime(),
    tab: "moments",
    icon: <MessageCircle size={14} className="text-[#A882DD]" />
  }));
  guestPhotos.forEach((p: any) => items.push({
    id: `photo_${p.id}`,
    type: "photo",
    text: `${p.guest_name} uploaded a photo`,
    ts: new Date(p.created_at).getTime(),
    tab: "guest_photos",
    icon: <Camera size={14} className="text-[#E8C97A]" />
  }));
  const views = Number(localStorage.getItem(`wb_viewed_${wedding.id}`) || 0);
  if (views >= 10) items.push({ id: `milestone_v_${Math.floor(views/10)*10}`, type: "milestone", text: `Celebration page hit ${Math.floor(views/10)*10} views`, ts: Date.now(), tab: "overview", icon: <Zap size={14} className="text-[#7A9E7E]" /> });
  return items.sort((a, b) => b.ts - a.ts);
}

export function NotificationCenter({ wedding, rsvps, moments, guestPhotos, open, onClose, onNavigate }: any) {
  const all = buildNotifications(wedding, rsvps, moments, guestPhotos);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_READ_KEY(wedding.id)) || "[]"); } catch { return []; }
  });

  const markAll = () => {
    const ids = all.map(n => n.id);
    setReadIds(ids);
    localStorage.setItem(NOTIF_READ_KEY(wedding.id), JSON.stringify(ids));
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 bottom-4 right-4 z-50 w-[400px] max-w-[92vw] glass-obsidian rounded-[32px] border border-white/[0.15] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-6 py-6 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="wedding-label text-[#D4A853]">Celebration Pulse</div>
            <div className="text-[13px] text-[#A8A29E] mt-0.5">{all.filter(n => !readIds.includes(n.id)).length} unread updates</div>
          </div>
          <button onClick={markAll} className="text-[12px] text-[#D4A853] hover:text-[#E8C97A] font-semibold underline underline-offset-4">Mark all read</button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {all.length === 0 ? (
            <div className="text-center py-24 text-[14px] text-[#78716C]">
              <div className="w-16 h-16 bg-white/[0.04] border border-white/[0.08] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4A853]">
                <Bell size={24} />
              </div>
              All quiet in your command center.
            </div>
          ) : (
            all.slice(0, 30).map(n => {
              const unread = !readIds.includes(n.id);
              return (
                <div
                  key={n.id}
                  className={`rounded-[20px] p-4 border transition-all ${unread ? "bg-white/[0.05] border-[#D4A853]/40 shadow-md" : "bg-white/[0.02] border-white/[0.06]"}`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="text-[13.5px] text-[#FAF7F2] font-semibold leading-snug">{n.text}</div>
                    {unread && <div className="w-2 h-2 rounded-full bg-[#D4A853] mt-1 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-[#A8A29E] font-mono">{formatDistanceToNow(new Date(n.ts), { addSuffix: true })}</div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { if(n.tab) onNavigate(n.tab); onClose(); }}
                      className="flex-1 py-1.5 rounded-full bg-[#D4A853] text-[#0C0A09] text-[11px] font-bold"
                    >Take Action</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/[0.08]">
          <button onClick={onClose} className="w-full fv-btn-ghost !py-2.5 text-[12px]">Close Panel</button>
        </div>
      </motion.div>
    </>
  );
}

export function unreadCount(wedding: any, rsvps: any[], moments: any[], guestPhotos: any[]) {
  const all = buildNotifications(wedding, rsvps, moments, guestPhotos);
  const read: string[] = (() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_READ_KEY(wedding.id)) || "[]"); } catch { return []; }
  })();
  return all.filter(n => !read.includes(n.id)).length;
}

/* ─────────────────────────────────────────────
   WORKSPACE SEARCH
   ───────────────────────────────────────────── */
export function WorkspaceSearch({ wedding, onNavigate }: any) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    const hits: { type: string; label: string; tab: string }[] = [];

    store.where("rsvps", (r: any) => r.wedding_id === wedding.id && (r.guest_name?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term) || r.message?.toLowerCase().includes(term)))
      .slice(0, 5).forEach((r: any) => hits.push({ type: "Guest", label: r.guest_name, tab: "rsvp" }));
    store.where("events", (e: any) => e.wedding_id === wedding.id && e.title?.toLowerCase().includes(term))
      .slice(0, 5).forEach((e: any) => hits.push({ type: "Event", label: e.title, tab: "events" }));
    store.where("guest_moments", (m: any) => m.wedding_id === wedding.id && m.message?.toLowerCase().includes(term))
      .slice(0, 5).forEach((m: any) => hits.push({ type: "Moment", label: `${m.guest_name}: ${m.message.slice(0, 40)}…`, tab: "moments" }));
    store.where("updates", (u: any) => u.wedding_id === wedding.id && (u.title?.toLowerCase().includes(term) || u.message?.toLowerCase().includes(term)))
      .slice(0, 5).forEach((u: any) => hits.push({ type: "Update", label: u.title, tab: "updates" }));
    store.where("accommodations", (a: any) => a.wedding_id === wedding.id && a.name?.toLowerCase().includes(term))
      .slice(0, 5).forEach((a: any) => hits.push({ type: "Hotel", label: a.name, tab: "accommodations" }));
    store.where("venue_markers", (v: any) => v.wedding_id === wedding.id && (v.title?.toLowerCase().includes(term) || v.category?.toLowerCase().includes(term)))
      .slice(0, 5).forEach((v: any) => hits.push({ type: "Map", label: v.title, tab: "map" }));

    return hits;
  }, [q, wedding.id]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#78716C]">
        <SearchIcon size={15} />
      </div>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search command center…"
        className="w-full rounded-full border border-white/[0.1] bg-white/[0.04] pl-11 pr-4 py-2.5 text-[13px] text-[#FAF7F2] outline-none focus:border-[#D4A853] transition-all placeholder:text-[#78716C]"
      />
      {open && q.trim() && (
        <div className="absolute top-full left-0 right-0 mt-3 glass-obsidian rounded-[24px] border border-white/[0.15] shadow-2xl z-50 max-h-[380px] overflow-y-auto p-2">
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-[#A8A29E] font-bold">Search Results</div>
          {results.length === 0 ? (
            <div className="p-6 text-[13px] text-[#78716C] text-center italic">No matches found</div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onMouseDown={() => { onNavigate(r.tab); setQ(""); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.06] rounded-[16px] transition flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-[10px] bg-white/[0.06] flex items-center justify-center text-[#D4A853] group-hover:bg-[#D4A853] group-hover:text-[#0C0A09] transition">
                  <ArrowRight size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#FAF7F2] font-semibold truncate">{r.label}</div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-[#A8A29E]">{r.type}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function WelcomeHeader({ wedding }: { wedding: any }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  return (
    <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08]">
      <div className="wedding-label mb-1">{greet}</div>
      <div className="display text-[26px] text-[#FAF7F2]">{wedding.couple_names}</div>
    </GlassCard>
  );
}
