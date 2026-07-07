// ForeverVow — Supabase-backed data store with lazy loading & error recovery.
// Replaces the old "load everything on import" approach.
import { supabase } from "@/utils/supabase";
import type {
  Wedding, WeddingEvent, Accommodation, GalleryItem, WeddingUpdate,
  GuestPhoto, GuestMoment, Checkin, RSVP, BudgetItem, VendorItem,
  MoodItem, GiftItem, TaskItem, TableItem, RunSheetItem, BroadcastItem,
  VenueMarker, CoupleProfile, Venue, VenueMap, GuestUpload, GuestbookEntry,
  MemoryItem, AnalyticsRecord, ThemeConfig, TemplateItem, QRCodeItem, InvitationLink,
} from "@/types/wedding";

// ── Re-export all types for consumers ──
export type {
  Wedding, WeddingEvent, Accommodation, GalleryItem, WeddingUpdate,
  GuestPhoto, GuestMoment, Checkin, RSVP, BudgetItem, VendorItem,
  MoodItem, GiftItem, TaskItem, TableItem, RunSheetItem, BroadcastItem,
  VenueMarker, CoupleProfile, Venue, VenueMap, GuestUpload, GuestbookEntry,
  MemoryItem, AnalyticsRecord, ThemeConfig, TemplateItem, QRCodeItem, InvitationLink,
};

// ── Table configuration ──
const REAL_TABLES = [
  "weddings", "events", "accommodations", "gallery", "guest_photos",
  "rsvps", "wedding_moments", "checkins", "wedding_updates",
  "guestbook", "vendors", "seating_tables", "seating_assignments",
  "themes", "wedding_analytics", "moment_reactions", "live_updates",
  "budgets", "mood_items", "gifts", "tasks", "tables", "run_sheet",
  "broadcasts", "venue_markers", "notifications", "couples", "venues",
  "venue_maps", "guest_uploads", "memories", "analytics", "templates",
  "qr_codes", "invitation_links",
] as const;

type RealTable = (typeof REAL_TABLES)[number];

const LEGACY_ALIAS: Record<string, string> = {
  updates: "wedding_updates",
  guest_moments: "wedding_moments",
  wedding_analytics: "analytics",
};

// ── Internal state ──
const cache: Record<string, Record<string, unknown>[]> = {};
const listeners = new Map<string, Set<() => void>>();
let pendingEmit = false;
const pendingTables = new Set<string>();

function resolve(t: string): string {
  return LEGACY_ALIAS[t] || t;
}

function isRealTable(t: string): boolean {
  return (REAL_TABLES as readonly string[]).includes(t);
}

// ── Debounced emit — batches rapid-fire notifications ──
function emit(table: string): void {
  pendingTables.add(table);
  if (!pendingEmit) {
    pendingEmit = true;
    queueMicrotask(() => {
      pendingEmit = false;
      const tables = [...pendingTables];
      pendingTables.clear();
      for (const t of tables) {
        const subs = listeners.get(t);
        if (subs) subs.forEach(fn => { try { fn(); } catch { /* listener error */ } });
      }
    });
  }
}

// ── Retry helper for Supabase writes ──
async function withRetry<T>(
  operation: () => PromiseLike<{ error: { message: string } | null; [key: string]: unknown }>,
  maxRetries = 2
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      if (!result.error) return { success: true };
      if (attempt === maxRetries) return { success: false, error: result.error.message };
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
    } catch (err) {
      if (attempt === maxRetries) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
      await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  return { success: false, error: "Max retries exceeded" };
}

// ── Lazy loading per wedding ──
const loadedWeddings = new Set<string>();

async function loadTablesForWedding(weddingId: string): Promise<void> {
  if (loadedWeddings.has(weddingId)) return;

  const weddingTables = [
    "events", "accommodations", "gallery", "guest_photos",
    "rsvps", "wedding_moments", "checkins", "wedding_updates",
    "vendors", "budgets", "mood_items", "gifts", "tasks",
    "tables", "run_sheet", "broadcasts", "venue_markers", "notifications",
    "couples", "venues", "venue_maps", "guest_uploads", "guestbook",
    "memories", "analytics", "qr_codes", "invitation_links",
  ];

  const results = await Promise.allSettled(
    weddingTables.map(async (t) => {
      const { data } = await supabase.from(t).select("*").eq("wedding_id", weddingId);
      if (!cache[t]) cache[t] = [];
      if (data) {
        // Merge results — remove existing entries for this wedding, add fresh
        cache[t] = [
          ...cache[t].filter((row: Record<string, unknown>) => row.wedding_id !== weddingId),
          ...(data as Record<string, unknown>[]),
        ];
      }
      emit(t);
    })
  );

  // Log any failures
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn(`[Store] Failed to load ${weddingTables[i]}:`, r.reason);
    }
  });

  loadedWeddings.add(weddingId);
}

async function loadWeddingsTable(): Promise<void> {
  if (cache.weddings?.length) return; // Already loaded
  const { data } = await supabase.from("weddings").select("*");
  cache.weddings = (data as Record<string, unknown>[] | null) ?? [];
  emit("weddings");
}

// ── Public API ──
export const store = {
  /** Load all data for a specific wedding. Safe to call multiple times. */
  async loadForWedding(weddingId: string): Promise<void> {
    await loadWeddingsTable();
    await loadTablesForWedding(weddingId);
  },

  /** Load just the weddings list (for admin dashboard). */
  async loadWeddings(): Promise<void> {
    await loadWeddingsTable();
  },

  /** Force reload for a specific wedding (invalidates cache). */
  async reloadForWedding(weddingId: string): Promise<void> {
    loadedWeddings.delete(weddingId);
    await loadTablesForWedding(weddingId);
  },

  subscribe(table: string, fn: () => void): () => void {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table)!.add(fn);
    return () => { listeners.get(table)?.delete(fn); };
  },

  all<T = Record<string, unknown>>(table: string): T[] {
    const real = resolve(table);
    return (cache[real] || []) as T[];
  },

  find<T = Record<string, unknown>>(table: string, predicate: (row: T) => boolean): T | undefined {
    return (this.all<T>(table)).find(predicate);
  },

  where<T = Record<string, unknown>>(table: string, predicate: (row: T) => boolean): T[] {
    return (this.all<T>(table)).filter(predicate);
  },

  insert<T extends Record<string, unknown>>(table: string, row: T): T & { id: string; created_at?: string } {
    const real = resolve(table);
    if (!isRealTable(real)) return row as T & { id: string; created_at?: string };
    const full = {
      ...row,
      id: (row.id as string) || crypto.randomUUID(),
      created_at: (row.created_at as string) || new Date().toISOString(),
    } as T & { id: string; created_at?: string };

    if (!cache[real]) cache[real] = [];
    cache[real].push(full as Record<string, unknown>);
    emit(real);
    emit(table);

    withRetry(() => (supabase.from(real) as any).insert([full])).then(({ success, error }) => {
      if (!success) {
        console.error(`[Store] insert ${real} failed after retries:`, error);
        // Rollback from cache
        const idx = cache[real].findIndex((r) => (r as Record<string, unknown>).id === (full as Record<string, unknown>).id);
        if (idx >= 0) { cache[real].splice(idx, 1); emit(real); emit(table); }
      }
    });

    return full;
  },

  update<T extends Record<string, unknown>>(table: string, id: string, patch: Partial<T>): T | undefined {
    const real = resolve(table);
    if (!isRealTable(real)) return undefined;
    const rows = cache[real] || [];
    const idx = rows.findIndex((r) => r.id === id);
    const original = idx >= 0 ? { ...rows[idx] } : null;

    if (idx >= 0) {
      rows[idx] = { ...rows[idx], ...patch };
      emit(real);
      emit(table);
    }

    withRetry(() => (supabase.from(real) as any).update(patch).eq("id", id)).then(({ success, error }) => {
      if (!success && original && idx >= 0) {
        console.error(`[Store] update ${real} failed after retries:`, error);
        rows[idx] = original;
        emit(real);
        emit(table);
      }
    });

    return rows[idx] as T | undefined;
  },

  remove(table: string, id: string): void {
    const real = resolve(table);
    if (!isRealTable(real)) return;
    const rows = cache[real] || [];
    const idx = rows.findIndex((r) => r.id === id);
    const removed = idx >= 0 ? rows[idx] : null;

    if (idx >= 0) {
      rows.splice(idx, 1);
      emit(real);
      emit(table);
    }

    withRetry(() => (supabase.from(real) as any).delete().eq("id", id)).then(({ success, error }) => {
      if (!success && removed) {
        console.error(`[Store] remove ${real} failed after retries:`, error);
        if (!cache[real]) cache[real] = [];
        cache[real].push(removed);
        emit(real);
        emit(table);
      }
    });
  },
};
