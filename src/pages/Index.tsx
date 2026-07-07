import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

/**
 * Index page — routes users to the appropriate portal based on auth state.
 * Uses Supabase session for admin detection (not localStorage flags).
 */
export default function Index() {
  const [target, setTarget] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function determineRoute() {
      // 1. Check for admin Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify admin role before redirecting
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (isAdmin) {
          setTarget("/admin/dashboard");
          setChecking(false);
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
        return;
      }

      // 3. Default to admin login
      setTarget("/admin/login");
      setChecking(false);
    }

    determineRoute();
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