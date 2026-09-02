import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches and caches wedding page data with a 5-minute stale time.
 * Wedding pages rarely change, so aggressive caching is safe.
 */
export const useWeddingData = (slug: string | undefined) => {
  const weddingQuery = useQuery({
    queryKey: ["wedding", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  });

  const weddingId = weddingQuery.data?.id;

  const eventsQuery = useQuery({
    queryKey: ["wedding-events", weddingId],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("sort_order");
      return data ?? [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const galleryQuery = useQuery({
    queryKey: ["wedding-gallery", weddingId],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const updatesQuery = useQuery({
    queryKey: ["wedding-updates", weddingId],
    queryFn: async () => {
      const { data } = await supabase
        .from("wedding_updates")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    wedding: weddingQuery.data ?? null,
    events: eventsQuery.data ?? [],
    gallery: galleryQuery.data ?? [],
    updates: updatesQuery.data ?? [],
    loading: weddingQuery.isLoading,
  };
};
