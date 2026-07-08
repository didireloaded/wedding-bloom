import React from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useWeddingData, useLiveGuestVault } from "@/hooks";
import { MemoryBookHomeView } from "@/features/guest/views/MemoryBookHomeView";

export default function MemoryBookPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get("preview") === "1";

  const { wedding, gallery, loading: weddingLoading } = useWeddingData(slug);
  const { guestPhotos, moments, loading: vaultLoading } = useLiveGuestVault(wedding?.id);

  if (weddingLoading || (wedding?.id && vaultLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <div className="text-[#D4AF37] font-mono text-[12px] tracking-[0.2em] uppercase">
            Opening Memory Book…
          </div>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-6 text-ivory">
        <div className="text-center max-w-md">
          <div className="font-mono text-[#D4AF37] mb-3 uppercase tracking-widest text-xs">404 • Archive Offline</div>
          <h1 className="font-headline-sm text-[38px] text-ivory">Memory Book Not Found</h1>
          <p className="text-[15px] text-[#A39A8E] mt-3 font-serif">
            This digital memory keepsake archive could not be located or has not been published yet.
          </p>
          <Link
            to={slug ? `/wedding/${slug}` : "/"}
            className="mt-6 inline-block px-6 py-3 rounded-full bg-[#D4AF37] text-[#0C0A09] font-bold text-[13px] transition hover:bg-[#ffe088]"
          >
            Return to Celebration Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MemoryBookHomeView
      wedding={wedding}
      gallery={gallery}
      guestPhotos={guestPhotos}
      moments={moments}
      isPreview={isPreview}
      onBack={() => navigate(`/wedding/${wedding.slug || slug}`)}
    />
  );
}
