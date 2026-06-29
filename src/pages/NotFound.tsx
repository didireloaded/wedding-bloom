import { Link } from "react-router-dom";
import { Flower2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6" style={{ fontFamily: '"Manrope", system-ui, sans-serif' }}>
      <style>{`
        .display { font-family: "Cormorant Garamond", Georgia, serif; }
        .wedding-label { letter-spacing: .26em; text-transform: uppercase; font-size: 11px; color: #b7834c; }
      `}</style>
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#f2e8da] border border-[#e4cfb7] flex items-center justify-center mb-5">
          <Flower2 size={20} className="text-[#b7794a]" />
        </div>
        <p className="wedding-label mb-3">404</p>
        <h1 className="display text-[48px] text-[#2a231d] mb-3">Page not found</h1>
        <p className="text-[15px] text-[#6b5d4f] mb-8">
          The page you're looking for doesn't exist or hasn't been published yet.
        </p>
        <Link to="/" className="inline-block px-6 py-[13px] rounded-full bg-[#2b2723] text-[#f9f2e8] text-[14px]">
          Back home
        </Link>
      </div>
    </div>
  );
}
