import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flower2, ArrowLeft, KeyRound, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";
import { GlassCard } from "@/components/ui/GlassCard";

export default function CoupleLogin() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = localStorage.getItem("couple_wedding_id") || sessionStorage.getItem("couple_wedding_id");
    if (sessionId) {
      const wedding = store.find("weddings", (w: any) => w.id === sessionId);
      if (wedding) {
        navigate(`/couple/${wedding.slug}/dashboard`, { replace: true });
      }
    }
  }, [navigate]);

  const submitCode = (c: string) => {
    setSubmitting(true);
    const wedding = store.find("weddings", (w: any) => w.access_code === c.trim().toUpperCase());
    if (!wedding) {
      toast.error("This invitation code could not be found.");
      setSubmitting(false);
      return;
    }
    localStorage.setItem("couple_wedding_id", wedding.id);
    localStorage.setItem("couple_wedding_slug", wedding.slug);
    localStorage.setItem("couple_access_code", c.trim().toUpperCase());
    sessionStorage.setItem("couple_wedding_id", wedding.id);
    sessionStorage.setItem("couple_wedding_slug", wedding.slug);
    sessionStorage.setItem("couple_access_code", c.trim().toUpperCase());
    toast.success(`Welcome back, ${wedding.couple_names}`);
    navigate(`/couple/${wedding.slug}/dashboard`);
    setSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    submitCode(code);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Editorial Luxury Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#EADCC9]/50 via-[#F3EFEA]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Link
        to="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#928D86] hover:text-[#2C2926] transition-colors z-20"
      >
        <ArrowLeft size={16} /> Return to ForeverVow Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard variant="heavy" padding="xl" className="shadow-2xl border border-white/80 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#2C2926] text-[#FAFAF7] flex items-center justify-center mb-6 shadow-xl">
            <Flower2 size={26} className="text-[#C5A059]" />
          </div>

          <p className="wedding-label mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={12} /> Mission Control Portal
          </p>
          <h1 className="display text-[42px] text-[#2C2926] leading-tight mb-2">Couple Access</h1>
          <p className="text-[14px] text-[#928D86] mb-8 max-w-xs mx-auto">
            Enter your private access code to enter your ForeverVow wedding operating system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label className="wedding-label block mb-2 text-center">Your Access Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                autoFocus
                className="w-full bg-white/80 border-2 border-[#E5DEC9] rounded-2xl py-4 px-4 text-[20px] font-mono font-bold text-center tracking-[0.24em] uppercase text-[#2C2926] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all placeholder:text-[#D1C9BE]"
                maxLength={12}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#2C2926] text-[#FAFAF7] text-[13px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-[#1B1917] transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? "Opening Mission Control…" : "Enter Mission Control"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5DEC9]/60 text-left">
            <div className="flex gap-3.5 p-4 rounded-2xl bg-[#F3EFEA]/70 border border-[#E5DEC9]">
              <Info size={18} className="text-[#A37C4D] shrink-0 mt-0.5" />
              <div className="text-[12px] text-[#726C65] leading-relaxed">
                <strong className="text-[#2C2926] block mb-0.5">Where do I find my code?</strong>
                Your wedding planner or ForeverVow administrator sent your 6-10 digit code when your wedding package was generated.
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[#928D86]">
            <KeyRound size={13} />
            <span>Encrypted access · One wedding per code</span>
          </div>

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-[12px] text-[#928D86] hover:text-[#2C2926] underline underline-offset-4 transition-colors font-medium">
              Staff & Admin Login →
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
