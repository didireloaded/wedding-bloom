import { MemoryBookRepository } from "@/repositories";
import { GuestMoment } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";

class MemoryBookDomainService extends MemoryBookRepository {
  constructor() {
    super();
  }

  async addMoment(weddingId: string, guestName: string, message: string): Promise<{ data: GuestMoment | null; error: string | null }> {
    const res = await this.create({
      wedding_id: weddingId,
      guest_name: guestName,
      message,
      status: "approved"
    });
    if (res.data) {
      await DomainEventBus.publish("MomentCreated", weddingId, `Guest note added by ${guestName}`, { message });
    }
    return res;
  }

  async generateDigitalMemoryBook(weddingId: string): Promise<string> {
    await DomainEventBus.publish("MemoryBookGenerated", weddingId, "Digital keepsake memory book generated");
    return `${typeof window !== "undefined" ? window.location.origin : ""}/memory-book/${weddingId}`;
  }
}

export const MemoryBookService = new MemoryBookDomainService();
