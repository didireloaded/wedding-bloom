import { BaseRepository } from "./repository/BaseRepository";
import { DomainEventBus } from "./events/DomainEventBus";

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

class GuestDomainService extends BaseRepository<Guest> {
  constructor() {
    super("guests");
  }

  async inviteGuest(weddingId: string, guest: Partial<Guest>): Promise<{ data: Guest | null; error: string | null }> {
    const res = await this.create({ ...guest, wedding_id: weddingId, status: "invited" });
    if (res.data) {
      await DomainEventBus.publish("GuestInvited", weddingId, `Invited guest ${res.data.name}`, { guestId: res.data.id });
    }
    return res;
  }
}

export const GuestService = new GuestDomainService();
