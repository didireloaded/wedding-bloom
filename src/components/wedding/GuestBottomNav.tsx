import { CalendarDays, Camera, CheckCircle, Home, Map, MapPin, MoreHorizontal, Images, MessageCircle, Heart } from "lucide-react";

const icons: Record<string, any> = { home: Home, schedule: CalendarDays, venue: MapPin, rsvp: Heart, more: MoreHorizontal, directions: MapPin, checkin: CheckCircle, map: Map, capture: Camera, wall: MessageCircle, photos: Images, moments: Heart };
export default function GuestBottomNav({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-[430px] -translate-x-1/2 items-center justify-between rounded-[24px] border border-white/70 bg-white/85 p-2 shadow-2xl backdrop-blur-xl">{tabs.map((tab) => { const Icon = icons[tab] || Home; return <button key={tab} onClick={() => onChange(tab)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 ${active === tab ? "bg-[#202020] text-white" : "text-foreground"}`}><Icon className="h-4 w-4" /><span className="font-body text-[9px] capitalize">{tab}</span></button>; })}</nav>;
}
