import type { WeddingPhase } from "@/lib/weddingPhase";

export type GuestState = "unknown_guest" | "invited" | "rsvp_pending" | "rsvp_confirmed" | "rsvp_declined" | "near_venue" | "checked_in";
export const resolveGuestExperience = (phase: WeddingPhase, guestState: GuestState, hasSeat = false) => {
  if (phase === "archive" || phase === "completed") return { tabs: ["home", "photos", "moments", "wall", "more"], primary: guestState === "rsvp_declined" ? "View memories" : "Share a memory" };
  if (guestState === "checked_in") return { tabs: ["home", "schedule", hasSeat ? "seat" : "venue", "capture", "more"], primary: hasSeat ? "Find my table" : "View schedule" };
  if (phase === "wedding_day" || phase === "live") return { tabs: ["home", "schedule", hasSeat ? "seat" : "directions", "checkin", "more"], primary: "Check in" };
  if (guestState === "rsvp_confirmed") return { tabs: ["home", "schedule", hasSeat ? "seat" : "venue", "photos", "more"], primary: hasSeat ? "Find my table" : "View schedule" };
  return { tabs: ["home", "schedule", "venue", "rsvp", "more"], primary: "RSVP" };
};
