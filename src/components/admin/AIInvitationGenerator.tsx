import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Download, Share2, Copy, Mail, MessageCircle, Wand2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

interface AIInvitationGeneratorProps {
  coupleNames: string;
  weddingDate: string;
  venue: string;
  weddingLink: string;
  theme?: any;
}

const AIInvitationGenerator = ({ coupleNames, weddingDate, venue, weddingLink, theme }: AIInvitationGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryColor = theme?.primary ? `hsl(${theme.primary})` : "hsl(30 10% 15%)";
  const secondaryColor = theme?.secondary ? `hsl(${theme.secondary})` : "hsl(35 30% 88%)";
  const accentColor = theme?.accent ? `hsl(${theme.accent})` : "hsl(38 60% 55%)";
  const bgColor = theme?.background ? `hsl(${theme.background})` : "hsl(40 20% 97%)";
  const fgColor = theme?.foreground ? `hsl(${theme.foreground})` : "hsl(30 10% 15%)";

  const formattedDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const generateMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_invitation_message", coupleNames, weddingDate: formattedDate, venue, weddingLink },
      });
      if (error) throw error;
      if (data?.result) {
        setMessages(data.result);
        toast.success("Invitation messages generated!");
      }
    } catch {
      toast.error("Failed to generate messages.");
    }
    setLoading(false);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
      const a = document.createElement("a");
      a.download = `${coupleNames.replace(/\s+/g, "-").toLowerCase()}-invitation.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast.success("Invitation downloaded!");
    } catch {
      toast.error("Failed to download. Try again.");
    }
  };

  const shareWhatsApp = () => {
    const text = messages?.whatsapp_message || `You're invited to the wedding of ${coupleNames}! ${weddingLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareEmail = () => {
    const subject = messages?.email_subject || `Wedding Invitation: ${coupleNames}`;
    const body = messages?.email_body || `You're invited to celebrate with ${coupleNames}.\n\n${weddingLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="space-y-6">
      {/* Invitation Card Preview */}
      <div className="space-y-3">
        <p className="wedding-label">DIGITAL INVITATION CARD</p>
        <div
          ref={cardRef}
          className="mx-auto max-w-md p-10 text-center space-y-6"
          style={{ backgroundColor: bgColor, color: fgColor, border: `1px solid ${secondaryColor}` }}
        >
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: accentColor }}>
            YOU ARE CORDIALLY INVITED
          </p>
          <div className="py-4">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: accentColor }}>
              TO THE WEDDING OF
            </p>
            <h2 className="font-display text-4xl font-light tracking-wide">{coupleNames}</h2>
          </div>
          {formattedDate && (
            <p className="text-sm tracking-[0.2em] uppercase">{formattedDate}</p>
          )}
          {venue && (
            <p className="text-xs tracking-[0.15em]" style={{ color: `${fgColor}cc` }}>{venue}</p>
          )}
          <div className="pt-4 flex justify-center">
            <QRCodeSVG value={weddingLink} size={100} fgColor={fgColor} bgColor="transparent" />
          </div>
          <p className="text-[10px] tracking-widest uppercase" style={{ color: `${fgColor}88` }}>
            SCAN TO VIEW WEDDING PAGE
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button onClick={downloadCard} className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase min-h-[44px]">
            <Download className="w-4 h-4" /> DOWNLOAD
          </button>
        </div>
      </div>

      {/* AI Message Generator */}
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-wedding-gold" />
            <p className="wedding-label">INVITATION MESSAGES</p>
          </div>
          <button onClick={generateMessages} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-wedding-gold/30 text-wedding-gold font-body text-xs tracking-[0.2em] uppercase hover:bg-wedding-gold/10 transition-colors min-h-[44px] disabled:opacity-50">
            <Wand2 className="w-4 h-4" /> {loading ? "GENERATING..." : "GENERATE"}
          </button>
        </div>

        {messages && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Formal invitation */}
            <div className="p-4 border border-border space-y-2">
              <p className="wedding-label">FORMAL INVITATION</p>
              <p className="font-body text-sm leading-relaxed">{messages.formal_invitation}</p>
              <button onClick={() => copyText(messages.formal_invitation, "Invitation")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body text-xs min-h-[44px]">
                <Copy className="w-3 h-3" /> {copied === "Invitation" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white font-body text-xs tracking-[0.15em] uppercase min-h-[48px]">
                <MessageCircle className="w-4 h-4" /> SHARE ON WHATSAPP
              </button>
              <button onClick={shareEmail} className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background font-body text-xs tracking-[0.15em] uppercase min-h-[48px]">
                <Mail className="w-4 h-4" /> SHARE VIA EMAIL
              </button>
            </div>

            {/* WhatsApp message preview */}
            <div className="p-4 border border-border space-y-2">
              <p className="wedding-label">WHATSAPP MESSAGE</p>
              <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{messages.whatsapp_message}</p>
              <button onClick={() => copyText(messages.whatsapp_message, "WhatsApp")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body text-xs min-h-[44px]">
                <Copy className="w-3 h-3" /> {copied === "WhatsApp" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Email preview */}
            <div className="p-4 border border-border space-y-2">
              <p className="wedding-label">EMAIL</p>
              <p className="font-body text-xs text-muted-foreground">Subject: {messages.email_subject}</p>
              <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{messages.email_body}</p>
              <button onClick={() => copyText(`Subject: ${messages.email_subject}\n\n${messages.email_body}`, "Email")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body text-xs min-h-[44px]">
                <Copy className="w-3 h-3" /> {copied === "Email" ? "Copied!" : "Copy"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIInvitationGenerator;
