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
import { supabase } from "@/utils/supabase";
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
import { CoupleWorkspaceShell, type TabId } from "@/components/nav/CoupleWorkspaceShell";
import {
  WeddingHomeView,
  PlanningDashboardView,
  VendorManagerView,
  SeatingAndTablesView,
  TimelineEventsView,
  AnnouncementsView,
  QRAndSharePortalView,
  VisionMoodBoardView,
  ThankYouTrackerView,
  RunSheetView,
  DelegationBoardView,
  LiveArrivalsRadarView,
  InteractiveMapView,
  AccommodationsView,
  RSVPManagerView,
  GuestCrmView,
  BatchCommunicationsView,
  DayOfCheckinsView,
  CuratedPortfolioView,
  GuestPhotoVaultView,
  MemoryWallView
} from "@/features/couple/views";


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
    let cancelled = false;
    async function initWedding() {
      let activeId = weddingId;
      if (!activeId && slug) {
        let found = store.find<Wedding>("weddings", (w) => w.slug === slug);
        if (!found) {
          const { data } = await supabase.from("weddings").select("*").eq("slug", slug).maybeSingle();
          if (data) {
            found = data as Wedding;
            store.insert("weddings", found);
          }
        }
        if (found) {
          activeId = found.id;
          sessionStorage.setItem("couple_wedding_id", found.id);
          sessionStorage.setItem("couple_wedding_slug", found.slug);
          localStorage.setItem("couple_wedding_id", found.id);
          localStorage.setItem("couple_wedding_slug", found.slug);
        }
      }
      if (!activeId) {
        if (!cancelled) navigate("/couple-login");
        return;
      }
      await store.loadForWedding(activeId);
      if (!cancelled) refresh();
    }
    initWedding();
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
    return () => { cancelled = true; off1(); off2(); off3(); off4(); off5(); off6(); off7(); off8(); off9(); off10(); off11(); off12(); off13(); off14(); off15(); off16(); off17(); };
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

      {/* Modern 5-Suite Workspace Shell */}
      <CoupleWorkspaceShell
        wedding={wedding}
        activeTab={tab}
        onSelectTab={(t: TabId) => setTab(t)}
        onOpenSettings={() => setEditingWedding(true)}
        onOpenCockpit={() => setInCockpitMode(true)}
        onOpenWalkthrough={() => setShowOnboarding(true)}
        onOpenNotifications={() => setNotifsOpen(true)}
        onLogout={logout}
        unreadCount={unread}
        counts={{
          vendors: vendors.length,
          moodItems: moodItems.length,
          gifts: gifts.length,
          runSheet: runSheet.length,
          tables: tablesList.length,
          tasks: tasks.filter(t => t.status !== "done").length,
          markers: markers.length,
          accommodations: accommodations.length,
          crm: rsvps.length,
          broadcasts: broadcasts.length,
          rsvps: rsvps.length,
          checkins: checkins.length,
          moments: moments.length,
          events: events.length,
          updates: updates.length,
          gallery: gallery.length,
          guestPhotos: guestPhotos.length,
        }}
        searchComponent={<WorkspaceSearch wedding={wedding} onNavigate={(t: TabId) => setTab(t)} />}
      >
        <div className="space-y-8 min-w-0">
          {tab === "workspace" && (
            <WeddingHomeView
              wedding={wedding}
              rsvps={rsvps}
              moments={moments}
              guestPhotos={guestPhotos}
              gallery={gallery}
              events={events}
              accommodations={accommodations}
              updates={updates}
              tasks={tasks}
              onNavigate={(t: TabId) => setTab(t)}
              onOpenOnboarding={() => setShowOnboarding(true)}
              onCopyLink={copyLink}
            />
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
            <div className="mb-4 flex items-center justify-between bg-white/[0.02] border border-white/[0.08] p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-ivory/70">
                <span className="text-primary-container">⚡ Suite Mode</span>
                <span>•</span>
                <span className="capitalize text-ivory font-bold">{tab === "guest_photos" ? "Guest Photo Vault" : tab.replace("_", " ")}</span>
              </div>
              <button onClick={() => setTab("workspace")} className="fv-btn-ghost !py-1.5 !px-3.5 text-xs">
                ← Back to Cockpit
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {tab === "overview" && (
            <PlanningDashboardView
              wedding={wedding}
              tasks={tasks}
              vendors={vendors}
              budgets={budgets}
              rsvps={rsvps}
              onNavigate={(t: TabId) => setTab(t)}
            />
          )}

          {/* RSVP Tab */}
          {tab === "rsvp" && (
            <RSVPManagerView
              wedding={wedding}
              rsvps={rsvps}
              onRemoveRSVP={(id) => {
                store.remove("rsvps", id);
                refresh(); toast.success("RSVP entry removed");
              }}
            />
          )}

          {/* Timeline Events Tab */}
          {tab === "events" && (
            <TimelineEventsView
              wedding={wedding}
              events={events}
              onAddEvent={(data) => {
                store.insert("events", { wedding_id: weddingId, ...data });
                refresh(); toast.success("Event added");
              }}
              onRemoveEvent={(id) => {
                store.remove("events", id);
                refresh(); toast.success("Event deleted");
              }}
            />
          )}

          {/* Gallery Tab */}
          {tab === "gallery" && (
            <CuratedPortfolioView
              wedding={wedding}
              gallery={gallery}
              onAddGalleryItem={(data) => {
                store.insert("gallery", { wedding_id: weddingId, ...data });
                refresh(); toast.success("Photo added to portfolio");
              }}
              onRemoveGalleryItem={(id) => {
                store.remove("gallery", id);
                refresh(); toast.success("Photo removed from portfolio");
              }}
            />
          )}

          {/* Accommodations Tab */}
          {tab === "accommodations" && (
            <AccommodationsView
              wedding={wedding}
              accommodations={accommodations}
              onAddAccommodation={(data) => {
                store.insert("accommodations", { wedding_id: weddingId, ...data });
                refresh(); toast.success("Hotel option added");
              }}
              onRemoveAccommodation={(id) => {
                store.remove("accommodations", id);
                refresh(); toast.success("Hotel option removed");
              }}
            />
          )}

          {/* Map Tab */}
          {tab === "map" && (
            <InteractiveMapView
              wedding={wedding}
              markers={markers}
              onAddMarker={(data) => {
                store.insert("venue_markers", { wedding_id: weddingId, ...data });
                refresh(); toast.success("Pin added to estate blueprint");
              }}
              onRemoveMarker={(id) => {
                store.remove("venue_markers", id);
                refresh(); toast.success("Pin removed");
              }}
            />
          )}

          {/* Live Updates Tab */}
          {tab === "updates" && (
            <AnnouncementsView
              wedding={wedding}
              updates={updates}
              onAddUpdate={(data: any) => {
                store.insert("updates", { wedding_id: weddingId, ...data });
                refresh(); toast.success("Announcement published");
              }}
              onRemoveUpdate={(id: any) => {
                store.remove("updates", id);
                refresh(); toast.success("Announcement deleted");
              }}
            />
          )}

          {/* Guest Photo Vault Tab */}
          {tab === "guest_photos" && (
            <GuestPhotoVaultView
              wedding={wedding}
              guestPhotos={guestPhotos}
              onModeratePhoto={async (id, action) => {
                if (action === "promote") {
                  const p = guestPhotos.find(gp => gp.id === id);
                  if (p) {
                    await MediaService.promoteToCuratedGallery(weddingId || "", p);
                    toast.success("✨ Promoted to Curated Portfolio!");
                  }
                } else {
                  await MediaService.moderatePhoto(id, action === "approve" ? "approve" : "reject");
                  toast.success(action === "approve" ? "Approved photo" : "Rejected photo");
                }
                refresh();
              }}
              onRemovePhoto={(id) => {
                store.remove("guest_photos", id);
                MediaService.moderatePhoto(id, "reject");
                refresh(); toast.success("Photo deleted");
              }}
            />
          )}

          {/* Moments / Memory Wall Tab */}
          {tab === "moments" && (
            <MemoryWallView
              wedding={wedding}
              moments={moments}
              onModerateMoment={(id, isApproved) => {
                store.update("guest_moments", id, { is_approved: isApproved });
                refresh(); toast.success(isApproved ? "Approved for memory wall" : "Unpublished from wall");
              }}
              onRemoveMoment={(id) => {
                store.remove("guest_moments", id);
                refresh(); toast.success("Entry deleted");
              }}
            />
          )}

          {/* Check-ins Tab */}
          {tab === "checkins" && (
            <DayOfCheckinsView
              wedding={wedding}
              checkins={checkins}
              onRemoveCheckin={(id) => {
                store.remove("checkins", id);
                refresh(); toast.success("Check-in record cleared");
              }}
            />
          )}

          {/* Share / QR Tab */}
          {tab === "share" && (
            <QRAndSharePortalView
              wedding={wedding}
              guestLinkUrl={weddingUrl}
              onCopyLink={copyLink}
            />
          )}

          {/* Arrivals Tab */}
          {tab === "arrivals" && (
            <div className="space-y-12">
              <LiveArrivalsRadarView
                wedding={wedding}
                checkins={checkins}
                onRemoveCheckin={(id) => {
                  store.remove("checkins", id);
                  refresh(); toast.success("Arrival entry cleared");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <GuestArrivalsModule wedding={wedding} rsvps={rsvps} />
              </div>
            </div>
          )}

          {/* Run Sheet Tab */}
          {tab === "run_sheet" && (
            <div className="space-y-12">
              <RunSheetView
                wedding={wedding}
                runSheetItems={runSheet}
                onAddRunSheetItem={(data) => {
                  store.insert("run_sheet", { wedding_id: weddingId, ...data });
                  refresh(); toast.success("Choreography step added");
                }}
                onRemoveRunSheetItem={(id) => {
                  store.remove("run_sheet", id);
                  refresh(); toast.success("Step removed");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <RunSheetModule wedding={wedding} runSheet={runSheet} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Seating and Tables Tab */}
          {tab === "tables" && (
            <div className="space-y-12">
              <SeatingAndTablesView
                wedding={wedding}
                tablesList={tablesList}
                rsvps={rsvps}
                onRefresh={refresh}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <FloorPlannerModule wedding={wedding} tablesList={tablesList} rsvps={rsvps} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {tab === "tasks" && (
            <div className="space-y-12">
              <DelegationBoardView
                wedding={wedding}
                tasks={tasks}
                onAddTask={(data) => {
                  store.insert("tasks", { wedding_id: weddingId, ...data });
                  refresh(); toast.success("Task created");
                }}
                onUpdateTaskStatus={(id, status) => {
                  store.update("tasks", id, { status });
                  refresh(); toast.success("Task updated");
                }}
                onRemoveTask={(id) => {
                  store.remove("tasks", id);
                  refresh(); toast.success("Task removed");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <TaskBoardModule wedding={wedding} tasks={tasks} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Guest CRM Tab */}
          {tab === "crm" && (
            <div className="space-y-12">
              <GuestCrmView
                wedding={wedding}
                rsvps={rsvps}
                onAddGuest={(data) => {
                  store.insert("rsvps", { wedding_id: weddingId, ...data });
                  refresh(); toast.success("Guest record added to CRM");
                }}
                onRemoveGuest={(id) => {
                  store.remove("rsvps", id);
                  refresh(); toast.success("Guest record removed");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <GuestCrmModule wedding={wedding} rsvps={rsvps} tablesList={tablesList} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Broadcasts Tab */}
          {tab === "broadcasts" && (
            <div className="space-y-12">
              <BatchCommunicationsView
                wedding={wedding}
                broadcasts={broadcasts}
                onAddBroadcast={(data) => {
                  store.insert("broadcasts", { wedding_id: weddingId, ...data });
                  refresh(); toast.success("Campaign dispatched");
                }}
                onRemoveBroadcast={(id) => {
                  store.remove("broadcasts", id);
                  refresh(); toast.success("Dispatch log cleared");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <BroadcastHubModule wedding={wedding} broadcasts={broadcasts} rsvps={rsvps} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {tab === "budget" && (
            <div className="space-y-12">
              <VendorManagerView
                wedding={wedding}
                vendors={vendors}
                budgets={budgets}
                onRefresh={refresh}
                onNavigate={(t: TabId) => setTab(t)}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <BudgetVendorModule wedding={wedding} budgets={budgets} vendors={vendors} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Mood Board Tab */}
          {tab === "mood_board" && (
            <div className="space-y-12">
              <VisionMoodBoardView
                wedding={wedding}
                moodItems={moodItems}
                onAddMoodItem={(data: any) => {
                  store.insert("mood_items", { wedding_id: weddingId, ...data });
                  refresh(); toast.success("Item added to mood board");
                }}
                onRemoveMoodItem={(id: any) => {
                  store.remove("mood_items", id);
                  refresh(); toast.success("Item removed");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <MoodBoardModule wedding={wedding} moodItems={moodItems} refresh={refresh} />
              </div>
            </div>
          )}

          {/* Gifts Tab */}
          {tab === "gifts" && (
            <div className="space-y-12">
              <ThankYouTrackerView
                wedding={wedding}
                gifts={gifts}
                onAddGift={(data: any) => {
                  store.insert("gifts", { wedding_id: weddingId, ...data });
                  refresh(); toast.success("Gift logged");
                }}
                onUpdateGiftStatus={(id: any, status: any) => {
                  store.update("gifts", id, { status });
                  refresh(); toast.success("Thank-you status updated");
                }}
                onRemoveGift={(id: any) => {
                  store.remove("gifts", id);
                  refresh(); toast.success("Gift removed");
                }}
              />
              <div className="pt-8 border-t border-white/[0.1]">
                <ThankYouTrackerModule wedding={wedding} gifts={gifts} rsvps={rsvps} refresh={refresh} />
              </div>
            </div>
          )}
        </div>
      </CoupleWorkspaceShell>

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
