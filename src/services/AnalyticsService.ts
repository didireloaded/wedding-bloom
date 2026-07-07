import { supabase } from "@/lib/supabase";

export interface AnalyticsSummary {
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  photoUploads: number;
  guestbookEntries: number;
  qrScans: number;
  pageViews: number;
}

class AnalyticsDomainService {
  async getWeddingAnalytics(weddingId: string): Promise<AnalyticsSummary> {
    try {
      const [rsvpsRes, photosRes, momentsRes, qrRes, viewsRes] = await Promise.all([
        supabase.from("rsvps").select("attending, guest_count").eq("wedding_id", weddingId),
        supabase.from("guest_photos").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId),
        supabase.from("guest_moments").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId),
        supabase.from("analytics").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).eq("event_type", "qr_scan"),
        supabase.from("analytics").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).eq("event_type", "page_view"),
      ]);

      const rsvps = rsvpsRes.data || [];
      let confirmedGuests = 0;
      let pendingGuests = 0;
      let declinedGuests = 0;

      rsvps.forEach((r: Record<string, unknown>) => {
        const count = Number(r.guest_count) || 1;
        const att = String(r.attending || "");
        if (att === "confirmed" || att === "yes") confirmedGuests += count;
        else if (att === "declined" || att === "no") declinedGuests += count;
        else pendingGuests += count;
      });

      return {
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        photoUploads: photosRes.count || 0,
        guestbookEntries: momentsRes.count || 0,
        qrScans: qrRes.count || 0,
        pageViews: viewsRes.count || 0,
      };
    } catch (err) {
      console.error("Error fetching analytics:", err);
      return { confirmedGuests: 0, pendingGuests: 0, declinedGuests: 0, photoUploads: 0, guestbookEntries: 0, qrScans: 0, pageViews: 0 };
    }
  }

  async logPageView(weddingId: string, path: string = typeof window !== "undefined" ? window.location.pathname : ""): Promise<void> {
    try {
      await supabase.from("analytics").insert([{
        wedding_id: weddingId,
        event_type: "page_view",
        path,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("Failed to log page view:", err);
    }
  }

  async logQRScan(weddingId: string, label: string = "General QR"): Promise<void> {
    try {
      await supabase.from("analytics").insert([{
        wedding_id: weddingId,
        event_type: "qr_scan",
        metadata: { label },
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("Failed to log QR scan:", err);
    }
  }

  /**
   * Tracks user conversion funnels (invitation open rates, RSVP completion funnels, QR scans, gallery views)
   * with PostHog / GA4 event emission fallbacks.
   */
  async trackConversionFunnel(
    weddingId: string,
    step: "invitation_opened" | "rsvp_started" | "rsvp_completed" | "qr_scanned" | "gallery_viewed",
    metadata?: Record<string, any>
  ): Promise<void> {
    const payload = {
      wedding_id: weddingId,
      event_type: step,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };
    try {
      // Emit to console / GA4 / PostHog simulation
      console.info(`[Analytics Funnel] Step: ${step}`, payload);
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture(step, payload);
      }
      await supabase.from("analytics").insert([payload]);
    } catch (err) {
      console.warn(`Failed to track funnel step (${step}):`, err);
    }
  }
}

export const AnalyticsService = new AnalyticsDomainService();
