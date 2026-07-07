import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

/**
 * Guards admin routes: requires a valid Supabase session AND the `admin`
 * role in user_roles. Falls back to /admin/login otherwise.
 * Cannot be bypassed via localStorage flags.
 */
export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setStatus("denied");
        return;
      }
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (cancelled) return;
      if (error || !isAdmin) {
        await supabase.auth.signOut();
        setStatus("denied");
        return;
      }
      setStatus("ok");
    }

    verify();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) setStatus("denied");
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="w-10 h-10 border-2 border-[#EAB308]/25 border-t-[#EAB308] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
