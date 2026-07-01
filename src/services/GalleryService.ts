import { BaseRepository } from "./repository/BaseRepository";
import { GalleryItem, GuestPhoto } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";
import { supabase } from "@/lib/supabase";

class GalleryDomainService extends BaseRepository<GalleryItem> {
  constructor() {
    super("gallery");
  }

  async getGuestPhotos(weddingId: string): Promise<GuestPhoto[]> {
    const { data } = await supabase
      .from("guest_photos")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });
    return (data || []) as GuestPhoto[];
  }

  async uploadGuestPhoto(weddingId: string, guestName: string, photoUrl: string): Promise<{ data: GuestPhoto | null; error: string | null }> {
    try {
      const payload = {
        wedding_id: weddingId,
        guest_name: guestName,
        photo_url: photoUrl,
        likes: 0,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from("guest_photos")
        .insert([payload])
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      
      await DomainEventBus.publish("PhotoUploaded", weddingId, `New guest photo uploaded by ${guestName}`, { photoUrl });
      return { data: data as GuestPhoto, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to upload photo" };
    }
  }
}

export const GalleryService = new GalleryDomainService();
