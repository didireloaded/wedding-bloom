import { BaseRepository } from "./repository/BaseRepository";
import { RSVP } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";
import { submitRSVPToBackend } from "@/lib/supabase";

class RSVPDomainService extends BaseRepository<RSVP> {
  constructor() {
    super("rsvps");
  }

  async submitRSVP(payload: Omit<RSVP, "id">): Promise<{ success: boolean; error?: string }> {
    const res = await submitRSVPToBackend(payload);
    if (res.success) {
      const isAttending = payload.attending === "confirmed" || payload.attending === "yes";
      const eventType = isAttending ? "GuestAccepted" : "GuestDeclined";
      await DomainEventBus.publish(
        eventType,
        payload.wedding_id,
        `RSVP submitted by ${payload.guest_name} (${isAttending ? "Attending" : "Declined"})`,
        { count: payload.guest_count, dietary: payload.dietary_preference }
      );
    }
    return res;
  }
}

export const RSVPService = new RSVPDomainService();
