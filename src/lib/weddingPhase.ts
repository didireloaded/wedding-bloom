export type WeddingPhase = "draft" | "upcoming" | "rsvp_closing" | "wedding_day" | "live" | "completed" | "archive";

export const getWeddingPhase = (wedding: any, events: any[] = [], now = new Date()): WeddingPhase => {
  if (!wedding?.published) return "draft";
  if (!wedding.wedding_date) return "upcoming";
  const start = new Date(wedding.wedding_date);
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - today.getTime()) / 86400000);
  if (days > 0) return days <= 3 ? "rsvp_closing" : "upcoming";
  if (days === 0) {
    const lastEvent = events.reduce((latest, event) => {
      const match = String(event.event_time || "").match(/(\d{1,2}):(\d{2})/);
      if (!match) return latest;
      const hour = Number(match[1]) + (String(event.event_time).toLowerCase().includes("pm") && Number(match[1]) < 12 ? 12 : 0);
      return Math.max(latest, hour * 60 + Number(match[2]));
    }, 23 * 60 + 59);
    const minutes = now.getHours() * 60 + now.getMinutes();
    return wedding.live_mode || minutes <= lastEvent ? (wedding.live_mode ? "live" : "wedding_day") : "completed";
  }
  return days >= -7 ? "completed" : "archive";
};

export const getGuestState = ({ rsvp, checkedIn = false, nearVenue = false }: { rsvp?: any; checkedIn?: boolean; nearVenue?: boolean }) => {
  if (checkedIn) return "checked_in";
  if (nearVenue) return "near_venue";
  if (!rsvp) return "unknown_guest";
  if (rsvp.attending === true) return "rsvp_confirmed";
  if (rsvp.attending === false) return "rsvp_declined";
  return "rsvp_pending";
};
