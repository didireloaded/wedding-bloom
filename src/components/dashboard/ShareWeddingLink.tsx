import { QRCodeSVG } from "qrcode.react";
import { Link2, ExternalLink, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareWeddingLinkProps {
  weddingSlug: string;
}

const ShareWeddingLink = ({ weddingSlug }: ShareWeddingLinkProps) => {
  const weddingUrl = `${window.location.origin}/wedding/${weddingSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(weddingUrl);
    toast.success("Wedding link copied to clipboard!");
  };

  const downloadQR = () => {
    const svg = document.getElementById("share-invitation-qr");
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
      a.download = `${weddingSlug}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast.success("QR code downloaded!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div
      id="share-wedding-section"
      className="border border-primary/20 bg-primary/5 p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* QR Code */}
        <div className="shrink-0 self-center sm:self-start p-3 bg-white border border-border">
          <QRCodeSVG id="share-invitation-qr" value={weddingUrl} size={96} level="H" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="font-display text-xl font-light">Share Your Wedding Invitation</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Share this link with your guests so they can open your invitation, view wedding details, and RSVP.
            </p>
          </div>

          {/* Link display */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={weddingUrl}
              readOnly
              className="flex-1 bg-background border border-border px-3 py-2 font-body text-xs text-muted-foreground truncate min-h-[40px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-[10px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors min-h-[40px]"
            >
              <Link2 className="w-3.5 h-3.5" />
              Copy Link
            </button>
            <a
              href={`/wedding/${weddingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border font-body text-[10px] tracking-[0.15em] uppercase hover:bg-muted transition-colors min-h-[40px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Wedding Page
            </a>
            <button
              onClick={downloadQR}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border font-body text-[10px] tracking-[0.15em] uppercase hover:bg-muted transition-colors min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWeddingLink;
