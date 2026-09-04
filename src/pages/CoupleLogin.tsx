import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
        toast.success("Account created. Let's set up your wedding.");
        navigate("/couple-onboarding");
      } else {
        navigate("/couple-dashboard");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <p className="wedding-label mb-3">FOREVERVOW</p>
        <h1 className="font-display text-4xl font-light mb-2">{mode === "signup" ? "Create your wedding home" : "Welcome back"}</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">
          {mode === "signup" ? "Start with your account, then we’ll build your wedding space together." : "Sign in to continue to your wedding space."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="wedding-label block mb-2">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-sm text-center focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div><label className="wedding-label block mb-2">PASSWORD</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-sm text-center focus:outline-none focus:border-foreground transition-colors" /></div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-foreground text-background font-body text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50"
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
