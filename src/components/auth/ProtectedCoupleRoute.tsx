import { useEffect, useState, useRef, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AuthService } from "@/services";

/**
 * Guards couple routes: requires a verified session for the requested wedding slug.
 * Uses timeout-protected methods and a safety timer to prevent infinite loading spinners.
 */
export function ProtectedCoupleRoute({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");
  const statusRef = useRef<"checking" | "ok" | "denied">("checking");
  statusRef.current = status;

  useEffect(() => {
    let cancelled = false;

    // Safety fallback timer: guarantee we never get stuck on the loading screen
    const safetyTimer = setTimeout(() => {
      if (!cancelled && statusRef.current === "checking") {
        console.warn("[ProtectedCoupleRoute] Auth verification timed out. Redirecting to login.");
        setStatus("denied");
        statusRef.current = "denied";
      }
    }, 2500);

    async function verify() {
      try {
        if (!slug) {
          if (!cancelled) { setStatus("denied"); statusRef.current = "denied"; }
          return;
        }
        const isAuthorized = await AuthService.verifyCoupleSessionForSlugWithTimeout(slug, 2000);
        if (cancelled) return;
        const next = isAuthorized ? "ok" : "denied";
        setStatus(next);
        statusRef.current = next;
      } catch (err) {
        if (cancelled) return;
        console.warn("[ProtectedCoupleRoute] Verification error:", err);
        setStatus("denied");
        statusRef.current = "denied";
      }
    }

    verify();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [slug]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="w-10 h-10 border-2 border-[#EAB308]/25 border-t-[#EAB308] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/couple-login" replace />;
  }

  return <>{children}</>;
}
