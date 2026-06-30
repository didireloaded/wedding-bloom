import { useEffect, useState } from "react";
import { store, type Wedding, type WeddingEvent, type GalleryItem, type WeddingUpdate, type Accommodation, type VenueMarker } from "@/store/weddingStore";

/**
 * Drop-in equivalent of the original repo's useWeddingData hook.
 * Reads from localStorage-backed store and subscribes to realtime-like updates.
 */
export function useWeddingData(slug: string | undefined) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [updates, setUpdates] = useState<WeddingUpdate[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [markers, setMarkers] = useState<VenueMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    const w = store.find<Wedding>("weddings", (r) => r.slug === slug && r.published);
    setWedding(w ?? null);
    if (w) {
      setEvents(store.where<WeddingEvent>("events", (r) => r.wedding_id === w.id).sort((a, b) => a.sort_order - b.sort_order));
      setGallery(store.where<GalleryItem>("gallery", (r) => r.wedding_id === w.id));
      setUpdates(store.where<WeddingUpdate>("updates", (r) => r.wedding_id === w.id));
      setAccommodations(store.where<Accommodation>("accommodations", (r) => r.wedding_id === w.id));
      setMarkers(store.where<VenueMarker>("venue_markers", (r) => r.wedding_id === w.id));
    }
    setLoading(false);

    const off1 = store.subscribe("events", () => {
      if (w) setEvents(store.where<WeddingEvent>("events", (r) => r.wedding_id === w.id).sort((a, b) => a.sort_order - b.sort_order));
    });
    const off2 = store.subscribe("gallery", () => {
      if (w) setGallery(store.where<GalleryItem>("gallery", (r) => r.wedding_id === w.id));
    });
    const off3 = store.subscribe("updates", () => {
      if (w) setUpdates(store.where<WeddingUpdate>("updates", (r) => r.wedding_id === w.id));
    });
    const off4 = store.subscribe("weddings", (row: Wedding, ev) => {
      if (ev === "UPDATE" && row.slug === slug) setWedding(row);
    });

    return () => { off1(); off2(); off3(); off4(); };
  }, [slug]);

  return { wedding, events, gallery, updates, accommodations, markers, loading };
}
