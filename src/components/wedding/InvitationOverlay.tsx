import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InvitationOverlayProps {
  coupleNames: string;
  date: string;
  venue?: string | null;
  onOpen: () => void;
}

function GoldParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-[#D4A853]"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0, 1.5, 0],
        y: [0, -40],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export const InvitationOverlay = ({ coupleNames, date, venue, onOpen }: InvitationOverlayProps) => {
  const [phase, setPhase] = useState<"ambient" | "revealing" | "done">("ambient");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start revealing content after a brief ambient pause
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => {
    setPhase("revealing");
    setTimeout(() => {
      setPhase("done");
      setTimeout(onOpen, 500);
    }, 1800);
  };

  // Generate particle positions
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 30 + Math.random() * 50,
    delay: Math.random() * 4,
  }));

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="invitation-overlay"
          exit={{ opacity: 0, scale: 1.05, filter: "blur(16px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0C0A09 0%, #1C1917 50%, #0C0A09 100%)" }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4A853]/[0.04] blur-[120px]" />
            <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[#C97B7B]/[0.03] blur-[100px]" />
          </div>

          {/* Floating gold particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <GoldParticle key={p.id} delay={p.delay} x={p.x} y={p.y} />
            ))}
          </div>

          {/* Corner ornaments */}
          <motion.div
            animate={phase === "revealing" ? { opacity: 0 } : { opacity: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-10 left-10 w-16 h-16 border-t border-l border-[#D4A853]/20" />
            <div className="absolute top-10 right-10 w-16 h-16 border-t border-r border-[#D4A853]/20" />
            <div className="absolute bottom-10 left-10 w-16 h-16 border-b border-l border-[#D4A853]/20" />
            <div className="absolute bottom-10 right-10 w-16 h-16 border-b border-r border-[#D4A853]/20" />
          </motion.div>

          {/* Main content */}
          <AnimatePresence mode="wait">
            {phase === "ambient" && showContent && (
              <motion.div
                key="sealed-content"
                exit={{ opacity: 0, y: -30, filter: "blur(12px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center px-8 max-w-lg mx-auto relative z-10"
              >
                {/* Overline */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-[10px] tracking-[0.5em] uppercase text-[#D4A853]/60 mb-10"
                >
                  You are invited to celebrate
                </motion.p>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="fv-divider mb-8"
                />

                {/* Couple names — editorial scale */}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="display text-[56px] sm:text-[78px] md:text-[96px] text-[#FEFCFA] leading-[0.85] tracking-wide"
                >
                  {coupleNames}
                </motion.h1>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="fv-divider mt-8 mb-8"
                />

                {/* Date */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="text-[11px] tracking-[0.4em] uppercase text-[#D4A853]/70"
                >
                  {date}
                </motion.p>

                {/* Venue */}
                {venue && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    className="text-[10px] tracking-[0.3em] uppercase text-[#A8A29E]/50 mt-3"
                  >
                    {venue}
                  </motion.p>
                )}

                {/* Open button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  onClick={handleOpen}
                  className="mt-14 group relative"
                >
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-[#D4A853]/10 blur-xl scale-150 group-hover:bg-[#D4A853]/15 transition-all duration-700" />

                  <div className="relative glass-obsidian rounded-full px-10 py-4 border border-[#D4A853]/20 group-hover:border-[#D4A853]/40 transition-all duration-500">
                    <span className="text-[11px] tracking-[0.35em] uppercase text-[#D4A853] group-hover:text-[#E8C97A] transition-colors">
                      Open Invitation
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Revealing phase — cinematic zoom */}
            {phase === "revealing" && (
              <motion.div
                key="revealing"
                initial={{ opacity: 1 }}
                className="text-center relative z-10"
              >
                {/* Expanding gold ring */}
                <motion.div
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 20, opacity: 0 }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-4 h-4 rounded-full border border-[#D4A853]/40 mx-auto"
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-[9px] tracking-[0.5em] uppercase text-[#D4A853]/50"
                >
                  Opening...
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
