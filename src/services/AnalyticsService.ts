import { supabase } from "@/lib/supabase";

export interface AnalyticsSummary {
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  photoUploads: number;
  guestbookEntries: number;
  qrScans: number;
}

class AnalyticsDomainService {
  async getWeddingAnalytics(weddingId: string): Promise<AnalyticsSummary> {
    try {
      const [rsvpsRes, photosRes, momentsRes] = await Promise.all([
        supabase.from("rsvps").select("attending, guest_count").eq("wedding_id", weddingId),
        supabase.from("guest_photos").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId),
        supabase.from("guest_moments").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId),
      ]);

      const rsvps = rsvpsRes.data || [];
      let confirmedGuests = 0;
      let pendingGuests = 0;
      let declinedGuests = 0;

      rsvps.forEach((r: any) => {
        const count = r.guest_count || 1;
        if (r.attending === "confirmed" || r.attending === "yes") confirmedGuests += count;
        else if (r.attending === "declined" || r.attending === "no") declinedGuests += count;
        else pendingGuests += count;
      });

      const qrKey = `wb_qr_${weddingId}`;
      const qrScans = Number(localStorage.getItem(qrKey) || 0);

      return {
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        photoUploads: photosRes.count || 0,
        guestbookEntries: momentsRes.count || 0,
        qrScans
      };
    } catch (err) {
      return { confirmedGuests: 0, pendingGuests: 0, declinedGuests: 0, photoUploads: 0, guestbookEntries: 0, qrScans: 0 };
    }
  }
}

export const AnalyticsService = new AnalyticsDomainService();
