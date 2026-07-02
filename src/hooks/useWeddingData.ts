import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import type { Wedding, WeddingEvent, GalleryItem, WeddingUpdate, Accommodation } from "@/types/wedding";

/**
 * Pure Supabase read hook for the public guest wedding page.
 * No localStorage / no mock fallback — a missing slug returns wedding=null.
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
      const { data: wData } = await supabase
        .from("weddings").select("*").eq("slug", slug).maybeSingle();
      if (cancelled) return;
      if (!wData) { setWedding(null); setLoading(false); return; }
      setWedding(wData as Wedding);

      const [ev, gal, upd, acc] = await Promise.all([
        supabase.from("events").select("*").eq("wedding_id", wData.id).order("sort_order"),
        supabase.from("gallery").select("*").eq("wedding_id", wData.id),
        supabase.from("wedding_updates").select("*").eq("wedding_id", wData.id).order("created_at", { ascending: false }),
        supabase.from("accommodations").select("*").eq("wedding_id", wData.id),
      ]);
      if (cancelled) return;
      setEvents((ev.data || []) as WeddingEvent[]);
      setGallery((gal.data || []) as GalleryItem[]);
      setUpdates((upd.data || []) as WeddingUpdate[]);
      setAccommodations((acc.data || []) as Accommodation[]);
      setMarkers([]);
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [slug]);

  return { wedding, events, gallery, updates, accommodations, markers, loading };
}
