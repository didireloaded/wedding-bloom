import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Flower2, LockKeyhole, UserPlus, Sparkles, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";
import { GlassCard } from "@/components/ui/GlassCard";

type Mode = "cards" | "explore" | "signin" | "signup";

export default function CoupleEntry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("cards");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const wedding = useMemo(
    () => store.find("weddings", (w: any) => w.slug === slug),
    [slug]
  ) as any;

  const inspiration = useMemo(
    () => store.all("weddings").filter((w: any) => w.published),
    []
  ) as any[];

  useEffect(() => {
    if (!wedding) return;
    const activeWeddingId = localStorage.getItem("couple_wedding_id") || sessionStorage.getItem("couple_wedding_id");
    if (activeWeddingId === wedding.id) {
      navigate(`/couple/${wedding.slug}/dashboard`, { replace: true });
    }
  }, [wedding, navigate]);

  const openWorkspace = (matchedWedding: any, usedCode: string) => {
    localStorage.setItem("couple_wedding_id", matchedWedding.id);
    localStorage.setItem("couple_wedding_slug", matchedWedding.slug);
    localStorage.setItem("couple_access_code", usedCode);
    localStorage.setItem("couple_email", email.trim());
    if (name.trim()) localStorage.setItem("couple_name", name.trim());

    sessionStorage.setItem("couple_wedding_id", matchedWedding.id);
    sessionStorage.setItem("couple_wedding_slug", matchedWedding.slug);
    sessionStorage.setItem("couple_access_code", usedCode);

    toast.success(`Welcome to ${matchedWedding.couple_names}`);
    navigate(`/couple/${matchedWedding.slug}/dashboard`);
  };

  const validateAccess = (e: React.FormEvent, createAccount = false) => {
    e.preventDefault();
    if (!wedding) return;

    if (!email.trim() || !password.trim() || !code.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (createAccount) {
      if (!name.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    const normalized = code.trim().toUpperCase();
    if (normalized !== wedding.access_code) {
      toast.error("Invalid Couple Access Code");
      return;
    }

    openWorkspace(wedding, normalized);
  };

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-6 text-[#FAF7F2] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#C97B7B]/10 blur-[120px] pointer-events-none" />
        <GlassCard variant="obsidian" padding="xl" className="text-center max-w-md relative z-10 border border-white/[0.1]">
          <div className="w-16 h-16 rounded-[20px] bg-[#C97B7B]/15 text-[#E4A5A5] mx-auto mb-6 flex items-center justify-center">
            <LockKeyhole size={28} />
          </div>
          <div className="wedding-label mb-2">Invalid Access Link</div>
          <h1 className="display text-[36px] text-[#FAF7F2] mb-3">Celebration Not Found</h1>
          <p className="text-[14px] text-[#A8A29E] leading-relaxed mb-8">
            This couple portal link does not match an active celebration in ForeverVow.
          </p>
          <Link to="/admin/login" className="fv-btn-primary w-full">Staff Portal Login</Link>
        </GlassCard>
      </div>
    );
  }

  const hero = wedding.cover_image || wedding.hero_image;

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] relative overflow-hidden flex flex-col justify-between">
      {/* Cinematic Hero Backdrop */}
      <div className="absolute inset-0 z-0">
        {hero && <img src={hero} alt="" className="w-full h-full object-cover opacity-30 scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/80 to-[#0C0A09]/30" />
      </div>

      {/* Ambient Orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#D4A853]/[0.06] blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-[#C97B7B]/[0.05] blur-[140px] pointer-events-none z-0" />

      {/* Top Bar */}
      <header className="relative z-20 px-6 md:px-12 pt-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 text-[13px] text-[#A8A29E] hover:text-[#FAF7F2] transition">
          <ArrowLeft size={16} className="text-[#D4A853]" /> Return to ForeverVow Home
        </Link>
        <span className="fv-badge fv-badge-gold">
          <Sparkles size={12} /> Couple OS
        </span>
      </header>

      {/* Main Container */}
      <main className="relative z-20 mx-auto max-w-6xl px-6 md:px-12 py-12 flex-1 flex flex-col justify-center">
        {/* Celebration Title Banner */}
        <div className="max-w-3xl mb-12">
          <div className="wedding-label mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-pulse" /> Welcome to your celebration cockpit
          </div>
          <h1 className="display text-[52px] sm:text-[72px] md:text-[84px] leading-[0.9] text-[#FAF7F2]">
            {wedding.couple_names}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-[14px] text-[#A8A29E]">
            {wedding.wedding_date && (
              <span className="font-mono bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/[0.08] text-[#FAF7F2]">
                {format(new Date(wedding.wedding_date), "MMMM d, yyyy")}
              </span>
            )}
            {wedding.ceremony_venue && (
              <span className="flex items-center gap-1.5 text-[#E8C97A]">
                <Flower2 size={15} /> {wedding.ceremony_venue}
              </span>
            )}
          </div>
        </div>

        {/* Mode switcher back link */}
        {mode !== "cards" && (
          <button
            onClick={() => setMode("cards")}
            className="mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#D4A853] hover:text-[#E8C97A] transition"
          >
            <ArrowLeft size={16} /> Back to Gateway Options
          </button>
        )}

        <AnimatePresence mode="wait">
          {mode === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[
                {
                  id: "explore",
                  title: "Explore Inspiration",
                  text: "Preview live ForeverVow celebrations to gather design ideas for your own site.",
                  icon: <Eye size={22} />,
                  variant: "obsidian" as const,
                  action: () => setMode("explore"),
                },
                {
                  id: "signin",
                  title: "Access Cockpit",
                  text: "Sign in with your email and private access code to manage RSVPs and events.",
                  icon: <LockKeyhole size={22} />,
                  variant: "aurora" as const,
                  action: () => setMode("signin"),
                },
                {
                  id: "signup",
                  title: "Register Couple Profile",
                  text: "First time here? Set up your account profile and link your celebration.",
                  icon: <UserPlus size={22} />,
                  variant: "obsidian" as const,
                  action: () => setMode("signup"),
                },
              ].map((card, i) => (
                <GlassCard
                  key={card.id}
                  variant={card.variant}
                  padding="xl"
                  hoverEffect
                  glowOnHover={card.variant === "aurora"}
                  onClick={card.action}
                  className="cursor-pointer flex flex-col justify-between min-h-[280px] border border-white/[0.1]"
                >
                  <div>
                    <div className="w-12 h-12 rounded-[16px] bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#D4A853] mb-6">
                      {card.icon}
                    </div>
                    <h3 className="display text-[26px] text-[#FAF7F2] mb-3">{card.title}</h3>
                    <p className="text-[14px] text-[#A8A29E] leading-relaxed">{card.text}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[13px] font-semibold text-[#D4A853]">
                    <span>Proceed</span>
                    <ArrowRight size={16} />
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {mode === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="wedding-label mb-2">Live Inspiration</div>
                <h2 className="display text-[36px] text-[#FAF7F2]">Real ForeverVow Celebrations</h2>
              </div>

              {inspiration.length === 0 ? (
                <GlassCard variant="obsidian" padding="xl" className="text-center py-16 border border-white/[0.1]">
                  <Eye size={32} className="mx-auto text-[#D4A853] mb-4" />
                  <div className="display text-[28px] text-[#FAF7F2]">No active previews available</div>
                  <p className="text-[14px] text-[#A8A29E] max-w-md mx-auto mt-2">
                    Published celebrations will appear here once administrators launch public wedding experiences.
                  </p>
                </GlassCard>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {inspiration.map((w: any) => (
                    <GlassCard
                      key={w.id}
                      variant="obsidian"
                      padding="none"
                      hoverEffect
                      onClick={() => navigate(`/wedding/${w.slug}?preview=1`)}
                      className="cursor-pointer overflow-hidden border border-white/[0.1]"
                    >
                      <div className="relative h-64">
                        <img src={w.cover_image || w.hero_image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-black/30 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <span className="fv-badge fv-badge-gold mb-2">Preview Website</span>
                          <div className="display text-[34px] text-[#FAF7F2] leading-tight">{w.couple_names}</div>
                        </div>
                      </div>
                      <div className="p-5 flex items-center justify-between text-[13px] text-[#A8A29E] border-t border-white/[0.06]">
                        <span>{w.venue_address || w.ceremony_venue || "Private Venue"}</span>
                        <span className="text-[#D4A853] font-semibold flex items-center gap-1">Open Preview <ArrowRight size={14} /></span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {(mode === "signin" || mode === "signup") && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md mx-auto w-full"
            >
              <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.12] relative overflow-hidden shadow-2xl rounded-[32px]">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#EAB308]/15 blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#EAB308]/20 to-transparent border border-[#EAB308]/30 text-[#EAB308] mx-auto mb-4 flex items-center justify-center">
                    <KeyRound size={22} />
                  </div>
                  <div className="wedding-label mb-1">{mode === "signin" ? "Secure Sign In" : "Couple Registration"}</div>
                  <h2 className="display text-[32px] text-[#FAFAFA]">{wedding.couple_names}</h2>
                </div>

                <form onSubmit={(e) => validateAccess(e, mode === "signup")} className="space-y-4 relative z-10">
                  {mode === "signup" && (
                    <div>
                      <label className="block wedding-label mb-2">Full Name</label>
                      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="fv-input" />
                    </div>
                  )}
                  <div>
                    <label className="block wedding-label mb-2">Email Address</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="elara@forevervow.app" className="fv-input" />
                  </div>
                  <div>
                    <label className="block wedding-label mb-2">Password</label>
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="fv-input" />
                  </div>
                  {mode === "signup" && (
                    <div>
                      <label className="block wedding-label mb-2">Confirm Password</label>
                      <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="fv-input" />
                    </div>
                  )}
                  <div>
                    <label className="block wedding-label mb-2">Private Access Code</label>
                    <input
                      required
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 8-DIGIT CODE"
                      className="fv-input text-center tracking-[0.22em] font-mono text-[16px] uppercase font-bold text-[#EAB308]"
                    />
                  </div>

                  <button type="submit" className="w-full fv-btn-primary !py-4 mt-4 text-[14px] shadow-lg">
                    {mode === "signin" ? "Open Couple Dashboard" : "Register & Open Dashboard"}
                  </button>
                </form>

                {mode === "signin" && (
                  <div className="mt-5 pt-5 border-t border-white/[0.08] text-center relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("elara@forevervow.app");
                        setPassword("demo2026");
                        setCode(wedding.access_code || "ELARA2026");
                        toast.info("Auto-filled demo couple credentials");
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-white/[0.05] hover:bg-[#EAB308]/15 border border-white/[0.1] hover:border-[#EAB308]/40 text-[12px] font-semibold text-[#FAFAFA] transition flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} className="text-[#EAB308]" /> Auto-Fill Demo Credentials ({wedding.access_code})
                    </button>
                  </div>
                )}

                <p className="mt-5 text-center text-[12px] text-[#71717A] relative z-10">
                  Your wedding coordinator provided your access code upon setup.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-6 px-6 md:px-12 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-[#78716C]">
        <span>ForeverVow Luxury Portal</span>
        <span className="font-mono">ENCRYPTED SESSION</span>
      </footer>
    </div>
  );
}