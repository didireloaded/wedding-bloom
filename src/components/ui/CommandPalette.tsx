import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, LayoutDashboard, PlusCircle, ArrowRight, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { store, Wedding } from "@/store/weddingStore";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setWeddings(store.all("weddings"));
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  if (!open) return null;

  const filteredWeddings = weddings.filter(
    (w) =>
      w.couple_names.toLowerCase().includes(query.toLowerCase()) ||
      w.slug.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-0 z-50 flex justify-center pt-[12vh] px-4"
          >
            <div className="w-full max-w-xl glass-obsidian rounded-[28px] overflow-hidden">
              {/* Search input */}
              <div className="flex items-center px-6 py-5 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-[#D4A853] mr-3.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search weddings, guests, or jump to section..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  className="w-full bg-transparent text-[15px] text-[#FAF7F2] placeholder-[#78716C] outline-none font-medium"
                  autoFocus
                />
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[#78716C]">ESC</span>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-[#78716C] hover:text-[#FAF7F2] transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[55vh] overflow-y-auto p-3 space-y-3">
                {/* Quick Actions */}
                <div>
                  <div className="wedding-label px-3 mb-2.5 text-[10px]">Quick Navigation</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSelect("/admin/dashboard")}
                      className="flex items-center gap-3 px-4 py-3 rounded-[16px] hover:bg-white/[0.06] text-left transition-all group"
                    >
                      <div className="p-2.5 rounded-[12px] bg-white/[0.06] text-[#D4A853] group-hover:bg-[#D4A853]/15 transition">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#FAF7F2]">Command Center</div>
                        <div className="text-[11px] text-[#78716C]">Admin Dashboard</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect("/admin/builder")}
                      className="flex items-center gap-3 px-4 py-3 rounded-[16px] hover:bg-white/[0.06] text-left transition-all group"
                    >
                      <div className="p-2.5 rounded-[12px] bg-white/[0.06] text-[#D4A853] group-hover:bg-[#D4A853]/15 transition">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#FAF7F2]">New Wedding</div>
                        <div className="text-[11px] text-[#78716C]">Wedding Builder</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Weddings list */}
                {weddings.length > 0 && (
                  <div>
                    <div className="wedding-label px-3 mb-2.5 text-[10px]">Active Weddings</div>
                    <div className="space-y-1">
                      {filteredWeddings.slice(0, 6).map((w, i) => (
                        <div
                          key={w.id}
                          className={`flex items-center justify-between p-3.5 rounded-[16px] transition-all group cursor-pointer ${i === selectedIndex ? "bg-white/[0.08] border border-[#D4A853]/20" : "hover:bg-white/[0.05] border border-transparent"}`}
                          onClick={() => {
                            localStorage.setItem("couple_wedding_id", w.id);
                            localStorage.setItem("couple_wedding_slug", w.slug);
                            handleSelect(`/couple/${w.slug}/dashboard`);
                          }}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#D4A853]/20 to-[#B8872E]/10 border border-[#D4A853]/15 text-[#E8C97A] flex items-center justify-center font-serif text-[16px]">
                              {w.couple_names[0]}
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-[#FAF7F2]">{w.couple_names}</div>
                              <div className="text-[11.5px] text-[#78716C] font-mono">/{w.slug}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(`/wedding/${w.slug}`);
                              }}
                              className="px-3 py-1.5 rounded-full bg-white/[0.06] text-[11px] font-medium border border-white/[0.08] hover:border-[#D4A853]/30 text-[#D4A853] transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 inline mr-1" />
                              Guest
                            </button>
                            <ArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#D4A853] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                      {filteredWeddings.length === 0 && (
                        <div className="p-6 text-center text-[#78716C] text-[13px]">
                          No weddings match "{query}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-3.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#78716C]">
                <span className="flex items-center gap-2">
                  <Heart size={10} className="text-[#D4A853]" />
                  ForeverVow Command Palette
                </span>
                <span className="font-mono">⌘K to toggle</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
