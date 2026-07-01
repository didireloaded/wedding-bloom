import { BaseRepository } from "./repository/BaseRepository";
import { WeddingEvent, RunSheetItem } from "@/types/wedding";
import { supabase } from "@/lib/supabase";

class TimelineDomainService extends BaseRepository<WeddingEvent> {
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

export const TimelineService = new TimelineDomainService();
