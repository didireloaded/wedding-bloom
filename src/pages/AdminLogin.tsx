import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";

const DEMO_ADMIN = { email: "admin@forevervow.app", password: "vows2026" };

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("wb_admin") || sessionStorage.getItem("wb_admin")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (store.isAdmin(email, password)) {
      localStorage.setItem("wb_admin", "1");
      sessionStorage.setItem("wb_admin", "1");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid admin credentials.");
    }
    setSubmitting(false);
  };

  const loginAsDemoAdmin = () => {
    localStorage.setItem("wb_admin", "1");
    sessionStorage.setItem("wb_admin", "1");
    toast.success("Signed in as admin");
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6">



      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-[13px] text-[#6b5d4f] hover:text-[#b0743c]">
        <ArrowLeft size={14}/> Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto w-14 h-14 rounded-[20px] bg-[#2b2723] border border-[#3d332d] flex items-center justify-center mb-6 shadow-sm">
          <Shield size={22} className="text-[#e8c89a]" />
        </div>

        <p className="wedding-label mb-3">ForeverVow Admin</p>
        <h1 className="display text-[44px] font-light mb-2 text-[#2a231d]">Admin Portal</h1>
        <p className="text-[14.5px] text-[#6b5d4f] mb-10">Staff login to manage all weddings and platform settings.</p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="wedding-label block mb-2">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@forevervow.app"
              className="w-full bg-white border-2 border-[#e0ccb2] rounded-[14px] py-3 px-4 text-[14px] focus:outline-none focus:border-[#d3a76b] transition"
            />
          </div>
          <div>
            <label className="wedding-label block mb-2">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border-2 border-[#e0ccb2] rounded-[14px] py-3 px-4 text-[14px] focus:outline-none focus:border-[#d3a76b] transition"
            />
          </div>
          <button
            type="submit" disabled={submitting}
            className="w-full py-[15px] bg-[#2b2723] text-[#f9f2e8] text-[13px] font-medium tracking-[0.04em] rounded-full hover:bg-[#392f29] transition disabled:opacity-50 uppercase tracking-[0.2em]"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* One-click demo admin */}
        <div className="mt-8 pt-6 border-t border-[#e6d4be]">
          <div className="wedding-label mb-3">Demo access</div>
          <button
            onClick={loginAsDemoAdmin}
            className="w-full flex items-center justify-between p-3.5 rounded-[14px] border border-[#e6d4be] bg-[#f8eee0] hover:bg-[#f2e4cd] hover:border-[#d3a76b] transition text-left"
          >
            <div>
              <div className="text-[14px] text-[#2a231d] font-medium">Sign in as Administrator</div>
              <div className="text-[12px] text-[#8d7962] mt-0.5">{DEMO_ADMIN.email}</div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#b0743c] font-medium">Tap to enter</div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <span className="text-[12.5px] text-[#8d7962]">Admin access only</span>
        </div>
      </motion.div>
    </div>
  );
}
