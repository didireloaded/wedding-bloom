import { RSVPRepository } from "@/repositories";
import { RSVP } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";
import { submitRSVPToBackend } from "@/lib/supabase";
import { rsvpSubmissionSchema } from "@/validators";

class RSVPDomainService extends RSVPRepository {
  constructor() {
    super();
  }

  async submitRSVP(payload: Omit<RSVP, "id">): Promise<{ success: boolean; error?: string }> {
    try {
      rsvpSubmissionSchema.parse(payload);
    } catch (err: any) {
      const msg = err?.issues?.[0]?.message || err?.errors?.[0]?.message || err.message || "Invalid RSVP data";
      return { success: false, error: msg };
    }

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
