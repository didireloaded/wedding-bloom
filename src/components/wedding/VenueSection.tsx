import { motion } from "framer-motion";
import { MapPin, Navigation, Map, CalendarPlus, Martini, Music, Camera, Gift, Utensils, DoorOpen } from "lucide-react";
import { generateICS } from "@/lib/calendarUtils";

interface VenueSectionProps {
  ceremonyVenue?: string;
  receptionVenue?: string;
  weddingDate?: string | null;
  ceremonyTime?: string | null;
  coupleNames?: string;
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

const getSmartDirectionsUrl = (query: string) => {
  if (isIOS()) {
    return `maps://maps.apple.com/?q=${encodeURIComponent(query)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const VenueSection = ({ ceremonyVenue = "Villa Cimbrone Gardens", receptionVenue = "The Grand Hall", weddingDate, ceremonyTime, coupleNames }: VenueSectionProps) => {
  const mapQuery = encodeURIComponent(ceremonyVenue);
  const venuePoints = [
    { label: "Entrance", detail: "Start here for arrivals and check-in.", className: "left-[42%] bottom-[8%]", icon: DoorOpen },
    { label: "Ceremony", detail: ceremonyVenue, className: "left-[35%] top-[14%]", icon: MapPin },
    { label: "Reception", detail: receptionVenue || "Reception area", className: "right-[16%] top-[34%]", icon: Utensils },
    { label: "Bar", detail: "Drinks and refreshments.", className: "left-[10%] top-[38%]", icon: Martini },
    { label: "Dance Floor", detail: "Music, first dance and late-night celebration.", className: "left-[34%] bottom-[32%]", icon: Music },
    { label: "Photo Booth", detail: "Capture memories for the couple.", className: "right-[10%] bottom-[18%]", icon: Camera },
    { label: "Gift Table", detail: "Cards, gifts and keepsakes.", className: "left-[13%] bottom-[18%]", icon: Gift },
  ];

  return (
    <section className="wedding-section bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="wedding-label mb-4">LOCATION</p>
          <h2 className="wedding-heading">The Venue</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/3] overflow-hidden border border-border/50 shadow-lg shadow-foreground/5"
          >
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Wedding venue map"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-wedding-champagne flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-wedding-gold" strokeWidth={1.5} />
                </div>
                <p className="wedding-label">CEREMONY</p>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-light">{ceremonyVenue}</h3>
            </div>

            <div className="wedding-divider !mx-0" />

            {receptionVenue && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-wedding-champagne flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-wedding-gold" strokeWidth={1.5} />
                  </div>
                  <p className="wedding-label">RECEPTION</p>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-light">{receptionVenue}</h3>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={getSmartDirectionsUrl(ceremonyVenue)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 font-body text-[10px] tracking-[0.25em] uppercase hover:bg-foreground/85 transition-all duration-300 min-h-[52px]"
              >
                <Navigation className="w-3.5 h-3.5" /> GET DIRECTIONS
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-foreground/15 px-8 py-4 font-body text-[10px] tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-all duration-300 min-h-[52px]"
              >
                <Map className="w-3.5 h-3.5" /> OPEN IN GOOGLE MAPS
              </a>
              {weddingDate && (
                <button
                  onClick={() => generateICS(coupleNames || "", weddingDate, ceremonyTime || null, ceremonyVenue, window.location.href)}
                  className="inline-flex items-center justify-center gap-3 border border-foreground/15 px-8 py-4 font-body text-[10px] tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-all duration-300 min-h-[52px]"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> ADD TO CALENDAR
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16"
        >
          <div className="mb-8 text-center">
            <p className="wedding-label mb-4">EXPLORE THE VENUE</p>
            <h3 className="font-display text-3xl md:text-5xl font-light">Event Map</h3>
            <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-7 text-muted-foreground">
              Once you arrive, use this layout to find the ceremony, reception, photos, gifts and celebration spaces.
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/3] max-w-3xl overflow-hidden border border-border/60 bg-[linear-gradient(145deg,hsl(var(--wedding-blush)),hsl(var(--wedding-ivory))_48%,hsl(var(--wedding-champagne)))] p-5 shadow-xl shadow-foreground/5">
            <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-foreground/15 bg-background/75 px-8 py-3 text-center font-body text-[10px] font-semibold uppercase tracking-[0.25em]">
              Stage
            </div>
            <div className="absolute left-[26%] top-[30%] h-16 w-24 rounded-full border border-foreground/10 bg-background/55" />
            <div className="absolute right-[25%] top-[30%] h-16 w-24 rounded-full border border-foreground/10 bg-background/55" />
            <div className="absolute left-[24%] bottom-[28%] h-16 w-24 rounded-full border border-foreground/10 bg-background/55" />
            <div className="absolute right-[24%] bottom-[28%] h-16 w-24 rounded-full border border-foreground/10 bg-background/55" />
            <div className="absolute left-1/2 bottom-[33%] -translate-x-1/2 rounded-full border border-wedding-gold/40 bg-background/75 px-6 py-3 font-body text-[10px] uppercase tracking-[0.2em]">
              Table 7 · You
            </div>

            {venuePoints.map((point) => {
              const Icon = point.icon;
              return (
                <button
                  key={point.label}
                  title={`${point.label}: ${point.detail}`}
                  className={`absolute ${point.className} group flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="pointer-events-none absolute left-1/2 top-11 z-10 w-36 -translate-x-1/2 rounded-xl bg-foreground px-3 py-2 text-center font-body text-[10px] leading-4 text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                    <strong className="block">{point.label}</strong>
                    {point.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VenueSection;
