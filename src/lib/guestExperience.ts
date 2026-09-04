import type { WeddingPhase } from "@/lib/weddingPhase";

export type GuestState = "unknown_guest" | "invited" | "rsvp_pending" | "rsvp_confirmed" | "rsvp_declined" | "near_venue" | "checked_in";
export const resolveGuestExperience = (phase: WeddingPhase, guestState: GuestState) => {
  if (phase === "archive" || phase === "completed") return { tabs: ["home", "photos", "moments", "wall", "more"], primary: guestState === "rsvp_declined" ? "View memories" : "Share a memory" };
  if (guestState === "checked_in") return { tabs: ["home", "schedule", "map", "capture", "wall"], primary: "Find my table" };
  if (phase === "wedding_day" || phase === "live") return { tabs: ["home", "schedule", "directions", "checkin", "more"], primary: "Check in" };
  return { tabs: ["home", "schedule", "venue", "rsvp", "more"], primary: guestState === "rsvp_confirmed" ? "View schedule" : "RSVP" };
};
