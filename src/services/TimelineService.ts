import { TimelineRepository } from "@/repositories";
import { WeddingEvent, RunSheetItem } from "@/types/wedding";

class TimelineDomainService extends TimelineRepository {
  constructor() {
    super();
  }
}

export const TimelineService = new TimelineDomainService();
