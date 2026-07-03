// @ts-nocheck
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Eye, Calendar, MapPin, Heart, Clock, Camera, Send, Sparkles, Flower2, Mail, MessageCircle, X, Gift, Users, ArrowRight, Menu, Plane, Train, Car, Navigation, ShieldCheck, CheckCircle2, Radio, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useWeddingData } from "@/hooks/useWeddingData";
import { format, differenceInDays } from "date-fns";
import { InvitationOverlay } from "@/components/wedding/InvitationOverlay";
import { GlassCard } from "@/components/ui/GlassCard";
import { submitRSVPToBackend, supabase } from "@/utils/supabase";
import { siteContent } from "@/config/siteContent";

function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const d = new Date(target + "T16:00:00").getTime();
  const diff = Math.max(0, d - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function generateICS(title: string, date: string | null, time: string | null, venue: string | null, url: string) {
  if (!date) return;
  const dt = new Date(`${date}T${time ?? "16:00"}:00`);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const end = new Date(dt.getTime() + 2 * 3600 * 1000);
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ForeverVow OS//EN\nBEGIN:VEVENT\nDTSTART:${fmt(dt)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nLOCATION:${venue || ""}\nDESCRIPTION:${url}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title.replace(/\W+/g, "-")}.ics`;
  a.click();
}

function RSVPForm({ wedding, isPreview }: { wedding: any; isPreview?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guest_name: "", email: "", attending: "yes", guest_count: 1,
    dietary_preference: "No preference", custom_diet: "", song_request: "", note: ""
  });
  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) { toast.info("This is a preview — RSVP is disabled"); return; }
    if (!form.guest_name.trim()) { toast.error("Please enter your name"); return; }
    if (form.attending === "yes" && form.dietary_preference === "Other" && !form.custom_diet.trim()) {
      toast.error("Please specify your dietary requirement"); return;
    }
    setLoading(true);
    const payload = {
      wedding_id: wedding.id,
      guest_name: form.guest_name.trim(),
      email: form.email.trim() || null,
      attending: form.attending === "yes" ? "confirmed" : "declined",
      guest_count: form.attending === "yes" ? (Number(form.guest_count) || 1) : 0,
      dietary_preference: form.attending === "yes" ? (form.dietary_preference === "Other" ? form.custom_diet.trim() : (form.dietary_preference || null)) : null,
      message: form.song_request || form.note || null,
      submitted_at: new Date().toISOString(),
    };

    const res = await submitRSVPToBackend(payload);
    if (!res.success) { toast.error(res.error || "Could not submit RSVP"); setLoading(false); return; }
    setLoading(false);
    setSubmitted(true);
    toast.success(form.attending === "yes" ? "RSVP Confirmed! ✨" : "RSVP Received", {
      description: form.attending === "yes" ? "We can't wait to celebrate with you!" : "Thank you for letting us know.",
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#7A9E7E]/20 border border-[#7A9E7E]/40 flex items-center justify-center text-[#7A9E7E] mb-5">
          <Heart size={24} fill="currentColor" />
        </div>
        <h3 className="display text-[32px] text-[#2C2926]">Thank You</h3>
        <p className="text-[15px] text-[#726C65] mt-2 max-w-md mx-auto leading-relaxed">
          Your response has been recorded. We will send updates and logistical details as the celebration approaches.
        </p>
        <button onClick={() => setSubmitted(false)} className="mt-6 text-[13px] text-[#A37C4D] font-bold underline underline-offset-4">Submit another RSVP</button>
      </div>
    );
  }

  const inputCls = "w-full rounded-[16px] border border-stone-200 bg-transparent px-4 py-3.5 outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition text-[14px] text-stone-800 placeholder:text-stone-400";
  const labelCls = "block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-600 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
      <div>
        <label className={labelCls}>Full Name</label>
        <input required value={form.guest_name} onChange={e => update("guest_name", e.target.value)} placeholder="Your name exactly as invited" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Email Address</label>
        <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="hello@example.com" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Attendance</label>
        <select value={form.attending} onChange={e => update("attending", e.target.value)} className={inputCls}>
          <option value="yes" className="bg-white text-stone-800">Joyfully Attending</option>
          <option value="no" className="bg-white text-stone-800">Regretfully Declining</option>
        </select>
      </div>
      {form.attending === "yes" && (
        <>
          <div>
            <label className={labelCls}>Party Size (Including You)</label>
            <input type="number" min={1} max={6} value={form.guest_count} onChange={e => update("guest_count", e.target.value)} className={inputCls} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className={labelCls}>Dietary Requirement</label>
            <select value={form.dietary_preference} onChange={e => update("dietary_preference", e.target.value)} className={inputCls}>
              <option value="No preference" className="bg-white text-stone-800">No preference</option>
              <option value="Vegetarian" className="bg-white text-stone-800">Vegetarian</option>
              <option value="Vegan" className="bg-white text-stone-800">Vegan</option>
              <option value="Gluten-free" className="bg-white text-stone-800">Gluten-free</option>
              <option value="Dairy-free" className="bg-white text-stone-800">Dairy-free</option>
              <option value="Severe Nut / Shellfish Allergy" className="bg-white text-stone-800">Severe Nut / Shellfish Allergy</option>
              <option value="Halal" className="bg-white text-stone-800">Halal</option>
              <option value="Other" className="bg-white text-stone-800">Other (Specify below)</option>
            </select>
          </div>
          {form.dietary_preference === "Other" && (
            <div className="col-span-1 md:col-span-2">
              <label className={labelCls}>Specify Allergy or Dietary Need</label>
              <input
                required
                value={form.custom_diet}
                onChange={e => update("custom_diet", e.target.value)}
                placeholder="e.g. Severe peanut allergy, FODMAP..."
                className={inputCls}
              />
            </div>
          )}
        </>
      )}
      <div className="col-span-1 md:col-span-2">
        <label className={labelCls}>Song Request</label>
        <textarea rows={2} value={form.song_request} onChange={e => update("song_request", e.target.value)} placeholder="One track guaranteed to get you on the dance floor…" className={inputCls + " resize-none"} />
      </div>
      <div className="col-span-1 md:col-span-2">
        <label className={labelCls}>Special Note for the Couple</label>
        <textarea rows={2} value={form.note} onChange={e => update("note", e.target.value)} placeholder="Optional warm wishes or logistical notes…" className={inputCls + " resize-none"} />
      </div>
      <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-[12px] text-stone-400 font-mono">ForeverVow Celebration Studio</div>
        <button type="submit" disabled={loading} className="fv-btn-primary !py-3.5 !px-8 text-[13px] disabled:opacity-50">
          <Send size={15} /> {loading ? "Sending RSVP..." : "Confirm & Send RSVP"}
        </button>
      </div>
    </form>
  );
}

function MomentsSectionGuestbook({ wedding, isPreview }: { wedding: any; isPreview?: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const fetchMoments = async () => {
    if (!wedding?.id) return;
    const { data } = await supabase.from("guest_moments").select("*").eq("wedding_id", wedding.id);
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMoments();
    const channel = supabase
      .channel("public:guest_moments")
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_moments" }, () => fetchMoments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [wedding?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) { toast.info("This is a preview — sharing is simulated"); return; }
    if (!name.trim() || !message.trim()) { toast.error("Please enter name and message"); return; }
    
    const { error } = await supabase.from("guest_moments").insert([{
      wedding_id: wedding.id,
      guest_name: name.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      toast.error("Could not post note: " + error.message);
      return;
    }

    setName(""); setMessage("");
    toast.success("Moment added to the wall");
    fetchMoments();
  };

  return (
    <div>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-4 mb-8">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="md:col-span-2 rounded-[16px] border border-[#E5DEC9] bg-white px-4 py-3.5 outline-none focus:border-[#C5A059] text-[14px]" />
        <button type="submit" className="fv-btn-primary !py-3.5 text-[13px]">Post Memory Note</button>
        <textarea required rows={2} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your heartfelt wishes or memory note here…" className="md:col-span-3 rounded-[16px] border border-[#E5DEC9] bg-white px-4 py-3.5 outline-none focus:border-[#C5A059] resize-none text-[14px]" />
      </form>
      <div className="grid md:grid-cols-3 gap-5">
        {messages.slice().reverse().map(m => (
          <GlassCard key={m.id} variant="crystal" padding="lg" className="border border-[#E5DEC9]">
            <div className="text-[15px] text-[#2C2926] leading-relaxed italic">"{m.message}"</div>
            <div className="text-[12px] text-[#A37C4D] font-bold mt-4 pt-3 border-t border-[#E5DEC9]/60">— {m.guest_name}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function GuestPhotosSection({ wedding, isPreview }: { wedding: any; isPreview?: boolean }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    if (!wedding?.id) return;
    const { data } = await supabase.from("guest_photos").select("*").eq("wedding_id", wedding.id);
    if (data) setPhotos(data);
  };

  useEffect(() => {
    fetchPhotos();
    const channel = supabase
      .channel("public:guest_photos")
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_photos" }, () => fetchPhotos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [wedding?.id]);

  const handleFile = (f: File) => {
    if (isPreview) {
      toast.info("Preview mode — photo upload simulated!");
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const { error } = await supabase.from("guest_photos").insert([{
        wedding_id: wedding.id,
        guest_name: isPreview ? "Preview Guest" : "Guest",
        photo_url: reader.result as string,
        likes: 0,
        created_at: new Date().toISOString(),
      }]);
      if (error) {
        toast.error("Upload error: " + error.message);
      } else {
        toast.success("Photo uploaded to the vault");
        fetchPhotos();
      }
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] font-bold text-[#A37C4D]">Live Guest Vault</div>
          <p className="text-[14px] text-[#726C65] mt-0.5">Share your candid snapshots directly to the couple&rsquo;s wedding vault.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-6 py-3 rounded-full bg-[#2C2926] hover:bg-[#A37C4D] text-[#FAF7F2] font-bold text-[13px] tracking-wide shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2.5 border border-[#C5A059]/40 cursor-pointer group"
          >
            <Camera size={16} className="text-[#C5A059] group-hover:text-white transition-colors" /> Upload Snapshot
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {photos.slice().reverse().map((p: any) => (
          <div key={p.id} className="relative aspect-square rounded-[20px] overflow-hidden border border-[#E5DEC9] group shadow-sm">
            <img src={p.photo_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-[11px] text-white font-medium">{p.guest_name}</div>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full text-center py-12 text-[13px] text-[#726C65] border border-dashed border-[#E5DEC9] rounded-[24px]">
            No guest photos shared yet. Be the first to upload!
          </div>
        )}
      </div>
    </div>
  );
}

function WeddingConcierge({ wedding }: { wedding: any }) {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { label: "Where is the ceremony?", href: "#venue" },
    { label: "Show venue blueprint", href: "#venue" },
    { label: "Get instant directions", href: `https://www.google.com/maps?q=${encodeURIComponent(wedding.venue_address || wedding.ceremony_venue)}` },
    { label: "View timeline schedule", href: "#events" },
    { label: "Upload celebration photos", href: "#guest-photos" },
    { label: "Leave a memory note", href: "#moments" },
    { label: "Add date to calendar", action: "calendar" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full glass-obsidian border border-white/[0.2] text-[#FAF7F2] flex items-center gap-2.5 shadow-2xl hover:scale-105 transition"
      >
        {open ? <X size={18}/> : <MessageCircle size={18} className="text-[#D4A853]"/>}
        <span className="text-[13px] font-bold">{open ? "Close Concierge" : "Guest Concierge"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-[340px] max-w-[92vw] glass-heavy rounded-[28px] border border-[#E5DEC9] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 bg-[#2C2926] text-[#FAF7F2]">
              <div className="wedding-label text-[#C5A059] text-[9px]">Virtual Assistant</div>
              <div className="display text-[20px]">Celebration Guide</div>
            </div>
            <div className="p-3 grid gap-1.5">
              {shortcuts.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (s.href?.startsWith("http")) window.open(s.href, "_blank");
                    else if (s.href) {
                      document.querySelector(s.href)?.scrollIntoView({ behavior: "smooth" });
                      setOpen(false);
                    } else if (s.action === "calendar") {
                      generateICS(wedding.couple_names + " Wedding", wedding.wedding_date, wedding.ceremony_time, wedding.ceremony_venue, window.location.href);
                      setOpen(false);
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-[14px] hover:bg-white text-[13px] font-semibold text-[#2C2926] transition flex items-center justify-between group"
                >
                  {s.label}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#C5A059]" />
                </button>
              ))}
            </div>
            <div className="bg-[#F3EFEA] p-3 text-center border-t border-[#E5DEC9]">
              <div className="text-[10px] text-[#A37C4D] font-mono uppercase">Powered by ForeverVow Studio</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function WeddingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const { wedding, events, gallery, updates, accommodations, markers, loading } = useWeddingData(slug);
  const [invitationOpen, setInvitationOpen] = useState(isPreview);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const countdown = useCountdown(wedding?.wedding_date ?? siteContent.weddingDateISO.split("T")[0]);
  const [journeyOptIn, setJourneyOptIn] = useState<"pending" | "shared" | "declined" | "arrived">("pending");

  useEffect(() => {
    if (!wedding?.id) return;
    const key = `wb_viewed_${wedding.id}`;
    const count = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(count));
  }, [wedding?.id]);

  const nav = useMemo(() => {
    if (wedding?.legacy_mode) {
      return [
        { id: "home", label: "Home" },
        { id: "story", label: "Story" },
        { id: "timeline", label: "Replay" },
        { id: "gallery", label: "Gallery" },
        { id: "moments", label: "Moments" },
      ];
    }
    return [
      { id: "home", label: "Home" },
      { id: "story", label: "Story" },
      { id: "timeline", label: "Timeline" },
      { id: "venue", label: "Venue & Stay" },
      { id: "rsvp", label: "RSVP" },
      { id: "gallery", label: "Gallery" },
    ];
  }, [wedding?.legacy_mode]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#A37C4D] font-mono text-[12px] tracking-[0.2em] uppercase">Opening Invitation…</div>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-6">
        <div className="text-center max-w-md">
          <div className="wedding-label mb-3">404</div>
          <h1 className="display text-[44px] text-[#2C2926]">Invitation Not Found</h1>
          <p className="text-[15px] text-[#726C65] mt-3">This celebration page may not exist or has not been published yet.</p>
          <Link to="/" className="mt-6 inline-block fv-btn-primary !py-3 !px-6 text-[13px]">Return Home</Link>
        </div>
      </div>
    );
  }

  const weddingDate = wedding.wedding_date ? format(new Date(wedding.wedding_date), "d MMMM yyyy").toUpperCase() : siteContent.weddingDateFormatted;
  const targetDateStr = wedding.wedding_date || siteContent.weddingDateISO.split("T")[0];
  const daysAway = differenceInDays(new Date(targetDateStr + "T16:00:00"), new Date());
  const timelineEvents = events.length > 0 ? events : siteContent.timeline.defaultEvents;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{wedding.couple_names} — ForeverVow</title>
        <meta name="description" content={`You're invited to ${wedding.couple_names}'s celebration${wedding.wedding_date ? ` on ${weddingDate}` : ""}.`} />
        {wedding.cover_image && <meta property="og:image" content={wedding.cover_image} />}
      </Helmet>

      <div className="min-h-screen bg-[#FAF7F2] text-[#2C2926]">
        <AnimatePresence>
          {!invitationOpen && (
            <InvitationOverlay
              coupleNames={wedding.couple_names}
              date={wedding.wedding_date ? format(new Date(wedding.wedding_date), "MMMM d, yyyy") : ""}
              venue={wedding.ceremony_venue}
              onOpen={() => setInvitationOpen(true)}
            />
          )}
        </AnimatePresence>

        {invitationOpen && (
          <>
            {isPreview && (
              <div className="sticky top-0 z-40 bg-[#2C2926] text-[#FAF7F2] text-center py-2.5 px-4 text-[11px] tracking-[0.2em] uppercase font-bold">
                <span className="inline-flex items-center gap-2">
                  <Eye size={13} className="text-[#C5A059]" /> Celebration Preview Mode
                  <Link to="/" className="ml-3 underline underline-offset-4 text-[#C5A059] hover:text-white normal-case tracking-normal text-[12px]">Back to ForeverVow</Link>
                </span>
              </div>
            )}

            {/* Sticky Editorial Navigation */}
            <nav className={`sticky ${isPreview ? "top-[38px]" : "top-0"} z-30 glass-heavy border-b border-[#E5DEC9]`}>
              <div className="mx-auto max-w-6xl px-6 h-[68px] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2C2926] text-[#C5A059] flex items-center justify-center">
                    <Flower2 size={15} />
                  </div>
                  <span className="display text-[17px] font-semibold text-[#2C2926]">{wedding.couple_names}</span>
                </Link>
                <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#726C65]">
                  {nav.map(n => (
                    <a key={n.id} href={`#${n.id}`} onClick={(e) => scrollToSection(e, n.id)} className="hover:text-[#A37C4D] transition">{n.label}</a>
                  ))}
                  <a href="#moments" onClick={(e) => scrollToSection(e, "moments")} className="hover:text-[#A37C4D] transition">Moments</a>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => generateICS(wedding.couple_names + " Wedding", wedding.wedding_date, wedding.ceremony_time, wedding.ceremony_venue, window.location.href)}
                    className="hidden sm:inline-flex items-center gap-2 text-[12px] font-bold px-4 py-2 rounded-full border border-[#E5DEC9] bg-white text-[#2C2926] hover:border-[#C5A059] transition shadow-sm"
                  >
                    <Calendar size={13} className="text-[#A37C4D]" /> Add to Calendar
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl border border-[#E5DEC9] bg-white text-[#2C2926] hover:border-[#C5A059] transition"
                    aria-label="Toggle Navigation"
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </div>

              {/* Mobile Hamburger Dropdown */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t border-[#E5DEC9] bg-[#FAF7F2] overflow-hidden"
                  >
                    <div className="px-6 py-4 flex flex-col gap-3.5 text-[14px] font-semibold text-[#2C2926]">
                      {nav.map(n => (
                        <a
                          key={n.id}
                          href={`#${n.id}`}
                          onClick={(e) => scrollToSection(e, n.id)}
                          className="py-1 hover:text-[#A37C4D] transition flex items-center justify-between"
                        >
                          <span>{n.label}</span>
                          <ArrowRight size={14} className="text-[#C5A059]" />
                        </a>
                      ))}
                      <a
                        href="#moments"
                        onClick={(e) => scrollToSection(e, "moments")}
                        className="py-1 hover:text-[#A37C4D] transition flex items-center justify-between"
                      >
                        <span>Moments</span>
                        <ArrowRight size={14} className="text-[#C5A059]" />
                      </a>
                      <div className="pt-2 border-t border-[#E5DEC9]">
                        <button
                          onClick={() => {
                            generateICS(wedding.couple_names + " Wedding", wedding.wedding_date, wedding.ceremony_time, wedding.ceremony_venue, window.location.href);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full mt-1 flex items-center justify-center gap-2 text-[13px] font-bold px-4 py-2.5 rounded-xl border border-[#C5A059] bg-[#C5A059]/10 text-[#2C2926] transition shadow-sm"
                        >
                          <Calendar size={15} className="text-[#A37C4D]" /> Add to Calendar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            {/* Morning-of Journey Opt-In Protocol */}
            {journeyOptIn === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2C2926] text-[#FAF7F2] border-b border-[#C5A059]/40 py-4 px-6 shadow-2xl relative z-20"
              >
                <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass size={20} className="animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                        <ShieldCheck size={14} className="text-[#7A9E7E]" /> Day 0 Privacy-First Protocol • Journey to Forever
                      </div>
                      <div className="text-[14px] font-semibold text-white mt-0.5">Good morning! Today&rsquo;s the big day.</div>
                      <p className="text-[12.5px] text-[#E5DEC9] mt-0.5 leading-relaxed max-w-2xl font-serif">
                        Would you like to share your live location with <strong className="text-white">{wedding.couple_names}</strong> while you&rsquo;re travelling to the venue? Your location will only be shared until you arrive or until the ceremony begins.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setJourneyOptIn("declined");
                        toast("Location sharing declined. Enjoy your journey!");
                      }}
                      className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#A37C4D] hover:bg-white/5 transition"
                    >
                      Not Now
                    </button>
                    <button
                      onClick={() => {
                        setJourneyOptIn("shared");
                        toast.success("Journey shared! Amelia & Daniel can see your live ETA.", {
                          description: "Tracking will automatically stop upon arrival."
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#C5A059] text-[#2C2926] font-bold text-[12.5px] hover:bg-[#D6B26A] transition shadow-lg flex items-center gap-2"
                    >
                      <Navigation size={14} /> Share My Journey
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {journeyOptIn === "shared" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gradient-to-r from-[#1C1814] via-[#2C2926] to-[#1C1814] text-[#FAF7F2] border-b border-[#7A9E7E]/50 py-3 px-6 shadow-md relative z-20"
              >
                <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7A9E7E] animate-pulse shrink-0" />
                    <span>
                      <strong className="text-[#7A9E7E]">Travelling</strong> • 18 minutes away — Traffic is light via A10
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setJourneyOptIn("arrived");
                      toast.success("🎉 Welcome to " + (wedding.ceremony_venue || "Château de Chambord") + "!", {
                        description: "100m Geofence triggered. Live GPS sharing automatically terminated."
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#7A9E7E]/20 hover:bg-[#7A9E7E]/30 text-[#7A9E7E] border border-[#7A9E7E]/40 text-[11.5px] font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Simulate Venue Arrival (100m Geofence)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Hero Section */}
            <section id="home" className="relative overflow-hidden pt-6 pb-2 md:pt-10 md:pb-4">
              <div className="mx-auto max-w-5xl px-6 text-center">
                {wedding.hero_image ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="rounded-[36px] overflow-hidden bg-white p-2 sm:p-3 shadow-2xl border border-[#E5DEC9]">
                      <div className="relative rounded-[26px] overflow-hidden h-[460px] md:h-[600px]">
                        <img src={wedding.hero_image} alt={wedding.couple_names} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-14 pb-16 md:pb-20 text-left">
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}>
                            <div className="text-[#EAB308] text-[11px] sm:text-[13px] tracking-[0.28em] uppercase font-bold font-mono mb-2 sm:mb-3 drop-shadow">
                              {wedding.legacy_mode ? siteContent.hero.legacyLabel : siteContent.hero.label}
                            </div>
                          </motion.div>
                          <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                            className="display text-[44px] sm:text-[70px] md:text-[92px] leading-[0.92] text-[#FAF7F2] drop-shadow-lg"
                          >
                            {wedding.couple_names}
                          </motion.h1>
                          {weddingDate && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                              className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3 md:gap-5 text-[12px] sm:text-[14px] tracking-[0.18em] uppercase font-semibold text-[#F3EFEA]/95 drop-shadow"
                            >
                              <span className="flex items-center gap-2"><Calendar size={15} className="text-[#EAB308]" />{wedding.legacy_mode ? `Married On ${weddingDate}` : weddingDate}</span>
                              {wedding.ceremony_venue && (
                                <>
                                  <span className="opacity-40 hidden sm:inline">•</span>
                                  <span className="flex items-center gap-2"><MapPin size={15} className="text-[#EAB308]" />{wedding.ceremony_venue}</span>
                                </>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8">
                    <div className="wedding-label mb-3">{wedding.legacy_mode ? siteContent.hero.legacyLabel : siteContent.hero.label}</div>
                    <h1 className="display text-[58px] sm:text-[84px] md:text-[108px] leading-[0.9] text-[#2C2926]">
                      {wedding.couple_names}
                    </h1>
                    {weddingDate && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }} className="mt-6 text-[12px] tracking-[0.24em] uppercase font-bold text-[#A37C4D]">
                        {wedding.legacy_mode ? `Married On ${weddingDate}` : `${weddingDate}${wedding.ceremony_venue ? ` • ${wedding.ceremony_venue}` : ""}`}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </section>

            {/* Unified Sleek Countdown Banner */}
            {countdown && !wedding.legacy_mode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                className="max-w-4xl mx-auto px-6 -mt-14 md:-mt-20 relative z-30 mb-12"
              >
                <GlassCard variant="crystal" padding="lg" className="border border-white/40 shadow-2xl bg-white/90 backdrop-blur-xl rounded-[28px]">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-3 py-1">
                    <div className="text-center md:text-left">
                      <div className="wedding-label text-[#A37C4D]">{siteContent.hero.countdownTitle}</div>
                      <div className="display text-[22px] md:text-[26px] text-[#2C2926] mt-1 font-semibold">
                        {daysAway && daysAway > 0 ? `${daysAway} Days Until We Say "I Do"` : siteContent.hero.countdownFallbackText}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 sm:gap-6">
                      {[["Days", countdown.days], ["Hours", countdown.hours], ["Minutes", countdown.minutes], ["Seconds", countdown.seconds]].map(([l, v], idx) => (
                        <div key={l as string} className="flex items-center gap-4 sm:gap-6">
                          <div className="text-center">
                            <div className="display text-[32px] sm:text-[40px] leading-none text-[#2C2926] font-mono">{String(v).padStart(2, "0")}</div>
                            <div className="wedding-label !text-[9px] mt-1 text-[#726C65]">{l}</div>
                          </div>
                          {idx < 3 && <div className="text-[24px] text-[#C5A059] font-light -mt-4">:</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Our Story Section */}
            {wedding.story && (
              <section id="story" className="py-20">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <div className="wedding-label">{siteContent.story.label}</div>
                  <h2 className="display text-[40px] md:text-[52px] text-[#2C2926] mt-2 leading-[1.05]">
                    {siteContent.story.headingPrefix}<span className="text-[#A37C4D] italic font-serif">{siteContent.story.headingHighlight}</span>
                  </h2>
                  <p className="mt-8 text-[17px] leading-relaxed text-[#726C65] whitespace-pre-line font-serif">{wedding.story}</p>
                </div>
              </section>
            )}

            {/* Timeline Events */}
            {timelineEvents.length > 0 && (
              <section id="timeline" className="py-24 bg-[#F3EFEA] border-y border-[#E5DEC9] relative overflow-hidden">
                <div className="mx-auto max-w-5xl px-6 relative">
                  <div className="text-center mb-20">
                    <div className="wedding-label text-[#A37C4D]">{siteContent.timeline.label}</div>
                    <h3 className="display text-[42px] sm:text-[50px] text-[#2C2926] mt-2">{siteContent.timeline.heading}</h3>
                  </div>

                  {/* Vertical Center Line with Gradient */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-40 bottom-12 w-0.5 bg-gradient-to-b from-[#C5A059]/10 via-[#C5A059] to-[#C5A059]/10 hidden md:block" />

                  <div className="space-y-12 relative">
                    {timelineEvents.map((ev, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ type: "spring", stiffness: 50, damping: 20, delay: idx * 0.15 }}
                          className={`flex flex-col md:flex-row items-center gap-8 ${
                            isEven ? "md:flex-row" : "md:flex-row-reverse"
                          }`}
                        >
                          {/* Half Width Content Card */}
                          <div className={`w-full md:w-[45%] ${isEven ? "md:text-right" : "md:text-left"}`}>
                            <div className="rounded-[24px] bg-white border border-[#E5DEC9] p-6 sm:p-8 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md group cursor-default">
                              <div className="wedding-label text-[#A37C4D]">
                                {ev.event_date && format(new Date(ev.event_date), "EEE • d MMM")}
                              </div>
                              <h4 className="display text-[26px] sm:text-[30px] text-[#2C2926] mt-1.5 group-hover:text-[#A37C4D] transition-colors">
                                {ev.title}
                              </h4>
                              <div className={`mt-3 flex items-center gap-2 text-[13.5px] font-mono text-[#726C65] ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                                <Clock size={15} className="text-[#A37C4D] shrink-0" /> {ev.event_time || "TBA"}
                              </div>
                              {ev.location && (
                                <div className={`text-[13.5px] text-[#726C65] mt-1.5 flex items-center gap-1.5 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                                  <MapPin size={15} className="text-[#A37C4D] shrink-0" /> {ev.location}
                                </div>
                              )}
                              {ev.description && (
                                <p className="text-[14px] text-[#726C65] leading-relaxed mt-4 pt-3 border-t border-[#E5DEC9] font-serif">
                                  {ev.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Center Node / Circle on the Timeline */}
                          <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[#2C2926] text-[#C5A059] border-4 border-[#FAF7F2] shadow-lg shrink-0 my-1 md:my-0 transition duration-300 hover:scale-110">
                            <Clock size={16} />
                          </div>

                          {/* Spacer for opposite half */}
                          <div className="hidden md:block w-[45%]" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Venue & Stay - Bento Grid UI Layout */}
            {wedding.ceremony_venue && !wedding.legacy_mode && (
              <section id="venue" className="py-24">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="text-center mb-16">
                    <div className="wedding-label">{siteContent.venue.label}</div>
                    <h3 className="display text-[42px] md:text-[54px] text-[#2C2926] mt-2 leading-[1.05]">
                      {siteContent.venue.heading}
                    </h3>
                    <p className="mt-4 text-[16px] text-[#726C65] max-w-xl mx-auto font-serif">
                      {siteContent.venue.subheading}
                    </p>
                  </div>

                  {/* Bento Grid Container */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Bento Item 1: Venue Setting & Map Iframe (Span 2 cols on lg) */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                      className="lg:col-span-2 rounded-[32px] bg-white border border-[#E5DEC9] p-6 sm:p-8 shadow-xl flex flex-col gap-6 justify-between"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 shrink-0">
                        <div>
                          <div className="wedding-label text-[#A37C4D]">{siteContent.venue.primarySettingLabel}</div>
                          <h4 className="display text-[30px] sm:text-[36px] text-[#2C2926] mt-1.5 leading-tight">{wedding.ceremony_venue || siteContent.venue.defaultCeremonyVenue}</h4>
                          {(wedding.venue_address || siteContent.venue.defaultVenueAddress) && (
                            <div className="mt-2.5 flex items-center gap-2 text-[14.5px] text-[#726C65] font-serif">
                              <MapPin size={16} className="text-[#A37C4D] shrink-0" /> {wedding.venue_address || siteContent.venue.defaultVenueAddress}
                            </div>
                          )}
                        </div>
                        {wedding.ceremony_time && (
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F3EFEA] border border-[#E5DEC9] text-[13px] font-mono text-[#2C2926] shrink-0 self-start">
                            <Clock size={15} className="text-[#A37C4D]" /> {siteContent.venue.promptlyPrefix}{wedding.ceremony_time}
                          </div>
                        )}
                      </div>

                      {/* Structured Premium Container with Muted Custom Graphic Map */}
                      <div className="w-full flex-1 min-h-[340px] sm:min-h-[400px] rounded-2xl overflow-hidden border border-stone-200 shadow-lg relative bg-[#EFECE6]">
                        <iframe
                          title="map"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(wedding.venue_address || wedding.ceremony_venue || siteContent.venue.defaultCeremonyVenue)}&output=embed`}
                          className="w-full h-full border-0 absolute inset-0 grayscale-[40%] sepia-[20%] contrast-125 opacity-90 transition duration-700 hover:grayscale-0 hover:sepia-0 hover:opacity-100"
                          loading="lazy"
                        />
                      </div>
                    </motion.div>

                    {/* Bento Item 2: Destination Travel Hub (Span 1 col on lg) */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.15 }}
                      className={`lg:col-span-1 rounded-[32px] p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-all ${
                        journeyOptIn === "arrived" ? "bg-[#2C2926] text-[#FAF7F2] border border-[#C5A059]" : "bg-[#F3EFEA] border border-[#E5DEC9]"
                      }`}
                    >
                      {journeyOptIn === "arrived" ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                            <CheckCircle2 size={16} className="text-[#7A9E7E]" /> Checked In • Live Venue Mode
                          </div>
                          <h4 className="display text-[28px] text-white">Welcome to the wedding!</h4>
                          <p className="text-[13.5px] text-[#E5DEC9] leading-relaxed font-serif">
                            We are overjoyed to have you arrive safely at <strong className="text-white">{wedding.ceremony_venue || "Château de Chambord"}</strong>.
                          </p>
                          <div className="mt-6 p-4 rounded-2xl bg-white/[0.08] border border-white/10 space-y-3 text-[13px]">
                            <div className="flex items-center justify-between">
                              <span className="text-[#C5A059] font-bold">Assigned Parking:</span>
                              <span className="text-white font-medium">Lot B (North Estate Gate)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#C5A059] font-bold">Welcome Refreshments:</span>
                              <span className="text-white font-medium">East Courtyard Terrace</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#C5A059] font-bold">Photo Vault Access:</span>
                              <span className="text-[#7A9E7E] font-bold">Unlocked ✨</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-full bg-[#2C2926] text-[#C5A059] flex items-center justify-center">
                              <Plane size={15} />
                            </div>
                            <span className="wedding-label !mb-0 text-[#A37C4D]">{siteContent.venue.travelLogisticsLabel}</span>
                          </div>
                          <h4 className="display text-[26px] text-[#2C2926] mb-6">{siteContent.venue.gettingThereHeading}</h4>

                          <div className="space-y-5">
                            {siteContent.venue.travelOptions.map((opt) => {
                              const Icon = opt.iconType === "plane" ? Plane : opt.iconType === "train" ? Train : Car;
                              return (
                                <div key={opt.id} className="p-4 rounded-[20px] bg-white border border-[#E5DEC9]/80 shadow-sm">
                                  <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#A37C4D] mb-1.5">
                                    <Icon size={14} /> {opt.category}
                                  </div>
                                  <div className="text-[14px] font-semibold text-[#2C2926]">{opt.title}</div>
                                  <p className="text-[12.5px] text-[#726C65] mt-1 leading-relaxed font-serif">
                                    {opt.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Bento Item 3: Interactive Venue Blueprint (Span full 3 cols if venue_map_url exists) */}
                    {wedding.venue_map_url && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        className="lg:col-span-3 rounded-[32px] bg-white border border-[#E5DEC9] p-6 sm:p-8 shadow-xl text-center"
                      >
                        <div className="wedding-label mb-2 text-[#A37C4D]">{siteContent.venue.estateBlueprintLabel}</div>
                        <h4 className="display text-[26px] text-[#2C2926] mb-6">{siteContent.venue.interactiveGroundMapHeading}</h4>
                        <div className="relative inline-block max-w-full rounded-[24px] overflow-hidden border border-[#E5DEC9] shadow-lg bg-[#FAF7F2]">
                          <img src={wedding.venue_map_url} alt="Venue map" className="max-h-[580px] w-auto" />
                          {markers.map((m: any) => (
                            <div
                              key={m.id}
                              className="absolute w-8 h-8 -ml-4 -mt-4 bg-[#2C2926] text-[#C5A059] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 transition group"
                              style={{ left: `${m.x}%`, top: `${m.y}%` }}
                            >
                              <MapPin size={16} />
                              <div className="absolute bottom-10 w-max px-3.5 py-2 bg-[#2C2926] text-[#FAF7F2] text-[12px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none z-20 text-center shadow-2xl border border-white/10">
                                <strong className="block">{m.title}</strong>
                                {m.category && <span className="text-[#C5A059] text-[10px] uppercase tracking-[0.1em]">{m.category}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Bento Item 4: Recommended Accommodations (Span full 3 cols) */}
                    {accommodations.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1 }}
                        className="lg:col-span-3 rounded-[32px] bg-[#FAF7F2] border border-[#E5DEC9] p-6 sm:p-10 shadow-xl"
                      >
                        <div className="text-center mb-10">
                          <div className="wedding-label text-[#A37C4D]">{siteContent.venue.hospitalityLabel}</div>
                          <h4 className="display text-[32px] sm:text-[38px] text-[#2C2926] mt-1">{siteContent.venue.accommodationsHeading}</h4>
                          <p className="text-[14.5px] text-[#726C65] mt-2 font-serif">{siteContent.venue.accommodationsSubheading}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {accommodations.map((acc: any) => (
                            <GlassCard key={acc.id} variant="crystal" padding="lg" className="border border-[#E5DEC9] flex flex-col justify-between hover:shadow-2xl transition duration-500 rounded-[24px] bg-white">
                              <div>
                                {acc.photo_url && (
                                  <div className="rounded-[18px] overflow-hidden mb-4 h-[180px]">
                                    <img src={acc.photo_url} alt={acc.name} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                                  </div>
                                )}
                                <h5 className="display text-[22px] text-[#2C2926]">{acc.name}</h5>
                                <div className="text-[13px] font-mono text-[#726C65] mt-3 space-y-1.5">
                                  {acc.distance && <div className="flex gap-2 items-center text-[#2C2926]"><MapPin size={14} className="text-[#A37C4D]" /> {acc.distance}</div>}
                                  {acc.price && <div className="flex gap-2 items-center text-[#726C65]"><span className="text-[#A37C4D] font-bold">{siteContent.venue.rateLabel}</span> {acc.price}</div>}
                                </div>
                              </div>
                              {acc.booking_url ? (
                                <a href={acc.booking_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 rounded-[14px] bg-[#2C2926] text-[#C5A059] font-bold text-[12px] uppercase tracking-[0.14em] hover:bg-[#A37C4D] hover:text-white transition">
                                  {siteContent.venue.reserveRoomText} <ArrowRight size={14} />
                                </a>
                              ) : (
                                <div className="mt-6 pt-3 border-t border-[#E5DEC9]/60 text-center text-[11px] font-mono uppercase tracking-[0.15em] text-[#A37C4D] font-bold">
                                  {siteContent.venue.contactConciergeText}
                                </div>
                              )}
                            </GlassCard>
                          ))}
                        </div>
                      </motion.div>
                    )}

                  </div>
                </div>
              </section>
            )}

            {/* Dress code */}
            {wedding.dress_code && !wedding.legacy_mode && (
              <section className="py-16 bg-[#F3EFEA] border-y border-[#E5DEC9]">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <div className="wedding-label">Attire Guidance</div>
                  <p className="display text-[32px] md:text-[38px] text-[#2C2926] mt-3 leading-[1.1]">{wedding.dress_code}</p>
                </div>
              </section>
            )}

            {/* Live Announcements */}
            {updates.length > 0 && !wedding.legacy_mode && (
              <section className="py-20 bg-[#FAF7F2]">
                <div className="mx-auto max-w-4xl px-6">
                  <div className="text-center mb-10">
                    <div className="wedding-label">Real-Time Alerts</div>
                    <h3 className="display text-[38px] text-[#2C2926] mt-2">Live Announcements</h3>
                  </div>
                  <div className="space-y-5 relative pl-6 border-l-2 border-[#C5A059]">
                    {updates.slice().reverse().map(u => (
                      <GlassCard key={u.id} variant="crystal" padding="lg" className="border border-[#E5DEC9] relative">
                        <div className="absolute -left-[31px] top-7 w-3.5 h-3.5 rounded-full bg-[#2C2926] border-2 border-[#C5A059]" />
                        <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-bold text-[#A37C4D] mb-2"><Sparkles size={13} />{format(new Date(u.created_at), "HH:mm • d MMM yyyy")}</div>
                        <h4 className="display text-[24px] text-[#2C2926]">{u.title}</h4>
                        <p className="text-[15px] text-[#726C65] leading-relaxed mt-2">{u.message}</p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* RSVP Section */}
            {!wedding.legacy_mode && (
              <section id="rsvp" className="py-24 bg-[#F3EFEA] border-y border-[#E5DEC9]">
                <div className="mx-auto max-w-4xl px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className="text-center mb-12"
                  >
                    <div className="wedding-label text-[#A37C4D]">{siteContent.rsvp.label}</div>
                    <h2 className="font-serif text-[42px] sm:text-[52px] text-stone-800 font-normal bg-transparent mt-2 tracking-tight">
                      {siteContent.rsvp.heading}
                    </h2>
                    <p className="text-[15.5px] text-stone-600 mt-3 font-serif">
                      {siteContent.rsvp.deadlineText}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.15 }}
                  >
                    <GlassCard variant="crystal" padding="xl" className="border border-[#E5DEC9] shadow-2xl">
                      <RSVPForm wedding={wedding} isPreview={isPreview} />
                    </GlassCard>
                  </motion.div>
                </div>
              </section>
            )}

            {/* Memory Wall */}
            <section id="moments" className="py-24">
              <div className="mx-auto max-w-6xl px-6">
                <div className="text-center mb-12">
                  <div className="wedding-label">Memory Wall</div>
                  <h3 className="display text-[38px] text-[#2C2926] mt-2">Heartfelt Notes & Wishes</h3>
                </div>
                <MomentsSectionGuestbook wedding={wedding} isPreview={isPreview} />
              </div>
            </section>

            {/* Guest Photos */}
            <section id="guest-photos" className="py-20 bg-[#F3EFEA] border-y border-[#E5DEC9]">
              <div className="mx-auto max-w-6xl px-6">
                <GuestPhotosSection wedding={wedding} isPreview={isPreview} />
              </div>
            </section>

            {/* Official Gallery */}
            {gallery.length > 0 && (
              <section id="gallery" className="py-24">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="text-center mb-12">
                    <div className="wedding-label">Portfolio</div>
                    <h3 className="display text-[42px] text-[#2C2926] mt-2">Curated Moments</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {gallery.map((g, i) => (
                      <motion.button
                        key={g.id}
                        onClick={() => setLightbox(g.url || g.image_url || null)}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="text-left rounded-[24px] bg-white border border-[#E5DEC9] p-2.5 shadow-md hover:shadow-xl transition group"
                      >
                        <div className="rounded-[18px] overflow-hidden aspect-[4/5]">
                          <img src={g.url || g.image_url || ""} alt={g.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        </div>
                        <div className="pt-3 px-1.5 flex justify-between text-[12px] font-mono text-[#726C65]">
                          <span className="truncate">{g.caption || "Untitled"}</span>
                          <span className="text-[#A37C4D] font-bold">#{String(i + 1).padStart(2, "0")}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Registry note */}
            {!wedding.legacy_mode && (
              <section className="py-20 bg-[#F3EFEA] border-t border-[#E5DEC9]">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <Gift size={24} className="mx-auto text-[#A37C4D] mb-4" />
                  <div className="wedding-label">{siteContent.registry.label}</div>
                  <h3 className="display text-[32px] md:text-[38px] text-[#2C2926] mt-2 leading-[1.1]">
                    {siteContent.registry.heading}
                  </h3>
                  <p className="mt-5 text-[15px] text-[#726C65] leading-relaxed">
                    {siteContent.registry.description}
                  </p>
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="border-t border-[#E5DEC9] bg-[#EAE3DA]">
              <div className="mx-auto max-w-6xl px-6 py-12 flex flex-wrap items-center justify-between gap-6 text-[13px] text-[#726C65]">
                <div className="flex items-center gap-3 font-semibold text-[#2C2926]">
                  <Flower2 size={16} className="text-[#A37C4D]"/>
                  <span>{siteContent.footer.brandName} • {wedding.couple_names} • {wedding.hashtag ? `#${wedding.hashtag}` : ""}</span>
                </div>
                <div className="flex gap-6 font-medium">
                  <Link to="/" className="hover:text-[#2C2926] transition">{siteContent.footer.homeLinkText}</Link>
                  <a href={`mailto:support@forevervow.studio?subject=Re: ${wedding.couple_names}`} className="hover:text-[#2C2926] flex items-center gap-1.5 transition"><Mail size={13}/> {siteContent.footer.contactLinkText}</a>
                  <Link to={`/checkin/${slug}`} className="hover:text-[#2C2926] flex items-center gap-1.5 transition"><Users size={13}/> {siteContent.footer.venueCheckinLinkText}</Link>
                </div>
              </div>
            </footer>

            {!isPreview && <WeddingConcierge wedding={wedding} />}

            <AnimatePresence>
              {lightbox && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
                  onClick={() => setLightbox(null)}
                >
                  <button className="absolute top-6 right-6 text-white w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"><X size={20}/></button>
                  <img src={lightbox} alt="" className="max-w-[92vw] max-h-[88vh] object-contain rounded-[20px] shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </HelmetProvider>
  );
}
