import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle, Heart, Users } from "lucide-react";

interface RsvpMatch {
  guest_name: string;
  guest_count: number;
  attending: boolean | null;
}

const WeddingCheckin = () => {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [rsvpMatch, setRsvpMatch] = useState<RsvpMatch | null>(null);

  useEffect(() => {
    if (slug) fetchWedding();
  }, [slug]);

  const fetchWedding = async () => {
    const { data } = await supabase
      .from("weddings")
      .select("id, couple_names, ceremony_venue, cover_image, published")
      .eq("slug", slug!)
      .eq("published", true)
      .maybeSingle();
    if (data) setWedding(data);
    setLoading(false);
  };

  const findRsvpMatch = async (guestName: string): Promise<RsvpMatch | null> => {
    if (!wedding?.id || !guestName.trim()) return null;
    const normalized = guestName.trim().toLowerCase();
    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("guest_name, guest_count, attending")
      .eq("wedding_id", wedding.id);
    if (!rsvps || rsvps.length === 0) return null;
    // Exact match first (case-insensitive)
    const exact = rsvps.find((r) => r.guest_name.toLowerCase() === normalized);
    if (exact) return exact;
    // Partial match (name contains or is contained)
    const partial = rsvps.find(
      (r) =>
        r.guest_name.toLowerCase().includes(normalized) ||
        normalized.includes(r.guest_name.toLowerCase())
    );
    return partial || null;
  };

  const handleCheckin = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    // The legacy route must not write directly to checkins. The embedded flow
    // validates the guest session, RSVP, location/QR token, and duplicate state.
    setSubmitting(true);
    window.location.assign(`/wedding/${slug}#checkin`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border border-wedding-gold/30 border-t-wedding-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-light mb-3">Not Found</h1>
          <p className="font-body text-sm text-muted-foreground">This wedding page doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-wedding-gold" strokeWidth={1} />
          </motion.div>
          <h1 className="font-display text-3xl sm:text-4xl font-light mb-3">You're Checked In!</h1>

          {rsvpMatch ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Welcome, <span className="text-foreground font-medium">{name}</span>!
              </p>
              <div className="inline-flex items-center gap-2 bg-wedding-sage/20 border border-wedding-sage/30 px-5 py-3">
                <Users className="w-4 h-4 text-wedding-gold" strokeWidth={1.5} />
                <span className="font-body text-xs tracking-wide">
                  RSVP: <strong>{rsvpMatch.guest_count}</strong> guest{rsvpMatch.guest_count !== 1 ? "s" : ""} registered
                </span>
              </div>
              {rsvpMatch.attending === false && (
                <p className="font-body text-[10px] text-muted-foreground mt-2 italic">
                  Note: Your RSVP was marked as declined
                </p>
              )}
            </motion.div>
          ) : (
            <div className="mb-6">
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Welcome, {name}. Enjoy the celebration!
              </p>
              <p className="font-body text-[10px] text-muted-foreground/60 mt-2 italic">
                No matching RSVP found — please check with the couple if needed
              </p>
            </div>
          )}

          <div className="wedding-divider" />
          <p className="font-display text-lg italic text-muted-foreground mt-6">{wedding.couple_names}</p>
          <a
            href={`/wedding/${slug}`}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-body text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10"
          >
            VIEW WEDDING PAGE →
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm text-center"
      >
        <div className="wedding-ornament mb-4">
          <Heart className="w-5 h-5 text-wedding-gold" strokeWidth={1} fill="currentColor" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-light mb-2">
          Welcome
        </h1>
        <p className="font-display text-lg sm:text-xl italic text-muted-foreground mb-2">
          {wedding.couple_names}'s Wedding
        </p>
        {wedding.ceremony_venue && (
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-10">
            {wedding.ceremony_venue}
          </p>
        )}

        <div className="bg-background border border-border/40 p-8 shadow-lg shadow-foreground/3 space-y-6">
          <div>
            <label className="wedding-label block mb-3">YOUR NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              autoFocus
              className="w-full bg-transparent border-b border-foreground/15 py-3 font-body text-sm text-center focus:outline-none focus:border-wedding-gold transition-colors placeholder:text-muted-foreground/40"
            />
          </div>

          <button
            onClick={handleCheckin}
            disabled={submitting}
            className="w-full py-5 bg-foreground text-background font-body text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all duration-300 min-h-[56px] disabled:opacity-50 shadow-lg shadow-foreground/10"
          >
            {submitting ? "CHECKING IN..." : "CHECK IN"}
          </button>
        </div>

        <p className="font-body text-[10px] tracking-wider text-muted-foreground/50 mt-8">
          TAP TO MARK YOUR ARRIVAL
        </p>
      </motion.div>
    </div>
  );
};

export default WeddingCheckin;
