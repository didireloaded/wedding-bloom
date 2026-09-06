import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CalendarDays, Check, Clock, Copy, ExternalLink, Globe2, Heart, Image, Loader2, MapPin, MessageCircle, Pencil, Plus, Send, ShieldCheck, Sparkles, Trash2, User, Users, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { Download } from 'lucide-react';

// Dashboard Components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CoupleOverview from "@/components/dashboard/CoupleOverview";
import CoupleProfile from "@/components/dashboard/CoupleProfile";
import CouplePageHeading from "@/components/dashboard/CouplePageHeading";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PhotoManager from "@/components/dashboard/PhotoManager";
import GuestMessages from "@/components/dashboard/GuestMessages";
import WeddingTools from "@/components/dashboard/WeddingTools";
import DailyReport from "@/components/dashboard/DailyReport";
import CoupleUpdates from "@/components/dashboard/CoupleUpdates";
import MomentsManager from "@/components/dashboard/MomentsManager";
import ShareWeddingLink from "@/components/dashboard/ShareWeddingLink";
import DashboardWalkthrough from "@/components/dashboard/DashboardWalkthrough";
import SetupProgress from "@/components/dashboard/SetupProgress";
import EditWeddingDetails from "@/components/dashboard/EditWeddingDetails";
import NotificationPreferences from "@/components/dashboard/NotificationPreferences";
import AIChatAssistant from "@/components/dashboard/AIChatAssistant";
import { WeddingRealtime } from "@/components/realtime/WeddingRealtime";
import { getWeddingPhase } from "@/lib/weddingPhase";
import { useAuth } from "@/hooks/useAuth";
import NextUp from "@/components/dashboard/NextUp";
import ReminderHistory from "@/components/dashboard/ReminderHistory";
import MemoryKeepsake from "@/components/dashboard/MemoryKeepsake";
import BudgetTracker from "@/components/dashboard/BudgetTracker";
import GuestPracticalInfo from "@/components/wedding/GuestPracticalInfo";

const withTimeout = async <T,>(promise: PromiseLike<T>, ms = 4500): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Preview data request timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const makePreviewWedding = (slug: string) => ({
  id: "preview-wedding",
  slug,
  access_code: "FOREVER",
  couple_names: slug === "towa-mathew" ? "Towa & Mathew" : "Elara & Julian",
  wedding_date: "2026-11-21",
  ceremony_venue: "Glasshouse Garden Chapel",
  reception_venue: "The Willow Estate",
  ceremony_time: "15:30",
  reception_time: "18:00",
  dress_code: "Garden formal",
  story: "A warm celebration shaped around family, travel, food, music, and the people who helped make the journey feel possible.",
  published: true,
  dashboard_tour_completed: true,
  live_mode: false,
  cover_image: null,
  hero_image: null,
  contact_email: "hello@forevervow.app",
});

const previewRsvps = [
  { id: "rsvp-1", guest_name: "Amara Lewis", attending: true, guest_count: 2, dietary_preference: "Vegetarian", submitted_at: new Date().toISOString() },
  { id: "rsvp-2", guest_name: "Daniel Reed", attending: true, guest_count: 1, dietary_preference: "No preference", submitted_at: new Date().toISOString() },
  { id: "rsvp-3", guest_name: "Mia Carter", attending: null, guest_count: 2, dietary_preference: null, submitted_at: new Date().toISOString() },
  { id: "rsvp-4", guest_name: "Noah Stone", attending: false, guest_count: 1, dietary_preference: null, submitted_at: new Date().toISOString() },
  { id: "rsvp-5", guest_name: "Sofia Grant", attending: true, guest_count: 2, dietary_preference: "Gluten-free", submitted_at: new Date().toISOString() },
];

const previewEvents = [
  { id: "event-1", title: "Ceremony", event_time: "3:30 PM", location: "Glasshouse Garden Chapel", sort_order: 1 },
  { id: "event-2", title: "Cocktail Hour", event_time: "5:00 PM", location: "The Willow Estate Lawn", sort_order: 2 },
  { id: "event-3", title: "Reception", event_time: "6:00 PM", location: "Willow Estate Hall", sort_order: 3 },
];

const CoupleDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const previewRequested = searchParams.get("preview") === "1";
  const [weddingId, setWeddingId] = useState(sessionStorage.getItem("couple_wedding_id") || "");
  const [weddingSlug, setWeddingSlug] = useState(sessionStorage.getItem("couple_wedding_slug") || searchParams.get("slug") || "");
  const [accessCode, setAccessCode] = useState(sessionStorage.getItem("couple_access_code") || "");

  const [wedding, setWedding] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [guestbookMessages, setGuestbookMessages] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "website" ? "profile" : searchParams.get("tab") || "home");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilter, setGuestFilter] = useState<"all" | "confirmed" | "pending" | "declined" | "checked-in">("all");
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [memoryView, setMemoryView] = useState('photos');
  useEffect(() => {
    const tab = searchParams.get('tab') || 'home';
    setActiveTab(tab === 'website' ? 'profile' : tab);
  }, [searchParams]);

  const changeTab = (tab: string) => {
    if (tab === "website") tab = "profile";
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('section');
    if (weddingSlug) nextParams.set("slug", weddingSlug);
    if (tab === "home") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const loadPreviewData = (slug = weddingSlug || "towa-mathew") => {
    const previewWedding = makePreviewWedding(slug);
    sessionStorage.setItem("couple_wedding_id", previewWedding.id);
    sessionStorage.setItem("couple_wedding_slug", previewWedding.slug);
    sessionStorage.setItem("couple_access_code", previewWedding.access_code);
    setWeddingId(previewWedding.id);
    setWeddingSlug(previewWedding.slug);
    setAccessCode(previewWedding.access_code);
    setWedding(previewWedding);
    setRsvps(previewRsvps);
    setGalleryImages([]);
    setGuestPhotos([]);
    setCheckins([]);
    setGuestbookMessages([
      { id: "message-1", guest_name: "Sofia Grant", message: "Counting the days. This page already feels so personal.", approved: true, created_at: new Date().toISOString() },
      { id: "message-2", guest_name: "Mia Carter", message: "I still need to confirm travel, but I am so excited.", approved: false, created_at: new Date().toISOString() },
    ]);
    setMoments([{ id: "moment-1", title: "Proposal dinner", approved: false, created_at: new Date().toISOString() }]);
    setEvents(previewEvents);
    setShowTour(false);
    setLoading(false);
  };

  const restoreWeddingMembership = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("wedding_members")
      .select("wedding_id")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error("We could not load your wedding yet. Please try again.");
      setLoading(false);
      return;
    }
    if (!data?.wedding_id) {
      navigate("/couple-onboarding", { replace: true });
      return;
    }

    sessionStorage.setItem("couple_wedding_id", data.wedding_id);
    setWeddingId(data.wedding_id);
  };

  useEffect(() => {
    if (!authLoading && !user && !previewRequested) navigate("/couple-login", { replace: true });
  }, [authLoading, navigate, previewRequested, user]);

  useEffect(() => {
    if (authLoading || (!user && !previewRequested)) return;
    if (!weddingId) {
      if (previewRequested) void hydratePreviewWedding();
      else void restoreWeddingMembership();
      return;
    }
    fetchData();

    // Realtime subscriptions
    const checkinChannel = supabase
      .channel(`checkins-${weddingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "checkins", filter: `wedding_id=eq.${weddingId}` },
        (payload) => setCheckins((prev) => [payload.new as any, ...prev])
      )
      .subscribe();

    const rsvpChannel = supabase
      .channel(`rsvps-${weddingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rsvps", filter: `wedding_id=eq.${weddingId}` },
        (payload) => setRsvps((prev) => [payload.new as any, ...prev])
      )
      .subscribe();

    const guestbookChannel = supabase
      .channel(`guestbook-${weddingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook", filter: `wedding_id=eq.${weddingId}` },
        (payload) => setGuestbookMessages((prev) => [payload.new as any, ...prev])
      )
      .subscribe();

    const photosChannel = supabase.channel(`couple-photos-${weddingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_photos", filter: `wedding_id=eq.${weddingId}` }, () => void fetchData())
      .subscribe();
    const refreshVisible = () => { if (document.visibilityState === "visible") void fetchData(); };
    const refreshTimer = window.setInterval(refreshVisible, 30000);
    document.addEventListener("visibilitychange", refreshVisible);

    const momentsChannel = supabase
      .channel(`moments-${weddingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wedding_moments", filter: `wedding_id=eq.${weddingId}` },
        (payload) => setMoments((prev) => [payload.new as any, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checkinChannel);
      supabase.removeChannel(rsvpChannel);
      supabase.removeChannel(guestbookChannel);
      supabase.removeChannel(momentsChannel);
      supabase.removeChannel(photosChannel);
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [authLoading, previewRequested, user?.id, weddingId]);

  const hydratePreviewWedding = async () => {
    setLoading(true);
    const requestedSlug = weddingSlug || "john-anna";
    try {
      const { data } = await withTimeout(
        supabase
          .from("weddings")
          .select("id, slug, access_code")
          .eq("slug", requestedSlug)
          .maybeSingle()
      );

      if (data) {
        sessionStorage.setItem("couple_wedding_id", data.id);
        sessionStorage.setItem("couple_wedding_slug", data.slug);
        sessionStorage.setItem("couple_access_code", data.access_code || "");
        setWeddingId(data.id);
        setWeddingSlug(data.slug);
        setAccessCode(data.access_code || "");
        return;
      }
    } catch (error) {
      console.warn("Using local couple dashboard preview data:", error);
    }

    loadPreviewData(requestedSlug);
  };

  const fetchData = async () => {
    if (weddingId === "preview-wedding") {
      loadPreviewData(weddingSlug || "towa-mathew");
      return;
    }

    let wRes;
    let rRes;
    let glRes;
    let gpRes;
    let cRes;
    let gbRes;
    let evRes;
    try {
      [wRes, rRes, glRes, gpRes, cRes, gbRes, evRes] = await withTimeout(Promise.all([
        supabase.from("weddings").select("*").eq("id", weddingId!).single(),
        supabase.from("rsvps").select("*").eq("wedding_id", weddingId!).order("submitted_at", { ascending: false }),
        supabase.from("gallery").select("*").eq("wedding_id", weddingId!).order("created_at", { ascending: false }),
        supabase.from("guest_photos").select("*").eq("wedding_id", weddingId!).order("created_at", { ascending: false }),
        supabase.from("checkins").select("*").eq("wedding_id", weddingId!).order("checkin_time", { ascending: false }),
        supabase.from("guestbook").select("*").eq("wedding_id", weddingId!).order("created_at", { ascending: false }),
        supabase.from("events").select("*").eq("wedding_id", weddingId!),
      ]));
    } catch (error) {
      console.error("Could not load couple dashboard:", error);
      toast.error("We could not load your wedding. Please try again.");
      setLoading(false);
      return;
    }
    if (wRes.error || !wRes.data) {
      sessionStorage.removeItem("couple_wedding_id");
      sessionStorage.removeItem("couple_wedding_slug");
      sessionStorage.removeItem("couple_access_code");
      setWeddingId("");
      setWeddingSlug("");
      setAccessCode("");
      setWedding(null);
      setLoading(true);
      return;
    }
    if (wRes.data) {
      setWedding(wRes.data);
      if (!(wRes.data as any).dashboard_tour_completed) {
        setShowTour(true);
      }
    }
    if (rRes.data) setRsvps(rRes.data);
    if (glRes.data) setGalleryImages(glRes.data);
    if (gpRes.data) setGuestPhotos(gpRes.data);
    if (cRes.data) setCheckins(cRes.data);
    if (gbRes.data) setGuestbookMessages(gbRes.data);
    if (evRes.data) setEvents(evRes.data);

    const { data: momentData, error: momentError } = await supabase
      .from("wedding_moments")
      .select("*")
      .eq("wedding_id", weddingId!)
      .order("created_at", { ascending: false });
    if (momentError) console.error("Could not load moments:", momentError);
    setMoments(momentData || []);

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-xs tracking-[0.15em] text-muted-foreground uppercase">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body text-muted-foreground">Wedding not found</p>
      </div>
    );
  }

  // Computed stats
  const confirmed = rsvps.filter((r) => r.attending === true).length;
  const pending = rsvps.filter((r) => r.attending === null).length;
  const declined = rsvps.filter((r) => r.attending === false).length;
  const totalPhotoUploads = galleryImages.length + guestPhotos.length;
  const completedTasks = [
    !!wedding.couple_names,
    !!wedding.wedding_date,
    !!wedding.ceremony_venue,
    !!wedding.story,
    wedding.published,
    events.length > 0,
    galleryImages.length > 0,
    rsvps.length > 0,
  ].filter(Boolean).length;
  const totalTasks = 8;
  const progress = Math.round((completedTasks / totalTasks) * 100);

  // Dietary summary
  const dietaryCounts: Record<string, number> = {};
  rsvps
    .filter((r) => r.attending === true && r.dietary_preference && r.dietary_preference !== "No preference")
    .forEach((r) => {
      dietaryCounts[r.dietary_preference!] = (dietaryCounts[r.dietary_preference!] || 0) + 1;
    });
  const dietarySummary = Object.entries(dietaryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

  const checkedInNames = new Set(checkins.map((checkin) => String(checkin.guest_name || "").trim().toLowerCase()));
  const filteredGuests = rsvps.filter((rsvp) => {
    const search = guestSearch.trim().toLowerCase();
    const matchesSearch = !search || [rsvp.guest_name, rsvp.email, rsvp.phone, rsvp.dietary_preference]
      .some((value) => String(value || "").toLowerCase().includes(search));
    const checkedIn = checkedInNames.has(String(rsvp.guest_name || "").trim().toLowerCase());
    const matchesFilter = guestFilter === "all" || (guestFilter === "confirmed" && rsvp.attending === true) || (guestFilter === "pending" && rsvp.attending === null) || (guestFilter === "declined" && rsvp.attending === false) || (guestFilter === "checked-in" && checkedIn);
    return matchesSearch && matchesFilter;
  });
  const weddingUrl = `${window.location.origin}/wedding/${weddingSlug || wedding.slug}`;
  const copyWeddingLink = () => { navigator.clipboard.writeText(weddingUrl); toast.success("Wedding link copied."); };
  const sendPushReminder = async (targetRsvpId?: string) => {
    if (weddingId === "preview-wedding") return toast.info("Reminders are available in your real wedding workspace.");
    const { data, error } = await supabase.rpc("queue_rsvp_reminder", {
      p_wedding_id: weddingId!,
      ...(targetRsvpId ? { p_rsvp_id: targetRsvpId } : {}),
    });
    if (error) return toast.error("The reminder could not be queued.");
    const recipients = Number((data as { recipients?: number })?.recipients || 0);
    if (!recipients) return toast.info("No reminders sent. Guests must still be undecided and not reminded within 24 hours.");
    toast.success(`Reminder added to ${recipients} guest inbox${recipients === 1 ? '' : 'es'}. Push notifications are sent where enabled.`);
  };
  const togglePublished = async () => {
    if (weddingId === "preview-wedding") return toast.info("Publishing is available in your real wedding workspace.");
    setPublishing(true);
    const nextPublished = !wedding.published;
    const { error } = await supabase.from("weddings").update({ published: nextPublished }).eq("id", weddingId);
    setPublishing(false);
    if (error) return toast.error("We could not update your wedding page.");
    setWedding((current: any) => ({ ...current, published: nextPublished }));
    toast.success(nextPublished ? "Your wedding is now live for guests." : "Your wedding is private again.");
  };
  const notifications = [
    ...rsvps.slice(0, 3).map((rsvp) => ({ id: `rsvp-${rsvp.id}`, title: rsvp.attending === true ? "New RSVP confirmed" : "RSVP needs attention", body: `${rsvp.guest_name || "A guest"} responded to your wedding invitation.`, targetTab: "guests" })),
    ...checkins.slice(0, 2).map((checkin) => ({ id: `checkin-${checkin.id}`, title: "Guest arrival", body: `${checkin.guest_name || "A guest"} checked in.`, targetTab: "guests" })),
    ...guestPhotos.slice(0, 2).map((photo) => ({ id: `photo-${photo.id}`, title: "New guest photo", body: `${photo.guest_name || "A guest"} shared a photo.`, targetTab: "moments" })),
    ...guestbookMessages.slice(0, 2).map((message) => ({ id: `message-${message.id}`, title: "New wall message", body: `${message.guest_name || "A guest"} left a message.`, targetTab: "moments" })),
  ];

  const weddingPhase = getWeddingPhase(wedding, events);

  return (
    <DashboardLayout
      coupleName={wedding.couple_names}
      weddingSlug={weddingSlug || ""}
      weddingDate={wedding.wedding_date}
      heroImage={wedding.cover_image || wedding.hero_image}
      activeTab={activeTab}
      onTabChange={changeTab}
      notificationCount={pending + moments.filter((m) => !m.approved).length}
      onRestartTour={() => setShowTour(true)}
      notifications={notifications}
    >
      <WeddingRealtime weddingId={weddingId!} onEvent={() => void fetchData()} />
      {/* Walkthrough Tour */}
      <DashboardWalkthrough
        weddingId={weddingId!}
        show={showTour}
        onComplete={() => setShowTour(false)}
      />

      {activeTab === "home" && (
        <CoupleOverview
          wedding={wedding}
          progress={progress}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          confirmed={confirmed}
          pending={pending}
          events={events}
          rsvps={rsvps}
          onTabChange={changeTab}
          onEditDetails={() => setShowEditDetails(true)}
          phase={weddingPhase}
        />
      )}

      {activeTab === "calendar" && (
        <PlannerSchedule
          wedding={wedding}
          events={events}
          pending={pending}
          onEditDetails={() => setShowEditDetails(true)}
          onRefresh={fetchData}
        />
      )}

      {(activeTab === "home" || activeTab === "calendar") && <div className="mt-5"><NextUp weddingId={weddingId!} onTabChange={changeTab} /></div>}

      {activeTab === "guests" && (
      <div className="space-y-5">
        <CouplePageHeading title="Guests" detail={`${rsvps.length} responses · ${pending} still deciding`} />

        <div id="dashboard-overview" className="grid grid-cols-2 gap-3">
          {[
            { label: "Confirmed", value: confirmed, icon: Check, tone: "fv-stat-lime" },
            { label: "Waiting", value: pending, icon: Clock, tone: "fv-stat-teal" },
            { label: "Declined", value: declined, icon: X, tone: "fv-stat-pink" },
            { label: "Arrived", value: checkins.length, icon: MapPin, tone: "bg-[#202020] text-white" },
          ].map((stat) => {
            const Icon = stat.icon;
            return <div key={stat.label} className={`rounded-[22px] p-4 shadow-sm ${stat.tone}`}><div className="flex items-center justify-between"><p className="font-body text-xs opacity-65">{stat.label}</p><Icon className="h-4 w-4 opacity-60" /></div><p className="mt-4 font-body text-3xl font-semibold">{stat.value}</p></div>;
          })}
        </div>

        {/* Pending RSVP nudge */}
        {pending > 0 && (
          <div className="flex items-center justify-between rounded-[22px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="font-body text-sm">
                <span className="font-medium">{pending} guest{pending === 1 ? "" : "s"}</span> haven't responded yet.
                Consider sending them a reminder.
              </p>
            </div>
            <button
              onClick={() => void sendPushReminder()}
              className="ml-4 whitespace-nowrap rounded-full bg-black px-3 py-2 font-body text-[10px] font-semibold text-white"
            >
              Send reminder
            </button>
          </div>
        )}

        <section className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-body text-base font-semibold">Guest list</h3><p className="font-body text-xs text-muted-foreground mt-1">Search responses, check-ins, and dietary notes.</p></div><span className="font-body text-xs text-muted-foreground">{filteredGuests.length} shown</span></div>
          <input value={guestSearch} onChange={(event) => setGuestSearch(event.target.value)} placeholder="Search guests..." className="mt-4 w-full rounded-full border border-border bg-card px-4 py-3 font-body text-sm outline-none focus:border-border" />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{(["all", "confirmed", "pending", "declined", "checked-in"] as const).map((filter) => <button key={filter} onClick={() => setGuestFilter(filter)} className={`whitespace-nowrap rounded-full px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.1em] ${guestFilter === filter ? "bg-[#202020] text-white" : "bg-muted text-muted-foreground"}`}>{filter.replace("-", " ")}</button>)}</div>
          <div className="mt-3 divide-y divide-border">{filteredGuests.map((guest) => { const checkedIn = checkedInNames.has(String(guest.guest_name || "").trim().toLowerCase()); const status = checkedIn ? "Checked in" : guest.attending === true ? "Confirmed" : guest.attending === false ? "Declined" : "Pending"; return <button key={guest.id} onClick={() => setSelectedGuest(guest)} className="flex w-full items-center justify-between gap-3 py-3 text-left"><span className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted"><User className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate font-body text-sm font-medium">{guest.guest_name || "Unnamed guest"}</span><span className="block truncate font-body text-xs text-muted-foreground">{guest.guest_count || 1} guest{guest.guest_count === 1 ? "" : "s"}{guest.dietary_preference ? ` · ${guest.dietary_preference}` : ""}</span></span></span><span className="rounded-full bg-muted px-2 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.08em]">{status}</span></button>; })}</div>
          {filteredGuests.length === 0 && <p className="py-6 text-center font-body text-sm text-muted-foreground">No guests match this view.</p>}
        </section>

        {dietarySummary.length > 0 && <section className="rounded-[24px] border border-border bg-card p-4 shadow-sm"><h3 className="font-body text-base font-semibold">Dietary summary</h3><div className="mt-3 flex flex-wrap gap-2">{dietarySummary.map(({ label, count }) => <span key={label} className="rounded-full bg-muted px-3 py-2 font-body text-xs">{label} <strong>{count}</strong></span>)}</div></section>}

        <ShareWeddingLink weddingSlug={weddingSlug || ""} />

        <ReminderHistory weddingId={weddingId!} />

        {/* Activity + Guest Messages */}
        <div id="dashboard-activity" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ActivityFeed
            rsvps={rsvps}
            guestbookMessages={guestbookMessages}
            guestPhotos={guestPhotos}
            checkins={checkins}
            moments={moments}
          />
          <div id="dashboard-messages">
            <GuestMessages
              weddingId={weddingId!}
              accessCode={accessCode}
              messages={guestbookMessages}
              onRefresh={fetchData}
            />
          </div>
        </div>

      </div>
      )}

      {activeTab === "moments" && (
        <div className="space-y-5">
          <CouplePageHeading title="Memories" detail={`${galleryImages.length + guestPhotos.length} photos · ${moments.length} moments together`} />
          <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Memories views">
            {[
              ["Photos", galleryImages.length + guestPhotos.length],
              ["Moments", moments.length],
              ["Wall", guestbookMessages.length],
              ["Keepsake", null],
            ].map(([label, value], index) => (
              <button role="tab" aria-selected={memoryView === String(label).toLowerCase()} onClick={() => setMemoryView(String(label).toLowerCase())} key={label as string} className={`rounded-2xl px-1 py-4 text-center ${memoryView === String(label).toLowerCase() ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>
                <p className="font-body text-lg font-semibold leading-none">{value === null ? <Download className="mx-auto h-[18px] w-[18px]" /> : value as number}</p>
                <p className="mt-1 font-body text-[10px]">{label as string}</p>
              </button>
            ))}
          </div>
          {memoryView === 'photos' && <section id="dashboard-photos" className="py-2">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Photos</p>
            <PhotoManager
              weddingId={weddingId!}
              galleryImages={galleryImages}
              guestPhotos={guestPhotos}
              onRefresh={fetchData}
            />
          </section>}
          {memoryView === 'moments' && <section className="py-2">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Moments</p>
            <MomentsManager
              weddingId={weddingId!}
              moments={moments}
              isLiveMode={wedding?.live_mode || false}
              onRefresh={fetchData}
            />
          </section>}
          {memoryView === 'wall' && <section className="py-2">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Wall</p>
            <GuestMessages
              weddingId={weddingId!}
              accessCode={accessCode}
              messages={guestbookMessages}
              onRefresh={fetchData}
            />
          </section>}
          {memoryView === 'keepsake' && <MemoryKeepsake wedding={wedding} gallery={galleryImages} photos={guestPhotos} messages={guestbookMessages} moments={moments} />}
        </div>
      )}

      {activeTab === "updates" && (
        <div className="space-y-5">
          <CoupleUpdates weddingId={weddingId!} />
          <ActivityFeed rsvps={rsvps} guestbookMessages={guestbookMessages} guestPhotos={guestPhotos} checkins={checkins} moments={moments} />
          <DailyReport weddingId={weddingId!} />
        </div>
      )}

      {activeTab === "profile" && <CoupleProfile
        wedding={wedding} onEdit={() => setShowEditDetails(true)}
        publishing={<><WebsiteWorkspace wedding={wedding} weddingSlug={weddingSlug || ""} publishing={publishing} onPublish={togglePublished} onEditDetails={() => setShowEditDetails(true)} /><ShareWeddingLink weddingSlug={weddingSlug || ""} /><WeddingTools weddingSlug={weddingSlug || ""} /></>}
        information={<GuestPracticalInfo key={weddingId} weddingId={weddingId!} editable />}
        budget={<BudgetTracker weddingId={weddingId!} coupleNames={wedding.couple_names} slug={weddingSlug || wedding.slug} />}
        readiness={<SetupProgress wedding={wedding} eventsCount={events.length} hasSharedLink={wedding.published} />}
      />}


      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-muted p-3" onClick={() => setSelectedGuest(null)}>
          <div className="w-full max-w-[430px] rounded-[28px] bg-muted p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between"><div><p className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground">Guest details</p><h3 className="mt-1 font-body text-2xl font-semibold">{selectedGuest.guest_name || "Unnamed guest"}</h3></div><button onClick={() => setSelectedGuest(null)} className="rounded-full bg-muted p-2" aria-label="Close guest details"><X className="h-4 w-4" /></button></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-card p-3"><p className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Response</p><p className="mt-1 font-body text-sm">{selectedGuest.attending === true ? "Confirmed" : selectedGuest.attending === false ? "Declined" : "Pending"}</p></div><div className="rounded-2xl bg-card p-3"><p className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Party size</p><p className="mt-1 font-body text-sm">{selectedGuest.guest_count || 1}</p></div></div>
            <div className="mt-3 space-y-2 rounded-2xl bg-card p-4 font-body text-sm"><p>{selectedGuest.email || "No email provided"}</p><p>{selectedGuest.phone || "No phone provided"}</p><p className="text-muted-foreground">Dietary: {selectedGuest.dietary_preference || "No preference noted"}</p></div>
            {selectedGuest.attending === null && <button onClick={() => { void sendPushReminder(selectedGuest.id); setSelectedGuest(null); }} className="mt-4 w-full rounded-full bg-[#202020] px-4 py-3 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white"><Send className="mr-2 inline h-4 w-4" />Remind</button>}
          </div>
        </div>
      )}

      {!previewRequested && weddingId && (
        <details className="fv-assistant-disclosure mt-5">
          <summary>Ask about your wedding <MessageCircle size={18} /></summary>
          <AIChatAssistant weddingId={weddingId} />
        </details>
      )}

      {/* Edit Wedding Details Modal */}
      <EditWeddingDetails
        open={showEditDetails}
        onOpenChange={setShowEditDetails}
        wedding={wedding}
        weddingId={weddingId!}
        accessCode={accessCode}
        onSaved={fetchData}
      />
    </DashboardLayout>
  );
};

export default CoupleDashboard;


function WebsiteWorkspace({ wedding, weddingSlug, publishing, onPublish, onEditDetails }: any) {
  const weddingUrl = `${window.location.origin}/wedding/${weddingSlug}`;
  const copyLink = () => {
    navigator.clipboard.writeText(weddingUrl);
    toast.success("Wedding link copied.");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-body text-xs font-semibold text-muted-foreground">GUEST WEBSITE</p>
        <h1 className="mt-2 font-body text-[32px] font-semibold leading-tight">Your wedding, ready to share</h1>
        <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">Preview the guest experience, finish the important details, and publish when it feels ready.</p>
      </div>

      <section className="overflow-hidden rounded-[28px] bg-[#202020] text-white shadow-xl">
        <div className="relative h-52 bg-gradient-to-br from-[#3a3a3a] via-[#262626] to-[#171717]">
          {(wedding.cover_image || wedding.hero_image) && <img src={wedding.cover_image || wedding.hero_image} alt="" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <span className={`absolute right-4 top-4 rounded-full px-3 py-2 font-body text-[10px] font-semibold ${wedding.published ? "bg-[#d9f06e] text-black" : "bg-card text-black"}`}>{wedding.published ? "LIVE" : "DRAFT"}</span>
          <div className="absolute inset-x-5 bottom-5"><p className="font-body text-2xl font-semibold">{wedding.couple_names}</p><p className="mt-1 truncate font-body text-xs text-white/65">/{weddingSlug}</p></div>
        </div>
        <div className="p-5">
          <button disabled={publishing} onClick={onPublish} className={`flex h-13 w-full items-center justify-center gap-2 rounded-full px-5 py-4 font-body text-xs font-semibold disabled:opacity-60 ${wedding.published ? "border border-border text-white" : "bg-card text-black"}`}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe2 className="h-4 w-4" />}
            {wedding.published ? "Make Wedding Private" : "Publish Wedding"}
          </button>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={weddingUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-card p-3 text-center font-body text-[10px]"><ExternalLink className="mx-auto mb-2 h-4 w-4" />Preview</a>
            <button onClick={copyLink} className="rounded-2xl bg-card p-3 text-center font-body text-[10px]"><Copy className="mx-auto mb-2 h-4 w-4" />Copy link</button>
            <button onClick={onEditDetails} className="rounded-2xl bg-card p-3 text-center font-body text-[10px]"><Sparkles className="mx-auto mb-2 h-4 w-4" />Edit details</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlannerSchedule({ wedding, events, onEditDetails, onRefresh }: any) {
  const [selectedDate, setSelectedDate] = useState(wedding.wedding_date?.slice(0, 10) || new Date().toLocaleDateString('en-CA'));
  const date = new Date(`${selectedDate}T12:00:00`);
  const dateKey = (day: Date) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() + index - 3);
    return day;
  });
  const emptyEvent = { id: "", title: "", event_date: wedding.wedding_date || "", event_time: "", location: "", description: "" };
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedEvents = events.filter((event: any) => (event.event_date || wedding.wedding_date || selectedDate).slice(0, 10) === selectedDate);

  const saveEvent = async () => {
    if (!editing?.title.trim()) return toast.error("Add an event title.");
    setSaving(true);
    const values = {
      wedding_id: wedding.id,
      title: editing.title.trim(),
      event_date: editing.event_date || null,
      event_time: editing.event_time || null,
      location: editing.location.trim() || null,
      description: editing.description.trim() || null,
      sort_order: editing.sort_order ?? events.length,
    };
    const { error } = editing.id
      ? await supabase.from("events").update(values).eq("wedding_id", wedding.id).eq("id", editing.id)
      : await supabase.from("events").insert(values);
    setSaving(false);
    if (error) return toast.error("The schedule could not be saved.");
    toast.success(editing.id ? "Event updated." : "Event added.");
    setEditing(null);
    await onRefresh();
  };

  const removeEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("wedding_id", wedding.id).eq("id", id);
    if (error) return toast.error("The event could not be deleted.");
    toast.success("Event deleted.");
    await onRefresh();
  };

  return (
    <div className="space-y-5">
      <CouplePageHeading title="Calendar" detail={date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}>
        <button onClick={() => setEditing({ ...emptyEvent, event_date: selectedDate })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Add event"><Plus className="h-4 w-4" /></button>
      </CouplePageHeading>

      <div className="grid grid-cols-7 gap-1.5" aria-label="Wedding week">
        {weekDays.map((day, index) => <button onClick={() => setSelectedDate(dateKey(day))} aria-pressed={index === 3} aria-label={day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} key={dateKey(day)} className={`rounded-full px-1 py-3 text-center font-body ${index === 3 ? "bg-[#ff6245] text-white" : "border border-border bg-[#242424] text-white/65"}`}><p className="text-[10px] font-medium">{day.toLocaleDateString(undefined, { weekday: "narrow" })}</p><p className="mt-2 text-sm font-semibold">{day.getDate()}</p></button>)}
      </div>
      <input type="date" aria-label="Choose calendar date" value={selectedDate} onChange={e => { if (e.target.value) setSelectedDate(e.target.value); }} className="rounded-xl border border-border p-2 text-sm" />

      {editing && (
        <section className="space-y-3 rounded-[24px] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-body text-sm font-semibold">{editing.id ? "Edit event" : "Add event"}</h2><button onClick={() => setEditing(null)} aria-label="Close event editor"><X className="h-4 w-4" /></button></div>
          <input aria-label="Event title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Event title" className="min-h-11 w-full rounded-xl border border-border px-3 font-body text-sm" />
          <div className="grid grid-cols-2 gap-2"><input aria-label="Event date" type="date" value={editing.event_date || ""} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} className="min-h-11 min-w-0 rounded-xl border border-border px-3 font-body text-xs" /><input aria-label="Event time" type="time" value={editing.event_time || ""} onChange={(e) => setEditing({ ...editing, event_time: e.target.value })} className="min-h-11 min-w-0 rounded-xl border border-border px-3 font-body text-xs" /></div>
          <input aria-label="Event location" value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Location" className="min-h-11 w-full rounded-xl border border-border px-3 font-body text-sm" />
          <textarea aria-label="Event description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Details" rows={3} className="w-full resize-none rounded-xl border border-border p-3 font-body text-sm" />
          <button onClick={saveEvent} disabled={saving} className="min-h-11 w-full rounded-full bg-[#202020] px-4 font-body text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save event"}</button>
        </section>
      )}

      <div className="space-y-3">
        {selectedEvents.map((event: any, index: number) => (
          <div key={event.id} className="grid grid-cols-[64px_1fr] gap-3">
            <div className="font-body text-xs text-muted-foreground pt-4">{event.event_time || "Time TBC"}</div>
            <div className={`fv-calendar-event rounded-[22px] p-4 ${index % 2 ? 'fv-teal' : 'fv-lime'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-body text-sm font-semibold">{event.title}</h2>
                  <p className="font-body text-xs text-muted-foreground leading-5 mt-1">{event.location || event.description || "Details will appear here."}</p>
                </div>
                <div className="flex gap-1"><button onClick={() => setEditing({ ...event })} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202020] text-white" aria-label={`Edit ${event.title}`}><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => removeEvent(event.id)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-destructive" aria-label={`Delete ${event.title}`}><Trash2 className="h-3.5 w-3.5" /></button></div>
              </div>
            </div>
          </div>
        ))}
        {selectedEvents.length === 0 && <div className="rounded-[22px] bg-card p-5 text-center"><CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" /><h2 className="mt-3 font-body text-sm font-semibold">Nothing planned for this day</h2><button onClick={() => setEditing({ ...emptyEvent, event_date: selectedDate })} className="mt-4 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold text-primary-foreground">Add event</button></div>}
      </div>
    </div>
  );
}
