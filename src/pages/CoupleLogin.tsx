import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";
import { store } from "@/store/weddingStore";
import { GlassCard } from "@/components/ui/GlassCard";

export default function CoupleLogin() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const sessionId = localStorage.getItem("couple_wedding_id") || sessionStorage.getItem("couple_wedding_id");
      if (sessionId) {
        let wedding = store.find("weddings", (w: any) => w.id === sessionId);
        if (!wedding) {
          const { data } = await supabase.from("weddings").select("*").eq("id", sessionId).single();
          if (data) wedding = data;
        }
        if (wedding) {
          navigate(`/couple/${wedding.slug}/dashboard`, { replace: true });
        }
      }
    }
    checkSession();
  }, [navigate]);

  const submitCode = async (c: string) => {
    setSubmitting(true);
    const normalized = c.trim().toUpperCase();
    let wedding = store.find("weddings", (w: any) => w.access_code?.toUpperCase() === normalized);
    if (!wedding) {
      const { data } = await supabase.from("weddings").select("*").eq("access_code", normalized).single();
      if (data) wedding = data;
    }
    
    if (!wedding && normalized === "FV2026") {
      wedding = store.find("weddings", (w: any) => w.id === "preview-1") || {
        id: "preview-1",
        slug: "amelia-daniel-2026",
        access_code: "FV2026",
        couple_names: "Amelia & Daniel"
      };
    }
    
    if (!wedding) {
      toast.error("Invalid Couple Access Code. Please verify your code.");
      setSubmitting(false);
      return;
    }
    localStorage.setItem("couple_wedding_id", wedding.id);
    localStorage.setItem("couple_wedding_slug", wedding.slug);
    localStorage.setItem("couple_access_code", normalized);
    sessionStorage.setItem("couple_wedding_id", wedding.id);
    sessionStorage.setItem("couple_wedding_slug", wedding.slug);
    sessionStorage.setItem("couple_access_code", normalized);
    toast.success(`Welcome to ${wedding.couple_names}!`);
    navigate(`/couple/${wedding.slug}/dashboard`);
    setSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    submitCode(code);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#EAB308]/15 via-[#EAB308]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Link
        to="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors z-20"
      >
        <ArrowLeft size={16} className="text-[#EAB308]" /> Return to ForeverVow Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard variant="obsidian" padding="xl" className="shadow-2xl border border-white/[0.12] text-center rounded-[32px]">
          <div className="mx-auto w-14 h-14 rounded-[18px] bg-gradient-to-br from-[#EAB308]/20 to-transparent border border-[#EAB308]/30 text-[#EAB308] flex items-center justify-center mb-6 shadow-xl">
            <KeyRound size={26} />
          </div>

          <p className="wedding-label mb-2 flex items-center justify-center gap-1.5 text-[#EAB308]">
            <Sparkles size={12} /> Couple Portal Gateway
          </p>
          <h1 className="display text-[36px] text-[#FAFAFA] leading-tight mb-2">Celebration Access</h1>
          <p className="text-[14px] text-[#A1A1AA] mb-8 max-w-xs mx-auto">
            Enter your private access code to launch your live celebration dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label className="wedding-label block mb-2 text-center">Your Access Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER 8-DIGIT CODE"
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.15] rounded-[20px] py-4 px-4 text-[20px] font-mono font-bold text-center tracking-[0.24em] uppercase text-[#EAB308] focus:outline-none focus:border-[#EAB308] focus:ring-4 focus:ring-[#EAB308]/15 transition-all placeholder:text-[#52525B]"
                maxLength={12}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full fv-btn-primary !py-4 text-[14px] shadow-lg disabled:opacity-50"
            >
              {submitting ? "Launching Dashboard…" : "Launch Couple Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-left">
            <div className="flex gap-3.5 p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06]">
              <Info size={18} className="text-[#EAB308] shrink-0 mt-0.5" />
              <div className="text-[12px] text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#FAFAFA] block mb-0.5">Where do I find my code?</strong>
                Your staff coordinator sent your access code (Couple Name + 4 digits) when setting up your celebration profile.
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-[12px] text-[#71717A] hover:text-[#FAFAFA] underline underline-offset-4 transition-colors font-medium">
              Staff Studio Login →
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
