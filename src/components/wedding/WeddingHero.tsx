import { motion } from "framer-motion";
import { ChevronDown, CalendarPlus } from "lucide-react";
import { generateICS } from "@/lib/calendarUtils";

interface WeddingHeroProps {
  coupleNames?: string;
  date?: string;
  venue?: string;
  coverImage?: string | null;
  weddingDate?: string | null;
  ceremonyTime?: string | null;
}

const WeddingHero = ({ coupleNames = "John & Anna", date = "24 JUNE 2026", venue = "TUSCANY, ITALY", coverImage, weddingDate, ceremonyTime }: WeddingHeroProps) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {coverImage ? <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          src={coverImage}
          alt="Wedding couple"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 20%' }}
        /> : <div className="absolute inset-0 bg-[linear-gradient(145deg,#eecfc3_0%,#c7b6dc_55%,#202020_100%)]" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="wedding-ornament mb-6"
        >
          <span className="font-body text-[10px] sm:text-xs tracking-[0.4em] uppercase text-primary-foreground/70">
            Together with their families
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-light text-primary-foreground leading-[0.9] tracking-wide"
        >
          {coupleNames}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-8 sm:mt-10"
        >
          <div className="wedding-divider !bg-primary-foreground/30 mb-6" />
          <p className="font-body text-[10px] sm:text-xs tracking-[0.4em] uppercase text-primary-foreground/80">
            {date}
          </p>
          {venue && (
            <p className="font-body text-[10px] sm:text-xs tracking-[0.3em] uppercase text-primary-foreground/60 mt-2">
              {venue}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-10 sm:mt-12 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* RSVP — solid, dominant */}
            <span className="relative inline-flex">
              <span className="absolute inset-0 ring-2 ring-primary-foreground/30 ring-offset-2 ring-offset-transparent animate-pulse rounded-sm" />
              <a
                href="#rsvp"
                className="relative inline-flex items-center bg-foreground text-background px-10 sm:px-14 py-3.5 font-body text-[10px] tracking-[0.35em] uppercase hover:bg-foreground/90 transition-all duration-300 min-h-[48px]"
              >
                RSVP
              </a>
            </span>
            {weddingDate && (
              <button
                onClick={() => generateICS(coupleNames, weddingDate, ceremonyTime || null, venue || "", window.location.href)}
                className="inline-flex items-center gap-2 border border-primary-foreground/25 text-primary-foreground/80 px-8 py-3.5 font-body text-[10px] tracking-[0.25em] uppercase hover:bg-primary-foreground/10 transition-all duration-300 min-h-[48px]"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> ADD TO CALENDAR
              </button>
            )}
          </div>
          <a
            href="#our-story"
            className="font-body text-[9px] tracking-[0.25em] uppercase text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors mt-2"
          >
            ↓ See full details
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[8px] tracking-[0.3em] uppercase text-primary-foreground/50">
          Scroll
        </span>
        <ChevronDown className="w-4 h-4 text-primary-foreground/40 scroll-indicator" />
      </motion.div>
    </section>
  );
};

export default WeddingHero;
