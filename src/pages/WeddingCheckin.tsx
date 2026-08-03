import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flower2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";

/**
 * Guest self-check-in. Mirrors the repo's WeddingCheckin:
 * - Find wedding by slug
 * - Match guest name against RSVP list (exact, then partial)
 * - Insert checkin row (realtime visible on couple dashboard)
 */
export default function WeddingCheckin() {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [rsvpMatch, setRsvpMatch] = useState<any>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    const w = store.find("weddings", (r: any) => r.slug === slug && r.published);
    setWedding(w ?? null);
    setLoading(false);
  }, [slug]);

  const findMatch = (guestName: string) => {
    if (!wedding?.id || !guestName.trim()) return null;
    const normalized = guestName.trim().toLowerCase();
    const rsvps = store.where<any>("rsvps", (r) => r.wedding_id === wedding.id);
    if (!rsvps.length) return null;
    const exact = rsvps.find(r => r.guest_name.toLowerCase() === normalized);
    if (exact) return exact;
    return rsvps.find(r =>
      r.guest_name.toLowerCase().includes(normalized) ||
      normalized.includes(r.guest_name.toLowerCase())
    ) || null;
  };

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setSubmitting(true);
    const match = findMatch(name);
    store.insert("checkins", {
      wedding_id: wedding.id,
      guest_name: name.trim(),
      checkin_time: new Date().toISOString(),
    });
    setRsvpMatch(match);
    setCheckedIn(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="w-12 h-12 mx-auto border-2 border-[#c9a87a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6" style={{ fontFamily: '"Manrope", system-ui, sans-serif' }}>
        <style>{`.display { font-family: "Cormorant Garamond", Georgia, serif; } .wedding-label { letter-spacing: .26em; text-transform: uppercase; font-size: 11px; color: #b7834c; }`}</style>
        <div className="text-center">
          <div className="wedding-label mb-3">Not found</div>
          <h1 className="display text-[44px] text-[#2a231d]">This wedding doesn't exist</h1>
          <Link to="/" className="mt-6 inline-block text-[13px] text-[#b0743c] underline">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6 py-10" style={{ fontFamily: '"Manrope", system-ui, sans-serif' }}>
      <style>{`.display { font-family: "Cormorant Garamond", Georgia, serif; } .wedding-label { letter-spacing: .26em; text-transform: uppercase; font-size: 11px; color: #b7834c; }`}</style>

      <Link to={`/wedding/${slug}`} className="absolute top-6 left-6 flex items-center gap-2 text-[13px] text-[#6b5d4f] hover:text-[#b0743c]">
        <ArrowLeft size={14}/> Back to invitation
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-[#f2e8da] border border-[#e4cfb7] flex items-center justify-center mb-5">
          <Flower2 size={20} className="text-[#b7794a]"/>
        </div>

        {!checkedIn ? (
          <>
            <p className="wedding-label mb-3">Welcome</p>
            <h1 className="display text-[44px] text-[#2a231d] mb-2">{wedding.couple_names}'s Wedding</h1>
            {wedding.ceremony_venue && <p className="text-[14px] text-[#6b5d4f] mb-8">{wedding.ceremony_venue}</p>}
            <form onSubmit={handleCheckin} className="space-y-6">
              <div>
                <label className="wedding-label block mb-2">Your name</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name" autoFocus
                  className="w-full bg-transparent border-b border-[#d9c6ae] py-3 text-[14px] text-center focus:outline-none focus:border-[#b0743c] transition-colors placeholder:text-[#c4b7a7]"
                />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-[#2b2723] text-[#f9f2e8] text-[12px] tracking-[0.3em] uppercase hover:bg-[#392f29] transition-colors disabled:opacity-50 rounded-full">
                {submitting ? "Checking in…" : "Mark your arrival"}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mx-auto w-16 h-16 rounded-full bg-[#eff6ee] border border-[#d2e2d0] flex items-center justify-center mb-4">
              <CheckCircle2 size={26} className="text-[#4f7a56]"/>
            </div>
            <p className="wedding-label mb-2">You're in</p>
            <h2 className="display text-[36px] text-[#2a231d] mb-4">You're checked in!</h2>
            {rsvpMatch ? (
              <div className="bg-white rounded-[18px] border border-[#e6d4be] p-5 text-left">
                <div className="text-[16px] text-[#2a231d]">Welcome, <strong>{rsvpMatch.guest_name}</strong>!</div>
                <div className="mt-3 space-y-1.5 text-[13.5px] text-[#5a4f45]">
                  <div>• RSVP: <span className="font-medium">{rsvpMatch.guest_count} guest{rsvpMatch.guest_count !== 1 ? "s" : ""}</span> registered</div>
                  {rsvpMatch.dietary_preference && <div>• Dietary: {rsvpMatch.dietary_preference}</div>}
                </div>
                {rsvpMatch.attending === false && (
                  <div className="mt-3 text-[12.5px] text-[#a64838] bg-[#fde9e6] rounded-lg p-2.5">
                    Note: Your RSVP was marked as declined — please speak with the couple if this is incorrect.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#fdf3e4] border border-[#e8d2b6] rounded-[14px] p-4 text-[13.5px] text-[#5a4735]">
                Welcome, <strong>{name}</strong>. Enjoy the celebration!<br/>
                <span className="text-[12.5px] text-[#b0743c]">No matching RSVP found — check with the couple if needed.</span>
              </div>
            )}
            <Link to={`/wedding/${slug}`} className="mt-6 inline-block text-[13px] text-[#b0743c] underline underline-offset-4">
              Back to invitation
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
