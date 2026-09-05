import { MapPin, Navigation, CalendarPlus } from "lucide-react";
import { generateICS } from "@/lib/calendarUtils";

interface VenueSectionProps {
  ceremonyVenue?: string;
  receptionVenue?: string;
  weddingDate?: string | null;
  ceremonyTime?: string | null;
  coupleNames?: string;
}

export default function VenueSection({ ceremonyVenue, receptionVenue, weddingDate, ceremonyTime, coupleNames }: VenueSectionProps) {
  const venues = [{ label: "Ceremony", name: ceremonyVenue }, { label: "Reception", name: receptionVenue }].filter(venue => venue.name);
  return <section className="wedding-section font-body">
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-semibold">Getting there</h2>
      {!venues.length && <p className="text-sm text-muted-foreground">Venue details will appear here when the couple shares them.</p>}
      <div className="space-y-4">{venues.map(venue => <article key={venue.label} className="rounded-3xl bg-white/85 p-5">
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{venue.label}</p>
        <h3 className="mt-2 break-words text-xl font-semibold">{venue.name}</h3>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name!)}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"><Navigation className="h-4 w-4" />Get directions</a>
      </article>)}</div>
      {weddingDate && <button onClick={() => generateICS(coupleNames || "", weddingDate, ceremonyTime || null, ceremonyVenue || "", window.location.href)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-black/15 px-5 py-3 text-sm font-semibold"><CalendarPlus className="h-4 w-4" />Save the date</button>}
    </div>
  </section>;
}
