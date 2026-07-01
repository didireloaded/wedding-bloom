import { BaseRepository } from "./repository/BaseRepository";
import { VenueMarker, Accommodation } from "@/types/wedding";
import { supabase } from "@/lib/supabase";
import { DomainEventBus } from "./events/DomainEventBus";

class VenueDomainService extends BaseRepository<VenueMarker> {
  constructor() {
    super("venue_markers");
  }

  async getAccommodations(weddingId: string): Promise<Accommodation[]> {
    const { data } = await supabase
      .from("accommodations")
      .select("*")
      .eq("wedding_id", weddingId);
    return (data || []) as Accommodation[];
  }

  async updateVenueDetails(weddingId: string, details: { ceremony_venue?: string; venue_address?: string }): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from("weddings")
      .update(details)
      .eq("id", weddingId);
    if (!error) {
      await DomainEventBus.publish("VenueUpdated", weddingId, `Venue updated to ${details.ceremony_venue || details.venue_address}`);
    }
    return { success: !error };
  }
}

export const VenueService = new VenueDomainService();
