// ForeverVow Supabase Data Layer
// Production cloud database layer with live Supabase database operations.
import { supabase } from "@/utils/supabase";
import * as Types from "@/types/wedding";
import { siteContent } from "@/config/siteContent";

export type Wedding = Types.Wedding;
export type WeddingEvent = Types.WeddingEvent;
export type Accommodation = Types.Accommodation;
export type VenueMarker = Types.VenueMarker;
export type GalleryItem = Types.GalleryItem;
export type WeddingUpdate = Types.WeddingUpdate;
export type GuestPhoto = Types.GuestPhoto;
export type GuestMoment = Types.GuestMoment;
export type Checkin = Types.Checkin;
export type RSVP = Types.RSVP;
export type BudgetItem = Types.BudgetItem;
export type VendorItem = Types.VendorItem;
export type MoodItem = Types.MoodItem;
export type GiftItem = Types.GiftItem;
export type TaskItem = Types.TaskItem;
export type TableItem = Types.TableItem;
export type RunSheetItem = Types.RunSheetItem;
export type BroadcastItem = Types.BroadcastItem;

export type TableName =
  | "weddings"
  | "events"
  | "accommodations"
  | "venue_markers"
  | "gallery"
  | "guest_photos"
  | "rsvps"
  | "guest_moments"
  | "checkins"
  | "updates"
  | "tasks"
  | "tables"
  | "run_sheet"
  | "broadcasts"
  | "budgets"
  | "vendors"
  | "mood_items"
  | "gifts";

type Listener = (row?: any, event?: string) => void;

const TABLES: TableName[] = [
  "weddings",
  "events",
  "accommodations",
  "venue_markers",
  "gallery",
  "guest_photos",
  "rsvps",
  "guest_moments",
  "checkins",
  "updates",
  "tasks",
  "tables",
  "run_sheet",
  "broadcasts",
  "budgets",
  "vendors",
  "mood_items",
  "gifts"
];

const defaultPreviewWeddings: any[] = [
  {
    id: "preview-1",
    slug: "amelia-daniel-2026",
    access_code: "FV2026",
    couple_names: siteContent.coupleNames || "Amelia & Daniel",
    wedding_date: siteContent.weddingDateISO.split("T")[0],
    ceremony_time: "16:00",
    ceremony_venue: siteContent.venue.defaultCeremonyVenue,
    venue_address: siteContent.venue.defaultVenueAddress,
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    hero_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    story: "Our journey began years ago and has blossomed into an everlasting promise of love and adventure.",
    dress_code: "Black Tie Optional — Soft champagne & neutral florals",
    hashtag: "#ForeverVow2026",
    published: true,
    legacy_mode: false,
    theme: { vibe: "Romantic & Elegant" },
    created_at: new Date().toISOString(),
  }
];

const defaultPreviewEvents: any[] = siteContent.timeline.defaultEvents.map((ev, idx) => ({
  id: ev.id || `ev-${idx}`,
  wedding_id: "preview-1",
  title: ev.title,
  description: ev.description,
  location: ev.location,
  event_date: ev.event_date,
  event_time: ev.event_time,
  sort_order: idx + 1
}));

const cache: Record<string, any[]> = {};
TABLES.forEach(t => { cache[t] = []; });
cache["weddings"] = [...defaultPreviewWeddings];
cache["events"] = [...defaultPreviewEvents];

const listeners = new Map<TableName, Set<Listener>>();

function emit(table: TableName, row: any, event: "INSERT" | "UPDATE" | "DELETE") {
  const subs = listeners.get(table);
  if (!subs) return;
  subs.forEach((fn) => {
    try { fn(row, event); } catch {}
  });
}

// Initial fetch from Supabase
let initialized = false;
async function initStore() {
  if (initialized) return;
  initialized = true;
  for (const t of TABLES) {
    supabase.from(t).select("*").then(({ data }) => {
      if (data && data.length > 0) {
        if (t === "weddings") {
          const existingIds = new Set(data.map((r: any) => r.id));
          cache[t] = [...data, ...defaultPreviewWeddings.filter(pw => !existingIds.has(pw.id))];
        } else if (t === "events") {
          const existingIds = new Set(data.map((r: any) => r.id));
          cache[t] = [...data, ...defaultPreviewEvents.filter(pe => !existingIds.has(pe.id))];
        } else {
          cache[t] = data;
        }
        emit(t, null, "UPDATE");
      }
    }).catch(() => {});
  }
}
initStore();

export const store = {
  subscribe(table: TableName, fn: Listener) {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table)!.add(fn);
    return () => { listeners.get(table)?.delete(fn); };
  },

  all<T = any>(table: TableName): T[] {
    return (cache[table] || []) as T[];
  },

  find<T = any>(table: TableName, predicate: (row: T) => boolean): T | undefined {
    return (cache[table] || []).find(predicate);
  },

  where<T = any>(table: TableName, predicate: (row: T) => boolean): T[] {
    return (cache[table] || []).filter(predicate);
  },

  insert<T extends Record<string, any>>(table: TableName, row: T): T {
    const full = { ...row, id: row.id || crypto.randomUUID(), created_at: new Date().toISOString() };
    if (!cache[table]) cache[table] = [];
    cache[table].push(full);
    emit(table, full, "INSERT");
    // Async insert to Supabase
    supabase.from(table).insert([full]).then(({ error }) => {
      if (error) console.error(`Supabase insert error on ${table}:`, error.message);
    }).catch(() => {});
    return full as T;
  },

  update<T = any>(table: TableName, id: string, patch: Partial<T>): T | undefined {
    const rows = cache[table] || [];
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx < 0) return undefined;
    rows[idx] = { ...rows[idx], ...patch };
    emit(table, rows[idx], "UPDATE");
    // Async update to Supabase
    supabase.from(table).update(patch).eq("id", id).then(({ error }) => {
      if (error) console.error(`Supabase update error on ${table}:`, error.message);
    }).catch(() => {});
    return rows[idx];
  },

  remove(table: TableName, id: string) {
    const rows = cache[table] || [];
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx >= 0) {
      const [removed] = rows.splice(idx, 1);
      emit(table, removed, "DELETE");
      // Async delete from Supabase
      supabase.from(table).delete().eq("id", id).then(({ error }) => {
        if (error) console.error(`Supabase remove error on ${table}:`, error.message);
      }).catch(() => {});
    }
  },

  refreshSession() {
    location.reload();
  },

  isAdmin(email: string, password: string) {
    return email === "admin@forevervow.app" && password === "vows2026";
  },
};
