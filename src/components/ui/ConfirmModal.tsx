import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.92, y: 16, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="glass-obsidian rounded-[28px] w-full max-w-sm p-7 relative overflow-hidden">
              {/* Subtle glow accent */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${destructive ? "bg-[#C97B7B]/15" : "bg-[#D4A853]/10"}`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="wedding-label mb-2">{destructive ? "Confirm Deletion" : "Confirm Action"}</div>
                    <h3 className="display text-[26px] text-[#FAF7F2]">{title}</h3>
                  </div>
                  <button
                    onClick={onCancel}
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2] transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[14.5px] text-[#A8A29E] leading-7 mb-7">{message}</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onCancel}
                    className="fv-btn-ghost text-[13px] py-3 px-5"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onCancel();
                    }}
                    className={`inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                      destructive
                        ? "bg-[#C97B7B]/20 text-[#E4A5A5] border border-[#C97B7B]/25 hover:bg-[#C97B7B]/30 hover:border-[#C97B7B]/40"
                        : "bg-gradient-to-r from-[#D4A853] to-[#B8872E] text-[#0C0A09] shadow-[0_4px_16px_-4px_rgba(212,168,83,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(212,168,83,0.5)] hover:scale-[1.02]"
                    }`}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
