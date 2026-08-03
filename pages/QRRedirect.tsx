import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { store } from "@/store/weddingStore";

/**
 * Mirrors the repo's QRRedirect page.
 * Increments a QR scan counter and redirects to the wedding page.
 */
export default function QRRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) { navigate("/"); return; }
    const wedding = store.find("weddings", (w: any) => w.slug === slug && w.published);
    if (wedding) {
      const key = `wb_qr_${wedding.id}`;
      const count = Number(localStorage.getItem(key) || 0) + 1;
      localStorage.setItem(key, String(count));
    }
    navigate(`/wedding/${slug}`, { replace: true });
  }, [slug, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#c9a87a] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#8d7962] text-sm tracking-[0.18em] uppercase">Opening invitation…</div>
      </div>
    </div>
  );
}
