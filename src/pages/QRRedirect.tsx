import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

/**
 * Mirrors the repo's QRRedirect page.
 * Redirects to the wedding page.
 */
export default function QRRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function redirect() {
      if (!slug) { navigate("/"); return; }
      const { data: wedding } = await supabase.from("weddings").select("id").eq("slug", slug).single();
      if (wedding?.id) {
        const key = `wb_qr_${wedding.id}`;
        const count = Number(localStorage.getItem(key) || 0) + 1;
        localStorage.setItem(key, String(count));
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
