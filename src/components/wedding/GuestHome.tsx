import { CalendarDays, CheckCircle, Images, MapPin, MessageCircle } from "lucide-react";

export default function GuestHome({ wedding, phase, guestState, response, onAction }: any) {
  const date = wedding.wedding_date ? new Date(wedding.wedding_date) : null;
  const days = date ? Math.max(0, Math.ceil((date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)) : null;
  const attending = guestState === "rsvp_confirmed" || guestState === "checked_in";
  const isWeddingDay = phase === "wedding_day" || phase === "live";
  const isPostWedding = phase === "completed" || phase === "archive";

  const eyebrow = isWeddingDay ? "Today's the day" : isPostWedding ? "Memories from the day" : "Your wedding companion";
  const timing = isWeddingDay
    ? `${wedding.ceremony_time || ""}${wedding.ceremony_venue ? ` · ${wedding.ceremony_venue}` : ""}`
    : isPostWedding
      ? "The celebration lives on"
      : days !== null
        ? `${days} days to go`
        : "We are glad you are here";

  if (isPostWedding) {
    return (
      <section className="guest-home">
        <p className="guest-kicker">{eyebrow}</p>
        <h1>{wedding.couple_names}</h1>
        <p className="guest-timing">{timing}</p>
        <div className="guest-hero-card guest-memory-card">
          <p className="font-body text-xs text-white/60">Relive the celebration</p>
          <p className="mt-2 font-body text-xl">Photos, messages, and favorite moments are waiting.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => onAction("photos")} className="rounded-full bg-white px-3 py-3 font-body text-xs font-semibold text-black">View photos</button>
            <button onClick={() => onAction("wall")} className="rounded-full border border-white/30 px-3 py-3 font-body text-xs">Share a memory</button>
          </div>
        </div>
        <div className="guest-quick-grid">
          <button onClick={() => onAction("photos")}><Images className="h-5 w-5" /><p>Wedding photos</p></button>
          <button onClick={() => onAction("wall")}><MessageCircle className="h-5 w-5" /><p>Memory wall</p></button>
        </div>
      </section>
    );
  }

  return (
    <section className="guest-home">
      <p className="guest-kicker">{eyebrow}</p>
      <h1>{wedding.couple_names}</h1>
      <p className="guest-timing">{timing}</p>
      <div className="guest-hero-card">
        <p className="font-body text-xs text-white/60">{isWeddingDay ? "Welcome to the wedding" : guestState === "checked_in" ? "Welcome" : attending ? "You're attending" : guestState === "rsvp_declined" ? "We'll miss you" : "Will you be celebrating with us?"}</p>
        {response && <p className="mt-2 break-words font-body text-lg">{response.guest_name}</p>}
        {attending && <p className="mt-2 font-body text-xl">{guestState === 'checked_in' ? "You're checked in" : `Confirmed for ${response?.guest_count || 1} ${(response?.guest_count || 1) === 1 ? 'guest' : 'guests'}`} <CheckCircle className="ml-1 inline h-5 w-5 text-lime-300" /></p>}
        {guestState === 'rsvp_pending' && <p className="mt-2 text-sm text-white/80">Your response is saved as not sure. You can update it when you know.</p>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => onAction(isWeddingDay && attending && guestState !== 'checked_in' ? "checkin" : attending ? "schedule" : "rsvp")} className="rounded-full bg-white px-3 py-3 font-body text-xs font-semibold text-black">{isWeddingDay && attending && guestState !== 'checked_in' ? "Check in" : attending ? "View schedule" : response ? "Update response" : "RSVP"}</button>
          <button onClick={() => onAction(isWeddingDay ? "schedule" : "venue")} className="rounded-full border border-white/30 px-3 py-3 font-body text-xs">{isWeddingDay ? "View schedule" : "Get directions"}</button>
        </div>
        {response && !isWeddingDay && <button onClick={() => onAction('rsvp')} className="mt-3 min-h-11 text-sm underline underline-offset-4">Change my response</button>}
      </div>
      <div className="guest-quick-grid">
        <button onClick={() => onAction("schedule")}><CalendarDays className="h-5 w-5" /><p>Schedule</p></button>
        <button onClick={() => onAction("venue")}><MapPin className="h-5 w-5" /><p>Venue & directions</p></button>
      </div>
    </section>
  );
}
