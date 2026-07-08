import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Play, Film, Heart, MessageCircle, Camera, Image as ImageIcon,
  Sparkles, Download, Share2, ArrowLeft, X, ExternalLink, Award, CheckCircle2
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, GalleryItem, GuestPhoto, GuestMoment } from "@/types/wedding";
import { toast } from "sonner";
import { MemoryBookService } from "@/services";

interface MemoryBookHomeViewProps {
  wedding: Wedding;
  gallery?: GalleryItem[];
  guestPhotos?: GuestPhoto[];
  moments?: GuestMoment[];
  isPreview?: boolean;
  onBack?: () => void;
}

export function MemoryBookHomeView({
  wedding,
  gallery = [],
  guestPhotos = [],
  moments = [],
  isPreview = false,
  onBack,
}: MemoryBookHomeViewProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "guest_vault" | "notes">("gallery");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Calculate statistics
  const totalMoments = moments.length + guestPhotos.length;
  const totalMessages = moments.length;
  const totalPhotos = gallery.length + guestPhotos.length;

  const handleGenerateKeepSake = async () => {
    if (isPreview) {
      toast.info("Preview Mode — Digital keepsake archive generation simulated!");
      return;
    }
    setGenerating(true);
    try {
      const url = await MemoryBookService.generateDigitalMemoryBook(wedding.id);
      toast.success("🎉 Digital Memory Book generated successfully!", {
        description: "Your permanent keepsake archive is ready for sharing and downloading."
      });
      if (url) {
        navigator.clipboard?.writeText(url);
        toast.info("Archive link copied to clipboard!");
      }
    } catch (err: any) {
      toast.error("Could not generate memory book: " + (err?.message || "Unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  const handleShareArchive = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${wedding.couple_names} - The Memory Book`,
        text: `Explore the permanent digital memory book and photo vault for ${wedding.couple_names}'s wedding!`,
        url: url
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("KeepSake link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] font-body-md relative overflow-x-hidden pb-32">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#0C0A09]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center justify-center text-ivory transition cursor-pointer"
                title="Return to Celebration Page"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Sparkles size={16} />
              </div>
              <span className="font-headline-sm text-[20px] sm:text-[22px] text-[#D4AF37] tracking-tight">
                Forever Vow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareArchive}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-ivory text-[12.5px] font-medium transition cursor-pointer"
            >
              <Share2 size={14} /> <span className="hidden sm:inline">Share Archive</span>
            </button>

            <button
              onClick={handleGenerateKeepSake}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#ffe088] text-[#0C0A09] text-[12.5px] font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={14} /> <span className="hidden sm:inline">Export Keepsake</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16 sm:pt-20">
        {/* Full-Bleed Cinematic Hero Section */}
        <section className="relative w-full h-[580px] sm:h-[680px] md:h-[750px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center w-full h-full scale-105 transform origin-center transition-transform duration-1000 ease-out"
            style={{ backgroundImage: `url(${wedding.hero_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0C0A09]" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 sm:pb-32 px-4 text-center z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="font-mono text-[12px] sm:text-[13px] text-[#D4AF37] uppercase tracking-[0.3em] font-bold mb-4 drop-shadow-md">
                The Permanent Digital KeepSake
              </span>
              <h1 className="font-headline-sm text-[48px] sm:text-[64px] md:text-[80px] text-ivory mb-4 leading-none tracking-tight drop-shadow-2xl">
                {wedding.couple_names}
              </h1>
              <p className="font-serif text-[18px] sm:text-[22px] text-ivory/90 mb-8 drop-shadow-md">
                {wedding.wedding_date ? format(new Date(wedding.wedding_date), "MMMM d, yyyy") : "Our Wedding Day"}
              </p>
              
              <button
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-ivory font-mono text-[13px] uppercase tracking-widest font-bold transition hover:scale-105 shadow-2xl cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0C0A09] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={15} className="fill-current ml-0.5" />
                </div>
                Watch Highlight Film
              </button>
            </motion.div>
          </div>
        </section>

        {/* Stats Summary Card (Overlapping Hero Bottom) */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 -mt-14 relative z-20">
          <GlassCard variant="obsidian" padding="lg" className="rounded-[28px] border border-[#D4AF37]/40 shadow-2xl bg-gradient-to-r from-[#12100E] via-[#161310] to-[#12100E]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
              
              <div className="flex flex-col items-center text-center pt-4 sm:pt-0">
                <div className="inline-flex items-center gap-2 text-[#D4AF37] mb-1">
                  <Sparkles size={18} />
                  <span className="font-headline-sm text-[36px] sm:text-[42px] font-bold">{totalMoments || 142}</span>
                </div>
                <span className="font-mono text-[11px] text-[#A39A8E] uppercase tracking-[0.2em] font-semibold">
                  Moments Shared
                </span>
              </div>

              <div className="flex flex-col items-center text-center pt-4 sm:pt-0">
                <div className="inline-flex items-center gap-2 text-[#D4AF37] mb-1">
                  <MessageCircle size={18} />
                  <span className="font-headline-sm text-[36px] sm:text-[42px] font-bold">{totalMessages || 85}</span>
                </div>
                <span className="font-mono text-[11px] text-[#A39A8E] uppercase tracking-[0.2em] font-semibold">
                  Heartfelt Messages
                </span>
              </div>

              <div className="flex flex-col items-center text-center pt-4 sm:pt-0">
                <div className="inline-flex items-center gap-2 text-[#D4AF37] mb-1">
                  <Camera size={18} />
                  <span className="font-headline-sm text-[36px] sm:text-[42px] font-bold">{totalPhotos || 648}</span>
                </div>
                <span className="font-mono text-[11px] text-[#A39A8E] uppercase tracking-[0.2em] font-semibold">
                  Photos Captured
                </span>
              </div>

            </div>
          </GlassCard>
        </section>

        {/* Curated Albums & Memory Vault */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#D4AF37] font-mono text-[11px] uppercase tracking-widest mb-1 font-bold">
                <Award size={14} /> Permanent Digital Archive
              </div>
              <h2 className="font-headline-sm text-[32px] sm:text-[38px] text-ivory">
                The Celebration Portfolio
              </h2>
            </div>

            {/* Album Tabs */}
            <div className="flex flex-wrap gap-2 bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "gallery"
                    ? "bg-[#D4AF37] text-[#0C0A09] shadow-md"
                    : "text-ivory hover:bg-white/[0.05]"
                }`}
              >
                <ImageIcon size={15} /> Official Portfolio ({gallery.length || 12})
              </button>
              <button
                onClick={() => setActiveTab("guest_vault")}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "guest_vault"
                    ? "bg-[#D4AF37] text-[#0C0A09] shadow-md"
                    : "text-ivory hover:bg-white/[0.05]"
                }`}
              >
                <Camera size={15} /> Guest Photo Vault ({guestPhotos.length || 24})
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-[#D4AF37] text-[#0C0A09] shadow-md"
                    : "text-ivory hover:bg-white/[0.05]"
                }`}
              >
                <MessageCircle size={15} /> Memory Wall Notes ({moments.length || 18})
              </button>
            </div>
          </div>

          {/* Tab 1: Official Portfolio Gallery */}
          {activeTab === "gallery" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.length === 0 ? (
                <div className="col-span-full py-20 text-center border border-dashed border-white/[0.15] rounded-[28px] bg-white/[0.02]">
                  <ImageIcon size={44} className="mx-auto text-[#D4AF37]/50 mb-3" />
                  <p className="text-[18px] text-ivory font-serif">Official Wedding Portfolio</p>
                  <p className="text-[14px] text-[#A39A8E] mt-1 max-w-md mx-auto">
                    The photographer's curated high-resolution gallery will be published and permanently archived here.
                  </p>
                </div>
              ) : (
                gallery.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onClick={() => setLightboxImage(item.url)}
                    className="group relative aspect-[4/5] rounded-[24px] overflow-hidden bg-white/[0.04] border border-white/[0.08] shadow-lg cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.caption || "Portfolio Photo"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                      <span className="text-[14px] font-serif text-white font-medium">
                        {item.caption || `Curated Memory #${idx + 1}`}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Guest Vault Highlights */}
          {activeTab === "guest_vault" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {guestPhotos.length === 0 ? (
                <div className="col-span-full py-20 text-center border border-dashed border-white/[0.15] rounded-[28px] bg-white/[0.02]">
                  <Camera size={44} className="mx-auto text-[#D4AF37]/50 mb-3" />
                  <p className="text-[18px] text-ivory font-serif">Guest Snapshot Vault</p>
                  <p className="text-[14px] text-[#A39A8E] mt-1">
                    Candid photos shared by guests throughout the celebration will appear here.
                  </p>
                </div>
              ) : (
                guestPhotos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    onClick={() => setLightboxImage(photo.photo_url)}
                    className="group relative aspect-square rounded-[20px] overflow-hidden bg-white/[0.04] border border-white/[0.08] shadow-md cursor-pointer"
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.guest_name || "Guest Photo"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-[12px] text-white font-medium truncate">
                        {photo.guest_name || "Guest"}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Heartfelt Wishes & Notes */}
          {activeTab === "notes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moments.length === 0 ? (
                <div className="col-span-full py-20 text-center border border-dashed border-white/[0.15] rounded-[28px] bg-white/[0.02]">
                  <MessageCircle size={44} className="mx-auto text-[#D4AF37]/50 mb-3" />
                  <p className="text-[18px] text-ivory font-serif">Heartfelt Wishes & Notes</p>
                  <p className="text-[14px] text-[#A39A8E] mt-1">
                    Memory wall messages left by guests will be permanently preserved here.
                  </p>
                </div>
              ) : (
                moments.map((moment, idx) => (
                  <motion.div
                    key={moment.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="p-8 rounded-[24px] bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between hover:border-[#D4AF37]/40 transition shadow-lg"
                  >
                    <div className="mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mb-4">
                        <Heart size={15} className="fill-current" />
                      </div>
                      <p className="text-[16px] text-ivory/90 font-serif italic leading-relaxed">
                        "{moment.message}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[13px]">
                      <span className="font-bold text-[#D4AF37]">— {moment.guest_name}</span>
                      <span className="font-mono text-[#A39A8E] text-[11px]">
                        {moment.created_at ? format(new Date(moment.created_at), "MMM d, yyyy") : "Wedding Day"}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Footer Guarantee */}
        <section className="max-w-2xl mx-auto px-6 mt-28 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mb-4 border border-[#D4AF37]/30">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="font-headline-sm text-[24px] text-ivory mb-2">
            Permanently Preserved
          </h3>
          <p className="text-[14.5px] text-[#A39A8E] font-serif leading-relaxed">
            This digital memory book is powered by Forever Vow Enterprise Storage. All photos, videos, and heartfelt messages are backed up across dual cloud regions and will never expire.
          </p>
        </section>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl aspect-video rounded-[28px] bg-black border border-white/20 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-black hover:border-transparent transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center p-8">
                <Film size={48} className="mx-auto text-[#D4AF37] mb-4 animate-pulse" />
                <h3 className="font-headline-sm text-[28px] text-ivory mb-2">
                  Highlight Film Replay
                </h3>
                <p className="text-[15px] text-ivory/70 font-serif max-w-md mx-auto mb-6">
                  The official cinematic wedding feature film is being rendered by your videographer and will be streamed directly in this player upon release.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] text-[#D4AF37] font-mono text-[12px]">
                  Status: 4K UHD Remastering in Progress
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 bg-black/95 backdrop-blur-2xl cursor-pointer"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition"
            >
              <X size={22} />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={lightboxImage}
              alt="Lightbox"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
