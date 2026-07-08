import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

/**
 * QR code redirect page — logs scan to Supabase activity_log (not localStorage),
 * then redirects to the wedding invitation page. Includes safety timer.
 */
export default function QRRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const safetyTimer = setTimeout(() => {
      if (!cancelled && !doneRef.current) {
        console.warn("[QRRedirect] Redirect timed out. Redirecting to home.");
        navigate("/", { replace: true });
      }
    }, 2500);

    async function redirect() {
      if (!slug) { doneRef.current = true; navigate("/"); return; }
      try {
        const res = await Promise.race([
          supabase.from("weddings").select("id").eq("slug", slug).single(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
        ]);

        if (cancelled) return;

        if (res && (res as any).data?.id) {
          const weddingId = (res as any).data.id;
          try {
            await supabase.from("activity_log").insert([{
              wedding_id: weddingId,
              event_type: "qr_scan",
              description: `QR code scanned for wedding invitation`,
              metadata: { slug, scanned_at: new Date().toISOString() },
              created_at: new Date().toISOString(),
            }]);
          } catch (err) {
            console.warn("[QR] Failed to log scan:", err);
          }
        }
      } catch (err) {
        console.warn("[QR] Error during redirect check:", err);
      } finally {
        if (!cancelled) {
          doneRef.current = true;
          navigate(`/wedding/${slug}`, { replace: true });
        }
      }
    }
    redirect();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [slug, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] text-[#FAF7F2]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#A8A29E] font-mono text-[12px] tracking-[0.2em] uppercase">Opening Celebration Invitation…</div>
      </div>
    </div>
  );
}
