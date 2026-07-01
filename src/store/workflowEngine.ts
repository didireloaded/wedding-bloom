import { store } from "./weddingStore";
import { Wedding, RSVP } from "@/types/wedding";
import { differenceInDays } from "date-fns";

export function calculateWeddingStage(w: any) {
  if (!w) return { stageNum: 1, label: "Dream", percent: 15 };
  if (w.legacy_mode) return { stageNum: 6, label: "Memory Book", percent: 100 };
  const days = w.wedding_date ? differenceInDays(new Date(w.wedding_date), new Date()) : 30;
  if (days < 0) return { stageNum: 6, label: "Memory Book", percent: 100 };
  if (days <= 7) return { stageNum: 5, label: "Live Week", percent: 85 };
  if (w.published) return { stageNum: 4, label: "RSVPs", percent: 65 };
  if (w.ceremony_venue) return { stageNum: 3, label: "Published", percent: 45 };
  return { stageNum: 2, label: "Planning", percent: 30 };
}

export type WorkflowEventType =
  | "WeddingCreated"
  | "WeddingPublished"
  | "GuestInvited"
  | "GuestRSVPSubmitted"
  | "PhotoUploaded"
  | "WeddingCompleted";

export interface WorkflowEvent {
  type: WorkflowEventType;
  weddingId: string;
  payload?: any;
  timestamp: string;
}

type EventCallback = (event: WorkflowEvent) => void;

class WorkflowBus {
  private subscribers: Map<WorkflowEventType | "*", Set<EventCallback>> = new Map();

  subscribe(type: WorkflowEventType | "*", callback: EventCallback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback);
    return () => {
      this.subscribers.get(type)?.delete(callback);
    };
  }

  publish(type: WorkflowEventType, weddingId: string, payload?: any) {
    const event: WorkflowEvent = {
      type,
      weddingId,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.subscribers.get(type)?.forEach((cb) => {
      try { cb(event); } catch (e) { console.error("Workflow callback error:", e); }
    });
    this.subscribers.get("*")?.forEach((cb) => {
      try { cb(event); } catch (e) { console.error("Workflow callback error:", e); }
    });
  }
}

export const workflowBus = new WorkflowBus();

export interface Milestone {
  id: string;
  label: string;
  description: string;
  isCompleted: (w: Wedding, rsvps: RSVP[]) => boolean;
}

export const MILESTONES: Milestone[] = [
  {
    id: "setup",
    label: "Celebration Configured",
    description: "Basic wedding venue and schedule setup.",
    isCompleted: (w) => !!w && !!w.ceremony_venue,
  },
  {
    id: "published",
    label: "Invitation Live",
    description: "Published to public guest portal link.",
    isCompleted: (w) => !!w && w.published,
  },
  {
    id: "rsvps",
    label: "RSVPs Received",
    description: "At least one guest has submitted RSVP.",
    isCompleted: (_, rsvps) => rsvps && rsvps.length > 0,
  },
];
