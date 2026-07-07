import { GuestRepository } from "@/repositories";
import { DomainEventBus } from "./events/DomainEventBus";
import { guestInvitationSchema } from "@/validators";

export interface Guest {
  id?: string;
  wedding_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  group_name?: string | null;
  status?: string;
  created_at?: string;
}

class GuestDomainService extends GuestRepository {
  constructor() {
    super();
  }

  async inviteGuest(weddingId: string, guest: Partial<Guest>): Promise<{ data: Guest | null; error: string | null }> {
    try {
      guestInvitationSchema.parse({ ...guest, wedding_id: weddingId, status: guest.status || "invited" });
    } catch (err: any) {
      const msg = err?.issues?.[0]?.message || err?.errors?.[0]?.message || err.message || "Invalid guest data";
      return { data: null, error: msg };
    }

    const res = await this.create({ ...guest, wedding_id: weddingId, status: "invited" });
    if (res.data) {
      await DomainEventBus.publish("GuestInvited", weddingId, `Invited guest ${res.data.name}`, { guestId: res.data.id });
    }
    return res;
  }
}

export const GuestService = new GuestDomainService();
