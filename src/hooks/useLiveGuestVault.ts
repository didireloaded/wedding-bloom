import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import type { GuestPhoto, GuestMoment } from "@/types/wedding";

export function useLiveGuestVault(weddingId: string | undefined) {
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([]);
  const [moments, setMoments] = useState<GuestMoment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVaultData = useCallback(async () => {
    if (!weddingId) {
      setLoading(false);
      return;
    }

    try {
      const [photosRes, momentsRes] = await Promise.all([
        supabase.from("guest_photos").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }),
        supabase.from("guest_moments").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }),
      ]);

      if (photosRes.data) setGuestPhotos(photosRes.data as GuestPhoto[]);
      if (momentsRes.data) setMoments(momentsRes.data as GuestMoment[]);
    } catch (err) {
      console.warn(`[useLiveGuestVault] Error loading vault for ${weddingId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    fetchVaultData();

    if (!weddingId) return;

    const channelPhotos = supabase
      .channel(`public:guest_photos:${weddingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_photos", filter: `wedding_id=eq.${weddingId}` }, () => {
        fetchVaultData();
      })
      .subscribe();

    const channelMoments = supabase
      .channel(`public:guest_moments:${weddingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_moments", filter: `wedding_id=eq.${weddingId}` }, () => {
        fetchVaultData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelPhotos);
      supabase.removeChannel(channelMoments);
    };
  }, [weddingId, fetchVaultData]);

  return { guestPhotos, moments, loading, refresh: fetchVaultData };
}
