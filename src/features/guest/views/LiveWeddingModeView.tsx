import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Radio, Clock, Calendar, MapPin, Camera, Heart, MessageCircle,
  Share2, Sparkles, Plus, CheckCircle2, AlertCircle, Volume2, X, Send, Image as ImageIcon
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, WeddingEvent, WeddingUpdate, GuestPhoto, GuestMoment } from "@/types/wedding";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

interface LiveWeddingModeViewProps {
  wedding: Wedding;
  events?: WeddingEvent[];
  updates?: WeddingUpdate[];
  guestPhotos?: GuestPhoto[];
  moments?: GuestMoment[];
  isPreview?: boolean;
  onExitLiveMode?: () => void;
  onRefresh?: () => void;
}

export function LiveWeddingModeView({
  wedding,
  events = [],
  updates = [],
  guestPhotos = [],
  moments = [],
  isPreview = false,
  onExitLiveMode,
  onRefresh,
}: LiveWeddingModeViewProps) {
  const [activeTab, setActiveTab] = useState<"photos" | "notes">("photos");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"photo" | "note">("photo");
  
  // Form State
  const [guestName, setGuestName] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for optimistic updates
  const [localPhotos, setLocalPhotos] = useState<GuestPhoto[]>(guestPhotos);
  const [localMoments, setLocalMoments] = useState<GuestMoment[]>(moments);

  useEffect(() => {
    setLocalPhotos(guestPhotos);
  }, [guestPhotos]);

  useEffect(() => {
    setLocalMoments(moments);
  }, [moments]);

  // Derive initials for Monogram (e.g. "Emma & James" -> "E & J")
  const getInitials = (names: string) => {
    if (!names) return "F & V";
    const parts = names.split(/&|and|\+/i).map(s => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0].toUpperCase()} & ${parts[1][0].toUpperCase()}`;
    }
    return names.slice(0, 3).toUpperCase();
  };

  // Sort timeline events by date & time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = `${a.event_date || ""}T${a.event_time || "00:00"}`;
    const timeB = `${b.event_date || ""}T${b.event_time || "00:00"}`;
    return timeA.localeCompare(timeB);
  });

  // Determine "Happening Now" vs "Up Next"
  const currentEvent = sortedEvents.length > 0 ? sortedEvents[0] : {
    id: "default-now",
    wedding_id: wedding.id,
    title: "Cocktail Hour & Reception",
    event_date: wedding.wedding_date,
    event_time: "16:30",
    location: wedding.reception_venue || "Sunset Terrace & Conservatory",
    description: "Enjoy signature drinks, hors d'oeuvres, and live music while taking in the twilight atmosphere.",
    created_at: new Date().toISOString()
  } as WeddingEvent;

  const upcomingEvents = sortedEvents.length > 1 ? sortedEvents.slice(1) : [
    {
      id: "default-next-1",
      wedding_id: wedding.id,
      title: "Guests Seated for Dinner",
      event_date: wedding.wedding_date,
      event_time: "18:00",
      location: "Grand Ballroom",
      created_at: new Date().toISOString()
    },
    {
      id: "default-next-2",
      wedding_id: wedding.id,
      title: "Grand Entrance & First Dance",
      event_date: wedding.wedding_date,
      event_time: "18:15",
      location: "Grand Ballroom Dance Floor",
      created_at: new Date().toISOString()
    },
    {
      id: "default-next-3",
      wedding_id: wedding.id,
      title: "Cake Cutting & Champagne Toast",
      event_date: wedding.wedding_date,
      event_time: "19:30",
      location: "Main Reception Hall",
      created_at: new Date().toISOString()
    }
  ] as WeddingEvent[];

  const latestAnnouncement = updates.length > 0 ? updates[0] : {
    id: "default-announcement",
    wedding_id: wedding.id,
    title: "Live Celebration Feed",
    message: "Welcome to our live celebration! The interactive photo booth and guest vault are now open. Snap a photo and leave a note!",
    created_at: new Date().toISOString()
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Please select an image under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (uploadType === "photo" && !selectedImage) {
      toast.error("Please select an image to upload.");
      return;
    }

    if (uploadType === "note" && !noteMessage.trim()) {
      toast.error("Please write a message for your note.");
      return;
    }

    setSubmitting(true);
    try {
      if (isPreview) {
        toast.info("Preview Mode — Share simulated successfully!");
        if (uploadType === "photo" && selectedImage) {
          setLocalPhotos(prev => [{
            id: `sim-${Date.now()}`,
            wedding_id: wedding.id,
            guest_name: guestName.trim(),
            photo_url: selectedImage,
            likes: 1,
            created_at: new Date().toISOString()
          }, ...prev]);
        } else if (uploadType === "note") {
          setLocalMoments(prev => [{
            id: `sim-${Date.now()}`,
            wedding_id: wedding.id,
            guest_name: guestName.trim(),
            message: noteMessage.trim(),
            created_at: new Date().toISOString()
          }, ...prev]);
        }
      } else {
        if (uploadType === "photo" && selectedImage) {
          const { error } = await supabase.from("guest_photos").insert([{
            wedding_id: wedding.id,
            guest_name: guestName.trim(),
            photo_url: selectedImage,
            likes: 0,
            created_at: new Date().toISOString()
          }]);
          if (error) throw error;
          toast.success("📸 Snapshot shared to the live vault!");
        } else {
          const { error } = await supabase.from("guest_moments").insert([{
            wedding_id: wedding.id,
            guest_name: guestName.trim(),
            message: noteMessage.trim(),
            created_at: new Date().toISOString()
          }]);
          if (error) throw error;
          toast.success("✨ Heartfelt note posted to the wall!");
        }
        if (onRefresh) onRefresh();
      }

      setShareModalOpen(false);
      setSelectedImage(null);
      setNoteMessage("");
    } catch (err: any) {
      toast.error("Failed to share: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePhoto = async (photoId: string) => {
    setLocalPhotos(prev => prev.map(p => p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p));
    if (!isPreview) {
      try {
        const photo = localPhotos.find(p => p.id === photoId);
        if (photo) {
          await supabase.from("guest_photos").update({ likes: (photo.likes || 0) + 1 }).eq("id", photoId);
        }
      } catch (err) {
        console.warn("Could not update likes:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] font-body-md relative overflow-x-hidden pb-32">
      {/* Ambient Twilight Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${wedding.hero_image_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=80'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09]/60 via-[#0C0A09]/80 to-[#0C0A09]" />
        {/* Subtle radial gold glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 pt-8 md:pt-14">
        {/* Top Control Bar */}
        {onExitLiveMode && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onExitLiveMode}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-ivory text-[13px] font-medium transition cursor-pointer"
            >
              <X size={15} /> Exit Live Mode
            </button>
          </div>
        )}

        {/* Header: Monogram & Live Status */}
        <header className="flex flex-col items-center justify-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-2.5 mb-4 bg-white/[0.08] backdrop-blur-xl px-4 py-1.5 rounded-full border border-[#D4AF37]/30 shadow-lg">
            <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_12px_#D4AF37]" />
            <span className="font-mono text-[11px] text-[#D4AF37] tracking-[0.24em] uppercase font-bold">Live Celebration Feed</span>
          </div>
          <h1 className="font-headline-sm text-[42px] sm:text-[56px] text-[#D4AF37] text-center mb-2 tracking-tight drop-shadow-md">
            {getInitials(wedding.couple_names)}
          </h1>
          <p className="font-serif text-[18px] sm:text-[20px] text-ivory/80 text-center max-w-lg">
            Celebrating the marriage of <span className="text-ivory font-semibold">{wedding.couple_names}</span>
          </p>
        </header>

        {/* Main 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (5 Cols): Schedule & Announcements */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Happening Now Glass Card */}
            <GlassCard variant="obsidian" padding="xl" className="rounded-[28px] border border-[#D4AF37]/40 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Radio size={18} className="text-[#D4AF37] animate-pulse" />
                  <h2 className="font-headline-sm text-[22px] text-ivory">Happening Now</h2>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                  Active
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 font-mono text-[13px] text-[#D4AF37] uppercase tracking-wider font-semibold">
                  <Clock size={14} />
                  {currentEvent.event_time || "16:30"}
                  {currentEvent.event_date && ` • ${format(new Date(currentEvent.event_date), "MMM d")}`}
                </div>
                <h3 className="font-headline-sm text-[28px] text-ivory leading-tight">
                  {currentEvent.title}
                </h3>
                <p className="text-[15px] text-ivory/70 leading-relaxed font-serif">
                  {currentEvent.description || "Join us as we celebrate this special moment of our wedding day."}
                </p>
                {currentEvent.location && (
                  <div className="inline-flex items-center gap-2 text-[13.5px] text-[#A39A8E] pt-1">
                    <MapPin size={15} className="text-[#D4AF37]" />
                    <span>{currentEvent.location}</span>
                  </div>
                )}
              </div>

              {/* Progress Line */}
              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <div className="w-full h-1 bg-white/[0.1] rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#FFE088] rounded-full shadow-[0_0_12px_#D4AF37]" 
                  />
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Schedule List */}
            <GlassCard variant="obsidian" padding="lg" className="rounded-[28px] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-[12px] text-[#A39A8E] uppercase tracking-[0.2em] font-bold">Up Next</h2>
                <Calendar size={16} className="text-[#A39A8E]" />
              </div>

              <div className="relative pl-6 space-y-6">
                {/* Vertical Timeline Line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#D4AF37]/60 via-white/[0.15] to-transparent" />

                {upcomingEvents.map((ev, idx) => (
                  <div key={ev.id || idx} className={`relative flex items-start gap-4 ${idx > 0 ? "opacity-60 hover:opacity-100 transition-opacity" : ""}`}>
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#0C0A09] border-2 border-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
                      {idx === 0 && <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />}
                    </div>
                    <div>
                      <div className="font-mono text-[12px] text-[#D4AF37] font-semibold">
                        {ev.event_time || "TBA"}
                      </div>
                      <h4 className="text-[17px] text-ivory font-medium mt-0.5">
                        {ev.title}
                      </h4>
                      {ev.location && (
                        <p className="text-[13px] text-[#A39A8E] mt-1 flex items-center gap-1">
                          <MapPin size={13} /> {ev.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Live Announcements */}
            <GlassCard variant="obsidian" padding="lg" className="rounded-[28px] border-l-4 border-l-[#D4AF37] border-y border-r border-white/[0.08] bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 size={18} className="text-[#D4AF37]" />
                <h2 className="font-mono text-[11px] text-[#D4AF37] uppercase tracking-[0.2em] font-bold">Latest Broadcast</h2>
              </div>
              <h4 className="text-[17px] text-ivory font-semibold mb-1">
                {latestAnnouncement.title}
              </h4>
              <p className="text-[14.5px] text-ivory/80 leading-relaxed font-serif">
                {latestAnnouncement.message}
              </p>
              <div className="mt-3 text-[11.5px] font-mono text-[#A39A8E]">
                {latestAnnouncement.created_at ? format(new Date(latestAnnouncement.created_at), "h:mm a • MMM d") : "Just now"}
              </div>
            </GlassCard>
          </div>

          {/* Right Column (7 Cols): Live Photo Feed & Memory Wall */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <GlassCard variant="obsidian" padding="xl" className="rounded-[28px] border border-white/[0.08] flex flex-col h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="font-headline-sm text-[26px] text-ivory">Guest Moments</h2>
                  <p className="text-[14px] text-[#A39A8E] mt-1">
                    Live snapshots & notes from #{wedding.slug?.replace(/-/g, "") || "ForeverVow"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setUploadType("photo"); setShareModalOpen(true); }}
                    className="px-5 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#ffe088] text-[#0C0A09] font-bold text-[13px] tracking-wide transition flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Camera size={16} /> Share Snapshot
                  </button>
                  <button
                    onClick={() => { setUploadType("note"); setShareModalOpen(true); }}
                    className="px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-ivory font-medium text-[13px] transition flex items-center gap-2 border border-white/[0.1] cursor-pointer"
                  >
                    <MessageCircle size={16} /> Leave Note
                  </button>
                </div>
              </div>

              {/* Toggle Tabs */}
              <div className="flex border-b border-white/[0.08] mb-6">
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`pb-3 px-4 text-[14px] font-medium transition border-b-2 cursor-pointer ${
                    activeTab === "photos" 
                      ? "border-[#D4AF37] text-[#D4AF37]" 
                      : "border-transparent text-[#A39A8E] hover:text-ivory"
                  }`}
                >
                  Live Photo Vault ({localPhotos.length})
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`pb-3 px-4 text-[14px] font-medium transition border-b-2 cursor-pointer ${
                    activeTab === "notes" 
                      ? "border-[#D4AF37] text-[#D4AF37]" 
                      : "border-transparent text-[#A39A8E] hover:text-ivory"
                  }`}
                >
                  Memory Wall Notes ({localMoments.length})
                </button>
              </div>

              {/* Tab 1: Photo Grid */}
              {activeTab === "photos" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-grow">
                  {localPhotos.length === 0 ? (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/[0.15] rounded-[24px]">
                      <Camera size={36} className="mx-auto text-[#D4AF37]/50 mb-3" />
                      <p className="text-[16px] text-ivory font-serif">No live photos uploaded yet.</p>
                      <p className="text-[13px] text-[#A39A8E] mt-1">Be the first to capture and share a moment!</p>
                      <button
                        onClick={() => { setUploadType("photo"); setShareModalOpen(true); }}
                        className="mt-5 px-6 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#D4AF37] text-[13px] font-bold border border-[#D4AF37]/30 transition cursor-pointer"
                      >
                        Upload First Snapshot
                      </button>
                    </div>
                  ) : (
                    localPhotos.map((photo, idx) => {
                      const isFeatured = idx === 0 && localPhotos.length > 2;
                      return (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className={`group relative rounded-[20px] overflow-hidden bg-white/[0.04] border border-white/[0.08] shadow-md aspect-square ${
                            isFeatured ? "col-span-2 row-span-2" : ""
                          }`}
                        >
                          <img 
                            src={photo.photo_url} 
                            alt={photo.guest_name || "Guest Photo"} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-white truncate max-w-[70%]">
                              {photo.guest_name || "Guest"}
                            </span>
                            <button
                              onClick={() => handleLikePhoto(photo.id)}
                              className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#D4AF37] hover:text-black hover:border-transparent transition cursor-pointer"
                            >
                              <Heart size={12} className="fill-current text-[#rose-light] group-hover:text-black" />
                              {photo.likes || 0}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Notes Grid */}
              {activeTab === "notes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                  {localMoments.length === 0 ? (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/[0.15] rounded-[24px]">
                      <MessageCircle size={36} className="mx-auto text-[#D4AF37]/50 mb-3" />
                      <p className="text-[16px] text-ivory font-serif">No notes written yet.</p>
                      <p className="text-[13px] text-[#A39A8E] mt-1">Leave a heartfelt wish or memory note for the couple!</p>
                      <button
                        onClick={() => { setUploadType("note"); setShareModalOpen(true); }}
                        className="mt-5 px-6 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#D4AF37] text-[13px] font-bold border border-[#D4AF37]/30 transition cursor-pointer"
                      >
                        Write First Note
                      </button>
                    </div>
                  ) : (
                    localMoments.map((moment, idx) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="p-6 rounded-[22px] bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between hover:border-[#D4AF37]/40 transition"
                      >
                        <p className="text-[15px] text-ivory/90 font-serif italic leading-relaxed">
                          "{moment.message}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[12px]">
                          <span className="font-bold text-[#D4AF37]">— {moment.guest_name}</span>
                          <span className="font-mono text-[#A39A8E]">
                            {moment.created_at ? format(new Date(moment.created_at), "MMM d") : "Today"}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Share Snapshot / Note Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-[28px] bg-[#12100E] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-6 right-6 text-[#A39A8E] hover:text-ivory transition cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-[11px] uppercase tracking-widest mb-2 font-bold">
                <Sparkles size={14} /> Live Celebration Feed
              </div>
              <h3 className="font-headline-sm text-[26px] text-ivory mb-6">
                {uploadType === "photo" ? "Share a Live Snapshot" : "Leave a Memory Wall Note"}
              </h3>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.05] rounded-xl mb-6 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setUploadType("photo")}
                  className={`py-2 text-[13px] font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    uploadType === "photo" ? "bg-[#D4AF37] text-black shadow-md" : "text-ivory hover:bg-white/[0.05]"
                  }`}
                >
                  <Camera size={15} /> Photo Snapshot
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("note")}
                  className={`py-2 text-[13px] font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    uploadType === "note" ? "bg-[#D4AF37] text-black shadow-md" : "text-ivory hover:bg-white/[0.05]"
                  }`}
                >
                  <MessageCircle size={15} /> Heartfelt Note
                </button>
              </div>

              <form onSubmit={handleSubmitShare} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-mono text-[#A39A8E] uppercase tracking-wider mb-1.5 font-semibold">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Aunt Sarah & Uncle Tom"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-4 py-3 text-ivory placeholder-[#A39A8E]/60 text-[14px] focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                {uploadType === "photo" ? (
                  <div>
                    <label className="block text-[12px] font-mono text-[#A39A8E] uppercase tracking-wider mb-1.5 font-semibold">
                      Select Snapshot *
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-white/[0.15] hover:border-[#D4AF37] bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition relative group"
                    >
                      {selectedImage ? (
                        <>
                          <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[13px] font-medium">
                            Click to change image
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon size={22} />
                          </div>
                          <span className="text-[14px] text-ivory font-medium">Click to choose photo</span>
                          <span className="text-[12px] text-[#A39A8E] mt-1">PNG, JPG or WEBP under 10MB</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[12px] font-mono text-[#A39A8E] uppercase tracking-wider mb-1.5 font-semibold">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={noteMessage}
                      onChange={e => setNoteMessage(e.target.value)}
                      placeholder="Write your wishes, advice, or favorite memory from today..."
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-4 py-3 text-ivory placeholder-[#A39A8E]/60 text-[14px] focus:outline-none focus:border-[#D4AF37] transition resize-none font-serif"
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-ivory text-[13px] font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-[#0C0A09] font-bold text-[13px] transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Post to Live Feed
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
