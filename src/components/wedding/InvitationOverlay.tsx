import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InvitationOverlayProps {
  coupleNames: string;
  date: string;
  venue?: string | null;
  onOpen: () => void;
}

const InvitationOverlay = ({ coupleNames, date, venue, onOpen }: InvitationOverlayProps) => {
  const [phase, setPhase] = useState<"sealed" | "opening" | "revealed">("sealed");

  const handleOpen = () => {
    setPhase("opening");
    // After envelope animation completes, reveal the page
    setTimeout(() => {
      setPhase("revealed");
      setTimeout(onOpen, 600);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {phase !== "revealed" ? (
        <motion.div
          key="invitation-overlay"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Decorative corner ornaments */}
          <motion.div
            animate={phase === "opening" ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-wedding-gold/30" />
            <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-wedding-gold/30" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-wedding-gold/30" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-wedding-gold/30" />
          </motion.div>

          {/* === SEALED STATE: Text + Envelope === */}
          <AnimatePresence mode="wait">
            {phase === "sealed" && (
              <motion.div
                key="sealed"
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center px-8 max-w-lg mx-auto"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="font-body text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-muted-foreground mb-8"
                >
                  You are invited to celebrate
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.9 }}
                >
                  <div className="wedding-divider mb-6" />
                  <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-foreground leading-[0.9] tracking-wide">
                    {coupleNames}
                  </h1>
                  <div className="wedding-divider mt-6" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                  className="font-body text-[10px] sm:text-xs tracking-[0.4em] uppercase text-muted-foreground mt-8"
                >
                  {date}
                </motion.p>

                {venue && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mt-3"
                  >
                    {venue}
                  </motion.p>
                )}

                {/* Envelope button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  onClick={handleOpen}
                  className="group mt-12 sm:mt-16 relative inline-flex flex-col items-center"
                >
                  {/* Envelope */}
                  <div className="relative w-44 sm:w-52 h-[72px] sm:h-[84px]">
                    {/* Envelope body */}
                    <div className="absolute inset-0 border border-foreground/15 bg-muted/30 rounded-sm" />
                    {/* Bottom V fold lines */}
                    <div
                      className="absolute inset-0 border-b border-foreground/10 rounded-sm"
                      style={{ clipPath: "polygon(0 40%, 50% 100%, 100% 40%, 100% 100%, 0 100%)" }}
                    />
                    {/* Envelope flap (triangle) */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-[55%] origin-top"
                      style={{
                        clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                        backgroundColor: "hsl(var(--muted))",
                        borderBottom: "1px solid hsl(var(--foreground) / 0.08)",
                      }}
                      animate={{ rotateX: [0, 8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Letter peeking out */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-[18%] w-[65%] h-[50%] bg-background border border-foreground/8 rounded-[1px] flex items-center justify-center shadow-sm"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="font-body text-[7px] sm:text-[8px] tracking-[0.35em] uppercase text-muted-foreground">
                        {coupleNames.split("&")[0]?.trim().charAt(0) ?? ""} & {coupleNames.split("&")[1]?.trim().charAt(0) ?? ""}
                      </span>
                    </motion.div>
                    {/* Wax seal dot */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-[38%] w-4 h-4 rounded-full bg-wedding-gold/40 z-10"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="mt-5 font-body text-[10px] sm:text-xs tracking-[0.35em] uppercase text-foreground/50 group-hover:text-foreground transition-colors duration-300">
                    Open Invitation
                  </span>
                </motion.button>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2.2 }}
                  className="mt-6 font-body text-[8px] tracking-[0.3em] uppercase text-muted-foreground/40"
                >
                  Tap to reveal
                </motion.p>
              </motion.div>
            )}

            {/* === OPENING STATE: Envelope animation === */}
            {phase === "opening" && (
              <motion.div
                key="opening"
                initial={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Envelope container */}
                <div className="relative w-56 sm:w-72 h-36 sm:h-44" style={{ perspective: "800px" }}>
                  {/* Envelope body */}
                  <div className="absolute inset-0 border border-foreground/15 bg-muted/30 rounded-sm overflow-hidden">
                    {/* Bottom V fold */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: "polygon(0 40%, 50% 100%, 100% 40%, 100% 100%, 0 100%)" }}
                    />
                  </div>

                  {/* Flap lifting open */}
                  <motion.div
                    className="absolute inset-x-0 top-0 h-[55%] origin-top z-10"
                    style={{
                      clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                      backgroundColor: "hsl(var(--muted))",
                      transformStyle: "preserve-3d",
                    }}
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: 180 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />

                  {/* Wax seal breaking */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 top-[38%] w-4 h-4 rounded-full bg-wedding-gold/40 z-20"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />

                  {/* Letter sliding out */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-[72%] h-[70%] bg-background border border-foreground/10 rounded-[2px] shadow-lg flex flex-col items-center justify-center gap-2 z-30"
                    initial={{ y: 20, opacity: 0.8 }}
                    animate={{ y: -120, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.6, ease: [0.2, 0, 0.2, 1] }}
                  >
                    <span className="font-body text-[7px] sm:text-[8px] tracking-[0.4em] uppercase text-muted-foreground">
                      You are invited
                    </span>
                    <span className="font-display text-lg sm:text-2xl font-light text-foreground tracking-wide">
                      {coupleNames}
                    </span>
                    <span className="font-body text-[7px] tracking-[0.3em] uppercase text-muted-foreground/60">
                      {date}
                    </span>
                  </motion.div>
                </div>

                {/* Fade everything out at the end */}
                <motion.div
                  className="absolute inset-0 bg-background"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default InvitationOverlay;
