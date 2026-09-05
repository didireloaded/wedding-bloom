import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "PASSWORD_RECOVERY" && session) setReady(true);
    });
    // The client may have processed the recovery URL before this lazy route mounts.
    supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(Boolean(data.session));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) { setMessage("The passwords do not match."); return; }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setPassword("");
      setConfirmation("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not update your password.");
    } finally { setBusy(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#ffd9c9_0%,#f8f4ef_48%,#d9b5f1_100%)] p-5 font-body">
    <section className="w-full max-w-sm rounded-[28px] bg-white/90 p-6 shadow-sm">
      <LockKeyhole className="mb-5 h-6 w-6" />
      <h1 className="text-2xl font-semibold">New password</h1>
      {done ? <p className="mt-4" role="status">Your password has been updated.</p> : ready ? <form onSubmit={save} className="mt-5 space-y-4">
        <label className="block text-sm">Password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border p-3" /></label>
        <label className="block text-sm">Confirm password<input required minLength={8} autoComplete="new-password" type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-2 w-full rounded-2xl border p-3" /></label>
        {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
        <button disabled={busy} className="w-full rounded-full bg-black p-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : "Save password"}</button>
      </form> : <p className="mt-4 text-sm">Open the password reset link from your email. If it has expired, request a new link.</p>}
      <Link to="/admin/login" className="mt-5 block text-sm underline">Owner sign in</Link>
      <Link to="/couple-login" className="mt-3 block text-sm underline">Couple sign in</Link>
    </section>
  </main>;
}
