import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";

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

  return (
    <div className="rounded-[26px] border border-white/75 bg-white/88 p-5 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          <h3 className="font-body text-base font-semibold">Printable QR codes</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Share your wedding page with guests, or print the QR codes for your venue.
        </p>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Invitation QR */}
          <div className="rounded-2xl bg-black/[0.04] p-3 text-center">
            <p className="mb-3 font-body text-[10px] font-semibold text-muted-foreground">
              Invitation QR
            </p>
            <div className="flex justify-center mb-3">
              <div className="inline-block rounded-xl bg-white p-2">
                <QRCodeSVG id="invitation-qr" value={weddingUrl} size={92} level="H" />
              </div>
            </div>
            <button
              onClick={() => downloadQR("invitation-qr", `${weddingSlug}-invitation`)}
              className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-foreground px-3 py-2 font-body text-[10px] font-semibold text-background"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>

          {/* Check-in QR */}
          <div className="rounded-2xl bg-black/[0.04] p-3 text-center">
            <p className="mb-3 font-body text-[10px] font-semibold text-muted-foreground">
              Venue Check-in QR
            </p>
            <div className="flex justify-center mb-3">
              <div className="inline-block rounded-xl bg-white p-2">
                <QRCodeSVG id="checkin-qr" value={checkinUrl} size={92} level="H" />
              </div>
            </div>
            <button
              onClick={() => downloadQR("checkin-qr", `${weddingSlug}-checkin`)}
              className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-foreground px-3 py-2 font-body text-[10px] font-semibold text-background"
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
