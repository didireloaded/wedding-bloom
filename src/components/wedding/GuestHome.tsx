import { CalendarDays, CheckCircle, Images, MapPin, MessageCircle } from "lucide-react";

export default function GuestHome({ wedding, phase, guestState, onAction }: any) {
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
      <section className="mx-auto max-w-xl px-5 py-10">
        <p className="wedding-label">{eyebrow}</p>
        <h1 className="mt-3 font-body text-4xl font-semibold">{wedding.couple_names}</h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">{timing}</p>
        <div className="mt-6 rounded-[28px] bg-[#202020] p-5 text-white shadow-xl">
          <p className="font-body text-xs text-white/60">Relive the celebration</p>
          <p className="mt-2 font-body text-xl">Photos, messages, and favorite moments are waiting.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => onAction("photos")} className="rounded-full bg-white px-3 py-3 font-body text-xs font-semibold text-black">View photos</button>
            <button onClick={() => onAction("wall")} className="rounded-full border border-white/30 px-3 py-3 font-body text-xs">Share a memory</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => onAction("photos")} className="rounded-[22px] bg-white/85 p-4 text-left shadow-sm"><Images className="h-5 w-5" /><p className="mt-3 font-body text-sm font-semibold">Wedding photos</p></button>
          <button onClick={() => onAction("wall")} className="rounded-[22px] bg-white/85 p-4 text-left shadow-sm"><MessageCircle className="h-5 w-5" /><p className="mt-3 font-body text-sm font-semibold">Memory wall</p></button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-10">
      <p className="wedding-label">{eyebrow}</p>
      <h1 className="mt-3 font-body text-4xl font-semibold">{wedding.couple_names}</h1>
      <p className="mt-2 font-body text-sm text-muted-foreground">{timing}</p>
      <div className="mt-6 rounded-[28px] bg-[#202020] p-5 text-white shadow-xl">
        <p className="font-body text-xs text-white/60">{isWeddingDay ? "Welcome to the wedding" : guestState === "checked_in" ? "Welcome" : attending ? "You're attending" : guestState === "rsvp_declined" ? "We'll miss you" : "Will you be celebrating with us?"}</p>
        {attending && <p className="mt-2 font-body text-xl">Your place is on the list <CheckCircle className="ml-1 inline h-5 w-5 text-lime-300" /></p>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => onAction(isWeddingDay ? "checkin" : attending ? "schedule" : "rsvp")} className="rounded-full bg-white px-3 py-3 font-body text-xs font-semibold text-black">{isWeddingDay ? "Check in" : attending ? "View schedule" : "RSVP"}</button>
          <button onClick={() => onAction(isWeddingDay ? "schedule" : "venue")} className="rounded-full border border-white/30 px-3 py-3 font-body text-xs">{isWeddingDay ? "View schedule" : "Get directions"}</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => onAction("schedule")} className="rounded-[22px] bg-white/85 p-4 text-left shadow-sm"><CalendarDays className="h-5 w-5" /><p className="mt-3 font-body text-sm font-semibold">Schedule</p></button>
        <button onClick={() => onAction("venue")} className="rounded-[22px] bg-white/85 p-4 text-left shadow-sm"><MapPin className="h-5 w-5" /><p className="mt-3 font-body text-sm font-semibold">Venue & directions</p></button>
      </div>
    </section>
  );
}
