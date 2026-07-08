import { useEffect, useState, useRef, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "@/services";
import { supabase } from "@/utils/supabase";

/**
 * Guards admin routes: requires a valid Supabase session AND the `admin`
 * role in user_roles. Falls back to /admin/login otherwise.
 * Uses timeout-protected methods and a safety timer to prevent infinite loading spinners.
 */
export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");
  const statusRef = useRef<"checking" | "ok" | "denied">("checking");
  statusRef.current = status;

  useEffect(() => {
    let cancelled = false;

    // Safety fallback timer: guarantee we never get stuck on the loading screen
    const safetyTimer = setTimeout(() => {
      if (!cancelled && statusRef.current === "checking") {
        console.warn("[ProtectedAdminRoute] Auth verification timed out. Redirecting to login.");
        setStatus("denied");
        statusRef.current = "denied";
      }
    }, 2500);

    async function verify() {
      try {
        const user = await AuthService.getUserWithTimeout(2000);
        if (cancelled) return;
        if (!user) {
          setStatus("denied");
          statusRef.current = "denied";
          return;
        }
        const isAdmin = await AuthService.checkUserRoleWithTimeout(user.id, "admin", 2000);
        if (cancelled) return;
        if (!isAdmin) {
          await AuthService.signOut();
          setStatus("denied");
          statusRef.current = "denied";
          return;
        }
        setStatus("ok");
        statusRef.current = "ok";
      } catch (err) {
        if (cancelled) return;
        console.warn("[ProtectedAdminRoute] Verification error:", err);
        setStatus("denied");
        statusRef.current = "denied";
      }
    }

    verify();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session && !cancelled) setStatus("denied");
    });

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
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
