import { Link } from "react-router-dom";
import { Flower2, Home } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] text-[#FAF7F2] px-6 py-12">
      <div className="w-full max-w-md">
        <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.12] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4A853]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="mx-auto w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mb-6 text-[#D4A853] shadow-md">
            <Flower2 size={26} />
          </div>
          <p className="wedding-label mb-2 text-[#D4A853]">Error 404</p>
          <h1 className="display text-[44px] text-[#FAF7F2] mb-3 leading-tight">Page Not Found</h1>
          <p className="text-[14.5px] text-[#A8A29E] mb-8 leading-relaxed">
            The page or invitation you are attempting to view does not exist or has been removed.
          </p>
          <Link to="/" className="fv-btn-primary w-full !py-3.5 flex items-center justify-center gap-2 text-[13px]">
            <Home size={16} /> Return to ForeverVow
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
