import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WeddingCountdownProps {
  weddingDate: string;
}

const WeddingCountdown = ({ weddingDate }: WeddingCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) {
        setIsPast(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  if (isPast) {
    return (
      <section className="py-16 px-6 bg-background text-center">
        <p className="wedding-label mb-4">THE DAY WAS</p>
        <p className="font-display text-3xl sm:text-5xl font-light italic">
          Everything we dreamed of
        </p>
        <a
          href="#gallery"
          className="inline-block mt-8 font-body text-[10px] tracking-[0.3em] uppercase border border-foreground/20 px-8 py-3.5 hover:bg-foreground hover:text-background transition-all min-h-[48px]"
        >
          VIEW THE MEMORIES
        </a>
      </section>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section className="py-16 md:py-24 px-6 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground">
            THE WEDDING BEGINS IN
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-3 sm:gap-8 mt-10">
          {units.map((unit, i) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <p className="font-display text-4xl sm:text-6xl md:text-7xl font-light leading-none text-foreground">
                {String(unit.value).padStart(2, "0")}
              </p>
              <div className="wedding-divider mt-4 mb-3" />
              <p className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {unit.label}
              </p>
            </motion.div>
          ))}
        </div>

        <a
          href="#rsvp"
          className="inline-block border border-foreground/20 px-8 py-3.5 font-body text-[10px] tracking-[0.3em] uppercase hover:bg-foreground hover:text-background transition-all min-h-[48px] mt-12"
        >
          RSVP FOR THIS DAY
        </a>
      </div>
    </section>
  );
};

export default WeddingCountdown;
