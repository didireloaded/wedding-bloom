import { supabase } from "@/utils/supabase";
import { IntegrationGateway } from "../integrations/IntegrationGateway";

export type DomainEventType =
  | "WeddingCreated"
  | "WeddingPublished"
  | "WeddingDuplicated"
  | "WeddingArchived"
  | "WeddingDeleted"
  | "BroadcastSent"
  | "GuestInvited"
  | "GuestAccepted"
  | "GuestDeclined"
  | "GuestRSVPSubmitted"
  | "PhotoUploaded"
  | "GuestPhotoUploaded"
  | "AnnouncementPosted"
  | "MomentCreated"
  | "VenueUpdated"
  | "WeddingCompleted"
  | "MemoryBookGenerated";

export interface DomainEvent<P = any> {
  id: string;
  type: DomainEventType;
  weddingId: string;
  description: string;
  payload?: P;
  timestamp: string;
}

type EventListener<P = any> = (event: DomainEvent<P>) => void | Promise<void>;

class DomainEventBusService {
  private listeners = new Map<DomainEventType | "*", Set<EventListener>>();

  subscribe(type: DomainEventType | "*", callback: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  async publish<P = any>(type: DomainEventType, weddingId: string, description: string, payload?: P): Promise<DomainEvent<P>> {
    const event: DomainEvent<P> = {
      id: crypto.randomUUID(),
      type,
      weddingId,
      description,
      payload,
      timestamp: new Date().toISOString()
    };

    // 1. Notify listeners asynchronously
    this.listeners.get(type)?.forEach(cb => {
      try { cb(event); } catch (e) { console.error(`[DomainEventBus] Listener error on ${type}:`, e); }
    });
    this.listeners.get("*")?.forEach(cb => {
      try { cb(event); } catch (e) { console.error(`[DomainEventBus] Wildcard listener error:`, e); }
    });

    // 2. Automatically trigger third-party integrations or analytics based on core lifecycle events
    this.triggerLifecycleIntegrations(event);

    // 3. Persist audit trail in activity_log table
    try {
      if (weddingId) {
        await supabase.from("activity_log").insert([{
          id: event.id,
          wedding_id: weddingId,
          event_type: type,
          description,
          metadata: payload || {},
          created_at: event.timestamp
        }]);
      }
    } catch (err) {
      console.warn("[DomainEventBus] Audit log write failure:", err);
    }

    return event;
  }

  /**
   * Event-Driven Lifecycle Triggers: Automatically dispatches analytics, push notifications, and session tagging.
   */
  private triggerLifecycleIntegrations(event: DomainEvent): void {
    try {
      // Analytics tracking for all domain events
      IntegrationGateway.analytics.trackEvent(event.type, {
        wedding_id: event.weddingId,
        description: event.description,
        ...event.payload,
      });

      // Specific lifecycle integrations
      switch (event.type) {
        case "WeddingCreated":
        case "WeddingPublished":
          IntegrationGateway.sessionReplay.tagSession("wedding_status", event.type);
          break;
        case "GuestRSVPSubmitted":
        case "GuestAccepted":
        case "GuestDeclined":
          void IntegrationGateway.push.sendTopicPushNotification(
            `wedding_${event.weddingId}`,
            "New RSVP Update",
            event.description,
            event.payload
          );
          break;
        case "GuestPhotoUploaded":
        case "PhotoUploaded":
          void IntegrationGateway.push.sendTopicPushNotification(
            `wedding_${event.weddingId}_photos`,
            "New Photo Uploaded",
            event.description,
            event.payload
          );
          break;
        case "AnnouncementPosted":
          void IntegrationGateway.push.sendTopicPushNotification(
            `wedding_${event.weddingId}_all`,
            "Important Wedding Announcement",
            event.description,
            event.payload
          );
          break;
        case "MemoryBookGenerated":
          IntegrationGateway.monitoring.captureMessage(`Memory book generated for wedding ${event.weddingId}`, "info");
          break;
      }
    } catch (err) {
      console.warn("[DomainEventBus] Lifecycle integration trigger error:", err);
    }
  }
}

export const DomainEventBus = new DomainEventBusService();
