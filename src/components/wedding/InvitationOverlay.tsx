import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

interface InvitationOverlayProps {
  coupleNames: string;
  date: string;
  venue?: string | null;
  coverImage?: string | null;
  onOpen: () => void;
}

export default function InvitationOverlay({ coupleNames, date, venue, coverImage, onOpen }: InvitationOverlayProps) {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(onOpen, 650);
  };

  return <AnimatePresence>
    <motion.div className="guest-invite" initial={{ opacity: 0 }} animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.035 : 1, filter: opening ? "blur(10px)" : "blur(0px)" }} transition={{ duration: opening ? .65 : .35 }}>
      {coverImage && <div className="guest-invite-media"><img className="guest-invite-backdrop" src={coverImage} alt="" aria-hidden="true" /><img className="guest-invite-photo" src={coverImage} alt={`${coupleNames} together`} /></div>}
      <div className="guest-invite-shade" />
      <div className="guest-invite-top"><strong>ForeverVow</strong><span>Wedding invitation</span></div>
      <motion.section initial={{ y: 24, opacity: 0 }} animate={{ y: opening ? -35 : 0, opacity: opening ? 0 : 1 }} transition={{ delay: opening ? 0 : .15, duration: .5 }}>
        <p>You are invited</p>
        <h1>{coupleNames}</h1>
        <div className="guest-invite-details">
          <span><CalendarDays size={17} />{date || "Date to be confirmed"}</span>
          <span><MapPin size={17} />{venue || "Venue to be confirmed"}</span>
        </div>
        <button onClick={open} disabled={opening}><span>{opening ? "Opening..." : "Open invitation"}</span><ArrowUpRight size={20} /></button>
      </motion.section>
      <div className="guest-invite-accent"><span>{coupleNames.split("&").map((name) => name.trim().charAt(0)).join(" + ")}</span></div>
    </motion.div>
  </AnimatePresence>;
}
