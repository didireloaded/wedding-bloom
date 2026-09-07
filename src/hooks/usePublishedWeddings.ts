import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublishedWedding = {
  id: string;
  slug: string;
  couple_names: string;
  wedding_date: string | null;
  ceremony_venue: string | null;
  cover_image: string | null;
};

export function featuredWeddingForWeek(weddings: PublishedWedding[], now = new Date()) {
  if (!weddings.length) return null;
  const week = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 604800000);
  return weddings[week % weddings.length];
}

export function usePublishedWeddings() {
  return useQuery({
    queryKey: ["published-wedding-showcase"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weddings")
        .select("id, slug, couple_names, wedding_date, ceremony_venue, cover_image")
        .eq("published", true)
        .order("wedding_date", { ascending: false });
      if (error) throw error;
      return (data || []) as PublishedWedding[];
    },
  });
}
