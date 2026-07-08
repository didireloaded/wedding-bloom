import { useEffect, useState, useRef } from "react";
import { WeddingService } from "@/services";
import type { Wedding, WeddingEvent, GalleryItem, WeddingUpdate, Accommodation } from "@/types/wedding";

/**
 * Pure service read hook for the public guest wedding page.
 * Includes timeout protection and error handling to guarantee loading state terminates.
 */
export function useWeddingData(slug: string | undefined) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [updates, setUpdates] = useState<WeddingUpdate[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  loadingRef.current = loading;

  useEffect(() => {
    let cancelled = false;

    const safetyTimer = setTimeout(() => {
      if (!cancelled && loadingRef.current) {
        console.warn(`[useWeddingData] Loading timed out for slug: ${slug}`);
        setLoading(false);
        loadingRef.current = false;
      }
    }, 3500);

    async function run() {
      if (!slug) { setLoading(false); loadingRef.current = false; return; }
      setLoading(true);
      loadingRef.current = true;
      
      try {
        // Race the payload fetch against a 3s timeout
        const res = await Promise.race([
          WeddingService.getPublicWeddingPayload(slug),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
        ]);

        if (cancelled) return;

        if (res) {
          setWedding(res.wedding);
          setEvents(res.events);
          setGallery(res.gallery);
          setUpdates(res.updates);
          setAccommodations(res.accommodations);
        } else {
          setWedding(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn(`[useWeddingData] Error loading wedding ${slug}:`, err);
          setWedding(null);
        }
      } finally {
        if (!cancelled) {
          setMarkers([]);
          setLoading(false);
          loadingRef.current = false;
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [slug]);

  return { wedding, events, gallery, updates, accommodations, markers, loading };
}
