// ForeverVow Workflow & Progress Engine
import { store, Wedding, RSVP } from "./weddingStore";
import { toast } from "sonner";

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

    // Notify exact type subscribers
    this.subscribers.get(type)?.forEach((cb) => {
      try { cb(event); } catch (e) { console.error("Workflow callback error:", e); }
    });
    // Notify wildcard subscribers
    this.subscribers.get("*")?.forEach((cb) => {
      try { cb(event); } catch (e) { console.error("Workflow callback error:", e); }
    });

    // Automated reactive behavior (Emotional & Helpful feedback)
    this.handleAutomatedReactions(event);
  }

  private handleAutomatedReactions(event: WorkflowEvent) {
    switch (event.type) {
      case "WeddingPublished":
        toast.success("Your wedding website is now live.", {
          description: "Your guests can begin celebrating with you.",
        });
        break;
      case "GuestRSVPSubmitted": {
        const guestName = event.payload?.guest_name || "A guest";
        const attending = event.payload?.attending;
        if (attending === "confirmed") {
          toast.success(`${guestName} can't wait to celebrate with you!`, {
            description: "RSVP confirmed.",
          });
        } else if (attending === "declined") {
          toast.info(`${guestName} sent their warmest wishes.`, {
            description: "RSVP declined.",
          });
        }
        break;
      }
      case "PhotoUploaded":
        toast.success("New memory added to your gallery.", {
          description: "Your collection is growing beautifully.",
        });
        break;
      case "WeddingCompleted":
        toast.success("Your wedding day has become part of your ForeverVow Memory Book.", {
          description: "Explore your timeless keepsake.",
        });
        break;
    }
  }
}

export const workflowBus = new WorkflowBus();

export interface WeddingStageInfo {
  stageNumber: number; // 1 to 6
  stageName: string;
  progressPercent: number;
  recommendation: string;
  actionLabel: string;
  isLegacyMode: boolean;
  lifecycleMode: "dream" | "planning" | "invitations" | "preparation" | "wedding_week" | "live_wedding" | "memory_book";
}

export function calculateWeddingStage(wedding: Wedding): WeddingStageInfo {
  if (!wedding) {
    return {
      stageNumber: 1,
      stageName: "Dream & Vision",
      progressPercent: 15,
      recommendation: "Welcome to ForeverVow Studio. Begin by personalizing your love story and design vision.",
      actionLabel: "Complete Profile",
      isLegacyMode: false,
      lifecycleMode: "dream",
    };
  }

  if (wedding.legacy_mode) {
    return {
      stageNumber: 6,
      stageName: "Married ❤️ — Memory Book",
      progressPercent: 100,
      recommendation: "Your wedding was unforgettable. Relive every cherished moment in your ForeverVow Memory Book.",
      actionLabel: "Explore Keepsake",
      isLegacyMode: true,
      lifecycleMode: "memory_book",
    };
  }

  const hasDetails = !!wedding.couple_names && !!wedding.wedding_date && !!wedding.story;
  const isPublished = wedding.published;
  
  const rsvps = store.where<RSVP>("rsvps", (r) => r.wedding_id === wedding.id);
  const confirmedCount = rsvps.filter((r) => r.attending === "confirmed").length;

  let daysRemaining: number | null = null;
  if (wedding.wedding_date) {
    const target = new Date(wedding.wedding_date + "T16:00:00").getTime();
    daysRemaining = Math.floor((target - Date.now()) / (1000 * 60 * 60 * 24));
  }

  if (daysRemaining !== null && daysRemaining < 0) {
    return {
      stageNumber: 6,
      stageName: "Married ❤️ — Memory Book",
      progressPercent: 100,
      recommendation: "Congratulations! Explore your digital Memory Book to curate guest snapshots and wishes.",
      actionLabel: "Explore Memory Book",
      isLegacyMode: false,
      lifecycleMode: "memory_book",
    };
  }

  if (daysRemaining !== null && daysRemaining === 0) {
    return {
      stageNumber: 5,
      stageName: "Live Wedding Day ✨",
      progressPercent: 95,
      recommendation: "Your celebration is happening today! Monitor live guest snapshots and timeline events.",
      actionLabel: "Open Live Mode",
      isLegacyMode: false,
      lifecycleMode: "live_wedding",
    };
  }

  if (daysRemaining !== null && daysRemaining <= 7 && isPublished) {
    return {
      stageNumber: 5,
      stageName: "Wedding Week",
      progressPercent: 88,
      recommendation: "Your celebration week has arrived! Review vendor run sheets and double-check guest check-ins.",
      actionLabel: "Review Run Sheet",
      isLegacyMode: false,
      lifecycleMode: "wedding_week",
    };
  }

  if (daysRemaining !== null && daysRemaining <= 30 && isPublished) {
    return {
      stageNumber: 4,
      stageName: "Final Preparation",
      progressPercent: 78,
      recommendation: `Only ${daysRemaining} days away. Lock in table seating arrangements and finalize vendor logistics.`,
      actionLabel: "Manage Seating & Tasks",
      isLegacyMode: false,
      lifecycleMode: "preparation",
    };
  }

  if (confirmedCount > 0 || rsvps.length > 0) {
    return {
      stageNumber: 4,
      stageName: "Invitations & RSVPs",
      progressPercent: 65,
      recommendation: `Guests are replying (${confirmedCount} confirmed). Review dietary notes and track headcount.`,
      actionLabel: "Manage RSVPs",
      isLegacyMode: false,
      lifecycleMode: "invitations",
    };
  }

  if (isPublished) {
    return {
      stageNumber: 3,
      stageName: "Invitation Published",
      progressPercent: 45,
      recommendation: "Your wedding site is live! Share your digital invitation link or QR code with invited guests.",
      actionLabel: "Share Invitation",
      isLegacyMode: false,
      lifecycleMode: "planning",
    };
  }

  if (hasDetails) {
    return {
      stageNumber: 2,
      stageName: "Planning Details",
      progressPercent: 30,
      recommendation: "Your core details look stunning. Preview your guest portal and publish when ready.",
      actionLabel: "Preview & Publish",
      isLegacyMode: false,
      lifecycleMode: "planning",
    };
  }

  return {
    stageNumber: 1,
    stageName: "Dream & Vision",
    progressPercent: 15,
    recommendation: "Start building your dream celebration by adding your wedding date, venue setting, and story.",
    actionLabel: "Edit Studio Details",
    isLegacyMode: false,
    lifecycleMode: "dream",
  };
}
