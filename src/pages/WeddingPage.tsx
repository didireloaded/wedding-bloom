import { lazy, Suspense, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  const [invitationOpen, setInvitationOpen] = useState(false);
  const { wedding, events, gallery, updates, loading } = useWeddingData(slug);
  const [unpublishedWedding, setUnpublishedWedding] = useState<any>(null);
  const [guestTab, setGuestTab] = useState("home");

  useEffect(() => {
    const checkUnpublished = async () => {
      if (!loading && !wedding && slug) {
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
  }, [loading, wedding, slug]);

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
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
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
  const handleGuestAction = (tab: string) => {
    setGuestTab(tab);
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
      {!invitationOpen && (
        <InvitationOverlay
          coupleNames={wedding.couple_names}
          date={weddingDate}
          venue={wedding.ceremony_venue}
          onOpen={() => setInvitationOpen(true)}
        />
      )}

      <div
        className="min-h-screen"
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
        <GuestWeddingRealtime
          weddingId={wedding.id}
          onEvent={() => window.dispatchEvent(new CustomEvent("forevervow:guest-realtime"))}
        />
        {weddingPhase === "wedding_day" || weddingPhase === "live" ? (
          <div className="sticky top-0 z-40 bg-[#202020] px-5 py-3 text-center text-white shadow-lg">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em]">{weddingPhase === "live" ? "Wedding Live" : "Today's the Day"}</p>
            <p className="mt-1 font-body text-xs text-white/70">{wedding.couple_names} · Your schedule and celebration are ready.</p>
          </div>
        ) : null}
        {/* 2. Nav */}
        <WeddingNav coupleNames={wedding.couple_names} />

        <div className="md:hidden"><GuestHome wedding={wedding} phase={weddingPhase} guestState="unknown_guest" onAction={handleGuestAction} /><NotificationPrompt weddingId={wedding.id} coupleNames={wedding.couple_names} guestSession={getGuestSessionToken(wedding.id)} /></div>

        {/* 3. Hero */}
        <WeddingHero
          coupleNames={wedding.couple_names}
          date={weddingDate}
          venue={wedding.ceremony_venue}
          coverImage={wedding.cover_image}
          weddingDate={wedding.wedding_date}
          ceremonyTime={wedding.ceremony_time}
        />

        {/* 4. Countdown */}
        {wedding.wedding_date && <WeddingCountdown weddingDate={wedding.wedding_date} />}

        {/* 5. Our Story */}
        {wedding.story && (
          <div id="our-story">
            <WeddingStory
              story={wedding.story}
              weddingDate={wedding.wedding_date}
              onAddToCalendar={handleAddToCalendar}
              storyImage={(wedding as any).story_image}
            />
          </div>
        )}

        {/* 6. Events */}
        {events.length > 0 && (
          <div id="events">
            <EventTimeline events={events} />
          </div>
        )}

        {/* 7. Venue */}
        {wedding.ceremony_venue && (
          <LazyVisible>
            <div id="venue">
              <VenueSection
                ceremonyVenue={wedding.ceremony_venue}
                receptionVenue={wedding.reception_venue}
                weddingDate={wedding.wedding_date}
                ceremonyTime={wedding.ceremony_time}
                coupleNames={wedding.couple_names}
              />
            </div>
          </LazyVisible>
        )}

        <div id="checkin" />

        {wedding.ceremony_venue && (
          <LazyVisible>
            <SmartArrivalCheckin
              weddingId={wedding.id}
              coupleNames={wedding.couple_names}
              venue={wedding.ceremony_venue}
              venueLatitude={(wedding as any).venue_latitude}
              venueLongitude={(wedding as any).venue_longitude}
              checkinRadiusMeters={(wedding as any).checkin_radius_meters}
            />
          </LazyVisible>
        )}

        {/* 8. Dress Code */}
        {wedding.dress_code && <DressCodeSection dressCode={wedding.dress_code} />}

        {/* 9. Updates */}
        {updates.length > 0 && (
          <LazyVisible>
            <WeddingUpdates updates={updates} />
          </LazyVisible>
        )}

        {/* 10. RSVP */}
        <div id="rsvp"><RSVPSection
          weddingId={wedding.id} weddingDate={wedding.wedding_date} ceremonyTime={wedding.ceremony_time}
          venue={wedding.ceremony_venue || ""} coupleNames={wedding.couple_names}
          rsvpDeadline={(wedding as any).rsvp_deadline} whatsappGroupUrl={(wedding as any).whatsapp_group_url}
          maxGuests={(wedding as any).max_guests} rsvpImage={(wedding as any).rsvp_image}
        /></div>

        {/* 11. Guestbook */}
        <LazyVisible>
          <div id="guestbook">
            <Guestbook weddingId={wedding.id} coupleNames={wedding.couple_names} />
          </div>
        </LazyVisible>

        {/* 12. Guest Photo Wall */}
        <LazyVisible>
          <div id="memories">
            <GuestPhotoWall weddingId={wedding.id} />
          </div>
        </LazyVisible>

        {/* 12.5. Live Feed */}
        <LazyVisible>
          <div id="live-feed">
            <LiveFeed
              weddingId={wedding.id}
              coupleNames={wedding.couple_names}
              isLiveMode={wedding.live_mode}
            />
          </div>
        </LazyVisible>

        {/* 13. Photo Gallery */}
        {gallery.length > 0 && (
          <LazyVisible>
            <div id="gallery">
              <PhotoGallery images={gallery} />
            </div>
          </LazyVisible>
        )}

        {/* 14. Accommodation */}
        <LazyVisible>
          <AccommodationSection weddingId={wedding.id} />
        </LazyVisible>

        {/* 15. Footer */}
        <WeddingFooter coupleNames={wedding.couple_names} date={weddingDate} venue={wedding.ceremony_venue} />

        {/* 16. Chat Assistant */}
        <LazyVisible>
          <WeddingChatAssistant weddingData={wedding} events={events} gallery={gallery} updates={updates} />
        </LazyVisible>

        <div className="md:hidden"><GuestBottomNav tabs={guestExperience.tabs} active={guestTab} onChange={handleGuestAction} /></div>
      </div>
    </>
  );
};

export default WeddingPage;
