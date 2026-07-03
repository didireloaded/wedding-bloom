import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  coupleNames?: string;
}

/**
 * Renders a downloadable QR code that points guests to the public
 * /wedding/:slug page. Uses the current origin so preview + production
 * both produce the correct URL.
 */
export function QRCodeModal({ open, onClose, slug, coupleNames }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const url = useMemo(() => `${window.location.origin}/wedding/${slug}`, [slug]);

  if (!open) return null;

  const download = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${slug}-invitation-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invitation link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] bg-[#0C0A09] border border-white/[0.12] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4A853] mb-1">Guest QR Code</div>
            <h3 className="display text-[24px] text-[#FAF7F2] leading-tight">{coupleNames || "Wedding Invitation"}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-[#A8A29E] hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div ref={canvasRef} className="mx-auto w-fit p-5 rounded-[20px] bg-white shadow-inner">
          <QRCodeCanvas
            value={url}
            size={240}
            level="H"
            includeMargin={false}
            fgColor="#0C0A09"
            bgColor="#FFFFFF"
          />
        </div>

        <div className="mt-5 p-3 rounded-[14px] bg-white/[0.03] border border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#78716C] mb-1">Public Invitation Link</div>
          <code className="text-[12px] text-[#FAF7F2] font-mono break-all">{url}</code>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button onClick={download} className="flex flex-col items-center justify-center gap-1 py-3 rounded-[14px] bg-[#D4A853] text-[#0C0A09] text-[12px] font-semibold hover:bg-[#c99a45] transition">
            <Download size={16} /> Download
          </button>
          <button onClick={copy} className="flex flex-col items-center justify-center gap-1 py-3 rounded-[14px] bg-white/[0.06] border border-white/[0.08] text-[#FAF7F2] text-[12px] font-semibold hover:bg-white/[0.1] transition">
            <Copy size={16} /> Copy Link
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 py-3 rounded-[14px] bg-white/[0.06] border border-white/[0.08] text-[#FAF7F2] text-[12px] font-semibold hover:bg-white/[0.1] transition">
            <ExternalLink size={16} /> Open
          </a>
        </div>

        <p className="mt-4 text-[11px] text-[#78716C] leading-relaxed text-center">
          Print, share on WhatsApp, or display at your venue — scanning opens the guest experience instantly.
        </p>
      </div>
    </div>
  );
}
