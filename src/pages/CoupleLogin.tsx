import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const clearWeddingSession = () => {
  sessionStorage.removeItem("couple_wedding_id");
  sessionStorage.removeItem("couple_wedding_slug");
  sessionStorage.removeItem("couple_access_code");
};

const CoupleLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = mode === "signup"
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    if (error) {
      toast.error(error.message || "Unable to sign in. Please try again.");
    } else {
      if (mode === "signup") {
        clearWeddingSession();
        toast.success("Account created. Let's set up your wedding.");
        navigate("/couple-onboarding");
      } else {
        clearWeddingSession();
        const { data: authData } = await supabase.auth.getUser();
        const { data: membership } = authData.user ? await supabase
          .from("wedding_members" as never)
          .select("wedding_id, weddings(slug, access_code)")
          .eq("user_id", authData.user.id)
          .order("joined_at", { ascending: false })
          .limit(1)
          .maybeSingle() : { data: null };
        const member = membership as unknown as { wedding_id: string; weddings: { slug: string; access_code: string } | null } | null;
        if (!member) navigate("/couple-onboarding");
        else {
          sessionStorage.setItem("couple_wedding_id", member.wedding_id);
          sessionStorage.setItem("couple_wedding_slug", member.weddings?.slug || "");
          sessionStorage.setItem("couple_access_code", member.weddings?.access_code || "");
          navigate(`/couple-dashboard?slug=${member.weddings?.slug || ""}`);
        }
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="couple-app min-h-screen flex items-center justify-center bg-[#f1f1f1] px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-[30px] border border-white/80 bg-white/90 p-6 text-center shadow-sm"
      >
        <p className="mb-3 font-body text-xs font-semibold text-muted-foreground">ForeverVow</p>
        <h1 className="mb-2 font-body text-3xl font-semibold">{mode === "signup" ? "Create your wedding home" : "Welcome back"}</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">
          {mode === "signup" ? "Start with your account, then we’ll build your wedding space together." : "Sign in to continue to your wedding space."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-left font-body text-xs font-semibold">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#f6f6f6] px-4 py-3 text-left font-body text-sm outline-none focus:border-black/30"
            />
          </div>
          <div><label className="mb-2 block text-left font-body text-xs font-semibold">Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#f6f6f6] px-4 py-3 text-left font-body text-sm outline-none focus:border-black/30" /></div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-foreground py-4 font-body text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {submitting ? "PLEASE WAIT..." : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>
        <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="mt-6 font-body text-xs text-muted-foreground underline underline-offset-4">
          {mode === "signup" ? "Already have an account? Sign in" : "New to ForeverVow? Create an account"}
        </button>
      </motion.div>
    </div>
  );
};

export default CoupleLogin;
