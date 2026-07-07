import { BaseRepository } from "./BaseRepository";
import { supabase } from "@/utils/supabase";
import type {
  Wedding, WeddingEvent, GalleryItem, WeddingUpdate, Accommodation,
  RSVP, GuestPhoto, GuestMoment, RunSheetItem, VenueMarker,
  TaskItem, BudgetItem, QRCodeItem, InvitationLink, CoupleProfile, ThemeConfig, TemplateItem, MoodItem, BroadcastItem
} from "@/types/wedding";

export class WeddingRepository extends BaseRepository<Wedding> {
  constructor() {
    super("weddings");
  }

  async findBySlug(slug: string): Promise<{ data: Wedding | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data as Wedding | null, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to query wedding by slug" };
    }
  }

  async findByAccessCode(accessCode: string): Promise<{ data: Wedding | null; error: string | null }> {
    try {
      const normalized = accessCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("access_code", normalized)
        .maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data as Wedding | null, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to query wedding by access code" };
    }
  }
}

export class EventRepository extends BaseRepository<WeddingEvent> {
  constructor() {
    super("events");
  }

  async findByWeddingIdOrdered(weddingId: string): Promise<WeddingEvent[]> {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("sort_order");
    return (data || []) as WeddingEvent[];
  }
}

export class GalleryRepository extends BaseRepository<GalleryItem> {
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

  async getApprovedGuestPhotos(weddingId: string): Promise<GuestPhoto[]> {
    const photos = await this.getGuestPhotos(weddingId);
    return photos.filter(p => p.status !== "rejected");
  }

  async updatePhotoStatus(photoId: string, status: "approved" | "pending" | "rejected" | "pinned"): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from("guest_photos")
        .update({ status })
        .eq("id", photoId);
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err?.message || "Failed to update photo status" };
    }
  }

  async promoteGuestPhotoToGallery(weddingId: string, photo: GuestPhoto): Promise<{ data: GalleryItem | null; error: string | null }> {
    try {
      // Create new gallery item in curated portfolio
      const galleryPayload = {
        wedding_id: weddingId,
        url: photo.photo_url,
        caption: `Photo by ${photo.guest_name}`,
        promoted_from_guest_photo_id: photo.id,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from("gallery")
        .insert([galleryPayload])
        .select()
        .single();
      if (error) return { data: null, error: error.message };

      // Mark original photo as promoted
      await supabase
        .from("guest_photos")
        .update({ is_promoted: true, status: "approved" })
        .eq("id", photo.id);

      return { data: data as GalleryItem, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to promote photo" };
    }
  }

  async createGuestPhoto(payload: Omit<GuestPhoto, "id">): Promise<{ data: GuestPhoto | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("guest_photos")
        .insert([payload])
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as GuestPhoto, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to upload photo" };
    }
  }
}

export class UpdateRepository extends BaseRepository<WeddingUpdate> {
  constructor() {
    super("wedding_updates");
  }

  async findByWeddingIdOrdered(weddingId: string): Promise<WeddingUpdate[]> {
    const { data } = await supabase
      .from("wedding_updates")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });
    return (data || []) as WeddingUpdate[];
  }
}

export class AccommodationRepository extends BaseRepository<Accommodation> {
  constructor() {
    super("accommodations");
  }

  async findNearbyHotels(weddingId: string, maxMiles?: number): Promise<{ data: Accommodation[]; error: string | null }> {
    const res = await this.findByWeddingId(weddingId);
    if (res.error || !maxMiles) return res;
    const filtered = res.data.filter((a) => {
      if (!a.distance) return true;
      const num = parseFloat(a.distance);
      return isNaN(num) || num <= maxMiles;
    });
    return { data: filtered, error: null };
  }
}

export class RSVPRepository extends BaseRepository<RSVP> {
  constructor() {
    super("rsvps");
  }
}

export class GuestRepository extends BaseRepository<any> {
  constructor() {
    super("guests");
  }
}

export class VenueMarkerRepository extends BaseRepository<VenueMarker> {
  constructor() {
    super("venue_markers");
  }

  async findByCategory(weddingId: string, category: string): Promise<{ data: VenueMarker[]; error: string | null }> {
    const res = await this.findByWeddingId(weddingId);
    if (res.error) return res;
    const filtered = res.data.filter((m) => (m.category || "General").toLowerCase() === category.toLowerCase());
    return { data: filtered, error: null };
  }
}

export class TimelineRepository extends BaseRepository<WeddingEvent> {
  constructor() {
    super("events");
  }

  async getRunSheet(weddingId: string): Promise<RunSheetItem[]> {
    const { data } = await supabase
      .from("run_sheet")
      .select("*")
      .eq("wedding_id", weddingId);
    return (data || []) as RunSheetItem[];
  }
}

export class NotificationRepository extends BaseRepository<any> {
  constructor() {
    super("notifications");
  }

  async getUnreadCount(weddingId: string): Promise<number> {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", weddingId)
      .eq("read", false);
    return count || 0;
  }
}

export class MemoryBookRepository extends BaseRepository<GuestMoment> {
  constructor() {
    super("guest_moments");
  }
}

export class TaskRepository extends BaseRepository<TaskItem> {
  constructor() {
    super("tasks");
  }
}

export class BudgetRepository extends BaseRepository<BudgetItem> {
  constructor() {
    super("budgets");
  }
}

export class QRCodeRepository extends BaseRepository<QRCodeItem> {
  constructor() {
    super("qr_codes");
  }
}

export class InvitationLinkRepository extends BaseRepository<InvitationLink> {
  constructor() {
    super("invitation_links");
  }
}

export class CoupleRepository extends BaseRepository<CoupleProfile> {
  constructor() {
    super("couples");
  }
}

export class ThemeRepository extends BaseRepository<ThemeConfig> {
  constructor() {
    super("themes");
  }
}

export class TemplateRepository extends BaseRepository<TemplateItem> {
  constructor() {
    super("templates");
  }
}

export class MoodRepository extends BaseRepository<MoodItem> {
  constructor() {
    super("mood_items");
  }
}

export class RunSheetRepository extends BaseRepository<RunSheetItem> {
  constructor() {
    super("run_sheet");
  }
}

export class BroadcastRepository extends BaseRepository<BroadcastItem> {
  constructor() {
    super("broadcasts");
  }
}

export class AuditLogRepository extends BaseRepository<any> {
  constructor() {
    super("audit_log");
  }
}

export class FeatureFlagRepository extends BaseRepository<any> {
  constructor() {
    super("feature_flags");
  }
}

export class CheckinRepository extends BaseRepository<any> {
  constructor() {
    super("checkins");
  }
}

export class VenueRepository extends BaseRepository<any> {
  constructor() {
    super("venues");
  }
}

export class VenueMapRepository extends BaseRepository<any> {
  constructor() {
    super("venue_maps");
  }
}

export class GuestbookRepository extends BaseRepository<any> {
  constructor() {
    super("guestbook");
  }
}

export class MemoryRepository extends BaseRepository<any> {
  constructor() {
    super("memories");
  }
}

