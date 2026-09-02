import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ShareMomentForm from "./ShareMomentForm";
import MomentCard from "./MomentCard";

interface LiveFeedProps {
  weddingId: string;
  coupleNames?: string;
  isLiveMode?: boolean;
}

const PAGE_SIZE = 20;

const LiveFeed = ({ weddingId, coupleNames, isLiveMode }: LiveFeedProps) => {
  const [moments, setMoments] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [newMomentCount, setNewMomentCount] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const atTopRef = useRef(true);
  const [newMomentIds, setNewMomentIds] = useState<Set<string>>(new Set());

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const feedTopRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pendingMoments = useRef<any[]>([]);

  const fetchMoments = useCallback(async (offset: number) => {
    const { data } = await supabase
      .from("wedding_moments")
      .select("*")
      .eq("wedding_id", weddingId)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    return data ?? [];
  }, [weddingId]);

  const fetchReactions = useCallback(async (momentIds: string[]) => {
    if (momentIds.length === 0) return {};
    const { data } = await supabase
      .from("moment_reactions")
      .select("moment_id, reaction_type")
      .in("moment_id", momentIds);
    const counts: Record<string, { heart: number; applause: number }> = {};
    (data ?? []).forEach((r: any) => {
      if (!counts[r.moment_id]) counts[r.moment_id] = { heart: 0, applause: 0 };
      if (r.reaction_type === "heart") counts[r.moment_id].heart++;
      else if (r.reaction_type === "applause") counts[r.moment_id].applause++;
    });
    return counts;
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    // Get total count
    const { count } = await supabase
      .from("wedding_moments")
      .select("*", { count: "exact", head: true })
      .eq("wedding_id", weddingId)
      .eq("approved", true);
    setTotalCount(count ?? 0);

    const data = await fetchMoments(0);
    const reactions = await fetchReactions(data.map((m: any) => m.id));
    const enriched = data.map((m: any) => ({ ...m, reaction_counts: reactions[m.id] || { heart: 0, applause: 0 } }));
    setMoments(enriched);
    offsetRef.current = data.length;
    setHasMore(data.length === PAGE_SIZE);
    setLoading(false);
  }, [weddingId, fetchMoments, fetchReactions]);

  const loadMore = useCallback(async () => {
    const data = await fetchMoments(offsetRef.current);
    const reactions = await fetchReactions(data.map((m: any) => m.id));
    const enriched = data.map((m: any) => ({ ...m, reaction_counts: reactions[m.id] || { heart: 0, applause: 0 } }));
    setMoments((prev) => [...prev, ...enriched]);
    offsetRef.current += data.length;
    setHasMore(data.length === PAGE_SIZE);
  }, [fetchMoments, fetchReactions]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Track feed top visibility
  useEffect(() => {
    if (!feedTopRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        setAtTop(visible);
        atTopRef.current = visible;
        if (visible) {
          // Flush pending moments
          if (pendingMoments.current.length > 0) {
            setMoments((prev) => [...pendingMoments.current, ...prev]);
            pendingMoments.current = [];
          }
          setNewMomentCount(0);
        }
      },
      { threshold: 0 }
    );
    observer.observe(feedTopRef.current);
    return () => observer.disconnect();
  }, []);

  // Realtime: new moments
  useEffect(() => {
    const channel = supabase
      .channel(`live-feed-${weddingId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "wedding_moments",
        filter: `wedding_id=eq.${weddingId}`,
      }, (payload) => {
        const newMoment = payload.new as any;
        if (!newMoment.approved) return;

        const enriched = { ...newMoment, reaction_counts: { heart: 0, applause: 0 } };
        setTotalCount((c) => c + 1);

        // Track as new for ring flash
        setNewMomentIds((prev) => new Set(prev).add(newMoment.id));
        setTimeout(() => {
          setNewMomentIds((prev) => {
            const next = new Set(prev);
            next.delete(newMoment.id);
            return next;
          });
        }, 2500);

        if (atTopRef.current) {
          setMoments((prev) => {
            if (prev.some((m) => m.id === newMoment.id)) return prev;
            return [enriched, ...prev];
          });
        } else {
          pendingMoments.current = [enriched, ...pendingMoments.current];
          setNewMomentCount((c) => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [weddingId]);

  // Realtime: reactions
  useEffect(() => {
    const channel = supabase
      .channel(`reactions-${weddingId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "moment_reactions",
      }, (payload) => {
        const r = payload.new as any;
        setMoments((prev) =>
          prev.map((m) =>
            m.id === r.moment_id
              ? {
                  ...m,
                  reaction_counts: {
                    ...m.reaction_counts,
                    [r.reaction_type]: (m.reaction_counts?.[r.reaction_type] ?? 0) + 1,
                  },
                }
              : m
          )
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [weddingId]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleNewMoment = (moment: any) => {
    const enriched = { ...moment, reaction_counts: { heart: 0, applause: 0 } };
    setMoments((prev) => [enriched, ...prev]);
    setTotalCount((c) => c + 1);
  };

  const handleScrollToTop = () => {
    feedTopRef.current?.scrollIntoView({ behavior: "smooth" });
    setMoments((prev) => [...pendingMoments.current, ...prev]);
    pendingMoments.current = [];
    setNewMomentCount(0);
  };

  // Derived data
  const topMoments = moments.filter((m) => m.highlighted).slice(0, 3);

  const guestCounts = moments.reduce((acc, m) => {
    acc[m.guest_name] = (acc[m.guest_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topGuests = Object.entries(guestCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);
  const showLeaderboard = topGuests.length >= 2 && moments.length >= 3;

  return (
    <section
      id="live-feed"
      className={`wedding-section ${isLiveMode ? "bg-foreground text-primary-foreground" : "bg-background"}`}
    >
      {/* New moments sticky banner */}
      <AnimatePresence>
        {newMomentCount > 0 && !atTop && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={handleScrollToTop}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 bg-foreground text-background shadow-lg font-body text-[10px] tracking-[0.2em] uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-wedding-gold animate-pulse" />
            {newMomentCount} new moment{newMomentCount > 1 ? "s" : ""} — Tap to view
          </motion.button>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {isLiveMode && (
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-destructive/10 border border-destructive/20">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-body text-[9px] tracking-[0.3em] uppercase text-destructive">
                Live Now
              </span>
            </div>
          )}
          <p className="wedding-label mb-4">WEDDING MOMENTS</p>
          {isLiveMode ? (
            <motion.h2
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="wedding-heading"
            >
              Wedding Moments
            </motion.h2>
          ) : (
            <h2 className="wedding-heading">Share This Day</h2>
          )}
          <p className={`font-body text-sm mt-4 max-w-md mx-auto ${isLiveMode ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            Post a photo or message — everyone here can see it instantly.
          </p>
        </div>

        {/* Celebration counter */}
        {totalCount > 0 && (
          <motion.p
            key={totalCount}
            initial={{ scale: 1.05, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center font-display text-2xl sm:text-3xl font-light italic mb-8 ${isLiveMode ? "text-primary-foreground/50" : "text-muted-foreground"}`}
          >
            {totalCount} moment{totalCount !== 1 ? "s" : ""} shared from this celebration
          </motion.p>
        )}

        {/* Form */}
        <ShareMomentForm
          weddingId={weddingId}
          isLiveMode={isLiveMode}
          onPosted={handleNewMoment}
        />

        {/* Top Moments */}
        {topMoments.length > 0 && (
          <div className="mt-10 mb-8">
            <p className="wedding-label mb-4">✦ TOP MOMENTS</p>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
              {topMoments.map((moment) => (
                <div
                  key={moment.id}
                  className="shrink-0 w-64 sm:w-auto border border-wedding-gold/30 bg-wedding-champagne/20 p-4"
                >
                  {moment.photo_url && (
                    <img src={moment.photo_url} className="w-full h-32 object-cover mb-3" loading="lazy" alt="" />
                  )}
                  {moment.message && (
                    <p className="font-body text-xs leading-relaxed line-clamp-3">{moment.message}</p>
                  )}
                  <p className="font-body text-[9px] tracking-widest uppercase text-muted-foreground mt-2">
                    {moment.guest_name}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border/30 mt-8" />
          </div>
        )}

        {/* Feed */}
        <div className="mt-10 space-y-4">
          <div ref={feedTopRef} />
          <AnimatePresence initial={false}>
            {moments.map((moment) => (
              <MomentCard key={moment.id} moment={moment} isNew={newMomentIds.has(moment.id)} />
            ))}
          </AnimatePresence>

          {hasMore && !loading && (
            <div ref={loadMoreRef} className="py-8 text-center">
              <div className="w-5 h-5 border border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && moments.length === 0 && (
            <div className="py-16 text-center border border-dashed border-border">
              <p className="font-display text-xl font-light text-muted-foreground italic">
                Be the first to share a moment
              </p>
            </div>
          )}
        </div>

        {/* Most Active Guests */}
        {showLeaderboard && (
          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="wedding-label mb-6 text-center">MOST ACTIVE GUESTS</p>
            <div className="flex flex-wrap justify-center gap-4">
              {topGuests.map(([name, count], i) => (
                <div key={name} className={`flex items-center gap-3 px-4 py-3 border border-border/50 ${isLiveMode ? "bg-foreground" : "bg-background"}`}>
                  <span className="font-display text-lg font-light text-wedding-gold">{i + 1}</span>
                  <div>
                    <p className="font-body text-sm">{name}</p>
                    <p className={`font-body text-[10px] tracking-wide ${isLiveMode ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      {count as number} moment{(count as number) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveFeed;
