import { QRCodeSVG } from "qrcode.react";
import { Link2, Download, ExternalLink, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

interface WeddingToolsProps {
  weddingSlug: string;
}

const WeddingTools = ({ weddingSlug }: WeddingToolsProps) => {
  const weddingUrl = `${window.location.origin}/wedding/${weddingSlug}`;
  const checkinUrl = `${window.location.origin}/wedding/${weddingSlug}/checkin`;

  const downloadQR = (elementId: string, filename: string) => {
    const svg = document.getElementById(elementId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(weddingUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Wedding Invitation",
          url: weddingUrl,
        });
      } catch (e) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="border border-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-wedding-gold" />
          <h3 className="font-body text-xs tracking-[0.15em] uppercase">Share Your Wedding</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Share your wedding page with guests, or print the QR codes for your venue.
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Wedding Page Link */}
        <div className="space-y-3">
          <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
            Wedding Page
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={weddingUrl}
              readOnly
              className="flex-1 bg-muted/30 border border-border px-3 py-2 font-body text-xs text-muted-foreground truncate min-h-[40px]"
            />
            <button
              onClick={copyLink}
              className="p-2 border border-border hover:bg-muted transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={shareLink}
              className="p-2 border border-border hover:bg-muted transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={weddingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-border hover:bg-muted transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* QR Codes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Invitation QR */}
          <div className="p-4 border border-border text-center">
            <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Invitation QR
            </p>
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-white border border-border inline-block">
                <QRCodeSVG id="invitation-qr" value={weddingUrl} size={120} level="H" />
              </div>
            </div>
            <button
              onClick={() => downloadQR("invitation-qr", `${weddingSlug}-invitation`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-[10px] tracking-[0.15em] uppercase min-h-[36px]"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>

          {/* Check-in QR */}
          <div className="p-4 border border-border text-center">
            <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Venue Check-in QR
            </p>
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-white border border-border inline-block">
                <QRCodeSVG id="checkin-qr" value={checkinUrl} size={120} level="H" />
              </div>
            </div>
            <button
              onClick={() => downloadQR("checkin-qr", `${weddingSlug}-checkin`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-[10px] tracking-[0.15em] uppercase min-h-[36px]"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingTools;
