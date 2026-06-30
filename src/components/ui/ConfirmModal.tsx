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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-[28px] border border-[#e6d4be] shadow-2xl w-full max-w-sm p-7">
              <div className="flex items-start justify-between mb-4">
                <h3 className="display text-[24px] text-[#2a231d]">{title}</h3>
                <button
                  onClick={onCancel}
                  className="w-8 h-8 rounded-full hover:bg-[#f5efe7] flex items-center justify-center text-[#8d7962]"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-[14.5px] text-[#5a5047] leading-7 mb-6">{message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-5 py-[11px] rounded-full border border-[#d9c6ae] text-[#5a4735] text-[13.5px] hover:bg-[#fbf3e8] transition"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`px-5 py-[11px] rounded-full text-[13.5px] transition ${
                    destructive
                      ? "bg-[#a64838] text-white hover:bg-[#8d3c2e]"
                      : "bg-[#2b2723] text-[#f9f2e8] hover:bg-[#392f29]"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
