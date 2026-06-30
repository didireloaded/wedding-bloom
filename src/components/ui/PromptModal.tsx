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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[28px] border border-[#e6d4be] shadow-2xl w-full max-w-sm p-7"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="display text-[24px] text-[#2a231d]">{title}</h3>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-8 h-8 rounded-full hover:bg-[#f5efe7] flex items-center justify-center text-[#8d7962]"
                >
                  <X size={16} />
                </button>
              </div>
              {label && (
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#a67c54] mb-2">
                  {label}
                </label>
              )}
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#d3a76b] mb-6"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-[11px] rounded-full border border-[#d9c6ae] text-[#5a4735] text-[13.5px] hover:bg-[#fbf3e8] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-[11px] rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13.5px] hover:bg-[#392f29] transition"
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
