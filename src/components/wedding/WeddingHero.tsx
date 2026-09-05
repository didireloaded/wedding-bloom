import { motion } from "framer-motion";
import { CalendarPlus, MapPin } from "lucide-react";
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
    <section className="relative flex min-h-[560px] max-h-[720px] h-[78vh] items-end overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12 text-left md:px-10 md:pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mb-4"
        >
          <span className="inline-flex rounded-full bg-white/15 px-3 py-2 font-body text-xs font-semibold text-white backdrop-blur-md">
            Wedding companion
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="max-w-3xl font-body text-5xl font-semibold leading-[0.96] text-white sm:text-6xl md:text-7xl"
        >
          {coupleNames}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-5"
        >
          <p className="font-body text-sm font-medium text-white/90">{date}</p>
          {venue && (
            <p className="mt-2 flex items-center gap-2 font-body text-sm text-white/70"><MapPin className="h-4 w-4" />
              {venue}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative inline-flex">
              <a
                href="#rsvp"
                className="relative inline-flex min-h-12 items-center rounded-full bg-white px-8 py-3.5 font-body text-xs font-semibold text-black transition-colors hover:bg-white/90"
              >
                RSVP
              </a>
            </span>
            {weddingDate && (
              <button
                onClick={() => generateICS(coupleNames, weddingDate, ceremonyTime || null, venue || "", window.location.href)}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-black/10 px-6 py-3.5 font-body text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <CalendarPlus className="w-4 h-4" /> Add to calendar
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WeddingHero;
