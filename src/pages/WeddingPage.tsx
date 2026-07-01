import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Eye, Calendar, MapPin, Heart, Clock, Camera, Send, Sparkles, Flower2, Mail, MessageCircle, X, Gift, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useWeddingData } from "@/hooks/useWeddingData";
import { store } from "@/store/weddingStore";
import { format, differenceInDays } from "date-fns";
import { InvitationOverlay } from "@/components/wedding/InvitationOverlay";
import { GlassCard } from "@/components/ui/GlassCard";

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

function generateICS(title: string, date: string, time: string | null, venue: string, url: string) {
  const dt = new Date(`${date}T${time ?? "16:00"}:00`);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const end = new Date(dt.getTime() + 2 * 3600 * 1000);
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ForeverVow OS//EN\nBEGIN:VEVENT\nDTSTART:${fmt(dt)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nLOCATION:${venue}\nDESCRIPTION:${url}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title.replace(/\W+/g, "-")}.ics`;
  a.click();
}

function RSVPForm({ wedding, isPreview }: { wedding: any; isPreview?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    guest_name: "", email: "", attending: "yes", guest_count: 1,
    dietary_preference: "No preference", song_request: "", note: ""
  });
  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) { toast.info("This is a preview — RSVP is disabled"); return; }
    if (!form.guest_name.trim()) { toast.error("Please enter your name"); return; }
    store.insert("rsvps", {
      wedding_id: wedding.id,
      guest_name: form.guest_name.trim(),
      email: form.email.trim() || null,
      attending: form.attending === "yes" ? "confirmed" : form.attending === "no" ? "declined" : "maybe",
      guest_count: Number(form.guest_count) || 1,
      dietary_preference: form.dietary_preference || null,
      message: form.song_request || form.note || null,
      submitted_at: new Date().toISOString(),
    });
    setSubmitted(true);
    toast.success("RSVP received — thank you!");
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

  const inputCls = "w-full rounded-[16px] border border-[#E5DEC9] bg-white px-4 py-3.5 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 text-[14px] transition text-[#2C2926]";
  const labelCls = "block text-[10px] uppercase tracking-[0.2em] font-bold text-[#A37C4D] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
      <div className="md:col-span-2">
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
          <option value="yes">Joyfully Attending</option>
          <option value="maybe">Uncertain for Now</option>
          <option value="no">Regretfully Declining</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Party Size (Including You)</label>
        <input type="number" min={1} max={6} value={form.guest_count} onChange={e => update("guest_count", e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Dietary Requirement</label>
        <select value={form.dietary_preference} onChange={e => update("dietary_preference", e.target.value)} className={inputCls}>
          <option>No preference</option><option>Vegetarian</option><option>Vegan</option>
          <option>Gluten-free</option><option>Dairy-free</option><option>Halal</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Song Request</label>
        <textarea rows={2} value={form.song_request} onChange={e => update("song_request", e.target.value)} placeholder="One track guaranteed to get you on the dance floor…" className={inputCls + " resize-none"} />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Special Note for the Couple</label>
        <textarea rows={2} value={form.note} onChange={e => update("note", e.target.value)} placeholder="Optional warm wishes or logistical notes…" className={inputCls + " resize-none"} />
      </div>
      <div className="md:col-span-2 flex items-center justify-between pt-2">
        <div className="text-[12px] text-[#A8A29E] font-mono">Verified Security • ForeverVow OS</div>
        <button type="submit" className="fv-btn-primary !py-3.5 !px-8 text-[13px]">
          <Send size={15} /> Transmit RSVP
        </button>
      </div>
    </form>
  );
}

function MomentsSectionGuestbook({ wedding, isPreview }: { wedding: any; isPreview?: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessages(store.where("guest_moments", r => r.wedding_id === wedding.id));
    const off = store.subscribe("guest_moments", () => setMessages(store.where("guest_moments", r => r.wedding_id === wedding.id)));
    return off;
  }, [wedding.id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) { toast.info("This is a preview — sharing is disabled"); return; }
    if (!name.trim() || !message.trim()) { toast.error("Please enter name and message"); return; }
    store.insert("guest_moments", {
      wedding_id: wedding.id,
      guest_name: name.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    });
    setName(""); setMessage("");
    toast.success("Moment added to the wall");
  };

  return (
    <div>
      {!isPreview && (
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-4 mb-8">
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="md:col-span-2 rounded-[16px] border border-[#E5DEC9] bg-white px-4 py-3.5 outline-none focus:border-[#C5A059] text-[14px]" />
          <button type="submit" className="fv-btn-primary !py-3.5 text-[13px]">Post Memory Note</button>
          <textarea required rows={2} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your heartfelt wishes or memory note here…" className="md:col-span-3 rounded-[16px] border border-[#E5DEC9] bg-white px-4 py-3.5 outline-none focus:border-[#C5A059] resize-none text-[14px]" />
        </form>
      )}
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

  useEffect(() => {
    const list = store.where("guest_photos", r => r.wedding_id === wedding.id);
    setPhotos(list);
    const off = store.subscribe("guest_photos", () => setPhotos(store.where("guest_photos", r => r.wedding_id === wedding.id)));
    return off;
  }, [wedding.id]);

  const handleFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      store.insert("guest_photos", {
        wedding_id: wedding.id,
        guest_name: "Guest",
        photo_url: reader.result as string,
        likes: 0,
        created_at: new Date().toISOString(),
      });
      toast.success("Photo uploaded to the vault");
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] uppercase tracking-[0.24em] font-bold text-[#A37C4D]">Live Guest Vault</div>
        {!isPreview && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="fv-btn-ghost !py-2 !px-4 text-[12px] flex items-center gap-2"
            >
              <Camera size={14} /> Upload Snapshot
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </>
        )}
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
              <div className="text-[10px] text-[#A37C4D] font-mono uppercase">Powered by ForeverVow OS</div>
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
  const countdown = useCountdown(wedding?.wedding_date ?? null);

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
        { id: "events", label: "Replay" },
        { id: "gallery", label: "Gallery" },
        { id: "moments", label: "Moments" },
      ];
    }
    return [
      { id: "home", label: "Home" },
      { id: "story", label: "Story" },
      { id: "events", label: "Timeline" },
      { id: "venue", label: "Venue & Stay" },
      { id: "rsvp", label: "RSVP" },
      { id: "gallery", label: "Gallery" },
    ];
  }, [wedding?.legacy_mode]);

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

  const weddingDate = wedding.wedding_date ? format(new Date(wedding.wedding_date), "d MMMM yyyy").toUpperCase() : "";
  const daysAway = wedding.wedding_date ? differenceInDays(new Date(wedding.wedding_date + "T16:00:00"), new Date()) : null;

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
                    <a key={n.id} href={`#${n.id}`} className="hover:text-[#A37C4D] transition">{n.label}</a>
                  ))}
                  <a href="#moments" className="hover:text-[#A37C4D] transition">Moments</a>
                </div>
                <button
                  onClick={() => generateICS(wedding.couple_names + " Wedding", wedding.wedding_date, wedding.ceremony_time, wedding.ceremony_venue, window.location.href)}
                  className="hidden sm:inline-flex items-center gap-2 text-[12px] font-bold px-4 py-2 rounded-full border border-[#E5DEC9] bg-white text-[#2C2926] hover:border-[#C5A059] transition shadow-sm"
                >
                  <Calendar size={13} className="text-[#A37C4D]" /> Add to Calendar
                </button>
              </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20">
              <div className="mx-auto max-w-5xl px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="wedding-label mb-3">{wedding.legacy_mode ? "A Day In Our Hearts" : "We Invite You To Celebrate"}</div>
                  <h1 className="display text-[58px] sm:text-[84px] md:text-[108px] leading-[0.9] text-[#2C2926]">
                    {wedding.couple_names}
                  </h1>
                  {weddingDate && (
                    <div className="mt-6 text-[12px] tracking-[0.24em] uppercase font-bold text-[#A37C4D]">
                      {wedding.legacy_mode ? `Married on ${weddingDate}` : `${weddingDate}${wedding.ceremony_venue ? ` • ${wedding.ceremony_venue}` : ""}`}
                    </div>
                  )}
                </motion.div>

                {wedding.hero_image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 max-w-4xl mx-auto"
                  >
                    <div className="rounded-[36px] overflow-hidden bg-white p-3 shadow-2xl border border-[#E5DEC9]">
                      <img src={wedding.hero_image} alt={wedding.couple_names} className="w-full h-[440px] md:h-[600px] object-cover rounded-[26px]" />
                    </div>
                  </motion.div>
                )}

                {daysAway !== null && (
                  <div className="mt-8 text-[13px] font-mono uppercase tracking-[0.2em] text-[#726C65]">
                    {daysAway > 0 ? `${daysAway} days until our vows` : "The celebration is here"}
                  </div>
                )}
              </div>
            </section>

            {/* Countdown Banner */}
            {countdown && wedding.wedding_date && !wedding.legacy_mode && (
              <section className="border-y border-[#E5DEC9] bg-[#F3EFEA]">
                <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-4 gap-6 text-center">
                  {[["Days", countdown.days], ["Hours", countdown.hours], ["Minutes", countdown.minutes], ["Seconds", countdown.seconds]].map(([l, v]) => (
                    <div key={l as string}>
                      <div className="display text-[44px] leading-none text-[#2C2926] font-mono">{String(v).padStart(2, "0")}</div>
                      <div className="wedding-label mt-2">{l}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Our Story Section */}
            {wedding.story && (
              <section id="story" className="py-24">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <div className="wedding-label">Our Journey</div>
                  <h2 className="display text-[40px] md:text-[52px] text-[#2C2926] mt-2 leading-[1.05]">
                    How our path <span className="text-[#A37C4D] italic font-serif">unfolded</span>
                  </h2>
                  <p className="mt-8 text-[17px] leading-relaxed text-[#726C65] whitespace-pre-line font-serif">{wedding.story}</p>
                </div>
              </section>
            )}

            {/* Timeline Events */}
            {events.length > 0 && (
              <section id="events" className="py-24 bg-[#F3EFEA] border-y border-[#E5DEC9]">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="text-center mb-14">
                    <div className="wedding-label">Weekend Schedule</div>
                    <h3 className="display text-[42px] text-[#2C2926] mt-2">The Order of Celebration</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map(ev => (
                      <GlassCard key={ev.id} variant="crystal" padding="lg" className="border border-[#E5DEC9]">
                        <div className="wedding-label text-[#A37C4D]">{ev.event_date && format(new Date(ev.event_date), "EEE • d MMM")}</div>
                        <div className="display text-[26px] text-[#2C2926] mt-2">{ev.title}</div>
                        <div className="mt-3 flex items-center gap-2 text-[13px] font-mono text-[#726C65]">
                          <Clock size={14} className="text-[#A37C4D]" /> {ev.event_time || "TBA"}
                        </div>
                        {ev.location && <div className="text-[13px] text-[#726C65] mt-1 flex items-center gap-1.5"><MapPin size={14} className="text-[#A37C4D]" />{ev.location}</div>}
                        {ev.description && <div className="text-[13.5px] text-[#726C65] leading-relaxed mt-4 pt-3 border-t border-[#E5DEC9]">{ev.description}</div>}
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Venue & Map */}
            {wedding.ceremony_venue && !wedding.legacy_mode && (
              <section id="venue" className="py-24">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                      <div className="wedding-label">Primary Setting</div>
                      <h3 className="display text-[40px] md:text-[50px] text-[#2C2926] mt-2 leading-[1]">{wedding.ceremony_venue}</h3>
                      {wedding.venue_address && (
                        <div className="mt-5 flex gap-3 text-[16px] text-[#726C65] font-serif"><MapPin size={18} className="text-[#A37C4D] shrink-0 mt-1" />{wedding.venue_address}</div>
                      )}
                      {wedding.ceremony_time && (
                        <div className="mt-3 flex gap-3 text-[16px] text-[#726C65] font-serif"><Clock size={18} className="text-[#A37C4D] shrink-0 mt-1" />Ceremony begins promptly at {wedding.ceremony_time}</div>
                      )}
                    </div>
                    <div className="rounded-[28px] overflow-hidden bg-white border border-[#E5DEC9] shadow-xl">
                      <iframe
                        title="map"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(wedding.venue_address || wedding.ceremony_venue)}&output=embed`}
                        className="w-full h-[380px]"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {wedding.venue_map_url && (
                    <div className="mt-16 text-center">
                      <div className="wedding-label mb-6">Interactive Venue Blueprint</div>
                      <div className="relative inline-block max-w-full rounded-[28px] overflow-hidden border border-[#E5DEC9] shadow-2xl bg-white">
                        <img src={wedding.venue_map_url} alt="Venue map" className="max-h-[620px] w-auto" />
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
                    </div>
                  )}

                  {accommodations.length > 0 && (
                    <div className="mt-20">
                      <div className="text-center mb-10">
                        <div className="wedding-label">Hospitality & Stay</div>
                        <h3 className="display text-[36px] text-[#2C2926] mt-2">Recommended Accommodations</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accommodations.map((acc: any) => (
                          <GlassCard key={acc.id} variant="crystal" padding="lg" className="border border-[#E5DEC9]">
                            {acc.photo_url && <img src={acc.photo_url} alt={acc.name} className="w-full h-[160px] object-cover rounded-[16px] mb-4" />}
                            <h4 className="display text-[24px] text-[#2C2926]">{acc.name}</h4>
                            <div className="text-[13px] font-mono text-[#726C65] mt-3 space-y-1">
                              {acc.distance && <div className="flex gap-2 items-center"><MapPin size={14} className="text-[#A37C4D]" /> {acc.distance}</div>}
                              {acc.price && <div className="flex gap-2 items-center"><span className="text-[#A37C4D] font-bold">Rate:</span> {acc.price}</div>}
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <div className="text-center mb-10">
                    <div className="wedding-label">RSVP Verification</div>
                    <h3 className="display text-[44px] text-[#2C2926] mt-2">Will You Join Us?</h3>
                    <p className="text-[15px] text-[#726C65] mt-3">Kindly transmit your reply by our deadline.</p>
                  </div>
                  <GlassCard variant="crystal" padding="xl" className="border border-[#E5DEC9] shadow-2xl">
                    <RSVPForm wedding={wedding} isPreview={isPreview} />
                  </GlassCard>
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
                        onClick={() => setLightbox(g.url)}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="text-left rounded-[24px] bg-white border border-[#E5DEC9] p-2.5 shadow-md hover:shadow-xl transition group"
                      >
                        <div className="rounded-[18px] overflow-hidden aspect-[4/5]">
                          <img src={g.url} alt={g.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
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
                  <div className="wedding-label">Gifts & Registry</div>
                  <h3 className="display text-[32px] md:text-[38px] text-[#2C2926] mt-2 leading-[1.1]">
                    Your Presence Is Our Cherished Gift
                  </h3>
                  <p className="mt-5 text-[15px] text-[#726C65] leading-relaxed">
                    If you wish to commemorate our special weekend with a gift, contributions towards our future adventures are deeply appreciated.
                  </p>
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="border-t border-[#E5DEC9] bg-[#EAE3DA]">
              <div className="mx-auto max-w-6xl px-6 py-12 flex flex-wrap items-center justify-between gap-6 text-[13px] text-[#726C65]">
                <div className="flex items-center gap-3 font-semibold text-[#2C2926]">
                  <Flower2 size={16} className="text-[#A37C4D]"/>
                  <span>ForeverVow • {wedding.couple_names} • {wedding.hashtag ? `#${wedding.hashtag}` : ""}</span>
                </div>
                <div className="flex gap-6 font-medium">
                  <Link to="/" className="hover:text-[#2C2926] transition">Home</Link>
                  <a href={`mailto:support@forevervow.studio?subject=Re: ${wedding.couple_names}`} className="hover:text-[#2C2926] flex items-center gap-1.5 transition"><Mail size={13}/> Contact Assistant</a>
                  <Link to={`/checkin/${slug}`} className="hover:text-[#2C2926] flex items-center gap-1.5 transition"><Users size={13}/> Venue Check-in</Link>
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
