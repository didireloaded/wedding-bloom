import { useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const requestReset = async () => {
    if (!email.trim()) { toast.error("Enter your email address first."); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("If this email has an account, a reset link will arrive shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send a reset email.");
    } finally { setSubmitting(false); }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    if (error) { toast.error(error.message); setSubmitting(false); return; }

    const { error: bootstrapError } = await supabase.rpc("claim_first_admin" as never);
    if (bootstrapError) console.warn("Admin bootstrap unavailable", bootstrapError.message);
    const { data: authData } = await supabase.auth.getUser();
    const { data: role } = authData.user ? await supabase.from("user_roles").select("role").eq("user_id", authData.user.id).eq("role", "admin").maybeSingle() : { data: null };
    if (!role) {
      await signOut();
      toast.error("This account does not have owner access.");
      setSubmitting(false);
      return;
    }
    navigate("/admin", { replace: true });
  };

  return <main className="min-h-screen bg-[linear-gradient(145deg,#ffd9c9_0%,#f8f4ef_48%,#d9b5f1_100%)] px-5 py-10 grid place-items-center"><motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-xl"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#202020] text-white"><LockKeyhole className="h-5 w-5" /></div><p className="mt-6 font-body text-xs font-semibold text-muted-foreground">ForeverVow owner</p><h1 className="mt-2 font-body text-3xl font-semibold">Admin access</h1><p className="mt-2 font-body text-sm leading-6 text-muted-foreground">Sign in with the owner account to manage weddings, guests, publishing, and imports.</p><form onSubmit={handleSubmit} className="mt-7 space-y-4"><label className="block"><span className="mb-2 block font-body text-xs font-semibold">Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#f8f8f8] px-4 py-4 font-body text-sm outline-none focus:border-black/30" /></label><label className="block"><span className="mb-2 block font-body text-xs font-semibold">Password</span><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#f8f8f8] px-4 py-4 font-body text-sm outline-none focus:border-black/30" /></label><button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#202020] font-body text-sm font-semibold text-white disabled:opacity-60">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? "Signing in..." : "Sign in"}</button></form><button type="button" disabled={submitting} onClick={requestReset} className="mt-4 w-full text-sm underline disabled:opacity-50">Forgot password?</button><button type="button" onClick={() => navigate("/")} className="mt-5 w-full font-body text-xs text-muted-foreground">Back to ForeverVow</button></motion.section></main>;
}
