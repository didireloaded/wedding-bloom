import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Sparkles, Mail, Key } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/services";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "magiclink">("password");
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AuthService.getCurrentUser().then((user) => {
      if (user) {
        AuthService.checkUserRole(user.id, "admin").then((isAdmin) => {
          if (isAdmin) navigate("/admin/dashboard", { replace: true });
        });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (loginMode === "magiclink") {
      const res = await AuthService.signInWithMagicLink(email, window.location.origin + "/admin/dashboard");
      setSubmitting(false);
      if (!res.success) {
        toast.error(res.error || "Failed to send magic link.");
      } else {
        setMagicLinkSent(true);
        toast.success("Magic link sent! Check your email inbox to enter headquarters.");
      }
      return;
    }

    const { user, session, error } = await AuthService.signInWithPassword(email, password);
    if (error || !user || !session) {
      toast.error(error || "Invalid admin credentials.");
      setSubmitting(false);
      return;
    }

    // Verify admin role
    const isAdmin = await AuthService.checkUserRole(user.id, "admin");
    if (!isAdmin) {
      await AuthService.signOut();
      toast.error("This account is not authorized as an admin.");
      setSubmitting(false);
      return;
    }

    toast.success("Welcome to ForeverVow Studio Headquarters");
    navigate("/admin/dashboard");
    setSubmitting(false);
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#0C0A09] text-[#FAF7F2] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#D4A853]/[0.05] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C97B7B]/[0.04] blur-[120px] pointer-events-none" />

      {/* Left Column — Editorial Hero (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 border-r border-white/[0.06] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury wedding editorial"
            className="w-full h-full object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0C0A09]" />
        </div>

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 text-[13px] text-[#A8A29E] hover:text-[#FAF7F2] transition">
            <ArrowLeft size={16} className="text-[#D4A853]" /> Return to ForeverVow
          </Link>
          <span className="fv-badge fv-badge-gold">
            <Sparkles size={12} /> Studio Headquarters
          </span>
        </div>

        {/* Center quote */}
        <div className="relative z-10 max-w-xl my-auto">
          <div className="wedding-label mb-4">ForeverVow Studio</div>
          <h2 className="display text-[52px] leading-[0.92] mb-6">
            Orchestrating unforgettable <span className="script fv-gradient-text">celebrations</span>.
          </h2>
          <p className="text-[16px] text-[#A8A29E] leading-relaxed">
            The premier platform for planning, designing, and managing beautiful weddings with effortless elegance and calm precision.
          </p>
        </div>

        {/* Bottom stats footer */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.08]">
          <div>
            <div className="display text-[28px] text-[#D4A853]">500+</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#78716C] mt-1">Weddings Crafted</div>
          </div>
          <div>
            <div className="display text-[28px] text-[#FAF7F2]">100%</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#78716C] mt-1">Calm Orchestration</div>
          </div>
          <div>
            <div className="display text-[28px] text-[#FAF7F2]">5-Star</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#78716C] mt-1">Guest Experience</div>
          </div>
        </div>
      </div>

      {/* Right Column — Login Panel */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile back link */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-[13px] text-[#A8A29E] hover:text-[#FAF7F2] mb-8 transition">
            <ArrowLeft size={16} className="text-[#D4A853]" /> Back to Home
          </Link>

          <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.1] relative">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#D4A853]/20 to-[#B8872E]/10 border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853]">
                <Shield size={22} />
              </div>
              <span className="text-[11px] font-mono text-[#78716C] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                STUDIO ACCESS
              </span>
            </div>

            <div className="mb-8">
              <div className="wedding-label mb-2">Staff Portal</div>
              <h1 className="display text-[36px] text-[#FAF7F2]">Admin Headquarters</h1>
              <p className="text-[14px] text-[#78716C] mt-1.5">
                Sign in to manage weddings, couples, and hospitality experiences.
              </p>
            </div>

            {magicLinkSent ? (
              <div className="p-6 rounded-[20px] bg-white/[0.04] border border-[#D4A853]/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#D4A853]/20 text-[#D4A853] mx-auto flex items-center justify-center">
                  <Mail size={22} />
                </div>
                <h3 className="text-[16px] font-semibold text-[#FAF7F2]">Check Your Email</h3>
                <p className="text-[13px] text-[#A8A29E] leading-relaxed">
                  We sent a passwordless login link to <strong className="text-[#FAF7F2]">{email}</strong>. Click the link to access Studio Headquarters.
                </p>
                <button
                  type="button"
                  onClick={() => setMagicLinkSent(false)}
                  className="text-[12px] text-[#D4A853] hover:underline pt-2 block mx-auto font-medium"
                >
                  Use a different email or password →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block wedding-label mb-2.5">Administrator Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@forevervow.app"
                    className="fv-input"
                  />
                </div>
                {loginMode === "password" && (
                  <div>
                    <label className="block wedding-label mb-2.5">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="fv-input"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full fv-btn-primary py-4 mt-2 shadow-lg"
                >
                  {submitting
                    ? "Verifying Access…"
                    : loginMode === "magiclink"
                    ? "Send Passwordless Magic Link"
                    : "Enter Wedding Headquarters"}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginMode(m => m === "password" ? "magiclink" : "password")}
                    className="text-[12px] text-[#A8A29E] hover:text-[#D4A853] transition flex items-center justify-center gap-1.5 mx-auto font-medium"
                  >
                    {loginMode === "password" ? (
                      <><Mail size={14} /> Sign in with Passwordless Magic Link</>
                    ) : (
                      <><Key size={14} /> Sign in with Password</>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
              <Link to="/couple-login" className="text-[12.5px] text-[#A8A29E] hover:text-[#FAF7F2] underline underline-offset-4 transition font-medium">
                Are you a couple? Go to Couple Portal Gateway →
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
