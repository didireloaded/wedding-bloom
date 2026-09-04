import { QRCodeSVG } from "qrcode.react";
import { Link2, ExternalLink, Download } from "lucide-react";
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
    <div id="share-wedding-section" className="rounded-[26px] border border-white/75 bg-white/88 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* QR Code */}
        <div className="shrink-0 rounded-2xl bg-white p-2 shadow-sm">
          <QRCodeSVG id="share-invitation-qr" value={weddingUrl} size={82} level="H" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="font-body text-base font-semibold">Share with your guests</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Share this link with your guests so they can open your invitation, view wedding details, and RSVP.
            </p>
          </div>

          {/* Link display */}
          <p className="truncate rounded-full bg-black/[0.04] px-3 py-2 font-body text-[10px] text-muted-foreground">{weddingUrl}</p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyLink}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-foreground px-4 py-2 font-body text-[10px] font-semibold text-background"
            >
              <Link2 className="w-3.5 h-3.5" />
              Copy Link
            </button>
            <a
              href={`/wedding/${weddingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-black/10 px-4 py-2 font-body text-[10px] font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Wedding Page
            </a>
            <button
              onClick={downloadQR}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-black/10 px-4 py-2 font-body text-[10px] font-semibold"
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
