import { VenueMarkerRepository, AccommodationRepository, WeddingRepository } from "@/repositories";
import { VenueMarker, Accommodation } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";

class VenueDomainService extends VenueMarkerRepository {
  private accommodationRepo = new AccommodationRepository();
  private weddingRepo = new WeddingRepository();

  constructor() {
    super();
  }

  async getAccommodations(weddingId: string): Promise<Accommodation[]> {
    const res = await this.accommodationRepo.findByWeddingId(weddingId);
    return res.data || [];
  }

  async updateVenueDetails(weddingId: string, details: { ceremony_venue?: string; venue_address?: string }): Promise<{ success: boolean }> {
    const res = await this.weddingRepo.update(weddingId, details);
    if (!res.error) {
      await DomainEventBus.publish("VenueUpdated", weddingId, `Venue updated to ${details.ceremony_venue || details.venue_address}`);
    }
    return { success: !res.error };
  }
}

export const VenueService = new VenueDomainService();
