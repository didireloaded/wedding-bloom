import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flower2, ArrowLeft, KeyRound, Info } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";

export default function CoupleLogin() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
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
    toast.success(`Welcome, ${wedding.couple_names}`);
    navigate(`/couple/${wedding.slug}/dashboard`);
    setSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    submitCode(code);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col" style={{ fontFamily: '"Manrope", system-ui, sans-serif' }}>
      <style>{`
        .display { font-family: "Cormorant Garamond", Georgia, serif; }
        .wedding-label { letter-spacing: .26em; text-transform: uppercase; font-size: 11px; color: #b7834c; }
      `}</style>

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-[13px] text-[#6b5d4f] hover:text-[#b0743c] transition"
      >
        <ArrowLeft size={16} /> Home
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-[20px] bg-[#f2e8da] border border-[#e4cfb7] flex items-center justify-center mb-6 shadow-sm">
              <Flower2 size={24} className="text-[#b7794a]" />
            </div>

            <p className="wedding-label mb-3">Couple Access</p>
            <h1 className="display text-[44px] text-[#221e1b] leading-[1] mb-2">Welcome</h1>
            <p className="text-[14.5px] text-[#6b5d4f] mb-10 leading-relaxed">
              Enter your unique access code to open your wedding workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-left">
              <label className="wedding-label block mb-2.5">Couple Access Code</label>
              <input
                type="text" required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Enter your access code"
                autoFocus
                className="w-full bg-white border-2 border-[#e0ccb2] rounded-[16px] py-4 px-4 text-[18px] text-center tracking-[0.18em] uppercase text-[#2a231d] focus:outline-none focus:border-[#d3a76b] transition-colors placeholder:text-[#c4b7a7] font-medium"
                maxLength={12}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-[15px] bg-[#2b2723] text-[#f9f2e8] text-[13.5px] font-medium tracking-[0.04em] rounded-full hover:bg-[#392f29] transition disabled:opacity-50"
            >
              {submitting ? "Verifying…" : "Continue"}
            </button>
          </form>

          {/* Help section */}
          <div className="mt-8 pt-6 border-t border-[#e6d4be]">
            <div className="flex gap-3 p-4 rounded-[16px] bg-[#fdf9f4] border border-[#eadfd1]">
              <Info size={16} className="text-[#b0743c] flex-shrink-0 mt-0.5" />
              <div className="text-[12.5px] text-[#5a4735] leading-relaxed">
                <p className="font-semibold text-[#2a231d] mb-1">Where do I find my code?</p>
                <p>Your ForeverVow administrator will send you a unique couple access code along with your dashboard link after your wedding is created.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-[#8d7962]">
            <KeyRound size={13} />
            <span>Secure access, one wedding per code</span>
          </div>

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-[12.5px] text-[#8d7962] hover:text-[#b0743c] underline underline-offset-4">
              Admin login →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
