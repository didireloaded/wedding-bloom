import { useEffect, useState, useRef } from "react";
import type {
  Wedding, RSVP, GalleryItem, GuestPhoto, GuestMoment,
  Accommodation, VenueMarker, WeddingUpdate, Checkin,
  WeddingEvent, TaskItem, TableItem, RunSheetItem,
  BroadcastItem, BudgetItem, VendorItem, MoodItem, GiftItem
} from "@/types/wedding";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import {
  Flower2, Heart, Users, Camera, LogOut, ExternalLink,
  Copy, CheckCircle2, Calendar, MapPin, Edit3, Trash2, Plus,
  MessageCircle, Clock, UserCheck, Gift, Bell, Home, Image as ImageIcon,
  Settings, Sparkles, Radio, Menu, X, DollarSign, Award, Mail, Navigation,
  UploadCloud, Pin, Check, ThumbsUp, ShieldCheck, Eye, Upload
} from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";
import { MediaService } from "@/services";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PromptModal } from "@/components/ui/PromptModal";
import { GlassCard } from "@/components/ui/GlassCard";
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import {
  CountdownWidget, HealthWidget, SummaryGrid, QuickActionsWidget,
  ActivityTimeline, InsightsWidget, NotificationCenter, WorkspaceSearch, unreadCount,
  CommandCenter
} from "@/features/couple/widgets";
import {
  RunSheetModule, FloorPlannerModule, TaskBoardModule, GuestCrmModule, BroadcastHubModule, GuestArrivalsModule, LiveCockpitModule
} from "@/features/couple/executionSuite";
import {
  BudgetVendorModule, MoodBoardModule, ThankYouTrackerModule
} from "@/features/couple/planningSuite";
import { CoupleOnboardingModal } from "@/components/wedding/CoupleOnboardingModal";

export default function CoupleDashboard() {
  const navigate = useNavigate();
  const weddingId = sessionStorage.getItem("couple_wedding_id") || localStorage.getItem("couple_wedding_id");
  const slug = sessionStorage.getItem("couple_wedding_slug") || localStorage.getItem("couple_wedding_slug");

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([]);
  const [moments, setMoments] = useState<GuestMoment[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [markers, setMarkers] = useState<VenueMarker[]>([]);
  const [updates, setUpdates] = useState<WeddingUpdate[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tablesList, setTablesList] = useState<TableItem[]>([]);
  const [runSheet, setRunSheet] = useState<RunSheetItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [moodItems, setMoodItems] = useState<MoodItem[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  type TabId = "workspace" | "overview" | "budget" | "mood_board" | "gifts" | "rsvp" | "crm" | "run_sheet" | "tables" | "tasks" | "broadcasts" | "events" | "map" | "accommodations" | "gallery" | "guest_photos" | "moments" | "updates" | "share" | "checkins" | "arrivals";
  const [tab, setTab] = useState<TabId>("workspace");
  const [editingWedding, setEditingWedding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inCockpitMode, setInCockpitMode] = useState(false);
  const [unread, setUnread] = useState(0);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", location: "", event_date: "", event_time: "" });
  const [showEventForm, setShowEventForm] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCap, setGalleryCap] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [hotelPromptOpen, setHotelPromptOpen] = useState(false);
  const [markerPromptOpen, setMarkerPromptOpen] = useState(false);
  const [markerCoords, setMarkerCoords] = useState<{ x: number; y: number } | null>(null);
  const [deleteMarker, setDeleteMarker] = useState<{ id: string; title: string } | null>(null);
  const [vaultFilter, setVaultFilter] = useState<string>("all");
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [uploadStats, setUploadStats] = useState<string | null>(null);

  useEffect(() => {
    let activeId = weddingId;
    if (!activeId && slug) {
      const found = store.find<Wedding>("weddings", (w) => w.slug === slug);
      if (found) {
        activeId = found.id;
        sessionStorage.setItem("couple_wedding_id", found.id);
        sessionStorage.setItem("couple_wedding_slug", found.slug);
        localStorage.setItem("couple_wedding_id", found.id);
        localStorage.setItem("couple_wedding_slug", found.slug);
      }
    }
    if (!activeId) {
      navigate("/couple-login");
      return;
    }
    store.loadForWedding(activeId).then(() => {
      refresh();
    });
    const off1 = store.subscribe("rsvps", refresh);
    const off2 = store.subscribe("guest_moments", refresh);
    const off3 = store.subscribe("checkins", refresh);
    const off4 = store.subscribe("gallery", refresh);
    const off5 = store.subscribe("events", refresh);
    const off6 = store.subscribe("guest_photos", refresh);
    const off7 = store.subscribe("accommodations", refresh);
    const off8 = store.subscribe("venue_markers", refresh);
    const off9 = store.subscribe("updates", refresh);
    const off10 = store.subscribe("tasks", refresh);
    const off11 = store.subscribe("tables", refresh);
    const off12 = store.subscribe("run_sheet", refresh);
    const off13 = store.subscribe("broadcasts", refresh);
    const off14 = store.subscribe("budgets", refresh);
    const off15 = store.subscribe("vendors", refresh);
    const off16 = store.subscribe("mood_items", refresh);
    const off17 = store.subscribe("gifts", refresh);
    return () => { off1(); off2(); off3(); off4(); off5(); off6(); off7(); off8(); off9(); off10(); off11(); off12(); off13(); off14(); off15(); off16(); off17(); };
  }, [weddingId, slug]);

  useEffect(() => {
    if (wedding?.id) {
      const completed = localStorage.getItem(`fv_onboarding_completed_${wedding.id}`);
      if (!completed) {
        setShowOnboarding(true);
      }
    }
  }, [wedding?.id]);

  const refresh = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      const activeId = sessionStorage.getItem("couple_wedding_id") || localStorage.getItem("couple_wedding_id") || weddingId;
      let w = store.find<Wedding>("weddings", (r) => r.id === activeId);
      if (!w && slug) {
        w = store.find<Wedding>("weddings", (r) => r.slug === slug);
      }
      if (!w) return;
      const targetId = w.id;
      setWedding(w);
      setRsvps(store.where<RSVP>("rsvps", (r) => r.wedding_id === targetId));
      setGallery(store.where<GalleryItem>("gallery", (r) => r.wedding_id === targetId));
      setGuestPhotos(store.where<GuestPhoto>("guest_photos", (r) => r.wedding_id === targetId));
      setMoments(store.where<GuestMoment>("guest_moments", (r) => r.wedding_id === targetId));
      setAccommodations(store.where<Accommodation>("accommodations", (r) => r.wedding_id === targetId));
      setMarkers(store.where<VenueMarker>("venue_markers", (r) => r.wedding_id === targetId));
      setUpdates(store.where<WeddingUpdate>("updates", (r) => r.wedding_id === targetId));
      setCheckins(store.where<Checkin>("checkins", (r) => r.wedding_id === targetId));
      setEvents(store.where<WeddingEvent>("events", (r) => r.wedding_id === targetId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      setTasks(store.where<TaskItem>("tasks", (r) => r.wedding_id === targetId));
      setTablesList(store.where<TableItem>("tables", (r) => r.wedding_id === targetId));
      setRunSheet(store.where<RunSheetItem>("run_sheet", (r) => r.wedding_id === targetId));
      setBroadcasts(store.where<BroadcastItem>("broadcasts", (r) => r.wedding_id === targetId));
      setBudgets(store.where<BudgetItem>("budgets", (r) => r.wedding_id === targetId));
      setVendors(store.where<VendorItem>("vendors", (r) => r.wedding_id === targetId));
      setMoodItems(store.where<MoodItem>("mood_items", (r) => r.wedding_id === targetId));
      setGifts(store.where<GiftItem>("gifts", (r) => r.wedding_id === targetId));

      setUnread(unreadCount(
        w,
        store.where<RSVP>("rsvps", (r) => r.wedding_id === targetId),
        store.where<GuestMoment>("guest_moments", (r) => r.wedding_id === targetId),
        store.where<GuestPhoto>("guest_photos", (r) => r.wedding_id === targetId)
      ));
    }, 10);
  };

  const logout = () => {
    sessionStorage.removeItem("couple_wedding_id");
    sessionStorage.removeItem("couple_wedding_slug");
    sessionStorage.removeItem("couple_access_code");
    localStorage.removeItem("couple_wedding_id");
    localStorage.removeItem("couple_wedding_slug");
    localStorage.removeItem("couple_access_code");
    navigate(slug ? `/couple/${slug}` : "/admin/login");
  };

  const copyLink = () => {
    const url = `${window.location.origin}/wedding/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Guest site URL copied to clipboard");
  };

  const saveWeddingEdits = (patch: Partial<Wedding>) => {
    store.update("weddings", weddingId!, patch);
    toast.success("Wedding configuration updated");
    setEditingWedding(false);
    refresh();
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) { toast.error("Title required"); return; }
    store.insert("events", {
      wedding_id: weddingId,
      title: newEvent.title,
      description: newEvent.description || null,
      location: newEvent.location || null,
      event_date: newEvent.event_date || (wedding?.wedding_date || null),
      event_time: newEvent.event_time || null,
      sort_order: events.length + 1,
    });
    setNewEvent({ title: "", description: "", location: "", event_date: "", event_time: "" });
    setShowEventForm(false);
    toast.success("Timeline event added");
  };

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] text-[#FAF7F2]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#A8A29E] font-mono text-[13px]">Loading Celebration Studio…</div>
        </div>
      </div>
    );
  }

  if (inCockpitMode) {
    return (
      <LiveCockpitModule
        wedding={wedding}
        rsvps={rsvps}
        runSheet={runSheet}
        refresh={refresh}
        onExit={() => setInCockpitMode(false)}
      />
    );
  }

  const confirmed = rsvps.filter(r => r.attending === 'confirmed').length;
  const pending = rsvps.filter(r => r.attending === 'pending').length;
  const totalGuests = rsvps.filter(r => r.attending === 'confirmed').reduce((s, r) => s + (r.guest_count || 0), 0);
  const dietary = rsvps
    .filter(r => r.attending && r.dietary_preference && r.dietary_preference !== "No preference")
    .reduce((acc, r) => {
      if (r.dietary_preference) {
        acc[r.dietary_preference] = (acc[r.dietary_preference] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  const weddingUrl = `${window.location.origin}/wedding/${slug}`;

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] pb-28 md:pb-24">
      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-30 glass-obsidian border-b border-white/[0.1] shadow-2xl">
        <div className="mx-auto max-w-[1520px] px-4 md:px-8 h-[74px] flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-[#FAF7F2]"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853] shrink-0">
              <Flower2 size={18} />
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#D4A853] font-semibold">Couple OS</div>
              <div className="display text-[18px] text-[#FAF7F2] -mt-0.5 truncate">{wedding.couple_names}</div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <WorkspaceSearch wedding={wedding} onNavigate={(t: TabId) => setTab(t)} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setInCockpitMode(true)}
              className="inline-flex items-center gap-1.5 !py-2 !px-3.5 text-[12px] rounded-xl bg-[#7A9E7E]/20 hover:bg-[#7A9E7E] text-[#7A9E7E] hover:text-black border border-[#7A9E7E]/30 transition shadow-sm font-semibold"
              title="Enter Day-Of Coordinator Cockpit Mode"
            >
              <Radio size={14} className="animate-pulse" />
              <span className="hidden sm:inline">Live Cockpit</span>
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 fv-btn-ghost !py-2 !px-3 text-[12px] text-[#E8C97A] border-[#D4A853]/30 hover:bg-[#D4A853]/10 transition"
              title="Concierge Walkthrough Tour"
            >
              <Sparkles size={14} className="text-[#D4A853] animate-pulse" />
              <span className="hidden sm:inline">Walkthrough</span>
            </button>

            <button
              onClick={() => setNotifsOpen(true)}
              className="relative w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center text-[#FAF7F2] transition"
              title="Live Notifications"
            >
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#D4A853] text-[#0C0A09] text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            <Link
              to={`/wedding/${slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 fv-btn-ghost !py-2 !px-4 text-[12px]"
            >
              <ExternalLink size={14} className="text-[#D4A853]" /> Live Site
            </Link>

            <button
              onClick={logout}
              className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-[#C97B7B]/20 text-[#A8A29E] hover:text-[#E4A5A5] flex items-center justify-center transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <WorkspaceSearch wedding={wedding} onNavigate={(t: TabId) => setTab(t)} />
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        wedding={wedding}
        rsvps={rsvps}
        moments={moments}
        guestPhotos={guestPhotos}
        open={notifsOpen}
        onClose={() => { setNotifsOpen(false); refresh(); }}
        onNavigate={(t: TabId) => setTab(t)}
      />

      <div className="mx-auto max-w-[1520px] px-4 md:px-8 pt-8 grid md:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Nav */}
        <aside className={`${sidebarOpen ? "block" : "hidden md:block"} md:sticky md:top-[96px] md:self-start z-10`}>
          <GlassCard variant="obsidian" padding="md" className="border border-white/[0.1] space-y-6">
            {[
              {
                group: "Celebration Studio",
                items: [
                  { id: "workspace", label: "Studio Cockpit", icon: <Home size={16} /> },
                ]
              },
              {
                group: "Treasury & Vision",
                items: [
                  { id: "budget", label: "Budget & Vendor Hub", count: vendors.length, icon: <DollarSign size={16} /> },
                  { id: "mood_board", label: "Vision & Mood Board", count: moodItems.length, icon: <Sparkles size={16} /> },
                  { id: "gifts", label: "Thank-You Tracker", count: gifts.length, icon: <Gift size={16} /> },
                ]
              },
              {
                group: "Execution Logistics",
                items: [
                  { id: "arrivals", label: "Live Guest Arrivals", icon: <Navigation size={16} /> },
                  { id: "run_sheet", label: "Day-of Run Sheet", count: runSheet.length, icon: <Clock size={16} /> },
                  { id: "tables", label: "Seating Floor Plan", count: tablesList.length, icon: <Users size={16} /> },
                  { id: "tasks", label: "Delegation Board", count: tasks.filter(t => t.status !== "done").length, icon: <CheckCircle2 size={16} /> },
                  { id: "map", label: "Interactive Map", count: markers.length, icon: <MapPin size={16} /> },
                  { id: "accommodations", label: "Hotels & Stay", count: accommodations.length, icon: <Sparkles size={16} /> },
                ]
              },
              {
                group: "Guest Intelligence",
                items: [
                  { id: "crm", label: "Guest CRM Database", count: rsvps.length, icon: <Award size={16} /> },
                  { id: "broadcasts", label: "Batch Communications", count: broadcasts.length, icon: <Mail size={16} /> },
                  { id: "rsvp", label: "RSVP Manager", count: rsvps.length, icon: <UserCheck size={16} /> },
                  { id: "checkins", label: "Day-of Check-ins", count: checkins.length, icon: <CheckCircle2 size={16} /> },
                  { id: "moments", label: "Memory Wall", count: moments.length, icon: <MessageCircle size={16} /> },
                ]
              },
              {
                group: "Celebration Plan",
                items: [
                  { id: "overview", label: "Overview & Story", icon: <Heart size={16} /> },
                  { id: "events", label: "Timeline Events", count: events.length, icon: <Calendar size={16} /> },
                  { id: "updates", label: "Wedding Announcements", count: updates.length, icon: <Radio size={16} /> },
                ]
              },
              {
                group: "Media Vault",
                items: [
                  { id: "gallery", label: "Curated Portfolio", count: gallery.length, icon: <ImageIcon size={16} /> },
                  { id: "guest_photos", label: "Guest Photo Vault", count: guestPhotos.length, icon: <Camera size={16} /> },
                ]
              },
              {
                group: "Distribution",
                items: [
                  { id: "share", label: "QR & Share Links", icon: <ExternalLink size={16} /> },
                ]
              },
            ].map(group => (
              <div key={group.group}>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#D4A853] px-3 pb-2 font-bold">{group.group}</div>
                <div className="space-y-1">
                  {group.items.map((it: any) => (
                    <button
                      key={it.id}
                      onClick={() => { setTab(it.id as TabId); setSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[16px] text-[13px] font-medium transition ${
                        tab === it.id
                          ? "bg-[#D4A853] text-[#0C0A09] font-bold shadow-md"
                          : "text-[#A8A29E] hover:bg-white/[0.06] hover:text-[#FAF7F2]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={tab === it.id ? "text-[#0C0A09]" : "text-[#D4A853]"}>{it.icon}</span>
                        <span className="truncate">{it.label}</span>
                      </div>
                      {it.count !== undefined && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${tab === it.id ? "bg-[#0C0A09]/20 text-[#0C0A09]" : "bg-white/[0.06] text-[#A8A29E]"}`}>
                          {it.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => { setEditingWedding(true); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-[13px] font-semibold text-[#A8A29E] hover:bg-white/[0.06] hover:text-[#FAF7F2] transition"
              >
                <Settings size={16} className="text-[#D4A853]" />
                <span>Wedding Settings</span>
              </button>
            </div>
          </GlassCard>
        </aside>

        {/* Main Workspace Area */}
        <main className="min-w-0">
          {tab === "workspace" && (
            <div className="space-y-8">
              <CommandCenter
                wedding={wedding}
                rsvps={rsvps}
                moments={moments}
                guestPhotos={guestPhotos}
                onOpenOnboarding={() => setShowOnboarding(true)}
              />

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <SummaryGrid
                    rsvps={rsvps}
                    moments={moments}
                    guestPhotos={guestPhotos}
                    wedding={wedding}
                    onNavigate={(t: TabId) => setTab(t)}
                  />
                  <QuickActionsWidget
                    wedding={wedding}
                    onNavigate={(t: TabId) => setTab(t)}
                    onCopyLink={copyLink}
                    onOpenOnboarding={() => setShowOnboarding(true)}
                  />
                  <ActivityTimeline
                    rsvps={rsvps} moments={moments} guestPhotos={guestPhotos} updates={updates}
                  />
                </div>
                <div className="space-y-8">
                  <CountdownWidget wedding={wedding} />
                  <HealthWidget wedding={wedding} gallery={gallery} events={events} accommodations={accommodations} />
                  <InsightsWidget wedding={wedding} rsvps={rsvps} guestPhotos={guestPhotos} moments={moments} />
                </div>
              </div>
            </div>
          )}

          {/* Edit Wedding Slide/Modal Card */}
          {editingWedding && (
            <GlassCard variant="obsidian" padding="xl" className="mb-8 border border-[#D4A853]/40 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
                <div>
                  <div className="wedding-label text-[#D4A853]">Package Configuration</div>
                  <h2 className="display text-[28px] text-[#FAF7F2]">Edit Celebration Details</h2>
                </div>
                <button onClick={() => setEditingWedding(false)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"><X size={15}/></button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); saveWeddingEdits(Object.fromEntries(fd)); }} className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block wedding-label mb-2">Couple Names</label>
                  <input name="couple_names" defaultValue={wedding.couple_names} className="fv-input" />
                </div>
                <div>
                  <label className="block wedding-label mb-2">Wedding Date</label>
                  <input name="wedding_date" type="date" defaultValue={wedding.wedding_date || ""} className="fv-input" />
                </div>
                <div>
                  <label className="block wedding-label mb-2">Ceremony Time</label>
                  <input name="ceremony_time" type="time" defaultValue={wedding.ceremony_time || ""} className="fv-input" />
                </div>
                <div>
                  <label className="block wedding-label mb-2">Primary Venue</label>
                  <input name="ceremony_venue" defaultValue={wedding.ceremony_venue || ""} className="fv-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block wedding-label mb-2">Full Address</label>
                  <input name="venue_address" defaultValue={wedding.venue_address || ""} className="fv-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block wedding-label mb-2">Our Story Narrative</label>
                  <textarea name="story" rows={4} defaultValue={wedding.story || ""} className="fv-input resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block wedding-label mb-2">Dress Code</label>
                  <input name="dress_code" defaultValue={wedding.dress_code || ""} className="fv-input" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button type="button" onClick={() => setEditingWedding(false)} className="fv-btn-ghost !py-2.5 !px-5 text-[12px]">Cancel</button>
                  <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-[12px]">Save Configuration</button>
                </div>
              </form>
            </GlassCard>
          )}

          {tab !== "workspace" && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="wedding-label text-[#D4A853]">Module Workspace</div>
                <h2 className="display text-[32px] text-[#FAF7F2] capitalize">
                  {tab === "arrivals" ? "Live Guest & Vendor Arrivals" : tab === "rsvp" ? "Guest RSVPs" : tab === "guest_photos" ? "Guest Vault" : tab === "map" ? "Interactive Venue Map" : tab === "share" ? "QR & Share Portal" : tab.replace("_", " ")}
                </h2>
              </div>
              <button onClick={() => setTab("workspace")} className="fv-btn-ghost !py-2 !px-4 text-[12px]">
                Back to Cockpit
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <UserCheck size={18}/>, label: "Confirmed", value: confirmed, color: "text-[#7A9E7E]" },
                  { icon: <Clock size={18}/>, label: "Pending", value: pending, color: "text-[#D4A853]" },
                  { icon: <Users size={18}/>, label: "Total Guests", value: totalGuests, color: "text-[#FAF7F2]" },
                  { icon: <MessageCircle size={18}/>, label: "Memory Notes", value: moments.length, color: "text-[#A882DD]" },
                ].map(c => (
                  <GlassCard key={c.label} variant="obsidian" padding="lg" className="border border-white/[0.1]">
                    <div className={`w-11 h-11 rounded-[14px] bg-white/[0.06] flex items-center justify-center ${c.color} mb-4`}>{c.icon}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#78716C]">{c.label}</div>
                    <div className="display text-[34px] text-[#FAF7F2] leading-none mt-1">{c.value}</div>
                  </GlassCard>
                ))}
              </div>

              {pending > 0 && (
                <GlassCard variant="aurora" padding="md" className="border border-[#D4A853]/30 flex items-center gap-3">
                  <Clock size={18} className="text-[#D4A853] shrink-0" />
                  <span className="text-[14px] text-[#FAF7F2]">
                    <strong>{pending} guest{pending === 1 ? "" : "s"}</strong> awaiting RSVP verification. Consider sending automated follow-ups.
                  </span>
                </GlassCard>
              )}

              {Object.keys(dietary).length > 0 && (
                <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
                  <div className="wedding-label mb-3">Dietary Requirements</div>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(dietary).map(([label, count]) => (
                      <span key={label} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] text-[#FAF7F2]">
                        <span className="text-[#D4A853] font-mono font-bold">{count as number}</span>{label}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* RSVP Tab */}
          {tab === "rsvp" && (
            <GlassCard variant="obsidian" padding="none" className="border border-white/[0.1] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[11px] uppercase tracking-[0.16em] text-[#78716C]">
                    <tr>
                      <th className="p-4">Guest Identity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Party Size</th>
                      <th className="p-4">Dietary</th>
                      <th className="p-4">Song Request</th>
                      <th className="p-4">Logged At</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {rsvps.map(r => (
                      <tr key={r.id} className="hover:bg-white/[0.03] transition">
                        <td className="p-4">
                          <div className="font-semibold text-[#FAF7F2]">{r.guest_name}</div>
                          {r.email && <div className="text-[11px] font-mono text-[#A8A29E]">{r.email}</div>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${r.attending === 'confirmed' ? "bg-[#7A9E7E]/20 text-[#7A9E7E]" : r.attending === 'declined' ? "bg-[#C97B7B]/20 text-[#C97B7B]" : "bg-[#D4A853]/20 text-[#D4A853]"}`}>
                            {r.attending === 'confirmed' ? "Going" : r.attending === 'declined' ? "Declined" : "Pending"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[#FAF7F2]">{r.guest_count}</td>
                        <td className="p-4 text-[#A8A29E]">{r.dietary_preference || "—"}</td>
                        <td className="p-4 text-[#A8A29E] max-w-[180px] truncate">{r.song_request || "—"}</td>
                        <td className="p-4 text-[12px] font-mono text-[#78716C]">{format(new Date(r.submitted_at), "MMM d")}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => { store.remove("rsvps", r.id); refresh(); toast.success("RSVP removed"); }} className="p-2 rounded-lg text-[#E4A5A5] hover:bg-[#C97B7B]/20">
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rsvps.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-[#78716C]">No RSVPs recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* Timeline Events Tab */}
          {tab === "events" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setShowEventForm(!showEventForm)} className="fv-btn-primary !py-2.5 !px-5 text-[12px]">
                  <Plus size={15}/> Add Timeline Event
                </button>
              </div>

              {showEventForm && (
                <GlassCard variant="obsidian" padding="lg" className="border border-[#D4A853]/40">
                  <form onSubmit={addEvent} className="grid md:grid-cols-2 gap-4">
                    <input required placeholder="Event Title (e.g. Champagne Reception)" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="md:col-span-2 fv-input" />
                    <input placeholder="Location / Room" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="fv-input" />
                    <input type="date" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} className="fv-input" />
                    <input type="time" value={newEvent.event_time} onChange={e => setNewEvent({...newEvent, event_time: e.target.value})} className="fv-input" />
                    <input placeholder="Short Description..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="fv-input" />
                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowEventForm(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
                      <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Save Event</button>
                    </div>
                  </form>
                </GlassCard>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                {events.map(ev => (
                  <GlassCard key={ev.id} variant="obsidian" padding="lg" className="border border-white/[0.1] flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="wedding-label text-[#D4A853]">
                          {ev.event_date && format(new Date(ev.event_date), "EEE • d MMM")}{ev.event_time && ` • ${ev.event_time}`}
                        </div>
                        <button onClick={() => { store.remove("events", ev.id); refresh(); toast.success("Event deleted"); }} className="text-[#E4A5A5] hover:text-[#C97B7B]">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                      <h3 className="display text-[26px] text-[#FAF7F2]">{ev.title}</h3>
                      {ev.location && <div className="text-[13px] text-[#E8C97A] mt-1 flex items-center gap-1.5"><MapPin size={13}/>{ev.location}</div>}
                    </div>
                    {ev.description && <div className="text-[13.5px] text-[#A8A29E] mt-4 pt-3 border-t border-white/[0.06]">{ev.description}</div>}
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {tab === "gallery" && (
            <div className="space-y-6">
              <GlassCard variant="obsidian" padding="md" className="border border-white/[0.1]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <input value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)} placeholder="High-Res Image URL or upload file →" className="flex-1 fv-input" />
                    <input value={galleryCap} onChange={e => setGalleryCap(e.target.value)} placeholder="Caption" className="flex-1 fv-input" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!galleryUrl.trim()) { toast.error("URL required"); return; }
                        store.insert("gallery", { wedding_id: weddingId, url: galleryUrl.trim(), caption: galleryCap.trim() || null });
                        setGalleryUrl(""); setGalleryCap(""); toast.success("Photo added to gallery");
                      }}
                      className="fv-btn-primary !py-3 !px-5 text-[12px] shrink-0"
                    >Add URL</button>
                    <label className="fv-btn-secondary !py-3 !px-4 text-[12px] shrink-0 cursor-pointer flex items-center gap-1.5 border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-white transition">
                      <UploadCloud size={15} className="text-[#D4A853]" />
                      <span>{uploadingMedia ? "Compressing..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingMedia}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingMedia(true);
                          setUploadStats(null);
                          toast.info("Compressing & optimizing image...");
                          const res = await MediaService.uploadAsset(file, "gallery", weddingId || "");
                          setUploadingMedia(false);
                          if (res.error) {
                            toast.error(res.error);
                          } else {
                            store.insert("gallery", { wedding_id: weddingId, url: res.url, caption: file.name.replace(/\.[^/.]+$/, "") });
                            setUploadStats(`Compressed: ${(res.compressedSize / 1024).toFixed(1)} KB (${res.reductionPercentage}% smaller, WebP)`);
                            toast.success(`Uploaded & compressed (${res.reductionPercentage}% smaller)!`);
                            refresh();
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                {uploadStats && (
                  <div className="mt-3 text-[12px] text-[#A8A29E] bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.08] flex items-center gap-2">
                    <Sparkles size={14} className="text-[#D4A853]" />
                    <span>{uploadStats}</span>
                  </div>
                )}
              </GlassCard>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gallery.map(g => (
                  <GlassCard key={g.id} variant="obsidian" padding="none" className="group relative overflow-hidden border border-white/[0.1] aspect-square">
                    <img
                      src={g.url}
                      srcSet={MediaService.generateResponsiveSrcset(g.url)}
                      sizes="(max-width: 640px) 50vw, 25vw"
                      alt={g.caption || ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {g.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-[12px] text-white font-medium">
                        {g.caption}
                      </div>
                    )}
                    <button onClick={() => { store.remove("gallery", g.id); refresh(); toast.success("Photo deleted"); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Trash2 size={13}/>
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Accommodations Tab */}
          {tab === "accommodations" && (
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="wedding-label">Travel & Hospitality</div>
                  <p className="text-[14px] text-[#A8A29E] mt-1">Manage partner hotels and guest stay recommendations.</p>
                </div>
                <button onClick={() => setHotelPromptOpen(true)} className="fv-btn-primary !py-2.5 !px-5 text-[12px]">Add Hotel</button>
              </div>

              <div className="space-y-3">
                {accommodations.map((acc: any) => (
                  <div key={acc.id} className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="text-[16px] text-[#FAF7F2] font-semibold">{acc.name}</div>
                      <div className="text-[12px] text-[#A8A29E] font-mono mt-0.5">{acc.price || "Rates on request"} • {acc.distance || "Near venue"}</div>
                    </div>
                    <button onClick={() => { store.remove("accommodations", acc.id); refresh(); }} className="p-2 text-[#E4A5A5] hover:bg-[#C97B7B]/20 rounded-lg">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
                {accommodations.length === 0 && <div className="text-center py-10 text-[#78716C] text-[13px]">No hotels configured yet.</div>}
              </div>
            </GlassCard>
          )}

          {/* Map Tab */}
          {tab === "map" && (
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
              <div>
                <div className="wedding-label">Interactive Floor & Venue Plan</div>
                <p className="text-[14px] text-[#A8A29E] mt-1">Upload an image and click directly on the canvas to place custom guest markers.</p>
              </div>

              <div>
                <label className="block wedding-label mb-2">Map Blueprint URL</label>
                <input
                  value={wedding.venue_map_url || ""}
                  onChange={e => saveWeddingEdits({ venue_map_url: e.target.value })}
                  placeholder="https://images.pexels.com/..."
                  className="fv-input"
                />
              </div>

              {wedding.venue_map_url ? (
                <div className="relative border border-white/[0.15] rounded-[24px] overflow-hidden bg-white/[0.02]">
                  <img
                    src={wedding.venue_map_url}
                    alt="Venue Blueprint"
                    className="w-full h-auto cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setMarkerCoords({ x, y });
                      setMarkerPromptOpen(true);
                    }}
                  />
                  {markers.map((m: any) => (
                    <div
                      key={m.id}
                      className="absolute w-8 h-8 -ml-4 -mt-4 bg-[#D4A853] text-[#0C0A09] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 transition group"
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteMarker({ id: m.id, title: m.title });
                      }}
                    >
                      <MapPin size={16} />
                      <div className="absolute bottom-10 w-max px-3 py-1.5 bg-[#0C0A09] text-white text-[11px] rounded-lg border border-white/[0.2] opacity-0 group-hover:opacity-100 pointer-events-none z-20 shadow-xl">
                        {m.title} (Click to remove)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-white/[0.03] rounded-[24px] border border-dashed border-white/[0.15] flex items-center justify-center text-[#78716C]">
                  <MapPin size={24} className="mr-2 text-[#D4A853]"/> Supply a valid map URL above to activate interactive tagging
                </div>
              )}
            </GlassCard>
          )}

          {/* Live Updates Tab */}
          {tab === "updates" && (
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
              <div>
                <div className="wedding-label">Live Broadcasts</div>
                <p className="text-[14px] text-[#A8A29E] mt-1">Push instantaneous alerts to all active guest screens.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if(!updateTitle || !updateMsg) return;
                store.insert("updates", { wedding_id: weddingId, title: updateTitle, message: updateMsg });
                refresh(); toast.success("Broadcast published");
                setUpdateTitle(""); setUpdateMsg("");
              }} className="space-y-3 p-5 rounded-[22px] bg-white/[0.03] border border-white/[0.08]">
                <input value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} required placeholder="Alert Headline (e.g. Ceremony starting in 10 mins)" className="fv-input" />
                <textarea value={updateMsg} onChange={e => setUpdateMsg(e.target.value)} required rows={2} placeholder="Broadcast details..." className="fv-input resize-none" />
                <div className="flex justify-end pt-2">
                  <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-[12px]">Broadcast Alert</button>
                </div>
              </form>

              <div className="space-y-3">
                {updates.slice().reverse().map((u: any) => (
                  <div key={u.id} className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06] flex justify-between items-start">
                    <div>
                      <div className="text-[16px] text-[#FAF7F2] font-semibold">{u.title}</div>
                      <div className="text-[13.5px] text-[#A8A29E] mt-1">{u.message}</div>
                      <div className="text-[11px] font-mono text-[#78716C] mt-2">{format(new Date(u.created_at), "HH:mm • d MMM yyyy")}</div>
                    </div>
                    <button onClick={() => { store.remove("updates", u.id); refresh(); }} className="p-2 text-[#E4A5A5] hover:bg-[#C97B7B]/20 rounded-lg">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Guest Photo Vault Tab */}
          {tab === "guest_photos" && (
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="wedding-label flex items-center gap-2">
                    <span>Guest Photo Vault ({guestPhotos.length})</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D4A853]/20 text-[#D4A853] font-normal">Moderation Enabled</span>
                  </div>
                  <p className="text-[13px] text-[#A8A29E] mt-0.5">Review guest moments, pin highlights, or promote favorites directly to your Curated Portfolio.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/[0.08]">
                    {["all", "approved", "pinned", "pending"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setVaultFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition ${
                          vaultFilter === f ? "bg-[#D4A853] text-black" : "text-[#A8A29E] hover:text-white"
                        }`}
                      >
                        {f === "all" ? `All (${guestPhotos.length})` : f}
                      </button>
                    ))}
                  </div>

                  <label className="fv-btn-primary !py-2.5 !px-4 text-[12px] cursor-pointer flex items-center gap-1.5 shrink-0">
                    <UploadCloud size={15} />
                    <span>{uploadingMedia ? "Compressing..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingMedia}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingMedia(true);
                        toast.info("Compressing & optimizing photo...");
                        const res = await MediaService.uploadAsset(file, "guest-vault", weddingId || "", "Couple Admin");
                        setUploadingMedia(false);
                        if (res.error) {
                          toast.error(res.error);
                        } else {
                          toast.success(`Uploaded to Vault (${res.reductionPercentage}% smaller, WebP)!`);
                          refresh();
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {guestPhotos
                  .filter((p) => {
                    if (vaultFilter === "approved") return p.status === "approved" || !p.status;
                    if (vaultFilter === "pinned") return p.status === "pinned";
                    if (vaultFilter === "pending") return p.status === "pending";
                    return p.status !== "rejected";
                  })
                  .slice()
                  .reverse()
                  .map((p: any) => (
                    <div key={p.id} className="relative aspect-square rounded-[18px] overflow-hidden border border-white/[0.1] group shadow-md bg-black/40 flex flex-col justify-end">
                      <img
                        src={p.photo_url}
                        srcSet={MediaService.generateResponsiveSrcset(p.photo_url)}
                        sizes="(max-width: 640px) 50vw, 20vw"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 top-0 p-2.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 border border-white/[0.15] text-white backdrop-blur-md font-medium capitalize">
                          {p.status || "approved"}
                        </span>
                        {p.is_promoted && (
                          <span title="Promoted to Gallery" className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A853] text-black font-semibold flex items-center gap-1 shadow-sm">
                            <Sparkles size={10} /> Promoted
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="text-[11px] text-white font-medium truncate">{p.guest_name}</div>
                        <div className="flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-white/[0.1]">
                          <button
                            title="Promote to Curated Gallery"
                            onClick={async () => {
                              toast.info("Promoting to Curated Portfolio...");
                              const res = await MediaService.promoteToCuratedGallery(weddingId || "", p);
                              if (res.error) toast.error(res.error);
                              else {
                                toast.success("✨ Promoted to Curated Portfolio!");
                                refresh();
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#D4A853]/20 hover:bg-[#D4A853] text-[#D4A853] hover:text-black transition"
                          >
                            <Sparkles size={13} />
                          </button>
                          <button
                            title={p.status === "pinned" ? "Unpin" : "Pin to Top"}
                            onClick={async () => {
                              await MediaService.moderatePhoto(p.id, p.status === "pinned" ? "approve" : "pin");
                              toast.success(p.status === "pinned" ? "Unpinned photo" : "Pinned photo to top");
                              refresh();
                            }}
                            className={`p-1.5 rounded-lg transition ${
                              p.status === "pinned" ? "bg-[#D4A853] text-black" : "bg-white/[0.1] hover:bg-white/[0.2] text-white"
                            }`}
                          >
                            <Pin size={13} />
                          </button>
                          <button
                            title="Reject / Remove Photo"
                            onClick={() => {
                              store.remove("guest_photos", p.id);
                              MediaService.moderatePhoto(p.id, "reject");
                              refresh();
                              toast.success("Photo removed");
                            }}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {guestPhotos.length === 0 && (
                  <div className="col-span-full text-center py-12 text-[13px] text-[#78716C] border border-dashed border-white/[0.15] rounded-[20px]">
                    No guest photos uploaded yet.
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Moments / Memory Wall Tab */}
          {tab === "moments" && (
            <div className="grid md:grid-cols-2 gap-5">
              {moments.slice().reverse().map((m: any) => (
                <GlassCard key={m.id} variant="obsidian" padding="lg" className="border border-white/[0.1] flex flex-col justify-between">
                  <div className="text-[15px] text-[#FAF7F2] leading-relaxed italic">"{m.message}"</div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
                    <div className="text-[13px] text-[#D4A853] font-semibold">— {m.guest_name}</div>
                    <button onClick={() => { store.remove("guest_moments", m.id); refresh(); toast.success("Note removed"); }} className="text-[#E4A5A5] hover:text-[#C97B7B]">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Check-ins Tab */}
          {tab === "checkins" && (
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-4">
              <div className="wedding-label mb-3">Live Venue Check-ins</div>
              <div className="space-y-2">
                {checkins.slice().reverse().map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#7A9E7E]/20 text-[#7A9E7E] flex items-center justify-center"><CheckCircle2 size={16}/></div>
                      <div>
                        <div className="text-[14.5px] text-[#FAF7F2] font-semibold">{c.guest_name}</div>
                        <div className="text-[11px] font-mono text-[#A8A29E]">{format(new Date(c.checkin_time || c.created_at || Date.now()), "HH:mm • d MMM")}</div>
                      </div>
                    </div>
                    <button onClick={() => { store.remove("checkins", c.id); refresh(); }} className="text-[#E4A5A5] hover:bg-[#C97B7B]/20 p-2 rounded-lg">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
                {checkins.length === 0 && <div className="text-[13px] text-[#78716C] text-center py-12">No self check-ins recorded yet.</div>}
              </div>
            </GlassCard>
          )}

          {/* Share / QR Tab */}
          {tab === "share" && (
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-4">
                <div className="wedding-label">Guest Portal URL</div>
                <div className="display text-[26px] text-[#FAF7F2]">Direct Invitation Link</div>
                <div className="flex items-center gap-2 p-3 rounded-[16px] bg-white/[0.04] border border-white/[0.08]">
                  <span className="flex-1 font-mono text-[13px] text-[#E8C97A] truncate">{weddingUrl}</span>
                  <button onClick={copyLink} className="fv-btn-primary !py-2 !px-4 text-[11px]">Copy</button>
                </div>
                <p className="text-[12.5px] text-[#A8A29E]">Distribute via WhatsApp, SMS, or embed in physical wedding cards.</p>
              </GlassCard>

              <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-4 flex flex-col items-center text-center">
                <div className="wedding-label">QR Entry Code</div>
                <div className="display text-[26px] text-[#FAF7F2]">Instant Check-in Code</div>
                <div className="p-6 rounded-[24px] bg-white border border-white/[0.2] shadow-xl">
                  <QRCodeSVG value={weddingUrl} size={180} level="H" fgColor="#0C0A09" />
                </div>
              </GlassCard>
            </div>
          )}

          {/* New Advanced Execution Logistics & Guest Intelligence Modules */}
          {tab === "arrivals" && <GuestArrivalsModule wedding={wedding} rsvps={rsvps} />}
          {tab === "run_sheet" && <RunSheetModule wedding={wedding} runSheet={runSheet} refresh={refresh} />}
          {tab === "tables" && <FloorPlannerModule wedding={wedding} tablesList={tablesList} rsvps={rsvps} refresh={refresh} />}
          {tab === "tasks" && <TaskBoardModule wedding={wedding} tasks={tasks} refresh={refresh} />}
          {tab === "crm" && <GuestCrmModule wedding={wedding} rsvps={rsvps} tablesList={tablesList} refresh={refresh} />}
          {tab === "broadcasts" && <BroadcastHubModule wedding={wedding} broadcasts={broadcasts} rsvps={rsvps} refresh={refresh} />}

          {/* New Interactive Treasury, Vision & Gratitude Modules */}
          {tab === "budget" && <BudgetVendorModule wedding={wedding} budgets={budgets} vendors={vendors} refresh={refresh} />}
          {tab === "mood_board" && <MoodBoardModule wedding={wedding} moodItems={moodItems} refresh={refresh} />}
          {tab === "gifts" && <ThankYouTrackerModule wedding={wedding} gifts={gifts} rsvps={rsvps} refresh={refresh} />}
        </main>
      </div>

      <PromptModal
        open={hotelPromptOpen}
        title="Add Recommended Hotel"
        label="Hotel Name"
        placeholder="e.g. Grand Hotel Villa Serbelloni"
        submitLabel="Save Hotel"
        onCancel={() => setHotelPromptOpen(false)}
        onSubmit={(name) => {
          store.insert("accommodations", { wedding_id: weddingId, name, photo_url: null, price: null, phone: null, distance: null, booking_url: null });
          refresh(); toast.success("Hotel saved");
        }}
      />

      <PromptModal
        open={markerPromptOpen}
        title="Add Map Marker"
        label="Marker Label"
        placeholder="e.g. Cocktail Bar, DJ Stage"
        submitLabel="Place Marker"
        onCancel={() => { setMarkerPromptOpen(false); setMarkerCoords(null); }}
        onSubmit={(title) => {
          if (markerCoords) {
            store.insert("venue_markers", {
              wedding_id: weddingId,
              title,
              category: "General",
              icon: "MapPin",
              description: null,
              x: markerCoords.x,
              y: markerCoords.y
            });
            refresh(); toast.success("Marker placed");
          }
        }}
      />

      <ConfirmModal
        open={!!deleteMarker}
        title="Remove Marker"
        message={`Remove "${deleteMarker?.title}" from the floor plan?`}
        destructive
        confirmLabel="Remove"
        onCancel={() => setDeleteMarker(null)}
        onConfirm={() => {
          if (deleteMarker) {
            store.remove("venue_markers", deleteMarker.id);
            refresh(); toast.success("Marker removed");
          }
        }}
      />
      <MobileBottomNav
        items={[
          { id: "workspace", label: "Home", icon: <Home size={20} />, active: tab === "workspace", onClick: () => { setTab("workspace"); setSidebarOpen(false); } },
          { id: "rsvp", label: "RSVPs", icon: <UserCheck size={20} />, active: tab === "rsvp", badge: rsvps.length, onClick: () => { setTab("rsvp"); setSidebarOpen(false); } },
          { id: "events", label: "Events", icon: <Calendar size={20} />, active: tab === "events", onClick: () => { setTab("events"); setSidebarOpen(false); } },
          { id: "gallery", label: "Gallery", icon: <ImageIcon size={20} />, active: tab === "gallery", onClick: () => { setTab("gallery"); setSidebarOpen(false); } },
          { id: "menu", label: sidebarOpen ? "Close" : "Menu", icon: sidebarOpen ? <X size={20} /> : <Menu size={20} />, onClick: () => setSidebarOpen((v) => !v) },
        ]}
      />
      <CoupleOnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        coupleNames={wedding?.couple_names || ""}
        weddingId={wedding?.id || ""}
        onNavigate={(t) => setTab(t as TabId)}
      />
    </div>
  );
}
