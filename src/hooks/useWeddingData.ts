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
      } else if (slug === "amelia-daniel-2026" || slug === "preview" || slug === "demo") {
        // Showcase template preview data when exploring sample design
        setWedding({
          id: "preview-1",
          slug: slug,
          access_code: "FV2026",
          couple_names: siteContent.coupleNames || "Amelia & Daniel",
          wedding_date: siteContent.weddingDateISO.split("T")[0],
          ceremony_time: "16:00",
          ceremony_venue: siteContent.venue.defaultCeremonyVenue,
          venue_address: siteContent.venue.defaultVenueAddress,
          venue_map_url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80",
          cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
          hero_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
          story: "Our journey began years ago and has blossomed into an everlasting promise of love and adventure.",
          dress_code: "Black Tie Optional — Soft champagne & neutral florals",
          hashtag: "#AmeliaAndDaniel2026",
          published: true,
          legacy_mode: false,
          soundtrack_url: null,
          theme: { vibe: "Romantic & Elegant" },
          created_at: new Date().toISOString()
        });
        setEvents(siteContent.timeline.defaultEvents.map((t, i) => ({
          id: `ev-${i}`,
          wedding_id: "preview-1",
          title: t.title,
          description: t.description,
          location: t.location,
          event_date: siteContent.weddingDateISO.split("T")[0],
          event_time: t.event_time,
          sort_order: i
        })));
        setAccommodations([
          {
            id: "acc-1",
            wedding_id: "preview-1",
            name: "Relais de Chambord Grand Hotel",
            price: "From €280/night",
            distance: "On Estate Grounds (0.2 mi)",
            booking_url: "https://www.relaisdechambord.com",
            photo_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            phone: null
          }
        ]);
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  return { wedding, events, gallery, updates, accommodations, markers, loading };
}
