import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CalendarDays, Check, Clock, Copy, ExternalLink, Heart, Image, MapPin, MessageCircle, Plus, Send, ShieldCheck, Sparkles, User, Users, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import weddingCover from "@/assets/towa-mathew-hero.jpeg";
import weddingStory from "@/assets/towa-mathew-story.jpeg";

// Dashboard Components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OverviewCards from "@/components/dashboard/OverviewCards";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import AISuggestions from "@/components/dashboard/AISuggestions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PhotoManager from "@/components/dashboard/PhotoManager";
import GuestMessages from "@/components/dashboard/GuestMessages";
import WeddingTools from "@/components/dashboard/WeddingTools";
import DailyReport from "@/components/dashboard/DailyReport";
import MomentsManager from "@/components/dashboard/MomentsManager";
import ShareWeddingLink from "@/components/dashboard/ShareWeddingLink";
import DashboardWalkthrough from "@/components/dashboard/DashboardWalkthrough";
import SetupProgress from "@/components/dashboard/SetupProgress";
import QuickActions from "@/components/dashboard/QuickActions";
import EditWeddingDetails from "@/components/dashboard/EditWeddingDetails";
import { getWeddingPhase } from "@/lib/weddingPhase";

const withTimeout = async <T,>(promise: Promise<T>, ms = 4500): Promise<T> => {
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
  cover_image: weddingCover,
  hero_image: weddingStory,
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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilter, setGuestFilter] = useState<"all" | "confirmed" | "pending" | "declined" | "checked-in">("all");
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    if (weddingSlug) nextParams.set("slug", weddingSlug);
    if (tab === "home") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const usePreviewData = (slug = weddingSlug || "towa-mathew") => {
    const previewWedding = makePreviewWedding(slug);
    sessionStorage.setItem("couple_wedding_id", previewWedding.id);
    sessionStorage.setItem("couple_wedding_slug", previewWedding.slug);
    sessionStorage.setItem("couple_access_code", previewWedding.access_code);
    setWeddingId(previewWedding.id);
    setWeddingSlug(previewWedding.slug);
    setAccessCode(previewWedding.access_code);
    setWedding(previewWedding);
    setRsvps(previewRsvps);
    setGalleryImages([{ id: "gallery-1", image_url: weddingCover }, { id: "gallery-2", image_url: weddingStory }]);
    setGuestPhotos([{ id: "guest-photo-1", image_url: weddingStory, guest_name: "Amara Lewis" }]);
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

  useEffect(() => {
    if (!weddingId) {
      void hydratePreviewWedding();
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
    };
  }, [weddingId]);

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

    usePreviewData(requestedSlug);
  };

  const fetchData = async () => {
    if (weddingId === "preview-wedding") {
      usePreviewData(weddingSlug || "towa-mathew");
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
      console.warn("Using local couple dashboard preview data:", error);
      usePreviewData(weddingSlug || "towa-mathew");
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

    // Fetch moments via edge function to bypass RLS
    try {
      const momRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-moments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wedding_id: weddingId, access_code: accessCode, action: "list" }),
      });
      const momData = momRes.ok ? await momRes.json() : { data: [] };
      if (momData.data) setMoments(momData.data);
    } catch {
      setMoments([]);
    }

    setLoading(false);
  };

  if (loading) {
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
  const copyReminderMessage = () => { navigator.clipboard.writeText(`Hi! Just a reminder to RSVP for ${wedding.couple_names}. We would love to celebrate with you: ${weddingUrl}`); toast.success("Reminder message copied."); };
  const notifications = [
    ...rsvps.slice(0, 3).map((rsvp) => ({ id: `rsvp-${rsvp.id}`, title: rsvp.attending === true ? "New RSVP confirmed" : "RSVP needs attention", body: `${rsvp.guest_name || "A guest"} responded to your wedding invitation.`, targetTab: "guests" })),
    ...checkins.slice(0, 2).map((checkin) => ({ id: `checkin-${checkin.id}`, title: "Guest arrival", body: `${checkin.guest_name || "A guest"} checked in.`, targetTab: "guests" })),
    ...guestPhotos.slice(0, 2).map((photo) => ({ id: `photo-${photo.id}`, title: "New guest photo", body: `${photo.guest_name || "A guest"} shared a photo.`, targetTab: "moments" })),
    ...guestbookMessages.slice(0, 2).map((message) => ({ id: `message-${message.id}`, title: "New wall message", body: `${message.guest_name || "A guest"} left a message.`, targetTab: "moments" })),
  ];

  // Wedding data for AI components
  const weddingData = {
    wedding,
    rsvps,
    guestbookMessages,
    checkins,
    guestPhotos,
  };
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
      {/* Walkthrough Tour */}
      <DashboardWalkthrough
        weddingId={weddingId!}
        show={showTour}
        onComplete={() => setShowTour(false)}
      />

      {activeTab === "add-task" && (
        <AddTaskScreen onCreate={() => changeTab("home")} wedding={wedding} pending={pending} />
      )}

      {activeTab === "home" && (
        <CoupleHome
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
          onTabChange={changeTab}
        />
      )}

      {activeTab === "guests" && (
      <div className="space-y-5">
        {/* Welcome Greeting */}
        <div>
          <h2 className="font-body text-2xl font-semibold tracking-normal">
            Guest center
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Track RSVPs, check-ins, guest messages, and follow-ups.
          </p>
        </div>

        {/* Overview Cards */}
        <div id="dashboard-overview">
        <OverviewCards
          confirmedGuests={confirmed}
          pendingRsvps={pending}
          declinedGuests={declined}
          checkins={checkins.length}
          photoUploads={totalPhotoUploads}
          dietarySummary={dietarySummary}
          pendingMoments={moments.filter((m) => !m.approved).length}
        />
        </div>

        {/* Pending RSVP nudge */}
        {pending > 0 && (
          <div className="flex items-center justify-between p-4 border border-amber-200/60 bg-amber-50/30 dark:bg-amber-900/10">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="font-body text-sm">
                <span className="font-medium">{pending} guest{pending === 1 ? "" : "s"}</span> haven't responded yet.
                Consider sending them a reminder.
              </p>
            </div>
            <button
              onClick={() => {
                copyWeddingLink();
              }}
              className="font-body text-xs tracking-[0.15em] uppercase underline text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 whitespace-nowrap ml-4"
            >
              Copy Link
            </button>
          </div>
        )}

        <section className="rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-body text-base font-semibold">Guest list</h3><p className="font-body text-xs text-muted-foreground mt-1">Search responses, check-ins, and dietary notes.</p></div><span className="font-body text-xs text-muted-foreground">{filteredGuests.length} shown</span></div>
          <input value={guestSearch} onChange={(event) => setGuestSearch(event.target.value)} placeholder="Search guests..." className="mt-4 w-full rounded-full border border-black/10 bg-white px-4 py-3 font-body text-sm outline-none focus:border-black/30" />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{(["all", "confirmed", "pending", "declined", "checked-in"] as const).map((filter) => <button key={filter} onClick={() => setGuestFilter(filter)} className={`whitespace-nowrap rounded-full px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.1em] ${guestFilter === filter ? "bg-[#202020] text-white" : "bg-black/5 text-muted-foreground"}`}>{filter.replace("-", " ")}</button>)}</div>
          <div className="mt-3 divide-y divide-black/5">{filteredGuests.map((guest) => { const checkedIn = checkedInNames.has(String(guest.guest_name || "").trim().toLowerCase()); const status = checkedIn ? "Checked in" : guest.attending === true ? "Confirmed" : guest.attending === false ? "Declined" : "Pending"; return <button key={guest.id} onClick={() => setSelectedGuest(guest)} className="flex w-full items-center justify-between gap-3 py-3 text-left"><span className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2eee9]"><User className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate font-body text-sm font-medium">{guest.guest_name || "Unnamed guest"}</span><span className="block truncate font-body text-xs text-muted-foreground">{guest.guest_count || 1} guest{guest.guest_count === 1 ? "" : "s"}{guest.dietary_preference ? ` · ${guest.dietary_preference}` : ""}</span></span></span><span className="rounded-full bg-black/5 px-2 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.08em]">{status}</span></button>; })}</div>
          {filteredGuests.length === 0 && <p className="py-6 text-center font-body text-sm text-muted-foreground">No guests match this view.</p>}
        </section>

        {dietarySummary.length > 0 && <section className="rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-sm"><h3 className="font-body text-base font-semibold">Dietary summary</h3><div className="mt-3 flex flex-wrap gap-2">{dietarySummary.map(({ label, count }) => <span key={label} className="rounded-full bg-[#f2eee9] px-3 py-2 font-body text-xs">{label} <strong>{count}</strong></span>)}</div></section>}

        <ShareWeddingLink weddingSlug={weddingSlug || ""} />

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

        <AIInsightsPanel weddingId={weddingId!} weddingData={weddingData} />
      </div>
      )}

      {activeTab === "moments" && (
        <div className="space-y-5">
          <div>
            <h2 className="font-body text-2xl font-semibold tracking-normal">Memories</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Photos, guest moments, and the shared wall from your wedding link.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Photos", galleryImages.length + guestPhotos.length],
              ["Moments", moments.length],
              ["Wall", guestbookMessages.length],
            ].map(([label, value], index) => (
              <div key={label as string} className={`rounded-2xl px-3 py-4 text-center ${index === 0 ? "bg-[#202020] text-white" : "bg-white/82 text-foreground shadow-sm"}`}>
                <p className="font-body text-lg font-semibold leading-none">{value as number}</p>
                <p className="mt-1 font-body text-[10px]">{label as string}</p>
              </div>
            ))}
          </div>
          <section id="dashboard-photos" className="rounded-[26px] bg-white/88 p-4 shadow-sm border border-white/70">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Photos</p>
            <PhotoManager
              weddingId={weddingId!}
              galleryImages={galleryImages}
              guestPhotos={guestPhotos}
              onRefresh={fetchData}
            />
          </section>
          <section className="rounded-[26px] bg-white/88 p-4 shadow-sm border border-white/70">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Moments</p>
            <MomentsManager
              weddingId={weddingId!}
              moments={moments}
              isLiveMode={wedding?.live_mode || false}
              onRefresh={fetchData}
            />
          </section>
          <section className="rounded-[26px] bg-white/88 p-4 shadow-sm border border-white/70">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Wall</p>
            <GuestMessages
              weddingId={weddingId!}
              accessCode={accessCode}
              messages={guestbookMessages}
              onRefresh={fetchData}
            />
          </section>
        </div>
      )}

      {activeTab === "website" && (
        <div className="space-y-5">
          <ShareWeddingLink weddingSlug={weddingSlug || ""} />
          <WeddingTools weddingSlug={weddingSlug || ""} />
          <SetupProgress wedding={wedding} eventsCount={events.length} hasSharedLink={wedding.published} />
          <QuickActions weddingSlug={weddingSlug || ""} onEditDetails={() => setShowEditDetails(true)} onTabChange={changeTab} />
          <AISuggestions weddingId={weddingId!} weddingData={weddingData} />
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-5">
          <ProfilePanel
            wedding={wedding}
            weddingSlug={weddingSlug || ""}
            accessCode={accessCode}
            confirmed={confirmed}
            pending={pending}
            totalPhotoUploads={totalPhotoUploads}
            onEditDetails={() => setShowEditDetails(true)}
            onTabChange={changeTab}
          />
          <DailyReport weddingId={weddingId!} />
        </div>
      )}

      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-3" onClick={() => setSelectedGuest(null)}>
          <div className="w-full max-w-[430px] rounded-[28px] bg-[#fbf8f4] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between"><div><p className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground">Guest details</p><h3 className="mt-1 font-body text-2xl font-semibold">{selectedGuest.guest_name || "Unnamed guest"}</h3></div><button onClick={() => setSelectedGuest(null)} className="rounded-full bg-black/5 p-2" aria-label="Close guest details"><X className="h-4 w-4" /></button></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white p-3"><p className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Response</p><p className="mt-1 font-body text-sm">{selectedGuest.attending === true ? "Confirmed" : selectedGuest.attending === false ? "Declined" : "Pending"}</p></div><div className="rounded-2xl bg-white p-3"><p className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Party size</p><p className="mt-1 font-body text-sm">{selectedGuest.guest_count || 1}</p></div></div>
            <div className="mt-3 space-y-2 rounded-2xl bg-white p-4 font-body text-sm"><p>{selectedGuest.email || "No email provided"}</p><p>{selectedGuest.phone || "No phone provided"}</p><p className="text-muted-foreground">Dietary: {selectedGuest.dietary_preference || "No preference noted"}</p></div>
            <button onClick={() => { copyReminderMessage(); setSelectedGuest(null); }} className="mt-4 w-full rounded-full bg-[#202020] px-4 py-3 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white"><Send className="mr-2 inline h-4 w-4" />Copy RSVP reminder</button>
          </div>
        </div>
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const ProgressRing = ({ value }: { value: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-[104px] h-[104px] flex items-center justify-center">
      <svg className="-rotate-90" width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="11" />
        <circle cx="52" cy="52" r={radius} fill="none" stroke="#d9f06e" strokeWidth="11" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-body text-xl font-semibold text-white">{value}%</div>
    </div>
  );
};

function CoupleHome({ wedding, progress, completedTasks, totalTasks, confirmed, pending, events, rsvps, onTabChange, onEditDetails, phase }: any) {
  const nextEvent = events[0];
  const guestTotal = rsvps.reduce((sum: number, r: any) => sum + (r.guest_count || 1), 0);
  const responseRate = rsvps.length ? Math.round((confirmed / rsvps.length) * 100) : 0;
  const weddingDate = wedding.wedding_date ? new Date(wedding.wedding_date) : null;
  const daysToGo = weddingDate
    ? Math.ceil((weddingDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
    : null;
  const intelligenceCards = [
    {
      label: "Guest confidence",
      value: rsvps.length ? `${responseRate}%` : "Needs list",
      detail: pending > 0 ? `${pending} RSVP${pending === 1 ? "" : "s"} need a reminder before planning gets tight.` : "All visible RSVPs are settled.",
      icon: Users,
      tab: "guests",
      tone: pending > 0 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Wedding page",
      value: wedding.published ? "Live" : "Draft",
      detail: wedding.published ? "Your guest link is ready to share." : "Publish when the page, venue, RSVP and gallery feel ready.",
      icon: ExternalLink,
      tab: "website",
      tone: wedding.published ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-rose-50 text-rose-700 border-rose-100",
    },
    {
      label: "Schedule readiness",
      value: `${events.length} event${events.length === 1 ? "" : "s"}`,
      detail: nextEvent ? `${nextEvent.title} is the next visible event.` : "Add ceremony, reception and travel timing for guests.",
      icon: CalendarDays,
      tab: "calendar",
      tone: "bg-violet-50 text-violet-700 border-violet-100",
    },
  ];
  const nextMoves = [
    { label: "Send RSVP reminder", detail: pending > 0 ? `${pending} people still pending` : "No pending RSVP reminders", tab: "guests", icon: Send, disabled: pending === 0 },
    { label: "Polish guest website", detail: wedding.story ? "Story is in place" : "Add your story and details", tab: "website", icon: Wand2 },
    { label: "Update wedding profile", detail: wedding.ceremony_venue ? wedding.ceremony_venue : "Venue details missing", tab: "profile", icon: MapPin },
  ];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="font-body text-[32px] leading-[1.04] font-normal tracking-[-0.02em] max-w-[285px]">
          {phase === "wedding_day" || phase === "live" ? "It's Your Wedding Day" : "Your Wedding"}<br />Command Center
        </h1>
        <p className="mt-3 max-w-[310px] font-body text-sm leading-6 text-black/55">
          A calm read on what guests know, what still needs attention, and what ForeverVow recommends next.
        </p>
      </section>

      <section className="rounded-[22px] bg-[#202020] text-background p-4 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.13),transparent_28%)]" />
        <div className="relative">
        <p className="font-body text-sm font-semibold mb-4">Wedding Readiness</p>
        <div className="flex items-center gap-4">
          <ProgressRing value={progress} />
          <div className="flex-1 space-y-3 border-l border-white/15 pl-5">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center"><CalendarDays className="w-3 h-3 text-white/60" /></span>
              <div><p className="font-body text-sm font-semibold leading-none">{daysToGo !== null ? Math.max(daysToGo, 0) : "--"}</p><p className="font-body text-[10px] text-white/55 mt-1">Days to go</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center"><Check className="w-3 h-3 text-white/60" /></span>
              <div><p className="font-body text-sm font-semibold leading-none">{completedTasks}/{totalTasks}</p><p className="font-body text-[10px] text-white/55 mt-1">Setup signals</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center"><Clock className="w-3 h-3 text-white/60" /></span>
              <div><p className="font-body text-sm font-semibold leading-none">{pending}</p><p className="font-body text-[10px] text-white/55 mt-1">Pending RSVPs</p></div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-body text-lg font-semibold tracking-normal">Intelligence</h2>
          <button onClick={() => onTabChange("guests")} className="font-body text-xs text-muted-foreground">View Guests</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button className="min-w-0 rounded-full bg-[#d9f06e] px-2 py-3 font-body text-[11px] font-semibold text-foreground">{confirmed} Confirmed</button>
          <button className="min-w-0 rounded-full bg-white/82 px-2 py-3 font-body text-[11px] font-semibold text-foreground shadow-sm">{pending} Pending</button>
          <button className="min-w-0 rounded-full bg-white/82 px-2 py-3 font-body text-[11px] font-semibold text-foreground shadow-sm">{guestTotal} Guests</button>
        </div>
        <div className="space-y-3">
          {intelligenceCards.map((card) => {
            const Icon = card.icon;
            return (
            <button key={card.label} onClick={() => onTabChange(card.tab)} className="w-full rounded-[24px] bg-white p-4 text-left shadow-sm border border-white/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[10px] font-semibold mb-4 ${card.tone}`}>
                    <Icon className="h-3 w-3" /> {card.label}
                  </span>
                  <p className="font-body text-[22px] leading-none font-semibold">{card.value}</p>
                  <p className="font-body text-xs text-muted-foreground mt-3 leading-5">{card.detail}</p>
                </div>
                <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </button>
          )})}
        </div>
      </section>

      <section className="rounded-[24px] bg-white/88 p-4 shadow-sm border border-white/70">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-body text-lg font-semibold tracking-normal">Recommended Next</h2>
          <Sparkles className="h-4 w-4 text-violet-500" />
        </div>
        <div className="space-y-2">
          {nextMoves.map((move) => {
            const Icon = move.icon;
            return (
              <button
                key={move.label}
                disabled={move.disabled}
                onClick={() => move.disabled ? undefined : onTabChange(move.tab)}
                className="flex w-full items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-left disabled:opacity-45"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-body text-sm font-semibold">{move.label}</span>
                  <span className="block font-body text-xs text-muted-foreground">{move.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] overflow-hidden relative min-h-[170px] text-white shadow-xl">
        <img src={wedding.cover_image || wedding.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative p-5">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-white/70">Wedding Status</p>
          <h2 className="font-display text-3xl mt-14">{wedding.couple_names}</h2>
          <div className="flex items-center gap-3 font-body text-xs text-white/80 mt-2">
            <span>{confirmed} confirmed</span>
            <span>{rsvps.length} invited</span>
            {nextEvent && <span>{nextEvent.title}</span>}
          </div>
        </div>
      </section>
    </div>
  );
}

function PlannerSchedule({ wedding, events, pending, onTabChange }: any) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = wedding.wedding_date ? new Date(wedding.wedding_date) : new Date();
  const agenda = [
    { time: "9:00 AM", title: "RSVP pulse check", detail: "Review accepted, declined, pending and dietary signals before vendor updates.", action: "Guests", tab: "guests" },
    { time: "11:00 AM", title: "Guest website review", detail: "Check story, venue, gallery, guestbook and RSVP sections before sharing.", action: "Website", tab: "website" },
    { time: "2:00 PM", title: "Pending RSVP follow-up", detail: `${pending} guest${pending === 1 ? "" : "s"} still need a reminder.`, action: "Copy Link", tab: "guests" },
    ...events.slice(0, 3).map((event: any) => ({ time: event.event_time || "4:00 PM", title: event.title, detail: event.location || "Wedding event", action: "Open", tab: "website" })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm font-semibold">{date.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" })}</p>
          <h1 className="font-body text-[32px] font-semibold leading-tight tracking-normal mt-1">Wedding Schedule</h1>
        </div>
        <button onClick={() => onTabChange("add-task")} className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center" aria-label="Add action">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, index) => (
          <button key={day} className={`min-w-14 rounded-2xl py-3 font-body text-xs ${index === 2 ? "bg-foreground text-background" : "bg-white text-foreground shadow-sm"}`}>
            <span className="block">{day}</span>
            <span className="block mt-2">{12 + index}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", "Guests", "Website", "Moments"].map((filter, index) => (
          <button key={filter} className={`px-5 py-3 rounded-full font-body text-xs font-semibold whitespace-nowrap ${index === 0 ? "bg-foreground text-background" : "bg-white text-foreground shadow-sm"}`}>
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {agenda.map((item, index) => (
          <div key={`${item.title}-${index}`} className="grid grid-cols-[58px_1fr] gap-3">
            <div className="font-body text-xs text-muted-foreground pt-4">{item.time}</div>
            <div className="rounded-[22px] bg-white p-4 shadow-sm border border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-body text-sm font-semibold">{item.title}</h2>
                  <p className="font-body text-xs text-muted-foreground leading-5 mt-1">{item.detail}</p>
                </div>
                <button onClick={() => onTabChange(item.tab)} className="px-3 py-2 rounded-full bg-blue-600 text-white font-body text-[10px] font-semibold">
                  {item.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddTaskScreen({ onCreate, wedding, pending }: { onCreate: () => void; wedding: any; pending: number }) {
  return (
    <div className="space-y-5 pt-1">
      <div className="h-2" />
      <Field label="Action Title">
        <input className="w-full rounded-[20px] border-0 bg-white px-5 py-4 font-body text-sm outline-none shadow-sm" defaultValue={pending > 0 ? "Send RSVP reminder" : "Review wedding website"} />
      </Field>
      <Field label="Description">
        <textarea className="w-full rounded-[20px] border-0 bg-white px-5 py-4 font-body text-sm leading-6 outline-none shadow-sm resize-none" rows={3} defaultValue={pending > 0 ? `Follow up with ${pending} pending guest RSVP${pending === 1 ? "" : "s"} and reshare the invitation link.` : "Check the guest-facing page for story, venue, RSVP, gallery and guestbook readiness."} />
      </Field>
      <Field label="Due Date & time">
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-full bg-white px-4 py-4 font-body text-xs text-left shadow-sm flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {wedding?.wedding_date || "Wedding week"}</button>
          <button className="rounded-full bg-white px-4 py-4 font-body text-xs text-left shadow-sm flex items-center gap-2"><Clock className="w-4 h-4" /> 10:00 AM</button>
        </div>
      </Field>
      <Field label="Priority">
        <div className="grid grid-cols-3 gap-3">
          <button className="rounded-full border border-green-500 bg-green-50 py-3 font-body text-xs text-green-700">Low</button>
          <button className="rounded-full border border-orange-400 bg-orange-50 py-3 font-body text-xs text-orange-600">Medium</button>
          <button className="rounded-full border border-rose-400 bg-rose-50 py-3 font-body text-xs text-rose-600">High</button>
        </div>
      </Field>
      <Field label="Area">
        <button className="w-full rounded-[20px] bg-white px-5 py-4 font-body text-sm shadow-sm flex items-center justify-between">
          <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> ForeverVow Wedding</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </Field>
      <Field label="Tags">
        <div className="flex flex-wrap gap-2">
          {["RSVP", "Guests", "Website"].map((tag) => (
            <button key={tag} className="rounded-full border border-violet-500/60 bg-violet-100/50 px-4 py-2 font-body text-xs text-violet-700 flex items-center gap-1.5">
              {tag} <X className="w-3 h-3" />
            </button>
          ))}
          <button className="rounded-full bg-white/70 px-4 py-2 font-body text-xs text-muted-foreground">+ Add</button>
        </div>
      </Field>
      <button onClick={onCreate} className="w-full rounded-[22px] bg-black py-5 font-body text-sm font-semibold text-white shadow-xl">Save Action</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-body text-sm font-semibold text-black">{label}</span>
      {children}
    </label>
  );
}

function ProfilePanel({ wedding, weddingSlug, accessCode, confirmed, pending, totalPhotoUploads, onEditDetails, onTabChange }: any) {
  const weddingUrl = `${window.location.origin}/wedding/${weddingSlug}`;
  const coupleNames = String(wedding.couple_names || "Your Wedding").split("&").map((name) => name.trim());
  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Wedding date not set";
  const copyLink = () => {
    navigator.clipboard.writeText(weddingUrl);
    toast.success("Wedding link copied.");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[30px] bg-white border border-white/80 overflow-hidden shadow-sm">
        <div className="relative h-64">
          <img src={wedding.cover_image || wedding.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-black shadow-sm">
            {wedding.published ? "Live" : "Draft"}
          </div>
          <div className="absolute left-5 right-5 bottom-5 text-white">
            <div className="mb-4 flex -space-x-4">
              {coupleNames.slice(0, 2).map((name, index) => (
                <div key={name} className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#202020] shadow-lg">
                  {index === 0 ? (
                    <img src={wedding.cover_image || wedding.hero_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-body text-2xl font-semibold">{name.charAt(0) || "V"}</span>
                  )}
                </div>
              ))}
            </div>
            <h1 className="font-body text-2xl font-semibold tracking-normal leading-tight">{wedding.couple_names}</h1>
            <p className="font-body text-xs text-white/75 mt-1">Wedding profile · /{weddingSlug}</p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Guests", confirmed],
              ["Pending", pending],
              ["Photos", totalPhotoUploads],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl bg-muted/60 px-2 py-3">
                <p className="font-body text-lg font-semibold leading-none">{value as number}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-1">{label as string}</p>
              </div>
            ))}
          </div>

          <button onClick={onEditDetails} className="w-full rounded-full bg-foreground text-background py-4 font-body text-xs tracking-[0.16em] uppercase">Edit Wedding Profile</button>

          <div className="space-y-2">
            {[
              { label: weddingDate, icon: CalendarDays },
              { label: wedding.ceremony_venue || "Ceremony venue not set", icon: MapPin },
              { label: wedding.reception_venue || "Reception venue not set", icon: Heart },
              { label: wedding.dress_code || "Dress code not set", icon: Sparkles },
              { label: `Couple access code ${accessCode || wedding.access_code || "not set"}`, icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-[24px] bg-[#202020] p-4 text-white">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-body text-sm font-semibold">Profile Health</p>
              <ShieldCheck className="h-4 w-4 text-[#d9f06e]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Guest link", wedding.published ? "Ready" : "Draft"],
                ["RSVPs", pending > 0 ? `${pending} open` : "Clear"],
                ["Photos", `${totalPhotoUploads} live`],
                ["Venue", wedding.ceremony_venue ? "Set" : "Missing"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="font-body text-[10px] text-white/50">{label}</p>
                  <p className="mt-1 font-body text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={copyLink} className="rounded-2xl bg-muted/60 p-4 text-left font-body text-xs">
              <Copy className="w-4 h-4 mb-3" />Copy guest link
            </button>
            <a href={`/wedding/${weddingSlug}`} target="_blank" rel="noreferrer" className="rounded-2xl bg-muted/60 p-4 text-left font-body text-xs">
              <ExternalLink className="w-4 h-4 mb-3" />Open guest site
            </a>
            <button onClick={() => onTabChange("moments")} className="rounded-2xl bg-muted/60 p-4 text-left font-body text-xs">
              <Image className="w-4 h-4 mb-3" />Manage photos
            </button>
            <button onClick={() => onTabChange("guests")} className="rounded-2xl bg-muted/60 p-4 text-left font-body text-xs">
              <MessageCircle className="w-4 h-4 mb-3" />Guest messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
