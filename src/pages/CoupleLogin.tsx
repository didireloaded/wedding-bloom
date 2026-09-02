import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CoupleLogin = () => {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase
      .from("weddings")
      .select("id, slug")
      .eq("access_code", code.trim())
      .maybeSingle();

    if (error || !data) {
      toast.error("Invalid wedding code. Please try again.");
    } else {
      sessionStorage.setItem("couple_wedding_id", data.id);
      sessionStorage.setItem("couple_wedding_slug", data.slug);
      sessionStorage.setItem("couple_access_code", code.trim());
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
          Enter your wedding code to access your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="wedding-label block mb-2">WEDDING CODE</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code"
              className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-sm text-center tracking-[0.3em] uppercase focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

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
