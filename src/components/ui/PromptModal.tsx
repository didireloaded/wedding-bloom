import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface PromptModalProps {
  open: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  open,
  title,
  label,
  placeholder = "",
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
    onCancel();
  };

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
            <form
              onSubmit={handleSubmit}
              className="glass-obsidian rounded-[28px] w-full max-w-sm p-7 relative overflow-hidden"
            >
              {/* Glow accent */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#D4A853]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="wedding-label mb-2">Input Required</div>
                    <h3 className="display text-[26px] text-[#FAF7F2]">{title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2] transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                {label && (
                  <label className="block wedding-label mb-2.5">{label}</label>
                )}
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="fv-input mb-7"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="fv-btn-ghost text-[13px] py-3 px-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="fv-btn-primary text-[13px] py-3 px-6"
                  >
                    {submitLabel}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
