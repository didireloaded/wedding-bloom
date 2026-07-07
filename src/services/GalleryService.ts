import { GalleryRepository } from "@/repositories";
import { GalleryItem, GuestPhoto } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";

class GalleryDomainService extends GalleryRepository {
  constructor() {
    super();
  }

  async uploadGuestPhoto(weddingId: string, guestName: string, photoUrl: string): Promise<{ data: GuestPhoto | null; error: string | null }> {
    const payload = {
      wedding_id: weddingId,
      guest_name: guestName,
      photo_url: photoUrl,
      likes: 0,
      created_at: new Date().toISOString()
    };
    const res = await this.createGuestPhoto(payload);
    if (res.data) {
      await DomainEventBus.publish("PhotoUploaded", weddingId, `New guest photo uploaded by ${guestName}`, { photoUrl });
    }
    return res;
  }
}

export const GalleryService = new GalleryDomainService();
