import { useEffect, useState } from "react";
import { WeddingService } from "@/services";
import type { Wedding, WeddingEvent, GalleryItem, WeddingUpdate, Accommodation } from "@/types/wedding";

/**
 * Pure service read hook for the public guest wedding page.
 * No localStorage / no mock fallback — delegates to WeddingService repository layer.
 */
export function useWeddingData(slug: string | undefined) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [updates, setUpdates] = useState<WeddingUpdate[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!slug) { setLoading(false); return; }
      setLoading(true);
      
      const res = await WeddingService.getPublicWeddingPayload(slug);
      if (cancelled) return;

      setWedding(res.wedding);
      setEvents(res.events);
      setGallery(res.gallery);
      setUpdates(res.updates);
      setAccommodations(res.accommodations);
      setMarkers([]);
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [slug]);

  return { wedding, events, gallery, updates, accommodations, markers, loading };
}
