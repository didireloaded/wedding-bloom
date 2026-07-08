import React, { useState } from "react";
import {
  QrCode, Share2, Copy, Check, Download, ExternalLink,
  Sparkles, ShieldCheck, Smartphone, Globe, Printer, Layers
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding } from "@/types/wedding";
import { QRCodeSVG } from "qrcode.react";

interface QRAndSharePortalViewProps {
  wedding: Wedding;
  guestLinkUrl: string;
  onCopyLink: () => void;
  onOpenQRModal?: () => void;
}

export function QRAndSharePortalView({
  wedding,
  guestLinkUrl,
  onCopyLink,
  onOpenQRModal
}: QRAndSharePortalViewProps) {
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState<180 | 256 | 320>(256);
  const [qrColor, setQrColor] = useState<"#1B1C1C" | "#D4AF37" | "#2E3A2F">("#1B1C1C");

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const svgEl = document.getElementById("master-qr-code");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1200;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 1000, 1000);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `ForeverVow-QR-${wedding.slug || "wedding"}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <QrCode size={13} className="text-primary-container" />
            <span>Smart Invitations & Kiosk Access</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Share Portal & QR Hub
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Distribute custom access links, export high-definition QR assets for paper invitations, or launch day-of interactive display kiosks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={guestLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fv-btn-ghost !py-2.5 !px-4 text-xs inline-flex items-center gap-2"
          >
            <ExternalLink size={14} />
            <span>Preview Guest Portal</span>
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Code Customizer & Interactive Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.08] relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-primary-container" />
                <span className="font-headline-sm text-base text-ivory">Master Portal QR Code</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Print Quality Ready (Vector/High-Res)
              </span>
            </div>

            {/* QR Card Container */}
            <div className="p-8 rounded-3xl bg-white shadow-2xl border-4 border-[#F0EBE0] transition duration-300 transform hover:scale-[1.02] flex flex-col items-center max-w-sm w-full">
              <div className="font-display-lg text-lg text-[#1B1C1C] font-bold mb-1 tracking-wide">
                {wedding.couple_names || "Join Our Celebration"}
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#6E706E] mb-5">
                Scan with mobile camera to enter
              </p>

              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-inner flex items-center justify-center">
                <QRCodeSVG
                  id="master-qr-code"
                  value={guestLinkUrl}
                  size={qrSize}
                  fgColor={qrColor}
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 w-full flex items-center justify-between text-[11px] font-mono text-[#545554]">
                <span>Code: <strong className="text-obsidian">{wedding.access_code || "VIP2026"}</strong></span>
                <span>Forever Vow Suite</span>
              </div>
            </div>

            {/* QR Customizer Toolbar */}
            <div className="w-full mt-8 pt-6 border-t border-white/[0.08] grid sm:grid-cols-2 gap-4">
              <div className="text-left space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60">Color Palette</label>
                <div className="flex items-center gap-2.5">
                  {[
                    { label: "Obsidian", color: "#1B1C1C" as const },
                    { label: "Imperial Gold", color: "#D4AF37" as const },
                    { label: "Botanical Green", color: "#2E3A2F" as const },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setQrColor(c.color)}
                      className={`h-8 px-3 rounded-xl text-xs flex items-center gap-2 border transition ${
                        qrColor === c.color ? "border-primary-container bg-white/[0.1] text-ivory font-bold" : "border-white/[0.08] bg-white/[0.02] text-ivory/60"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-left space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60">Export Resolution</label>
                <button
                  onClick={handleDownloadQR}
                  className="fv-btn-primary w-full !py-2.5 !px-4 text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download size={15} />
                  <span>Download High-Res Vector PNG</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: URL Links, Kiosks & Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Universal Link Box */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-primary-container font-headline-sm text-lg">
              <Globe size={18} />
              <span>Universal Celebration Link</span>
            </div>
            <p className="text-xs text-ivory/65 leading-relaxed">
              Share this secure link via SMS, WhatsApp, or email. Guests will land directly on your interactive celebration story and RSVP concierge.
            </p>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-ivory/90 truncate select-all">{guestLinkUrl}</span>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                  copied ? "bg-emerald-500 text-white shadow-sm" : "bg-primary-container text-obsidian hover:bg-primary-container/90"
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied Link!" : "Copy URL"}</span>
              </button>
            </div>
          </GlassCard>

          {/* Invitation Stationery Guidance */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-ivory font-headline-sm text-lg">
              <Printer size={18} className="text-[#E8C97A]" />
              <span>Stationery Print Specs</span>
            </div>
            <div className="space-y-3 text-xs text-ivory/70 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <p><strong>Recommended Size:</strong> Minimum 1.25 inches (3.2 cm) square on printed paper cards to ensure rapid mobile camera focus.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <p><strong>Contrast Ratio:</strong> Always maintain high contrast between foreground bars and background cardstock (e.g., dark ink on ivory/cotton paper).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <p><strong>Access Code Note:</strong> Include your access code (<code className="bg-white/10 px-1.5 py-0.5 rounded text-ivory">{wedding.access_code || "VIP"}</code>) below the QR for elderly guests or desktop visitors.</p>
              </div>
            </div>
          </GlassCard>

          {/* Day-of Kiosk Mode Quick Launch */}
          <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/30 bg-primary-container/[0.03] space-y-3">
            <div className="flex items-center gap-2 text-primary-container font-headline-sm text-base">
              <Sparkles size={16} />
              <span>Interactive Welcome Kiosk</span>
            </div>
            <p className="text-xs text-ivory/65 leading-relaxed">
              Display this QR screen on a tablet or monitor at your ceremony entrance so arriving guests can check in and upload live photos instantly.
            </p>
            <button
              onClick={() => onOpenQRModal?.()}
              className="fv-btn-ghost w-full !py-2.5 text-xs flex items-center justify-center gap-2 border-primary-container/40 hover:bg-primary-container/15"
            >
              <Layers size={14} />
              <span>Launch Fullscreen Welcome Kiosk</span>
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
