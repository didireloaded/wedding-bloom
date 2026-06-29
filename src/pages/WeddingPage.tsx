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
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Wedding Bloom//EN\nBEGIN:VEVENT\nDTSTART:${fmt(dt)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nLOCATION:${venue}\nDESCRIPTION:${url}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title.replace(/\W+/g, "-")}.ics`;
  a.click();
}

// Local InvitationOverlay replaced by imported component with premium animation

// RSVP form — mirrors the repo's RSVPForm component
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
      attending: form.attending === "yes" ? true : form.attending === "no" ? false : null,
      guest_count: Number(form.guest_count) || 1,
      dietary_preference: form.dietary_preference || null,
      song_request: form.song_request || null,
      note: form.note || null,
      submitted_at: new Date().toISOString(),
    });
    setSubmitted(true);
    toast.success("RSVP received — thank you");
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#eff6ee] border border-[#d2e2d0] flex items-center justify-center text-[#4f7a56] mb-4">
          <Heart size={22} fill="#4f7a56" />
        </div>
        <div className="display text-[28px] text-[#2a2420]">Grazie mille</div>
        <p className="text-[15px] text-[#5a5047] mt-2 max-w-md mx-auto">
          Your reply is saved. We'll email your weekend pass, shuttle times, and a printable seating card 10 days before.
        </p>
        <button onClick={() => setSubmitted(false)} className="mt-5 text-[13px] text-[#b07b47] underline underline-offset-4">Submit another</button>
      </div>
    );
  }

  const inputCls = "w-full rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-[13px] outline-none focus:border-[#d3a76b] text-[14.2px]";
  const labelCls = "text-[11px] uppercase tracking-[0.19em] text-[#a67c54]";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[14.2px]">
      <div className="md:col-span-2">
        <label className={labelCls}>Full name</label>
        <input required value={form.guest_name} onChange={e => update("guest_name", e.target.value)} placeholder="Your name exactly as invited" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="hello@domain.com" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Attending</label>
        <select value={form.attending} onChange={e => update("attending", e.target.value)} className={inputCls}>
          <option value="yes">Joyfully, yes</option>
          <option value="maybe">Not sure yet</option>
          <option value="no">Regretfully, no</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Guests (incl. you)</label>
        <input type="number" min={1} max={6} value={form.guest_count} onChange={e => update("guest_count", e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Dietary</label>
        <select value={form.dietary_preference} onChange={e => update("dietary_preference", e.target.value)} className={inputCls}>
          <option>No preference</option><option>Vegetarian</option><option>Vegan</option>
          <option>Gluten-free</option><option>Dairy-free</option><option>Halal</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Song request & note</label>
        <textarea rows={2} value={form.song_request} onChange={e => update("song_request", e.target.value)} placeholder="One song we should play…" className={inputCls + " resize-none"} />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>A little note</label>
        <textarea rows={2} value={form.note} onChange={e => update("note", e.target.value)} placeholder="Optional — we read every one" className={inputCls + " resize-none"} />
      </div>
      <div className="md:col-span-2 flex items-center justify-between pt-1">
        <div className="text-[12.2px] text-[#8c7760]">Powered by Wedding Bloom</div>
        <button className="px-6 py-[13px] rounded-full bg-[#2c2723] text-[#fff5e8] text-[13.8px] flex items-center gap-2 hover:bg-[#3a3029] transition">
          <Send size={15} /> Send RSVP
        </button>
      </div>
    </form>
  );
}

// Guestbook section with realtime updates
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
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-4 mb-6">
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="md:col-span-2 rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-[13px] outline-none focus:border-[#d3a76b]" />
          <button className="px-5 py-[13px] rounded-full bg-[#2c2723] text-[#f9f2e8] text-[13.5px] hover:bg-[#392f29]">Share a memory</button>
          <textarea required rows={2} value={message} onChange={e => setMessage(e.target.value)} placeholder="My favorite part of today was…" className="md:col-span-3 rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-[13px] outline-none focus:border-[#d3a76b] resize-none" />
        </form>
      )}
      <div className="grid md:grid-cols-3 gap-4">
        {messages.slice().reverse().map(m => (
          <div key={m.id} className="rounded-[22px] bg-white border border-[#e6d4be] p-5 shadow-[0_4px_16px_rgba(82,64,51,.04)]">
            <div className="text-[15.5px] text-[#3d332a] leading-7">"{m.message}"</div>
            <div className="text-[12.6px] text-[#a67a50] mt-3">— {m.guest_name}</div>
          </div>
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
      toast.success("Photo uploaded to the wall");
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] uppercase tracking-[0.2em] text-[#b8895c]">Guest Uploads</div>
        {!isPreview && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-[10px] rounded-full border border-[#d9c6ae] text-[#5a4735] text-[12.5px] hover:bg-[#fbf3e8] flex items-center gap-2"
            >
              <Camera size={14} /> Add photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {photos.slice().reverse().map((p: any) => (
          <div key={p.id} className="relative aspect-square rounded-[16px] overflow-hidden border border-[#e6d4be] group shadow-sm">
            <img src={p.photo_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <div className="text-[11px] text-white font-medium">{p.guest_name}</div>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full text-center py-8 text-[13.5px] text-[#8c7862] border border-dashed border-[#d9c6ae] rounded-[16px]">
            No guest photos yet.
          </div>
        )}
      </div>
    </div>
  );
}

// Chat assistant (simple FAQ)
function WeddingConcierge({ wedding }: { wedding: any }) {
  const [open, setOpen] = useState(false);
  
  const shortcuts = [
    { label: "Where is the ceremony?", href: "#venue" },
    { label: "Show me the venue map", href: "#venue" },
    { label: "Get directions", href: `https://www.google.com/maps?q=${encodeURIComponent(wedding.venue_address || wedding.ceremony_venue)}` },
    { label: "View today's schedule", href: "#events" },
    { label: "Upload my photos", href: "#guest-photos" },
    { label: "Leave a message", href: "#moments" },
    { label: "Add to my calendar", action: "calendar" },
    { label: "View accommodation", href: "#venue" },
  ];

  return (
    <>
      <button 
        onClick={() => setOpen(o => !o)} 
        className="fixed bottom-5 right-5 z-40 px-5 py-3 rounded-full bg-[#2b2723] text-[#f9f2e8] flex items-center gap-2 shadow-xl hover:bg-[#392f29] transition group"
      >
        {open ? <X size={18}/> : <MessageCircle size={18}/>}
        <span className="text-[13px] font-medium">{open ? "Close" : "Need Help?"}</span>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="fixed bottom-24 right-5 z-40 w-[320px] max-w-[92vw] bg-white border border-[#e6d4be] rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 bg-[#fdf9f4] border-b border-[#e8d2b6]">
              <div className="wedding-label text-[10px]">Wedding Concierge</div>
              <div className="display text-[18px] text-[#2a231d]">How can we help?</div>
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
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-[12px] hover:bg-[#f5efe7] text-[13.5px] text-[#5a4735] transition flex items-center justify-between group"
                >
                  {s.label}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#b0743c]" />
                </button>
              ))}
            </div>
            <div className="bg-[#fcf7f1] p-4 border-t border-[#e8d2b6] text-center">
              <div className="text-[11px] text-[#a98a6b] uppercase tracking-wider">ForeverVow Guest Assistant</div>
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
  const [invitationOpen, setInvitationOpen] = useState(isPreview); // skip envelope in preview
  const [lightbox, setLightbox] = useState<string | null>(null);
  const countdown = useCountdown(wedding?.wedding_date ?? null);

  // track page view (mirrors repo's increment_page_view RPC)
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
      { id: "venue", label: "Venue & Map" },
      { id: "rsvp", label: "RSVP" },
      { id: "gallery", label: "Gallery" },
    ];
  }, [wedding?.legacy_mode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#c9a87a] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#8d7962] text-sm tracking-[0.18em] uppercase">Loading invitation</div>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6">
        <div className="text-center max-w-md">
          <div className="wedding-label mb-3">404</div>
          <h1 className="display text-[44px] text-[#2a231d]">Wedding not found</h1>
          <p className="text-[15px] text-[#5a5047] mt-3">This page may not exist or hasn't been published yet.</p>
          <Link to="/" className="mt-6 inline-block px-5 py-[12px] rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13.5px]">Back home</Link>
        </div>
      </div>
    );
  }

  const weddingDate = wedding.wedding_date ? format(new Date(wedding.wedding_date), "d MMMM yyyy").toUpperCase() : "";
  const daysAway = wedding.wedding_date ? differenceInDays(new Date(wedding.wedding_date + "T16:00:00"), new Date()) : null;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{wedding.couple_names} — Wedding Bloom</title>
        <meta name="description" content={`You're invited to ${wedding.couple_names}'s wedding${wedding.wedding_date ? ` on ${weddingDate}` : ""}.`} />
        {wedding.cover_image && <meta property="og:image" content={wedding.cover_image} />}
      </Helmet>

      <style>{`
        ::selection { background:#ebdacf; color:#302928; }
        .display { font-family: "Cormorant Garamond", Georgia, serif; }
        .script { font-family: "Fraunces", "Cormorant Garamond", serif; font-style: italic; }
        .wedding-label { letter-spacing: .26em; text-transform: uppercase; font-size: 11px; color: #b7834c; }
      `}</style>

      <div className="min-h-screen bg-[#faf8f5] text-[#2e2b28]" style={{ fontFamily: '"Manrope", system-ui, sans-serif' }}>
        {/* Invitation overlay */}
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
            {/* Preview banner */}
            {isPreview && (
              <div className="sticky top-0 z-40 bg-[#2b2723] text-[#f9f2e8] text-center py-2.5 px-4 text-[12px] tracking-[0.18em] uppercase">
                <span className="inline-flex items-center gap-2">
                  <Eye size={12} /> Wedding Preview · This is an example website
                  <Link to="/" className="ml-3 underline underline-offset-2 hover:text-white normal-case tracking-normal text-[12.5px]">Back to ForeverVow</Link>
                </span>
              </div>
            )}

            {/* Nav */}
            <nav className={`sticky ${isPreview ? "top-[40px]" : "top-0"} z-30 backdrop-blur-md bg-[rgba(250,248,245,0.92)] border-b border-[#ece2d6]`}>
              <div className="mx-auto max-w-6xl px-6 h-[64px] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <Flower2 size={16} className="text-[#b7794a]"/>
                  <span className="display text-[15px] text-[#302927]">{wedding.couple_names}</span>
                </Link>
                <div className="hidden md:flex items-center gap-6 text-[13.5px] text-[#544d47]">
                  {nav.map(n => (
                    <a key={n.id} href={`#${n.id}`} className="hover:text-[#b0743c]">{n.label}</a>
                  ))}
                  <a href="#moments" className="hover:text-[#b0743c]">Moments</a>
                </div>
                <button
                  onClick={() => generateICS(wedding.couple_names + " Wedding", wedding.wedding_date, wedding.ceremony_time, wedding.ceremony_venue, window.location.href)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[12px] px-4 py-[9px] rounded-full border border-[#d6bc9c] text-[#704a28] hover:bg-[#fbf3e8]"
                >
                  <Calendar size={13}/> Add to cal
                </button>
              </div>
            </nav>

            {/* Hero */}
            <section id="home" className="relative overflow-hidden">
              <div className="mx-auto max-w-6xl px-6 pt-[60px] pb-[40px] md:pt-[90px] md:pb-[60px] text-center">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                  {wedding.legacy_mode ? (
                    <div className="wedding-label mb-4">A Day We'll Never Forget</div>
                  ) : (
                    <div className="wedding-label mb-4">We're getting married</div>
                  )}
                  <h1 className="display text-[60px] sm:text-[86px] md:text-[110px] leading-[0.88] text-[#221e1b] tracking-[-0.012em]">
                    {wedding.couple_names}
                  </h1>
                  {weddingDate && (
                    <div className="mt-6 text-[13px] tracking-[0.22em] uppercase text-[#8d7962]">
                      {wedding.legacy_mode ? `Married on ${weddingDate}` : `${weddingDate}${wedding.ceremony_venue ? ` • ${wedding.ceremony_venue}` : ""}`}
                    </div>
                  )}
                </motion.div>

                {wedding.hero_image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-10 max-w-4xl mx-auto"
                  >
                    <div className="rounded-[30px] overflow-hidden bg-white p-[12px] shadow-[0_18px_50px_rgba(82,64,51,.12)] border border-[#eaddd0]">
                      <img src={wedding.hero_image} alt={wedding.couple_names} className="w-full h-[420px] md:h-[560px] object-cover rounded-[22px]" />
                    </div>
                  </motion.div>
                )}

                {daysAway !== null && (
                  <div className="mt-8 text-[14px] text-[#6b5d4f]">
                    {daysAway > 0 ? `${daysAway} day${daysAway === 1 ? "" : "s"} to go` : "The day has arrived"}
                  </div>
                )}
              </div>
            </section>

            {/* Countdown */}
            {countdown && wedding.wedding_date && !wedding.legacy_mode && (
              <section className="border-y border-[#eadfd1] bg-[#fcf7f1]">
                <div className="mx-auto max-w-5xl px-6 py-7 grid grid-cols-4 gap-6 text-center">
                  {[["Days", countdown.days], ["Hours", countdown.hours], ["Minutes", countdown.minutes], ["Seconds", countdown.seconds]].map(([l, v]) => (
                    <div key={l as string}>
                      <div className="display text-[42px] leading-none text-[#2c2520]">{String(v).padStart(2, "0")}</div>
                      <div className="wedding-label mt-2">{l}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Story */}
            {wedding.story && (
              <section id="story" className="py-[80px]">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <div className="wedding-label">Our story</div>
                  <h2 className="display text-[38px] md:text-[48px] text-[#24201c] mt-3 leading-[1.04]">
                    How we <span className="script text-[#b7794a]">got here</span>
                  </h2>
                  <p className="mt-6 text-[16.5px] leading-8 text-[#5b5148] whitespace-pre-line">{wedding.story}</p>
                </div>
              </section>
            )}

            {/* Events */}
            {events.length > 0 && (
              <section id="events" className="py-[74px] bg-[#f5efe7] border-y border-[#eadfd1]">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="text-center mb-10">
                    <div className="wedding-label">Wedding weekend</div>
                    <h3 className="display text-[38px] md:text-[46px] text-[#24201c] mt-3">The plan.</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {events.map(ev => (
                      <div key={ev.id} className="bg-white rounded-[22px] border border-[#e6d6c2] p-6 shadow-[0_6px_24px_rgba(82,64,51,.06)]">
                        <div className="wedding-label">{ev.event_date && format(new Date(ev.event_date), "EEE • d MMM")}</div>
                        <div className="display text-[24px] text-[#2b241d] mt-2">{ev.title}</div>
                        <div className="mt-3 flex items-center gap-2 text-[13.2px] text-[#5c4f43]">
                          <Clock size={14} className="text-[#c4925e]" /> {ev.event_time || "TBA"}
                        </div>
                        {ev.location && <div className="text-[13.2px] text-[#6a5948] mt-1">{ev.location}</div>}
                        {ev.description && <div className="text-[13.6px] text-[#64584a] leading-6 mt-3">{ev.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Venue & Map */}
            {wedding.ceremony_venue && !wedding.legacy_mode && (
              <section id="venue" className="py-[80px]">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
                    <div>
                      <div className="wedding-label">Venue</div>
                      <h3 className="display text-[36px] md:text-[44px] text-[#231e1a] mt-3 leading-[1]">{wedding.ceremony_venue}</h3>
                      {wedding.venue_address && (
                        <div className="mt-4 flex gap-3 text-[15px] text-[#5a4f45]"><MapPin size={17} className="text-[#c2864b] mt-[2px]" />{wedding.venue_address}</div>
                      )}
                      {wedding.ceremony_time && (
                        <div className="mt-3 flex gap-3 text-[15px] text-[#5a4f45]"><Clock size={17} className="text-[#c2864b] mt-[2px]" />Ceremony at {wedding.ceremony_time}</div>
                      )}
                    </div>
                    <div className="rounded-[24px] overflow-hidden bg-white border border-[#e6d4be] shadow-[0_18px_50px_rgba(82,64,51,.08)]">
                      <iframe
                        title="map"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(wedding.venue_address || wedding.ceremony_venue)}&output=embed`}
                        className="w-full h-[360px]"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Interactive Venue Map */}
                  {wedding.venue_map_url && (
                    <div className="mt-16 text-center">
                      <div className="wedding-label mb-6">Interactive Venue Map</div>
                      <div className="relative inline-block max-w-full rounded-[24px] overflow-hidden border border-[#e6d4be] shadow-[0_18px_50px_rgba(82,64,51,.08)]">
                        <img src={wedding.venue_map_url} alt="Venue map" className="max-h-[600px] w-auto" />
                        {markers.map((m: any) => (
                          <div 
                            key={m.id} 
                            className="absolute w-8 h-8 -ml-4 -mt-4 bg-[#b0743c] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition group"
                            style={{ left: `${m.x}%`, top: `${m.y}%` }}
                          >
                            <MapPin size={16} />
                            <div className="absolute top-10 w-max px-3 py-2 bg-[#2b2723] text-[#f9f2e8] text-[13px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-10 text-center shadow-xl">
                              <strong className="block">{m.title}</strong>
                              {m.category && <span className="text-[#c4b7a7] text-[11px] uppercase tracking-[0.1em]">{m.category}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[13px] text-[#8d7962] mt-4">Hover or tap markers to explore the venue.</p>
                    </div>
                  )}

                  {/* Accommodations */}
                  {accommodations.length > 0 && (
                    <div className="mt-16">
                      <div className="text-center mb-8">
                        <div className="wedding-label">Where to stay</div>
                        <h3 className="display text-[32px] md:text-[38px] text-[#24201c] mt-2">Accommodations</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {accommodations.map((acc: any) => (
                          <div key={acc.id} className="bg-white rounded-[20px] border border-[#e6d4be] p-5">
                            {acc.photo_url && <img src={acc.photo_url} alt={acc.name} className="w-full h-[140px] object-cover rounded-[14px] mb-4" />}
                            <div className="display text-[22px] text-[#2a231d]">{acc.name}</div>
                            <div className="text-[13.5px] text-[#5a4f45] mt-2 space-y-1">
                              {acc.distance && <div className="flex gap-2 items-center"><MapPin size={14} className="text-[#c2864b]" /> {acc.distance}</div>}
                              {acc.price && <div className="flex gap-2 items-center"><span className="text-[#c2864b]">€</span> {acc.price}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Dress code */}
            {wedding.dress_code && !wedding.legacy_mode && (
              <section className="py-[56px] bg-[#f5efe7] border-y border-[#eadfd1]">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <div className="wedding-label">Dress code</div>
                  <p className="display text-[28px] md:text-[34px] text-[#2a231d] mt-3 leading-[1.1]">{wedding.dress_code}</p>
                </div>
              </section>
            )}

            {/* Live Announcements */}
            {updates.length > 0 && !wedding.legacy_mode && (
              <section className="py-[64px] bg-[#fcf7f1]">
                <div className="mx-auto max-w-4xl px-6">
                  <div className="text-center mb-8">
                    <div className="wedding-label">Live Announcements</div>
                    <h3 className="display text-[32px] md:text-[40px] text-[#24201c] mt-2">Latest updates</h3>
                  </div>
                  <div className="space-y-4 relative pl-4 border-l-2 border-[#d6bc9c]">
                    {updates.slice().reverse().map(u => (
                      <div key={u.id} className="bg-white rounded-[22px] border border-[#e6d4be] p-6 shadow-[0_4px_16px_rgba(82,64,51,.04)] relative">
                        <div className="absolute -left-[24px] top-6 w-3 h-3 rounded-full bg-[#b0743c] border-2 border-[#fcf7f1]"></div>
                        <div className="flex items-center gap-2 text-[11.5px] tracking-[0.2em] uppercase text-[#a67a50] mb-2"><Sparkles size={12} />{format(new Date(u.created_at), "HH:mm • d MMM yyyy")}</div>
                        <div className="display text-[22px] text-[#2a231d]">{u.title}</div>
                        <div className="text-[15px] text-[#5a5048] leading-7 mt-2">{u.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* RSVP */}
            {!wedding.legacy_mode && (
              <section id="rsvp" className="py-[78px] bg-[#f3ede4] border-y border-[#e2d3c0]">
                <div className="mx-auto max-w-4xl px-6">
                  <div className="text-center mb-8">
                    <div className="wedding-label">RSVP</div>
                    <h3 className="display text-[38px] md:text-[46px] text-[#221d19] leading-[0.98] mt-2">Will we see you?</h3>
                    <p className="text-[15px] text-[#5c5045] mt-3">Kindly reply by August 1st.</p>
                  </div>
                  <div className="bg-white rounded-[28px] border border-[#e0cdb5] p-6 md:p-8 shadow-[0_18px_50px_rgba(82,64,51,.08)]">
                    <RSVPForm wedding={wedding} isPreview={isPreview} />
                  </div>
                </div>
              </section>
            )}

            {/* Guest Moments (Replaces Guestbook) */}
            <section id="moments" className="py-[72px]">
              <div className="mx-auto max-w-6xl px-6">
                <div className="text-center mb-8">
                  <div className="wedding-label">Moments</div>
                  <h3 className="display text-[34px] md:text-[42px] text-[#24201c] mt-2">A living wall of memories.</h3>
                </div>
                <MomentsSectionGuestbook wedding={wedding} isPreview={isPreview} />
              </div>
            </section>

            {/* Guest Photos */}
            <section id="guest-photos" className="py-[60px] bg-[#f5efe7] border-y border-[#eadfd1]">
              <div className="mx-auto max-w-6xl px-6">
                <GuestPhotosSection wedding={wedding} isPreview={isPreview} />
              </div>
            </section>

            {/* Gallery */}
            {gallery.length > 0 && (
              <section id="gallery" className="py-[70px]">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="text-center mb-10">
                    <div className="wedding-label">Gallery</div>
                    <div className="display text-[36px] md:text-[44px] text-[#24201c]">Sketches of us.</div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {gallery.map((g, i) => (
                      <motion.button
                        key={g.id}
                        onClick={() => setLightbox(g.url)}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        className="text-left rounded-[22px] bg-white border border-[#e7d6c2] p-[10px] shadow-[0_6px_24px_rgba(82,64,51,.06)]"
                      >
                        <div className="rounded-[16px] overflow-hidden aspect-[4/5]">
                          <img src={g.url} alt={g.caption || ""} className="w-full h-full object-cover hover:scale-[1.04] transition duration-700" />
                        </div>
                        <div className="pt-2.5 px-1 flex justify-between text-[12.6px] text-[#6e5c47]">
                          <span>{g.caption}</span>
                          <span className="text-[#c0925d]">#{String(i + 1).padStart(2, "0")}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Registry note */}
            {!wedding.legacy_mode && (
              <section className="py-[64px] bg-[#f5efe7] border-t border-[#eadfd1]">
                <div className="mx-auto max-w-3xl px-6 text-center">
                  <Gift size={22} className="mx-auto text-[#b7794a] mb-3" />
                  <div className="wedding-label">Registry</div>
                  <p className="display text-[28px] md:text-[34px] text-[#2a231d] mt-3 leading-[1.1]">
                    Your presence is the present.
                  </p>
                  <p className="mt-4 text-[15px] text-[#5a5047]">
                    If you'd like to honor us with a gift, donations to the Namib Desert Seed Bank would make our hearts sing.
                  </p>
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="border-t border-[#e2d3bf] bg-[#f5ede3]">
              <div className="mx-auto max-w-6xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-[12.5px] text-[#94765a]">
                <div className="flex items-center gap-3">
                  <Flower2 size={16} className="text-[#b7794a]"/>
                  <span>Wedding Bloom • {wedding.couple_names} • {wedding.hashtag ? `#${wedding.hashtag}` : ""}</span>
                </div>
                <div className="flex gap-5">
                  <Link to="/" className="hover:text-[#7d5630]">Home</Link>
                  <a href={`mailto:hello@weddingbloom.studio?subject=Re: ${wedding.couple_names}`} className="hover:text-[#7d5630] flex items-center gap-1"><Mail size={12}/> Contact</a>
                  <Link to={`/checkin/${slug}`} className="hover:text-[#7d5630] flex items-center gap-1"><Users size={12}/> Check-in</Link>
                </div>
              </div>
            </footer>

            {/* Wedding Concierge */}
            {!isPreview && <WeddingConcierge wedding={wedding} />}

            {/* Lightbox */}
            <AnimatePresence>
              {lightbox && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6"
                  onClick={() => setLightbox(null)}
                >
                  <button className="absolute top-5 right-5 text-white w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18}/></button>
                  <img src={lightbox} alt="" className="max-w-[92vw] max-h-[88vh] object-contain rounded-[12px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </HelmetProvider>
  );
}
