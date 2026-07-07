import { supabase } from "@/lib/supabase";
import { DomainEventBus } from "./events/DomainEventBus";

export interface WeddingArchivePackage {
  wedding: any;
  rsvps: any[];
  events: any[];
  accommodations: any[];
  gallery: any[];
  guest_photos: any[];
  guest_moments: any[];
  exportedAt: string;
}

class DataGovernanceDomainService {
  async exportWeddingArchive(weddingId: string): Promise<{ data: WeddingArchivePackage | null; error: string | null }> {
    try {
      const [wRes, rRes, eRes, aRes, gRes, gpRes, gmRes] = await Promise.all([
        supabase.from("weddings").select("*").eq("id", weddingId).single(),
        supabase.from("rsvps").select("*").eq("wedding_id", weddingId),
        supabase.from("events").select("*").eq("wedding_id", weddingId),
        supabase.from("accommodations").select("*").eq("wedding_id", weddingId),
        supabase.from("gallery").select("*").eq("wedding_id", weddingId),
        supabase.from("guest_photos").select("*").eq("wedding_id", weddingId),
        supabase.from("guest_moments").select("*").eq("wedding_id", weddingId)
      ]);

      if (wRes.error) return { data: null, error: wRes.error.message };

      const pkg: WeddingArchivePackage = {
        wedding: wRes.data,
        rsvps: rRes.data || [],
        events: eRes.data || [],
        accommodations: aRes.data || [],
        gallery: gRes.data || [],
        guest_photos: gpRes.data || [],
        guest_moments: gmRes.data || [],
        exportedAt: new Date().toISOString()
      };

      const recordCount = pkg.rsvps.length + pkg.events.length + pkg.gallery.length + pkg.guest_photos.length + pkg.guest_moments.length;
      
      try {
        await supabase.from("data_exports").insert([{
          wedding_id: weddingId,
          export_type: "full_archive",
          status: "completed",
          record_count: recordCount,
          created_at: pkg.exportedAt
        }]);
      } catch (err) {
        console.warn("[DataGovernance] Export tracking write failed:", err);
      }

      await DomainEventBus.publish("MemoryBookGenerated", weddingId, `Generated full data archive package (${recordCount} records)`);

      return { data: pkg, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to generate wedding export archive" };
    }
  }

  async retentionPurgeWedding(weddingId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Due to ON DELETE CASCADE on foreign keys, deleting the core wedding record purges all child records cleanly.
      const { error } = await supabase.from("weddings").delete().eq("id", weddingId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to execute account retention purge" };
    }
  }
}

export const DataGovernanceService = new DataGovernanceDomainService();
