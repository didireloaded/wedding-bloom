import { useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
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
      setResetSent(true);
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

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f3f5] px-4 py-8 text-[#19191d]">
      <section className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6245] text-white"><LockKeyhole className="h-5 w-5" /></div>
        <p className="mt-6 text-xs font-semibold text-black/45">ForeverVow</p>
        <h1 className="mt-1 text-2xl font-semibold">Admin access</h1>
        <p className="mt-2 text-sm leading-6 text-black/55">Sign in to manage weddings, guests, publishing, and imports.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block"><span className="mb-2 block text-xs font-semibold">Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-black/10 bg-[#f3f3f5] px-4 py-3 text-sm outline-none focus:border-black/30" /></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold">Password</span><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-black/10 bg-[#f3f3f5] px-4 py-3 text-sm outline-none focus:border-black/30" /></label>
          <button disabled={submitting} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#202020] text-sm font-semibold text-white disabled:opacity-60">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? "Signing in..." : "Sign in"}</button>
        </form>
        <button type="button" disabled={submitting || resetSent} onClick={requestReset} className="mt-4 min-h-11 w-full text-sm font-medium text-black/70 underline disabled:opacity-50">{resetSent ? "Reset email requested" : "Forgot password?"}</button>
        <button type="button" onClick={() => navigate("/")} className="mt-2 min-h-11 w-full text-xs font-semibold text-black/45">Back to ForeverVow</button>
      </section>
    </main>
  );
}
