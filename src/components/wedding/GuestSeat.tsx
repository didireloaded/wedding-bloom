import { MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { GuestSeat as Seat } from "@/hooks/useGuestContext";

export default function GuestSeat({ seat }: { seat: Seat | null }) {
  if (!seat) return <section id="seat" className="mx-auto w-full max-w-2xl px-5 py-8"><p className="guest-kicker">Your place at the celebration</p><h2 className="mt-2 text-2xl font-semibold text-white">Seating details are being updated</h2><p className="mt-3 text-sm text-white/65">Please check back later or ask a host when you arrive.</p></section>;
  const planUrl = seat.plan_image_path ? supabase.storage.from("wedding-images").getPublicUrl(seat.plan_image_path).data.publicUrl : null;
  const markers = Array.isArray(seat.markers) ? seat.markers.filter((item) => item && typeof item.label === "string" && typeof item.x === "number" && item.x >= 0 && item.x <= 100 && typeof item.y === "number" && item.y >= 0 && item.y <= 100) : [];
  return <section id="seat" className="mx-auto w-full max-w-2xl px-5 py-7 md:py-10">
    <p className="guest-kicker">Your place at the celebration</p>
    <h2 className="mt-2 text-2xl font-semibold text-white">Find your table</h2>
    <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#b2dc6b] p-5 text-[#17210c]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black/10"><Users size={22} /></span><div><p className="text-xs font-medium opacity-70">Your table</p><p className="mt-1 break-words text-xl font-bold">{seat.table_name}</p></div></div>
    {planUrl ? <div className="mt-5"><p className="mb-3 text-sm text-white/65">Venue plan</p><div className="relative overflow-hidden rounded-2xl bg-[#242424]"><img src={planUrl} alt="Venue site plan showing your table" className="block h-auto w-full" />{seat.position_x !== null && seat.position_y !== null && <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff6245] px-3 py-2 text-xs font-bold text-black shadow-lg" style={{ left: `${seat.position_x}%`, top: `${seat.position_y}%` }}>{seat.table_name}</span>}{markers.map((marker) => <span key={marker.id} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-black shadow" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>{marker.label}</span>)}</div></div> : <p className="mt-5 flex items-center gap-2 text-sm text-white/65"><MapPin size={16} />The couple has not shared a venue plan. Ask a host to show you {seat.table_name}.</p>}
  </section>;
}
