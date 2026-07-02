import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { store } from "@/store/weddingStore";
import type { Wedding, WeddingEvent, GalleryItem, WeddingUpdate, Accommodation, VenueMarker } from "@/types/wedding";
import { siteContent } from "@/config/siteContent";

/**
 * Supabase-backed useWeddingData hook for guest flow.
 * Reads directly from public Supabase tables or gracefully provides preview/fallback data.
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
    async function fetchData() {
      if (!slug) { setLoading(false); return; }
      setLoading(true);

      let wData = store.find("weddings", (w: any) => w.slug === slug);
      if (!wData) {
        const { data } = await supabase
          .from("weddings")
          .select("*")
          .eq("slug", slug)
          .single();
        if (data) wData = data;
      }

      if (wData) {
        setWedding(wData as Wedding);
        const [evRes, galRes, updRes, accRes, mrkRes] = await Promise.all([
          supabase.from("events").select("*").eq("wedding_id", wData.id).order("sort_order"),
          supabase.from("gallery").select("*").eq("wedding_id", wData.id),
          supabase.from("updates").select("*").eq("wedding_id", wData.id),
          supabase.from("accommodations").select("*").eq("wedding_id", wData.id),
          supabase.from("venue_markers").select("*").eq("wedding_id", wData.id),
        ]);
        setEvents((evRes.data && evRes.data.length > 0 ? evRes.data : store.where("events", (e: any) => e.wedding_id === wData.id)) as WeddingEvent[]);
        setGallery((galRes.data || []) as GalleryItem[]);
        setUpdates((updRes.data || []) as WeddingUpdate[]);
        setAccommodations((accRes.data || []) as Accommodation[]);
        setMarkers((mrkRes.data || []) as VenueMarker[]);
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  return { wedding, events, gallery, updates, accommodations, markers, loading };
}
