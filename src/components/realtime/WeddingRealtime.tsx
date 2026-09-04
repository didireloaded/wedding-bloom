import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type RealtimeEvent = { event: string; payload: unknown };
type EventHandler = (payload: RealtimeEvent) => void;

const useLatest = (handler: EventHandler) => {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  }, [handler]);
  return ref;
};

function BroadcastRealtime({
  channelName,
  events,
  onEvent,
  privateChannel,
}: {
  channelName: string;
  events: readonly string[];
  onEvent: EventHandler;
  privateChannel: boolean;
}) {
  const handlerRef = useLatest(onEvent);
  const eventKey = events.join("|");

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    const subscribe = async () => {
      if (privateChannel) {
        try {
          await supabase.realtime.setAuth();
        } catch (error) {
          console.warn("Unable to refresh realtime authorization", error);
        }
      }

      if (cancelled) return;

      channel = supabase.channel(channelName, {
        config: {
          ...(privateChannel ? { private: true } : {}),
          broadcast: { self: false, ack: true },
        },
      });

      events.forEach((event) => {
        channel?.on("broadcast", { event }, (payload) => handlerRef.current(payload as RealtimeEvent));
      });

      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`Realtime channel ${channelName} ${status.toLowerCase()}`);
        }
      });
    };

    void subscribe();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [channelName, eventKey, events, handlerRef, privateChannel]);

  return null;
}

const coupleEvents = ["INSERT", "UPDATE", "DELETE"] as const;
const guestEvents = [
  "live_update_created",
  "live_update_changed",
  "guestbook_entry_created",
  "guestbook_entry_changed",
  "guest_photo_created",
  "guest_photo_changed",
] as const;

export function WeddingRealtime({ weddingId, onEvent }: { weddingId: string; onEvent: EventHandler }) {
  if (!weddingId || weddingId === "preview-wedding") return null;
  return <BroadcastRealtime channelName={`wedding:${weddingId}`} events={coupleEvents} onEvent={onEvent} privateChannel />;
}

export function GuestWeddingRealtime({ weddingId, onEvent }: { weddingId: string; onEvent: EventHandler }) {
  if (!weddingId) return null;
  return <BroadcastRealtime channelName={`wedding:${weddingId}:guests`} events={guestEvents} onEvent={onEvent} privateChannel={false} />;
}
