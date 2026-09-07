import { CalendarDays, Camera, CheckCircle, Home, Map, MapPin, MoreHorizontal, Images, MessageCircle, Heart } from "lucide-react";

const icons: Record<string, any> = { home: Home, schedule: CalendarDays, venue: MapPin, rsvp: Heart, more: MoreHorizontal, directions: MapPin, checkin: CheckCircle, map: Map, capture: Camera, wall: MessageCircle, photos: Images, moments: Heart };
export default function GuestBottomNav({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return <nav className="guest-bottom-nav" aria-label="Guest navigation">{tabs.map((tab) => { const Icon = icons[tab] || Home; return <button key={tab} onClick={() => onChange(tab)} aria-current={active === tab ? "page" : undefined}><span><Icon className="h-5 w-5" /></span><small>{tab}</small></button>; })}</nav>;
}
