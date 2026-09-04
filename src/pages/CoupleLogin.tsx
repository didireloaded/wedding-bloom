import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CoupleLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await signIn(email.trim(), password);
    if (error) {
      toast.error(error.message || "Unable to sign in. Please try again.");
    } else {
      navigate("/couple-dashboard");
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
        <p className="wedding-label mb-3">COUPLE ACCESS</p>
        <h1 className="font-display text-4xl font-light mb-2">Welcome</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">
          Sign in to access your wedding dashboard.
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
            {submitting ? "CHECKING..." : "ACCESS DASHBOARD"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CoupleLogin;
