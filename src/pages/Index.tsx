import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "@/services";

/**
 * Index page — routes users to the appropriate portal based on auth state.
 * Uses AuthService timeout-protected methods to prevent infinite loading screens
 * when network delays or Supabase latency occurs.
 */
export default function Index() {
  const [target, setTarget] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const checkingRef = useRef(true);
  checkingRef.current = checking;

  useEffect(() => {
    let cancelled = false;

    // Safety fallback timer: guarantee we never get stuck on the loading screen
    const safetyTimer = setTimeout(() => {
      if (!cancelled && checkingRef.current) {
        console.warn("[Index] Route determination timed out. Defaulting to admin login.");
        setTarget("/admin/login");
        setChecking(false);
        checkingRef.current = false;
      }
    }, 2500);

    async function determineRoute() {
      try {
        // 1. Check for admin Supabase session with 2s timeout
        const session = await AuthService.getSessionWithTimeout(2000);
        if (cancelled) return;

        if (session) {
          const isAdmin = await AuthService.checkUserRoleWithTimeout(session.user.id, "admin", 2000);
          if (cancelled) return;
          if (isAdmin) {
            setTarget("/admin/dashboard");
            setChecking(false);
            checkingRef.current = false;
            return;
          }
        }

        // 2. Check for couple session
        const coupleSlug =
          sessionStorage.getItem("couple_wedding_slug") ||
          localStorage.getItem("couple_wedding_slug");
        if (coupleSlug) {
          setTarget(`/couple/${coupleSlug}/dashboard`);
          setChecking(false);
          checkingRef.current = false;
          return;
        }

        // 3. Default to admin login
        setTarget("/admin/login");
        setChecking(false);
        checkingRef.current = false;
      } catch (err) {
        if (cancelled) return;
        console.warn("[Index] Route determination failed, defaulting to admin login:", err);
        setTarget("/admin/login");
        setChecking(false);
        checkingRef.current = false;
      }
    }

    determineRoute();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="w-10 h-10 border-2 border-[#EAB308]/25 border-t-[#EAB308] rounded-full animate-spin" />
      </div>
    );
  }

  return <Navigate to={target!} replace />;
}