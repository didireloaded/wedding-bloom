import { supabase } from "@/lib/supabase";

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
  | "PhotoUploaded"
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

    // 2. Persist audit trail in activity_log table
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
}

export const DomainEventBus = new DomainEventBusService();
