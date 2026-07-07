import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Info, Sparkles, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/services";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Couple portal login — pure Supabase.
 * - Client-side format validation (8 alphanumeric characters).
 * - Localised error messages for empty / format / not-found / network failures.
 * - Progressive rate limiting: 5 failed attempts within 15 min → 5-min lockout,
 *   tracked in localStorage per browser.
 */

const CODE_RE = /^[A-Za-z0-9]{6,12}$/;
const RL_KEY = "fv_couple_login_attempts";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

type Attempts = { failures: number[]; lockedUntil: number };

function readAttempts(): Attempts {
  try {
    const raw = localStorage.getItem(RL_KEY);
    if (!raw) return { failures: [], lockedUntil: 0 };
    const parsed = JSON.parse(raw) as Attempts;
    return {
      failures: Array.isArray(parsed.failures) ? parsed.failures : [],
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return { failures: [], lockedUntil: 0 };
  }
}

function writeAttempts(a: Attempts) {
  localStorage.setItem(RL_KEY, JSON.stringify(a));
}

function recordFailure(): Attempts {
  const now = Date.now();
  const prev = readAttempts();
  const recent = prev.failures.filter(t => now - t < WINDOW_MS);
  recent.push(now);
  const next: Attempts = {
    failures: recent,
    lockedUntil: recent.length >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
  };
  writeAttempts(next);
  return next;
}

function clearAttempts() {
  localStorage.removeItem(RL_KEY);
}

export default function CoupleLogin() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number>(() => readAttempts().lockedUntil);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const slug = sessionStorage.getItem("couple_wedding_slug") || localStorage.getItem("couple_wedding_slug");
    if (slug) navigate(`/couple/${slug}/dashboard`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const remainingLockMs = Math.max(0, lockedUntil - now);
  const isLocked = remainingLockMs > 0;
  const remainingAttempts = useMemo(() => {
    const a = readAttempts();
    const recent = a.failures.filter(t => Date.now() - t < WINDOW_MS).length;
    return Math.max(0, MAX_ATTEMPTS - recent);
  }, [error, lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLocked) {
      const mins = Math.ceil(remainingLockMs / 60000);
      setError(`Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
      return;
    }

    const normalized = code.trim();
    if (!normalized) {
      setError("Please enter your access code.");
      return;
    }
    if (!CODE_RE.test(normalized)) {
      setError("Access codes are 6–12 letters and numbers. Please double-check the code your coordinator sent you.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: dbError } = await AuthService.verifyCoupleAccessCode(normalized);

      if (dbError && dbError !== "Invalid access code") {
        setError("We couldn't reach the celebration server. Please try again in a moment.");
        setSubmitting(false);
        return;
      }

      if (!data) {
        const next = recordFailure();
        setLockedUntil(next.lockedUntil);
        const attemptsLeft = Math.max(0, MAX_ATTEMPTS - next.failures.length);
        if (next.lockedUntil) {
          setError("Too many incorrect codes. This device is temporarily locked for 5 minutes.");
        } else {
          setError(`Invalid access code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining before a temporary lockout.`);
        }
        setSubmitting(false);
        return;
      }

      clearAttempts();
      toast.success(`Welcome, ${data.couple_names}!`);
      navigate(`/couple/${data.slug}/dashboard`);
    } catch (_err: unknown) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const lockedMinsRemaining = Math.ceil(remainingLockMs / 60000);

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#EAB308]/15 via-[#EAB308]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors z-20">
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
            Enter your private access code to open your celebration dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label className="wedding-label block mb-2 text-center">Your Access Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); if (error) setError(null); }}
                placeholder="ENTER YOUR CODE"
                autoFocus
                disabled={isLocked || submitting}
                aria-invalid={!!error}
                aria-describedby={error ? "code-error" : undefined}
                className="w-full bg-white/[0.04] border border-white/[0.15] rounded-[20px] py-4 px-4 text-[20px] font-mono font-bold text-center tracking-[0.24em] uppercase text-[#EAB308] focus:outline-none focus:border-[#EAB308] focus:ring-4 focus:ring-[#EAB308]/15 transition-all placeholder:text-[#52525B] disabled:opacity-50"
                maxLength={12}
              />
            </div>

            {error && (
              <div id="code-error" role="alert" className="flex gap-2.5 p-3.5 rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/30 text-left">
                <ShieldAlert size={16} className="text-[#F87171] shrink-0 mt-0.5" />
                <div className="text-[12.5px] text-[#FCA5A5] leading-relaxed">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isLocked}
              className="w-full fv-btn-primary !py-4 text-[14px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLocked
                ? `Locked — ${lockedMinsRemaining} min remaining`
                : submitting
                  ? "Verifying…"
                  : "Launch Couple Dashboard"}
            </button>

            {!isLocked && remainingAttempts < MAX_ATTEMPTS && remainingAttempts > 0 && (
              <p className="text-[11px] text-[#A1A1AA] text-center">
                {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"} remaining
              </p>
            )}
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-left">
            <div className="flex gap-3.5 p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06]">
              <Info size={18} className="text-[#EAB308] shrink-0 mt-0.5" />
              <div className="text-[12px] text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#FAFAFA] block mb-0.5">Where do I find my code?</strong>
                Your coordinator sent your access code when your wedding was created.
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
