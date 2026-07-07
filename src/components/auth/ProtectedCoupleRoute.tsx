import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AuthService } from "@/services";

/**
 * Guards couple routes: requires a verified session for the requested wedding slug
 * (either via Supabase Auth admin/couple role OR via server-verified access code session).
 * Redirects unauthorized requests to /couple-login.
 */
export function ProtectedCoupleRoute({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!slug) {
        if (!cancelled) setStatus("denied");
        return;
      }
      const isAuthorized = await AuthService.verifyCoupleSessionForSlug(slug);
      if (cancelled) return;
      setStatus(isAuthorized ? "ok" : "denied");
    }

    verify();

    return () => {
      cancelled = true;
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
