import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InvitationOverlayProps {
  coupleNames: string;
  date: string;
  venue?: string | null;
  onOpen: () => void;
}

export const InvitationOverlay = ({ coupleNames, date, venue, onOpen }: InvitationOverlayProps) => {
  const [phase, setPhase] = useState<"sealed" | "opening" | "revealed">("sealed");

  const handleOpen = () => {
    setPhase("opening");
    // After envelope animation completes, reveal the page
    setTimeout(() => {
      setPhase("revealed");
      setTimeout(onOpen, 600);
    }, 2200);
  };

  return (
    <AnimatePresence>
      {phase !== "revealed" && (
        <motion.div
          key="invitation-overlay"
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#faf8f5] overflow-hidden"
        >
          <style>{`
            .wedding-divider {
              height: 1px;
              width: 60px;
              background: #c9a87a;
              margin: 0 auto;
              opacity: 0.5;
            }
          `}</style>

          {/* Decorative corner ornaments */}
          <motion.div
            animate={phase === "opening" ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#c9a87a]/30" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#c9a87a]/30" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#c9a87a]/30" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#c9a87a]/30" />
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
                  className="text-[10px] tracking-[0.5em] uppercase text-[#8d7962] mb-8"
                  style={{ fontFamily: '"Manrope", sans-serif' }}
                >
                  You are invited to celebrate
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.9 }}
                >
                  <div className="wedding-divider mb-6" />
                  <h1 
                    className="text-5xl sm:text-7xl font-light text-[#221e1b] leading-[0.9] tracking-wide"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                  >
                    {coupleNames}
                  </h1>
                  <div className="wedding-divider mt-6" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                  className="text-[11px] sm:text-xs tracking-[0.4em] uppercase text-[#8d7962] mt-8"
                  style={{ fontFamily: '"Manrope", sans-serif' }}
                >
                  {date}
                </motion.p>

                {venue && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="text-[10px] tracking-[0.3em] uppercase text-[#8d7962]/70 mt-3"
                    style={{ fontFamily: '"Manrope", sans-serif' }}
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
                  <div className="relative w-44 sm:w-52 h-[72px] sm:h-[84px]">
                    <div className="absolute inset-0 border border-[#221e1b]/10 bg-[#fdf9f4] rounded-sm" />
                    <div
                      className="absolute inset-0 border-b border-[#221e1b]/5 rounded-sm"
                      style={{ clipPath: "polygon(0 40%, 50% 100%, 100% 40%, 100% 100%, 0 100%)" }}
                    />
                    {/* Flap */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-[55%] origin-top z-20"
                      style={{
                        clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                        backgroundColor: "#f5efe7",
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                      animate={{ rotateX: [0, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Letter peeking */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-[15%] w-[75%] h-[55%] bg-white border border-[#221e1b]/5 rounded-[1px] flex items-center justify-center shadow-sm z-10"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="text-[8px] tracking-[0.35em] uppercase text-[#8d7962]">
                        {coupleNames.split("&")[0]?.trim().charAt(0) ?? ""} & {coupleNames.split("&")[1]?.trim().charAt(0) ?? ""}
                      </span>
                    </motion.div>
                    {/* Wax seal */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-[38%] w-5 h-5 rounded-full bg-[#c9a87a]/60 z-30 flex items-center justify-center shadow-sm"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full border border-white/20" />
                    </motion.div>
                  </div>
                  <span className="mt-5 text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#221e1b]/50 group-hover:text-[#221e1b] transition-colors duration-300">
                    Open Invitation
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* === OPENING STATE === */}
            {phase === "opening" && (
              <motion.div
                key="opening"
                initial={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-64 sm:w-80 h-40 sm:h-48" style={{ perspective: "1000px" }}>
                  {/* Envelope Body */}
                  <div className="absolute inset-0 border border-[#221e1b]/10 bg-[#fdf9f4] rounded-sm z-10 overflow-hidden shadow-xl">
                    <div
                      className="absolute inset-0"
                      style={{ 
                        clipPath: "polygon(0 40%, 50% 100%, 100% 40%, 100% 100%, 0 100%)",
                        backgroundColor: "rgba(0,0,0,0.02)"
                      }}
                    />
                  </div>

                  {/* Opening Flap */}
                  <motion.div
                    className="absolute inset-x-0 top-0 h-[60%] origin-top z-40"
                    style={{
                      clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                      backgroundColor: "#f5efe7",
                      backfaceVisibility: "hidden"
                    }}
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: -160 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />

                  {/* Invitation Card Sliding Up */}
                  <motion.div
                    className="absolute left-[5%] right-[5%] bottom-[5%] h-[90%] bg-white rounded-sm shadow-2xl z-20 p-6 flex flex-col items-center justify-center border border-[#c9a87a]/10"
                    initial={{ y: 0 }}
                    animate={{ y: -160, scale: 1.1 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                  >
                    <div className="w-8 h-px bg-[#c9a87a]/40 mb-4" />
                    <h2 
                      className="text-2xl text-center text-[#221e1b]"
                      style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                      {coupleNames}
                    </h2>
                    <div className="w-8 h-px bg-[#c9a87a]/40 mt-4" />
                    <motion.div 
                      className="mt-6 text-[8px] tracking-[0.4em] uppercase text-[#b0743c]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      Opening...
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
