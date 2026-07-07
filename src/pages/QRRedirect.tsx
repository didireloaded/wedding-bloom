import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

/**
 * QR code redirect page — logs scan to Supabase activity_log (not localStorage),
 * then redirects to the wedding invitation page.
 */
export default function QRRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function redirect() {
      if (!slug) { navigate("/"); return; }
      const { data: wedding } = await supabase.from("weddings").select("id").eq("slug", slug).single();
      if (wedding?.id) {
        // Log QR scan server-side for accurate analytics
        try {
          await supabase.from("activity_log").insert([{
            wedding_id: wedding.id,
            event_type: "qr_scan",
            description: `QR code scanned for wedding invitation`,
            metadata: { slug, scanned_at: new Date().toISOString() },
            created_at: new Date().toISOString(),
          }]);
        } catch (err) {
          console.warn("[QR] Failed to log scan:", err);
        }
      }
      navigate(`/wedding/${slug}`, { replace: true });
    }
    redirect();
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
