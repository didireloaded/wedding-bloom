import { lazy, Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useWeddingData } from "@/hooks/useWeddingData";
import { useLazySection } from "@/hooks/useLazySection";
import { supabase } from "@/integrations/supabase/client";
import { generateICS } from "@/lib/calendarUtils";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import WeddingNav from "@/components/wedding/WeddingNav";
import WeddingHero from "@/components/wedding/WeddingHero";
import InvitationOverlay from "@/components/wedding/InvitationOverlay";
import WeddingCountdown from "@/components/wedding/WeddingCountdown";
import WeddingStory from "@/components/wedding/WeddingStory";
import EventTimeline from "@/components/wedding/EventTimeline";
import DressCodeSection from "@/components/wedding/DressCodeSection";
import RSVPSection from "@/components/wedding/RSVPSection";
import WeddingFooter from "@/components/wedding/WeddingFooter";
import { Helmet } from "react-helmet-async";
import { getWeddingPhase } from "@/lib/weddingPhase";
import { resolveGuestExperience } from "@/lib/guestExperience";
import GuestBottomNav from "@/components/wedding/GuestBottomNav";
import GuestHome from "@/components/wedding/GuestHome";
import NotificationPrompt from "@/components/wedding/NotificationPrompt";
import { getGuestSessionToken } from "@/lib/guestSession";
import { GuestWeddingRealtime } from "@/components/realtime/WeddingRealtime";
import { ArrowLeft, Bell, BookOpen, Images, MessageCircle } from "lucide-react";

const VenueSection = lazy(() => import("@/components/wedding/VenueSection"));
const PhotoGallery = lazy(() => import("@/components/wedding/PhotoGallery"));
const GuestPhotoWall = lazy(() => import("@/components/wedding/GuestPhotoWall"));
const AccommodationSection = lazy(() => import("@/components/wedding/AccommodationSection"));
const WeddingUpdates = lazy(() => import("@/components/wedding/WeddingUpdates"));
const WeddingChatAssistant = lazy(() => import("@/components/wedding/WeddingChatAssistant"));
const Guestbook = lazy(() => import("@/components/wedding/Guestbook"));
const LiveFeed = lazy(() => import("@/components/wedding/LiveFeed"));
const SmartArrivalCheckin = lazy(() => import("@/components/wedding/SmartArrivalCheckin"));

const SectionPlaceholder = () => (
  <div className="py-20 flex justify-center">
    <div className="w-6 h-6 border border-wedding-gold/30 border-t-wedding-gold rounded-full animate-spin" />
  </div>
);

const GUEST_VIEWS = new Set(["home", "schedule", "venue", "directions", "map", "rsvp", "more", "story", "wall", "photos", "moments", "capture", "checkin"]);

const LazyVisible = ({ children, rootMargin = "300px" }: { children: React.ReactNode; rootMargin?: string }) => {
  const { ref, isVisible } = useLazySection(rootMargin);
  return (
    <div ref={ref}>
      {isVisible ? (
        <SectionErrorBoundary>
          <Suspense fallback={<SectionPlaceholder />}>{children}</Suspense>
        </SectionErrorBoundary>
      ) : (
        <div className="min-h-[200px]" />
      )}
    </div>
  );
};

const WeddingPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isPreview = slug === "preview" && searchParams.get("preview") === "1";
  const [invitationOpen, setInvitationOpen] = useState(isPreview);
  const weddingData = useWeddingData(isPreview ? undefined : slug);
  const wedding = isPreview ? previewWedding : weddingData.wedding;
  const events = isPreview ? previewEvents : weddingData.events;
  const gallery = isPreview ? previewGallery : weddingData.gallery;
  const updates = isPreview ? previewUpdates : weddingData.updates;
  const loading = isPreview ? false : weddingData.loading;
  const [unpublishedWedding, setUnpublishedWedding] = useState<any>(null);
  const requestedView = searchParams.get("view") || "home";
  const [guestTab, setGuestTab] = useState(GUEST_VIEWS.has(requestedView) ? requestedView : "home");

  useEffect(() => {
    const checkUnpublished = async () => {
      if (!isPreview && !loading && !wedding && slug) {
        const { data } = await supabase
          .from("weddings")
          .select("id, couple_names, published")
          .eq("slug", slug)
          .single();
        if (data && !data.published) {
          setUnpublishedWedding(data);
        }
      }
    };
    checkUnpublished();
  }, [isPreview, loading, wedding, slug]);

  useEffect(() => {
    if (loading || !wedding || !window.location.hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loading, wedding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border border-wedding-gold/30 border-t-wedding-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="wedding-label">Loading...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    if (unpublishedWedding) {
      return (
        <div className="guest-app min-h-screen flex items-center justify-center bg-background px-6">
          <div className="text-center max-w-md">
            <h1 className="font-display text-3xl sm:text-4xl font-light mb-4">Not Yet Published</h1>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              The wedding page for <strong>{unpublishedWedding.couple_names}</strong> hasn't been published yet.
              Publish it from the Admin Dashboard to make it live.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="guest-app min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-light mb-4">Wedding Not Found</h1>
          <p className="font-body text-sm text-muted-foreground">This wedding page may not exist or hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()
    : "";
  const weddingPhase = getWeddingPhase(wedding, events);
  const guestExperience = resolveGuestExperience(weddingPhase, "unknown_guest");
  const isPreWedding = weddingPhase === "upcoming" || weddingPhase === "rsvp_closing";
  const isWeddingDay = weddingPhase === "wedding_day" || weddingPhase === "live";
  const isPostWedding = weddingPhase === "completed" || weddingPhase === "archive";
  const handleGuestAction = (tab: string) => {
    setGuestTab(tab);
    if (window.matchMedia("(max-width: 767px)").matches) {
      const nextParams = new URLSearchParams(searchParams);
      if (tab === "home") nextParams.delete("view");
      else nextParams.set("view", tab);
      setSearchParams(nextParams, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = tab === "schedule" ? "events" : tab === "venue" || tab === "directions" || tab === "map" ? "venue" : tab === "rsvp" ? "rsvp" : tab === "checkin" ? "checkin" : tab === "photos" || tab === "moments" || tab === "wall" ? "memories" : null;
    if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddToCalendar = () => {
    if (wedding.wedding_date) {
      generateICS(
        wedding.couple_names,
        wedding.wedding_date,
        wedding.ceremony_time || null,
        wedding.ceremony_venue || "",
        window.location.href
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>{wedding.couple_names} — Wedding</title>
        <meta name="description" content={`Join us to celebrate the wedding of ${wedding.couple_names}${weddingDate ? ` on ${weddingDate}` : ""}.`} />
        <meta property="og:title" content={`${wedding.couple_names} — Wedding`} />
        <meta property="og:description" content={`Celebrate with ${wedding.couple_names}${weddingDate ? ` on ${weddingDate}` : ""}.`} />
        {wedding.cover_image && <meta property="og:image" content={wedding.cover_image} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* 1. Invitation Overlay */}
      {isPreWedding && !invitationOpen && (
        <InvitationOverlay
          coupleNames={wedding.couple_names}
          date={weddingDate}
          venue={wedding.ceremony_venue}
          onOpen={() => setInvitationOpen(true)}
        />
      )}

      <div
        className="guest-app min-h-screen"
        style={wedding.theme && typeof wedding.theme === 'object' && !Array.isArray(wedding.theme) ? {
          '--background': (wedding.theme as Record<string, string>).background,
          '--foreground': (wedding.theme as Record<string, string>).foreground,
          '--primary': (wedding.theme as Record<string, string>).primary || undefined,
          '--accent': (wedding.theme as Record<string, string>).accent || undefined,
          '--wedding-gold': (wedding.theme as Record<string, string>).accent || undefined,
          backgroundColor: `hsl(${(wedding.theme as Record<string, string>).background})`,
          color: `hsl(${(wedding.theme as Record<string, string>).foreground})`,
        } as React.CSSProperties : undefined}
      >
        {!isPreview && <GuestWeddingRealtime weddingId={wedding.id} onEvent={() => window.dispatchEvent(new CustomEvent("forevervow:guest-realtime"))} />}
        {weddingPhase === "wedding_day" || weddingPhase === "live" ? (
          <div className="sticky top-0 z-40 bg-[#202020] px-5 py-3 text-center text-white shadow-lg">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em]">{weddingPhase === "live" ? "Wedding Live" : "Today's the Day"}</p>
            <p className="mt-1 font-body text-xs text-white/70">{wedding.couple_names} · Your schedule and celebration are ready.</p>
          </div>
        ) : null}
        {/* 2. Nav */}
        <div className="hidden md:block"><WeddingNav coupleNames={wedding.couple_names} /></div>

        <div className="md:hidden">
          {guestTab === "home" && <GuestHome wedding={wedding} phase={weddingPhase} guestState="unknown_guest" onAction={handleGuestAction} />}
          {guestTab === "more" && <GuestMore wedding={wedding} hasUpdates={updates.length > 0} onAction={handleGuestAction} />}
          {["story", "wall", "photos", "moments"].includes(guestTab) && <MobileBack title={guestTab === "story" ? "Our story" : guestTab === "wall" ? "Guestbook" : guestTab === "photos" ? "Photos" : "Updates"} onBack={() => handleGuestAction("more")} />}
          {!isPreview && guestTab === "home" && <NotificationPrompt weddingId={wedding.id} coupleNames={wedding.couple_names} guestSession={getGuestSessionToken(wedding.id)} />}
        </div>

        {/* 3. Hero */}
        <div className="hidden md:block"><WeddingHero coupleNames={wedding.couple_names} date={weddingDate} venue={wedding.ceremony_venue} coverImage={wedding.cover_image} weddingDate={wedding.wedding_date} ceremonyTime={wedding.ceremony_time} /></div>

        {/* 4. Countdown */}
        {isPreWedding && wedding.wedding_date && <div className="hidden md:block"><WeddingCountdown weddingDate={wedding.wedding_date} /></div>}

        {/* 5. Our Story */}
        {wedding.story && (
          <div id="our-story" className={`${guestTab === "story" ? "block" : "hidden"} md:block`}>
            <WeddingStory
              story={wedding.story}
              weddingDate={wedding.wedding_date}
              onAddToCalendar={handleAddToCalendar}
              storyImage={(wedding as any).story_image}
            />
          </div>
        )}

        {/* 6. Events */}
        {!isPostWedding && events.length > 0 && (
          <div id="events" className={`${guestTab === "schedule" ? "block" : "hidden"} md:block`}>
            <EventTimeline events={events} />
          </div>
        )}

        {/* 7. Venue */}
        {!isPostWedding && wedding.ceremony_venue && (
          <div className={`${["venue", "directions", "map"].includes(guestTab) ? "block" : "hidden"} md:block`}><LazyVisible>
            <div id="venue">
              <VenueSection
                ceremonyVenue={wedding.ceremony_venue}
                receptionVenue={wedding.reception_venue}
                weddingDate={wedding.wedding_date}
                ceremonyTime={wedding.ceremony_time}
                coupleNames={wedding.couple_names}
              />
            </div>
          </LazyVisible></div>
        )}

        <div id="checkin" />

        {isWeddingDay && wedding.ceremony_venue && (
          <div className={`${guestTab === "checkin" ? "block" : "hidden"} md:block`}><LazyVisible>
            <SmartArrivalCheckin
              weddingId={wedding.id}
              coupleNames={wedding.couple_names}
              venue={wedding.ceremony_venue}
              venueLatitude={(wedding as any).venue_latitude}
              venueLongitude={(wedding as any).venue_longitude}
              checkinRadiusMeters={(wedding as any).checkin_radius_meters}
            />
          </LazyVisible></div>
        )}

        {/* 8. Dress Code */}
        {!isPostWedding && wedding.dress_code && <div className="hidden md:block"><DressCodeSection dressCode={wedding.dress_code} /></div>}

        {/* 9. Updates */}
        {updates.length > 0 && (
          <div className={`${guestTab === "moments" ? "block" : "hidden"} md:block`}><LazyVisible>
            <WeddingUpdates updates={updates} />
          </LazyVisible></div>
        )}

        {/* 10. RSVP */}
        {isPostWedding ? (
          <section id="rsvp" className={`${guestTab === "rsvp" ? "block" : "hidden"} wedding-section bg-black/[0.04] md:block`}>
            <div className="mx-auto max-w-xl text-center">
              <p className="font-body text-xs font-semibold text-muted-foreground">The celebration continues</p>
              <h2 className="mt-3 font-body text-3xl font-semibold">Share a favorite memory</h2>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-muted-foreground">The RSVP window has closed, but your photos and messages are still welcome.</p>
              <a href="#memories" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-foreground px-6 py-3 font-body text-xs font-semibold text-background">Open memories</a>
            </div>
          </section>
        ) : isWeddingDay ? (
          <section id="rsvp" className={`${guestTab === "rsvp" ? "block" : "hidden"} wedding-section bg-black/[0.04] md:block`}>
            <div className="mx-auto max-w-xl text-center">
              <p className="font-body text-xs font-semibold text-muted-foreground">Today is the day</p>
              <h2 className="mt-3 font-body text-3xl font-semibold">Welcome to the celebration</h2>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-muted-foreground">RSVPs are closed. Check in when you arrive so the couple knows you are here.</p>
              <a href="#checkin" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-foreground px-6 py-3 font-body text-xs font-semibold text-background">Check in</a>
            </div>
          </section>
        ) : (
          <div id="rsvp" className={`${guestTab === "rsvp" ? "block" : "hidden"} md:block`}><RSVPSection
            weddingId={wedding.id} weddingDate={wedding.wedding_date} ceremonyTime={wedding.ceremony_time}
            venue={wedding.ceremony_venue || ""} coupleNames={wedding.couple_names}
            rsvpDeadline={(wedding as any).rsvp_deadline} whatsappGroupUrl={(wedding as any).whatsapp_group_url}
            maxGuests={(wedding as any).max_guests} rsvpImage={(wedding as any).rsvp_image}
          /></div>
        )}

        {/* 11. Guestbook */}
        <div className={`${guestTab === "wall" ? "block" : "hidden"} md:block`}><LazyVisible>
          <div id="guestbook">
            <Guestbook weddingId={wedding.id} coupleNames={wedding.couple_names} />
          </div>
        </LazyVisible></div>

        {/* 12. Guest Photo Wall */}
        <div className={`${["photos", "capture"].includes(guestTab) ? "block" : "hidden"} md:block`}><LazyVisible>
          <div id="memories">
            <GuestPhotoWall weddingId={wedding.id} />
          </div>
        </LazyVisible></div>

        {/* 12.5. Live Feed */}
        {(isWeddingDay || isPostWedding) && <div className={`${guestTab === "moments" ? "block" : "hidden"} md:block`}><LazyVisible>
          <div id="live-feed"><LiveFeed weddingId={wedding.id} coupleNames={wedding.couple_names} isLiveMode={wedding.live_mode} /></div>
        </LazyVisible></div>}

        {/* 13. Photo Gallery */}
        {gallery.length > 0 && (
          <div className={`${guestTab === "photos" ? "block" : "hidden"} md:block`}><LazyVisible>
            <div id="gallery">
              <PhotoGallery images={gallery} />
            </div>
          </LazyVisible></div>
        )}

        {/* 14. Accommodation */}
        {isPreWedding && <div className={`${["venue", "directions", "map"].includes(guestTab) ? "block" : "hidden"} md:block`}><LazyVisible><AccommodationSection weddingId={wedding.id} /></LazyVisible></div>}

        {/* 15. Footer */}
        <div className="hidden md:block"><WeddingFooter coupleNames={wedding.couple_names} date={weddingDate} venue={wedding.ceremony_venue} /></div>

        {/* 16. Chat Assistant */}
        {!isPostWedding && <div className="hidden md:block"><LazyVisible><WeddingChatAssistant weddingData={wedding} events={events} gallery={gallery} updates={updates} /></LazyVisible></div>}

        <div className="md:hidden"><GuestBottomNav tabs={guestExperience.tabs} active={guestTab} onChange={handleGuestAction} /></div>
      </div>
    </>
  );
};

export default WeddingPage;

const previewWedding = {
  id: "preview-wedding",
  slug: "preview",
  couple_names: "Elara & Julian",
  wedding_date: "2026-11-21",
  ceremony_time: "15:30:00",
  ceremony_venue: "Glasshouse Garden Chapel",
  reception_venue: "Willow Estate Hall",
  cover_image: null,
  story_image: null,
  story: "What began as an ordinary introduction became a life built around laughter, long conversations, and a shared love of bringing people together.",
  dress_code: "Garden formal",
  published: true,
  live_mode: false,
  theme: null,
};

const previewEvents = [
  { id: "preview-ceremony", title: "Ceremony", event_time: "15:30:00", location: "Glasshouse Garden Chapel", description: "Please arrive 20 minutes early.", sort_order: 0 },
  { id: "preview-cocktails", title: "Cocktail hour", event_time: "17:00:00", location: "Willow Estate Lawn", description: "Drinks and canapes on the lawn.", sort_order: 1 },
  { id: "preview-reception", title: "Reception", event_time: "18:00:00", location: "Willow Estate Hall", description: "Dinner and dancing follow.", sort_order: 2 },
];

const previewGallery: { id: string; image_url: string }[] = [];

const previewUpdates = [
  { id: "preview-update", message: "We cannot wait to celebrate with you. Please RSVP when you are ready.", created_at: "2026-09-04T12:00:00Z" },
];

function MobileBack({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="flex items-center gap-3 px-5 pb-2 pt-8"><button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-black text-white" aria-label="Back to more"><ArrowLeft className="h-4 w-4" /></button><h1 className="font-body text-2xl font-semibold">{title}</h1></header>;
}

function GuestMore({ wedding, hasUpdates, onAction }: { wedding: any; hasUpdates: boolean; onAction: (tab: string) => void }) {
  const items = [
    wedding.story && { id: "story", label: "Our story", detail: "How the couple found each other", icon: BookOpen },
    { id: "wall", label: "Guestbook", detail: "Leave a message for the couple", icon: MessageCircle },
    { id: "photos", label: "Photos", detail: "Share and view wedding memories", icon: Images },
    hasUpdates && { id: "moments", label: "Wedding updates", detail: "The latest news from the celebration", icon: Bell },
  ].filter(Boolean) as { id: string; label: string; detail: string; icon: typeof Bell }[];
  return <section className="mx-auto min-h-[calc(100dvh-96px)] max-w-xl px-5 pb-28 pt-10"><p className="font-body text-xs font-semibold text-muted-foreground">More from the wedding</p><h1 className="mt-2 font-body text-3xl font-semibold">{wedding.couple_names}</h1><div className="mt-6 space-y-3">{items.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => onAction(item.id)} className="flex w-full items-center gap-4 rounded-[22px] bg-white p-4 text-left shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"><Icon className="h-4 w-4" /></span><span><span className="block font-body text-sm font-semibold">{item.label}</span><span className="mt-1 block font-body text-xs text-muted-foreground">{item.detail}</span></span></button>; })}</div><div className="mt-6 rounded-[22px] bg-black/[0.04] p-4"><p className="font-body text-sm font-semibold">Wedding details</p><p className="mt-2 font-body text-xs leading-5 text-muted-foreground">{wedding.wedding_date || "Date to be confirmed"}<br />{wedding.ceremony_venue || "Venue to be confirmed"}<br />{wedding.dress_code || "Dress code to be confirmed"}</p></div></section>;
}
