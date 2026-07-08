import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flower2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Guest self-check-in page — pure Supabase.
 * Fuzzy-matches the entered name against the RSVP list for a warmer welcome.
 * Includes timeout protection and error handling for loading state.
 */
export default function WeddingCheckin() {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  loadingRef.current = loading;
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [rsvpMatch, setRsvpMatch] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const safetyTimer = setTimeout(() => {
      if (!cancelled && loadingRef.current) {
        console.warn(`[WeddingCheckin] Loading timed out for slug: ${slug}`);
        setLoading(false);
        loadingRef.current = false;
      }
    }, 3000);

    async function run() {
      if (!slug) { setLoading(false); loadingRef.current = false; return; }
      try {
        const res = await Promise.race([
          supabase.from("weddings").select("*").eq("slug", slug).maybeSingle(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
        ]);
        if (cancelled) return;
        setWedding(res && (res as any).data ? (res as any).data : null);
      } catch (err) {
        if (!cancelled) console.warn("[WeddingCheckin] Error loading wedding:", err);
      } finally {
        if (!cancelled) { setLoading(false); loadingRef.current = false; }
      }
    }
    run();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [slug]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!wedding?.id) return;
    setSubmitting(true);

    const { data: rsvps } = await supabase.from("rsvps").select("*").eq("wedding_id", wedding.id);
    let match: any = null;
    if (rsvps?.length) {
      const norm = name.trim().toLowerCase();
      match = rsvps.find(r => r.guest_name?.toLowerCase() === norm) ||
              rsvps.find(r => r.guest_name?.toLowerCase().includes(norm) || norm.includes(r.guest_name?.toLowerCase() || ""));
    }

    await supabase.from("checkins").insert([{
      wedding_id: wedding.id,
      guest_name: name.trim(),
      created_at: new Date().toISOString(),
    }]);

    setRsvpMatch(match);
    setCheckedIn(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-12 h-12 mx-auto border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-6 text-[#2C2926]">
        <div className="text-center">
          <div className="wedding-label mb-3">404 Verification</div>
          <h1 className="display text-[44px] text-[#2C2926]">Celebration Not Found</h1>
          <Link to="/" className="mt-6 inline-block fv-btn-primary !py-3 !px-6 text-[13px]">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-6 py-12 text-[#2C2926]">
      <Link to={`/wedding/${slug}`} className="absolute top-8 left-8 flex items-center gap-2 text-[13px] font-semibold text-[#726C65] hover:text-[#A37C4D] transition">
        <ArrowLeft size={16}/> Return to Celebration
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <GlassCard variant="crystal" padding="xl" className="border border-[#E5DEC9] shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#2C2926] text-[#C5A059] flex items-center justify-center mb-6 shadow-md">
            <Flower2 size={24} />
          </div>

          {!checkedIn ? (
            <>
              <p className="wedding-label mb-2">Self Check-in Portal</p>
              <h1 className="display text-[44px] text-[#2C2926] mb-2">{wedding.couple_names}</h1>
              {wedding.ceremony_venue && <p className="text-[14px] text-[#726C65] font-serif mb-8">{wedding.ceremony_venue}</p>}

              <form onSubmit={handleCheckin} className="space-y-6">
                <div>
                  <label className="wedding-label block mb-3">Please State Your Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter full guest name..." autoFocus
                    className="w-full bg-white border border-[#E5DEC9] rounded-[16px] py-4 px-6 text-[15px] text-center focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition placeholder:text-[#A8A29E]"
                  />
                </div>
                <button type="submit" disabled={submitting} className="fv-btn-primary w-full !py-4 text-[13px]">
                  {submitting ? "Verifying Attendance…" : "Confirm Arrival"}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="mx-auto w-16 h-16 rounded-full bg-[#7A9E7E]/20 border border-[#7A9E7E]/40 flex items-center justify-center text-[#7A9E7E] mb-5">
                <CheckCircle2 size={28} />
              </div>
              <p className="wedding-label mb-1">Checked In</p>
              <h2 className="display text-[38px] text-[#2C2926] mb-6">Welcome to the Celebration!</h2>

              {rsvpMatch ? (
                <div className="bg-white rounded-[20px] border border-[#E5DEC9] p-6 text-left shadow-sm">
                  <div className="text-[17px] text-[#2C2926] font-semibold">Verified Guest: <strong>{rsvpMatch.guest_name}</strong></div>
                  <div className="mt-3 space-y-1.5 text-[14px] font-mono text-[#726C65]">
                    <div>• Party Size: <span className="font-bold text-[#2C2926]">{rsvpMatch.guest_count} guest{rsvpMatch.guest_count !== 1 ? "s" : ""}</span> registered</div>
                    {rsvpMatch.dietary_preference && <div>• Dietary: {rsvpMatch.dietary_preference}</div>}
                  </div>
                  {rsvpMatch.attending === false && (
                    <div className="mt-4 text-[13px] text-[#C97B7B] bg-[#C97B7B]/10 rounded-xl p-3 border border-[#C97B7B]/20">
                      Notice: Your RSVP was previously logged as declined — please verify with reception staff.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#FAF7F2] border border-[#E5DEC9] rounded-[20px] p-5 text-[14px] text-[#726C65]">
                  Welcome, <strong className="text-[#2C2926]">{name}</strong>. Enjoy the celebration!<br/>
                  <span className="text-[12px] text-[#A37C4D] font-mono mt-1 block">Unregistered name — check with reception desk if seating is assigned.</span>
                </div>
              )}

              <Link to={`/wedding/${slug}`} className="mt-8 inline-block fv-btn-ghost !py-2.5 !px-6 text-[12px]">
                Open Digital Invitation
              </Link>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
