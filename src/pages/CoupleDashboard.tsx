import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BriefcaseBusiness, CalendarDays, Check, Clock, Copy, ExternalLink, Heart, Image, MapPin, MessageCircle, MoreHorizontal, Plus, ShieldCheck, Star, User, Users, X } from "lucide-react";
import { toast } from "sonner";

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

const CoupleDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [activeTab, setActiveTab] = useState("home");

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
    const { data } = await supabase
      .from("weddings")
      .select("id, slug, access_code")
      .eq("slug", requestedSlug)
      .maybeSingle();

    if (data) {
      sessionStorage.setItem("couple_wedding_id", data.id);
      sessionStorage.setItem("couple_wedding_slug", data.slug);
      sessionStorage.setItem("couple_access_code", data.access_code || "");
      setWeddingId(data.id);
      setWeddingSlug(data.slug);
      setAccessCode(data.access_code || "");
      return;
    }

    navigate("/couple-login");
  };

  const fetchData = async () => {
    const [wRes, rRes, glRes, gpRes, cRes, gbRes, evRes] = await Promise.all([
      supabase.from("weddings").select("*").eq("id", weddingId!).single(),
      supabase.from("rsvps").select("*").eq("wedding_id", weddingId!).order("submitted_at", { ascending: false }),
      supabase.from("gallery").select("*").eq("wedding_id", weddingId!).order("created_at", { ascending: false }),
      supabase.from("guest_photos").select("*").eq("wedding_id", weddingId!).order("created_at", { ascending: false }),
      supabase.from("checkins").select("*").eq("wedding_id", weddingId!).order("checkin_time", { ascending: false }),
      supabase.from("guestbook").select("*").eq("wedding_id", weddingId!).order("created_at", { ascending: false }),
      supabase.from("events").select("*").eq("wedding_id", weddingId!),
    ]);
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

  // Wedding data for AI components
  const weddingData = {
    wedding,
    rsvps,
    guestbookMessages,
    checkins,
    guestPhotos,
  };

  return (
    <DashboardLayout
      coupleName={wedding.couple_names}
      weddingSlug={weddingSlug || ""}
      weddingDate={wedding.wedding_date}
      heroImage={wedding.cover_image || wedding.hero_image}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      notificationCount={pending + moments.filter((m) => !m.approved).length}
      onRestartTour={() => setShowTour(true)}
    >
      {/* Walkthrough Tour */}
      <DashboardWalkthrough
        weddingId={weddingId!}
        show={showTour}
        onComplete={() => setShowTour(false)}
      />

      {activeTab === "add-task" && (
        <AddTaskScreen onCreate={() => setActiveTab("home")} />
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
          onTabChange={setActiveTab}
          onEditDetails={() => setShowEditDetails(true)}
        />
      )}

      {activeTab === "calendar" && (
        <PlannerSchedule
          wedding={wedding}
          events={events}
          pending={pending}
          onTabChange={setActiveTab}
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

        <ShareWeddingLink weddingSlug={weddingSlug || ""} />

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
                navigator.clipboard.writeText(`${window.location.origin}/wedding/${weddingSlug}`);
                toast.success("Wedding link copied — share it with your pending guests!");
              }}
              className="font-body text-xs tracking-[0.15em] uppercase underline text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 whitespace-nowrap ml-4"
            >
              Copy Link
            </button>
          </div>
        )}

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
          <PhotoManager
            weddingId={weddingId!}
            galleryImages={galleryImages}
            guestPhotos={guestPhotos}
            onRefresh={fetchData}
          />
          <MomentsManager
            weddingId={weddingId!}
            moments={moments}
            isLiveMode={wedding?.live_mode || false}
            onRefresh={fetchData}
          />
          <GuestMessages
            weddingId={weddingId!}
            accessCode={accessCode}
            messages={guestbookMessages}
            onRefresh={fetchData}
          />
        </div>
      )}

      {activeTab === "website" && (
        <div className="space-y-5">
          <ShareWeddingLink weddingSlug={weddingSlug || ""} />
          <WeddingTools weddingSlug={weddingSlug || ""} />
          <SetupProgress wedding={wedding} eventsCount={events.length} hasSharedLink={wedding.published} />
          <QuickActions weddingSlug={weddingSlug || ""} onEditDetails={() => setShowEditDetails(true)} />
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
            onTabChange={setActiveTab}
          />
          <DailyReport weddingId={weddingId!} />
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

function CoupleHome({ wedding, progress, completedTasks, totalTasks, confirmed, pending, events, rsvps, onTabChange, onEditDetails }: any) {
  const nextEvent = events[0];
  const tasks = [
    { label: "Finalize wedding details", done: !!wedding.ceremony_venue, tab: "profile", time: "10:30 AM - 11:30 AM", priority: "High Priority" },
    { label: "Share RSVP link", done: wedding.published, tab: "website", time: "12:00 PM - 12:30 PM", priority: "Medium Priority" },
    { label: "Review pending RSVPs", done: pending === 0, tab: "guests", time: "3:00 PM - 3:45 PM", priority: "High Priority" },
  ];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="font-body text-[32px] leading-[1.04] font-normal tracking-[-0.02em] max-w-[285px]">
          Let’s Make<br />Today Productive
        </h1>
      </section>

      <section className="rounded-[22px] bg-[#202020] text-background p-4 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.13),transparent_28%)]" />
        <div className="relative">
        <p className="font-body text-sm font-semibold mb-4">Today's Progress</p>
        <div className="flex items-center gap-4">
          <ProgressRing value={progress} />
          <div className="flex-1 space-y-3 border-l border-white/15 pl-5">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center"><CalendarDays className="w-3 h-3 text-white/60" /></span>
              <div><p className="font-body text-sm font-semibold leading-none">{totalTasks}</p><p className="font-body text-[10px] text-white/55 mt-1">Total Task</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center"><Check className="w-3 h-3 text-white/60" /></span>
              <div><p className="font-body text-sm font-semibold leading-none">{completedTasks}</p><p className="font-body text-[10px] text-white/55 mt-1">Completed Task</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center"><Clock className="w-3 h-3 text-white/60" /></span>
              <div><p className="font-body text-sm font-semibold leading-none">{Math.max(totalTasks - completedTasks, 0)}</p><p className="font-body text-[10px] text-white/55 mt-1">Pending Task</p></div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-body text-lg font-semibold tracking-normal">Today's Tasks</h2>
          <button onClick={() => onTabChange("planner")} className="font-body text-xs text-muted-foreground">View All</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            ["To Do", 4],
            ["In Progress", 2],
            ["In Review", 3],
          ].map(([label, count], index) => (
            <button key={label as string} className={`rounded-full py-3 font-body text-xs font-semibold whitespace-nowrap ${index === 0 ? "bg-[#d9f06e] text-foreground" : "bg-white/82 text-foreground shadow-sm"}`}>
              {count as number} <span className="ml-1">{label as string}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <button key={task.label} onClick={() => onTabChange(task.tab)} className="w-full rounded-[24px] bg-white p-4 text-left shadow-sm border border-white/70">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border px-3 py-1.5 font-body text-[10px] font-semibold mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {task.priority}
                  </span>
                  <p className="font-body text-[15px] font-semibold">{task.label}</p>
                  <p className="font-body text-xs text-muted-foreground mt-5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{task.time}</p>
                </div>
                <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
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
    { time: "9:00 AM", title: "Meeting with Client", detail: "Review RSVP progress, guest flow, and final open tasks.", action: "Meet" },
    { time: "11:00 AM", title: "Wedding Page Review", detail: "Check story, venue, gallery, and RSVP sections.", action: "Review" },
    { time: "2:00 PM", title: "Pending RSVP Follow-up", detail: `${pending} guest${pending === 1 ? "" : "s"} still need a reminder.`, action: "Copy Link" },
    ...events.slice(0, 3).map((event: any) => ({ time: event.event_time || "4:00 PM", title: event.title, detail: event.location || "Wedding event", action: "Open" })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm font-semibold">{date.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" })}</p>
          <h1 className="font-body text-[32px] font-semibold leading-tight tracking-normal mt-1">Task Schedule</h1>
        </div>
        <button onClick={() => onTabChange("add-task")} className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center" aria-label="Add task">
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
        {["All", "Work", "Personal", "Wedding"].map((filter, index) => (
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
                <button onClick={() => onTabChange("website")} className="px-3 py-2 rounded-full bg-blue-600 text-white font-body text-[10px] font-semibold">
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

function AddTaskScreen({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="space-y-5 pt-1">
      <div className="h-2" />
      <Field label="Task Title">
        <input className="w-full rounded-[20px] border-0 bg-white px-5 py-4 font-body text-sm outline-none shadow-sm" defaultValue="Finish landing page design" />
      </Field>
      <Field label="Description">
        <textarea className="w-full rounded-[20px] border-0 bg-white px-5 py-4 font-body text-sm leading-6 outline-none shadow-sm resize-none" rows={3} defaultValue="Design the new landing page for the product launch." />
      </Field>
      <Field label="Due Date & time">
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-full bg-white px-4 py-4 font-body text-xs text-left shadow-sm flex items-center gap-2"><CalendarDays className="w-4 h-4" /> April 14, 2026</button>
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
      <Field label="Project">
        <button className="w-full rounded-[20px] bg-white px-5 py-4 font-body text-sm shadow-sm flex items-center justify-between">
          <span className="flex items-center gap-2"><BriefcaseBusiness className="w-4 h-4 text-violet-600" /> Wedding Redesign</span>
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </Field>
      <Field label="Tags">
        <div className="flex flex-wrap gap-2">
          {["Design", "UI/UX", "Work"].map((tag) => (
            <button key={tag} className="rounded-full border border-violet-500/60 bg-violet-100/50 px-4 py-2 font-body text-xs text-violet-700 flex items-center gap-1.5">
              {tag} <X className="w-3 h-3" />
            </button>
          ))}
          <button className="rounded-full bg-white/70 px-4 py-2 font-body text-xs text-muted-foreground">+ Add</button>
        </div>
      </Field>
      <button onClick={onCreate} className="w-full rounded-[22px] bg-black py-5 font-body text-sm font-semibold text-white shadow-xl">Create Task</button>
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
  const copyLink = () => {
    navigator.clipboard.writeText(weddingUrl);
    toast.success("Wedding link copied.");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[30px] bg-white border border-white/80 overflow-hidden shadow-sm">
        <div className="relative h-56">
          <img src={wedding.cover_image || wedding.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute left-5 right-5 bottom-5 text-white">
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img src={wedding.cover_image || wedding.hero_image} alt="" className="h-full w-full object-cover" />
            </div>
            <h1 className="font-body text-2xl font-semibold tracking-normal leading-tight">{wedding.couple_names}</h1>
            <p className="font-body text-xs text-white/70 mt-1">/{weddingSlug}</p>
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

          <button onClick={onEditDetails} className="w-full rounded-full bg-foreground text-background py-4 font-body text-xs tracking-[0.16em] uppercase">Edit Profile</button>

          <div className="space-y-2">
            {[
              { label: wedding.wedding_date || "Wedding date not set", icon: CalendarDays },
              { label: wedding.ceremony_venue || "Venue not set", icon: MapPin },
              { label: `Access code ${accessCode || wedding.access_code || "not set"}`, icon: ShieldCheck },
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
