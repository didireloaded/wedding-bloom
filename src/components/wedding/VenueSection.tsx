import { motion } from "framer-motion";
import { MapPin, Navigation, Map, CalendarPlus } from "lucide-react";
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
      </div>
    </section>
  );
};

export default VenueSection;
