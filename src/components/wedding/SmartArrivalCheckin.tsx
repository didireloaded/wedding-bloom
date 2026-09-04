import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, LocateFixed, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getGuestSessionToken } from "@/lib/guestSession";

interface SmartArrivalCheckinProps {
  weddingId: string;
  coupleNames: string;
  venue?: string | null;
  venueLatitude?: number | null;
  venueLongitude?: number | null;
  checkinRadiusMeters?: number | null;
}

const SmartArrivalCheckin = ({
  weddingId,
  coupleNames,
  venue,
  venueLatitude,
  venueLongitude,
  checkinRadiusMeters = 180,
}: SmartArrivalCheckinProps) => {
  const [guestName, setGuestName] = useState("");
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [nearVenue, setNearVenue] = useState<boolean | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.info("Location is not available in this browser. You can still check in manually.");
      setNearVenue(true);
      return;
    }

    setCheckingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const guestSession = getGuestSessionToken(weddingId);
        if (!guestSession) { setNearVenue(null); toast.info("Please RSVP first so we can verify your arrival."); setCheckingLocation(false); return; }
        supabase.functions.invoke("verify-guest-arrival", { body: { wedding_id: weddingId, guest_session: guestSession, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: position.timestamp } }).then(({ data, error }) => {
          if (error || !data) throw error || new Error("Verification failed");
          setNearVenue(Boolean(data.verified));
          setVerificationToken(data.verification_token || null);
          toast[data.verified ? "success" : "info"](data.verified ? "Looks like you have arrived." : data.qr_fallback ? "We could not confirm your location. Use the venue QR instead." : "You do not seem to be at the venue yet.");
        }).catch(() => { setNearVenue(null); toast.info("We could not verify your location. Use the venue QR instead."); }).finally(() => setCheckingLocation(false));
      },
      () => {
        setNearVenue(null);
        setCheckingLocation(false);
        toast.info("Location was not shared. You can still confirm arrival manually.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const checkIn = async () => {
    const guestSession = getGuestSessionToken(weddingId);
    if (!guestSession || nearVenue !== true) { toast.error("Verify your location before checking in."); return; }
    const { data, error } = await supabase.functions.invoke("guest-checkin", { body: { wedding_id: weddingId, guest_session: guestSession, verification_token: verificationToken, method: "geolocation" } });
    if (error || !data?.checked_in) { toast.error("We could not save your check-in. Please try again."); return; }

    setCheckedIn(true);
    toast.success(`Welcome, ${guestName.trim()}.`);
  };

  if (checkedIn) {
    return (
      <section className="px-6 py-12 bg-wedding-blush/30">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-md border border-wedding-sage/30 bg-background p-6 text-center shadow-lg shadow-foreground/5">
          <CheckCircle className="mx-auto mb-4 h-10 w-10 text-wedding-gold" strokeWidth={1.5} />
          <h2 className="font-display text-3xl font-light">You are checked in</h2>
          <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
            {coupleNames} will see that you have arrived.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12 bg-wedding-blush/30">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-md border border-border/60 bg-background p-6 shadow-lg shadow-foreground/5">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wedding-champagne">
            <MapPin className="h-5 w-5 text-wedding-gold" strokeWidth={1.5} />
          </div>
          <div>
            <p className="wedding-label mb-2">ARRIVAL CHECK-IN</p>
            <h2 className="font-display text-3xl font-light">Looks like you have arrived?</h2>
            <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
              Let {coupleNames} know you are here. Location is only used to help confirm venue arrival.
            </p>
          </div>
        </div>

        <input
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Your full name"
          className="mb-4 w-full border border-border bg-muted/20 px-4 py-4 font-body text-sm outline-none transition-colors focus:border-wedding-gold"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={requestLocation}
            disabled={checkingLocation}
            className="inline-flex min-h-[52px] items-center justify-center gap-3 border border-foreground/15 px-5 py-4 font-body text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-muted disabled:opacity-50"
          >
            <LocateFixed className="h-4 w-4" />
            {checkingLocation ? "Checking..." : "Use Location"}
          </button>
          <button
            onClick={checkIn}
            disabled={nearVenue === false}
            className="inline-flex min-h-[52px] items-center justify-center gap-3 bg-foreground px-5 py-4 font-body text-[10px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
          >
            I'm Here
          </button>
        </div>

        {venue && (
          <p className="mt-4 font-body text-xs leading-5 text-muted-foreground">
            Venue: {venue}
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default SmartArrivalCheckin;
