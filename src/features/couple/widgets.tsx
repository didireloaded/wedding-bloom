import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import {
  Heart, Users, MessageCircle, Camera, Eye, QrCode, Sparkles, Bell,
  ArrowRight, TrendingUp, Activity, Calendar, MapPin,
  Send, ExternalLink, Image, BarChart3, Zap
} from "lucide-react";
import { store } from "@/store/weddingStore";

/* ─────────────────────────────────────────────
   GREETING + COUNTDOWN HEADER (THE COMMAND CENTER)
   ───────────────────────────────────────────── */
export function CommandCenter({ wedding, rsvps, moments, guestPhotos }: any) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const days = wedding.wedding_date ? differenceInDays(new Date(wedding.wedding_date + "T16:00:00"), new Date()) : null;

  const confirmed = rsvps.filter((r: any) => r.attending === "confirmed" || r.attending === true).length;
  const pending = rsvps.filter((r: any) => r.attending === "pending" || r.attending === null).length;
  
  const latestAct = buildNotifications(wedding, rsvps, moments, guestPhotos)[0];

  // Journey Recommendation
  const getRecommendation = () => {
    if (!wedding.wedding_date) return "Add your wedding date to start the countdown.";
    if (!wedding.published) return "Your invitation is in Draft. Finish details and Publish.";
    if (days && days > 90) return "Complete your wedding story and upload your hero image.";
    if (days && days > 30) return "Check pending RSVPs and follow up with guests.";
    if (days && days > 7) return "Publish final parking and travel information.";
    if (days && days >= 0) return "Get ready! Switch to Live Wedding Mode today.";
    return "Your wedding was magic. Relive the memories in your Memory Book.";
  };

  return (
    <div className="bg-[#2b2723] rounded-[28px] border border-[#392f29] p-7 md:p-9 text-[#f9f2e8] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#b0743c]/20 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-2 h-2 rounded-full animate-pulse ${wedding.published ? "bg-[#4f7a56]" : "bg-[#b0743c]"}`} />
            <div className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/60">
              Wedding Status: <span className="text-white">{wedding.legacy_mode ? "Legacy (Keepsake)" : wedding.published ? "Published" : "Draft"}</span>
            </div>
          </div>
          
          <div className="text-[12px] uppercase tracking-[0.1em] text-[#c9a87a] mb-2">{greet},</div>
          <h1 className="display text-[38px] md:text-[50px] leading-[0.9] text-white mb-4">{wedding.couple_names}</h1>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-[18px] px-5 py-4 min-w-[120px]">
              <div className="display text-[26px] text-[#c9a87a]">{days !== null ? Math.abs(days) : "—"}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/50">{days !== null && days >= 0 ? "Days Remaining" : "Days Married"}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[18px] px-5 py-4 min-w-[120px]">
              <div className="display text-[26px] text-white">{confirmed}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/50">Guests Confirmed</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[18px] px-5 py-4 min-w-[120px]">
              <div className="display text-[26px] text-white/70">{pending}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/50">Pending RSVPs</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#b0743c] rounded-[22px] p-5 text-white shadow-lg">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 mb-2 flex items-center gap-2">
              <Sparkles size={12} /> Journey Guide
            </div>
            <div className="text-[15px] font-medium leading-relaxed">{getRecommendation()}</div>
            <button className="mt-3 text-[12px] flex items-center gap-1.5 font-bold hover:gap-2 transition-all">
              Complete Task <ArrowRight size={14} />
            </button>
          </div>

          {latestAct && (
            <div className="bg-white/5 border border-white/10 rounded-[22px] p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Live Activity</div>
              <div className="text-[13.5px] text-white/90 truncate">{latestAct.text}</div>
              <div className="text-[11px] text-[#c9a87a] mt-1">{formatDistanceToNow(new Date(latestAct.ts), { addSuffix: true })}</div>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6 shadow-sm">
      <div className="wedding-label mb-4">Countdown</div>
      <div className="grid grid-cols-4 gap-3">
        {[["Days", days], ["Hrs", hours], ["Min", minutes], ["Sec", seconds]].map(([l, v]) => (
          <div key={l as string} className="bg-[#fcf7f1] border border-[#eadfd1] rounded-[16px] py-4 text-center">
            <div className="display text-[28px] md:text-[34px] leading-none text-[#2c2520]">{String(v).padStart(2, "0")}</div>
            <div className="text-[10.5px] uppercase tracking-[0.22em] text-[#a98a6b] mt-1.5">{l}</div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="wedding-label">Wedding Progress</div>
          <div className="display text-[24px] text-[#2a231d] mt-1">{overall}% Complete</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${overall > 80 ? "bg-[#eff6ee] text-[#4f7a56]" : "bg-[#fdf3e4] text-[#b0743c]"}`}>
          {overall > 80 ? "Ready" : "In Progress"}
        </div>
      </div>
      
      <div className="space-y-4">
        {categories.map(c => (
          <div key={c.name}>
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-[#5a4f45]">{c.name}</span>
              <span className="font-bold text-[#b0743c]">{Math.round(c.score * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#f5efe7] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${c.score * 100}%` }}
                className="h-full bg-[#c9a87a]" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUMMARY STATS GRID
   ───────────────────────────────────────────── */
export function SummaryGrid({ rsvps, moments, guestPhotos, wedding, onNavigate }: any) {
  const confirmed = rsvps.filter((r: any) => r.attending === "confirmed" || r.attending === true).length;
  const pending = rsvps.filter((r: any) => r.attending === "pending" || r.attending === null).length;
  const declined = rsvps.filter((r: any) => r.attending === "declined" || r.attending === false).length;
  const views = Number(localStorage.getItem(`wb_viewed_${wedding.id}`) || 0);
  const qrScans = Number(localStorage.getItem(`wb_qr_${wedding.id}`) || 0);

  const cards = [
    { icon: <Users size={16} />, label: "Confirmed", value: confirmed, tab: "rsvp", color: "#4f7a56", bg: "#eff6ee", sub: `Expecting ~${rsvps.length}` },
    { icon: <Heart size={16} />, label: "Pending", value: pending, tab: "rsvp", color: "#b0743c", bg: "#fdf3e4", sub: `${Math.round((pending/rsvps.length)||0)}% remaining` },
    { icon: <Activity size={16} />, label: "Declined", value: declined, tab: "rsvp", color: "#a64838", bg: "#fde9e6", sub: "Guest list updated" },
    { icon: <MessageCircle size={16} />, label: "Messages", value: moments.length, tab: "moments", color: "#7a5a8f", bg: "#f3edf6", sub: "In Guestbook" },
    { icon: <Image size={16} />, label: "Guest Photos", value: guestPhotos.length, tab: "guest_photos", color: "#b7794a", bg: "#f8eee0", sub: "New uploads" },
    { icon: <Eye size={16} />, label: "Page Views", value: views, tab: "overview", color: "#5f7b85", bg: "#eaf1f4", sub: "Live traffic" },
    { icon: <QrCode size={16} />, label: "QR Scans", value: qrScans, tab: "share", color: "#2b2723", bg: "#f0e9e0", sub: "Invitations opened" },
    { icon: <Sparkles size={16} />, label: "Exp. Score", value: "94%", tab: "overview", color: "#b7794a", bg: "#fdf9f4", sub: "Guest sentiment" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <button
          key={c.label}
          onClick={() => onNavigate?.(c.tab)}
          className="text-left bg-white rounded-[24px] border border-[#e6d4be] p-5 hover:border-[#d3a76b] hover:shadow-md transition-all group"
        >
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
            style={{ backgroundColor: c.bg, color: c.color }}
          >
            {c.icon}
          </div>
          <div className="display text-[28px] text-[#2a231d] leading-none">{c.value}</div>
          <div className="text-[11px] tracking-[0.16em] uppercase text-[#8d7962] mt-2 font-bold">{c.label}</div>
          <div className="text-[11px] text-[#a98a6b] mt-1">{c.sub}</div>
        </button>
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
    { icon: <Send size={15} />, label: "Share Wedding", onClick: onCopyLink },
    { icon: <ExternalLink size={15} />, label: "Preview Site", onClick: () => window.open(`/wedding/${slug}`, "_blank") },
    { icon: <QrCode size={15} />, label: "QR Code", onClick: () => onNavigate("share") },
    { icon: <Calendar size={15} />, label: "Add Event", onClick: () => onNavigate("events") },
    { icon: <Image size={15} />, label: "Official Gallery", onClick: () => onNavigate("gallery") },
    { icon: <MessageCircle size={15} />, label: "New Update", onClick: () => onNavigate("updates") },
    { icon: <MapPin size={15} />, label: "Venue Map", onClick: () => onNavigate("map") },
    { icon: <Heart size={15} />, label: "Hotels", onClick: () => onNavigate("accommodations") },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6 shadow-sm">
      <div className="wedding-label mb-4">Command Center Actions</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-2.5 px-4 py-4 rounded-[18px] border border-[#e6d4be] bg-[#fcf7f1] hover:bg-[#f8eee0] hover:border-[#d3a76b] transition text-[13.5px] text-[#5a4735] text-left font-medium"
          >
            <span className="text-[#b0743c] bg-white w-8 h-8 rounded-full flex items-center justify-center border border-[#e6d4be]">{a.icon}</span>
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
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
        icon: <Heart size={13} className="text-[#b7794a]" />,
        text: `${r.guest_name} ${r.attending === "confirmed" || r.attending === true ? "confirmed attendance" : r.attending === "declined" || r.attending === false ? "declined" : "submitted an RSVP"}`,
        sub: r.guest_count > 1 ? `${r.guest_count} guests` : "",
      });
    });
    moments.forEach((m: any) => list.push({
      ts: new Date(m.created_at).getTime(),
      icon: <MessageCircle size={13} className="text-[#7a5a8f]" />,
      text: `${m.guest_name} shared a moment`,
      sub: `"${m.message.slice(0, 60)}${m.message.length > 60 ? "…" : ""}"`,
    }));
    guestPhotos.forEach((p: any) => list.push({
      ts: new Date(p.created_at).getTime(),
      icon: <Camera size={13} className="text-[#b7794a]" />,
      text: `${p.guest_name} uploaded a photo`,
      sub: "",
    }));
    updates.forEach((u: any) => list.push({
      ts: new Date(u.created_at).getTime(),
      icon: <Bell size={13} className="text-[#4f7a56]" />,
      text: `Announcement: ${u.title}`,
      sub: u.message.slice(0, 60),
    }));
    return list.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [rsvps, moments, guestPhotos, updates]);

  return (
    <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="wedding-label">Activity Feed</div>
      </div>
      {items.length === 0 ? (
        <div className="text-[13.5px] text-[#8d7962] text-center py-6">Nothing happening yet. Share your wedding link to get started.</div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#f5efe7] space-y-6">
          {items.map((it, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-white border border-[#e6d4be] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {it.icon}
              </div>
              <div className="text-[14px] text-[#2a231d] font-medium">{it.text}</div>
              {it.sub && <div className="text-[12.5px] text-[#8d7962] mt-1 italic">{it.sub}</div>}
              <div className="text-[11px] text-[#a98a6b] mt-1 font-medium">{formatDistanceToNow(new Date(it.ts), { addSuffix: true })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   WEDDING INSIGHTS
   ───────────────────────────────────────────── */
export function InsightsWidget({ wedding, rsvps, guestPhotos, moments }: any) {
  const totalInvited = rsvps.length;
  const responded = rsvps.filter((r: any) => r.attending === "confirmed" || r.attending === "declined" || r.attending === true || r.attending === false).length;
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
    { label: "RSVP Completion", value: `${responseRate}%`, icon: <TrendingUp size={14} /> },
    { label: "Traffic Volume", value: views, icon: <Eye size={14} /> },
    { label: "Photos Today", value: photosToday, icon: <Camera size={14} /> },
    { label: "Guest Satisfaction", value: `${engagement}%`, icon: <BarChart3 size={14} /> },
    { label: "MVP Guest", value: mostActive ? mostActive[0] : "—", icon: <Users size={14} /> },
    { label: "Latest RSVP", value: latestRsvp ? latestRsvp.guest_name : "—", icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6 shadow-sm">
      <div className="wedding-label mb-4">Analytics & Insights</div>
      <div className="grid grid-cols-2 gap-4">
        {insights.map(i => (
          <div key={i.label} className="rounded-[18px] border border-[#eadfd1] bg-[#fcf7f1] p-4 group hover:bg-white transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#a98a6b] mb-2 font-bold">
              <span className="text-[#b0743c] group-hover:scale-110 transition-transform">{i.icon}</span>{i.label}
            </div>
            <div className="display text-[22px] text-[#2a231d] truncate leading-none">{i.value}</div>
          </div>
        ))}
      </div>
    </div>
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
    text: `${r.guest_name} ${r.attending === "confirmed" || r.attending === true ? "confirmed attendance" : r.attending === "declined" || r.attending === false ? "declined" : "sent an RSVP"}`,
    ts: new Date(r.submitted_at).getTime(),
    tab: "rsvp",
    icon: <Heart size={14} className="text-[#b0743c]" />
  }));
  moments.forEach((m: any) => items.push({
    id: `mom_${m.id}`,
    type: "moment",
    text: `${m.guest_name} shared a moment`,
    ts: new Date(m.created_at).getTime(),
    tab: "moments",
    icon: <MessageCircle size={14} className="text-[#7a5a8f]" />
  }));
  guestPhotos.forEach((p: any) => items.push({
    id: `photo_${p.id}`,
    type: "photo",
    text: `${p.guest_name} uploaded a photo`,
    ts: new Date(p.created_at).getTime(),
    tab: "guest_photos",
    icon: <Camera size={14} className="text-[#b7794a]" />
  }));
  const views = Number(localStorage.getItem(`wb_viewed_${wedding.id}`) || 0);
  if (views >= 10) items.push({ id: `milestone_v_${Math.floor(views/10)*10}`, type: "milestone", text: `Wedding page hit ${Math.floor(views/10)*10} views`, ts: Date.now(), tab: "overview", icon: <Zap size={14} className="text-[#4f7a56]" /> });
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 bottom-4 right-4 z-50 w-[380px] max-w-[92vw] bg-white rounded-[32px] border border-[#e6d4be] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-6 py-6 border-b border-[#e6d4be] flex items-center justify-between bg-[#fdf9f4]">
          <div>
            <div className="wedding-label">Wedding Pulse</div>
            <div className="text-[13px] text-[#8d7962] mt-1 font-medium">{all.filter(n => !readIds.includes(n.id)).length} new notifications</div>
          </div>
          <button onClick={markAll} className="text-[12px] text-[#b0743c] hover:text-[#8e5c2e] font-bold underline underline-offset-4">Clear All</button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {all.length === 0 ? (
            <div className="text-center py-20 text-[14px] text-[#8d7962]">
              <div className="w-16 h-16 bg-[#f5efe7] rounded-full flex items-center justify-center mx-auto mb-4 text-[#c9a87a]">
                <Bell size={24} />
              </div>
              Your wedding is quiet for now.
            </div>
          ) : (
            all.slice(0, 30).map(n => {
              const unread = !readIds.includes(n.id);
              return (
                <div key={n.id} className={`mx-2 my-2 rounded-[20px] px-5 py-4 border transition-all ${unread ? "bg-[#fdf9f4] border-[#d3a76b] shadow-sm" : "bg-white border-[#f0e4d4]"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[14px] text-[#2a231d] font-bold leading-snug">{n.text}</div>
                    {unread && <div className="w-2 h-2 rounded-full bg-[#b0743c] mt-1 flex-shrink-0" />}
                  </div>
                  <div className="text-[11.5px] text-[#a98a6b] font-medium">{formatDistanceToNow(new Date(n.ts), { addSuffix: true })}</div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => { if(n.tab) onNavigate(n.tab); onClose(); }}
                      className="flex-1 py-2 rounded-full bg-[#2b2723] text-white text-[12px] font-bold hover:bg-black transition"
                    >Take Action</button>
                    <button className="px-4 py-2 rounded-full border border-[#e6d4be] text-[#5a4735] text-[12px] hover:bg-[#fbf3e8] transition"><MessageCircle size={14}/></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="p-4 bg-[#fdf9f4] border-t border-[#e6d4be]">
           <button onClick={onClose} className="w-full py-3 rounded-full border border-[#e6d4be] bg-white text-[#2a231d] text-[13px] font-bold">Close Panel</button>
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
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#a98a6b]">
        <Search size={15} />
      </div>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search command center…"
        className="w-full rounded-[20px] border border-[#e6d4be] bg-[#fdf9f4] pl-11 pr-4 py-3 text-[14px] outline-none focus:border-[#d3a76b] focus:bg-white focus:ring-4 focus:ring-[#b0743c]/5 transition-all placeholder:text-[#a98a6b]"
      />
      {open && q.trim() && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[24px] border border-[#e6d4be] shadow-2xl z-50 max-h-[400px] overflow-y-auto p-2">
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-[#a98a6b] font-bold">Search Results</div>
          {results.length === 0 ? (
            <div className="p-6 text-[14px] text-[#8d7962] text-center italic">No matches found</div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onMouseDown={() => { onNavigate(r.tab); setQ(""); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-[#fdf9f4] rounded-[16px] transition-colors mb-1 last:mb-0 flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[#f5efe7] flex items-center justify-center text-[#b0743c] group-hover:bg-[#b0743c] group-hover:text-white transition-colors">
                   <ArrowRight size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] text-[#2a231d] font-bold truncate">{r.label}</div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-[#a98a6b] font-medium">{r.type}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Search({ size, className }: { size?: number; className?: string }) {
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
  // Kept for backward compatibility or alternate use
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  return (
    <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
      <div className="wedding-label mb-1">{greet}</div>
      <div className="display text-[28px] text-[#2a231d]">{wedding.couple_names}</div>
    </div>
  );
}
