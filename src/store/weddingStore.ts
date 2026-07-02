// @ts-nocheck
// ForeverVow — Supabase-backed data cache.
// No localStorage mock persistence, no seed data. Every read/write hits Supabase.
// The `store` API is kept only as a compatibility surface for legacy dashboards.
import { supabase } from "@/utils/supabase";
import * as Types from "@/types/wedding";

export type Wedding = Types.Wedding;
export type WeddingEvent = Types.WeddingEvent;
export type Accommodation = Types.Accommodation;
export type GalleryItem = Types.GalleryItem;
export type WeddingUpdate = Types.WeddingUpdate;
export type GuestPhoto = Types.GuestPhoto;
export type GuestMoment = Types.GuestMoment;
export type Checkin = Types.Checkin;
export type RSVP = Types.RSVP;

// Only real Supabase tables. Deprecated legacy names return empty arrays.
const REAL_TABLES = [
  "weddings", "events", "accommodations", "gallery", "guest_photos",
  "rsvps", "wedding_moments", "checkins", "wedding_updates",
  "guestbook", "vendors", "seating_tables", "seating_assignments",
  "themes", "wedding_analytics", "moment_reactions", "live_updates",
] as const;

const LEGACY_ALIAS: Record<string, string> = {
  updates: "wedding_updates",
  guest_moments: "wedding_moments",
  tables: "seating_tables",
};

type TableName = string;

const cache: Record<string, any[]> = {};
const listeners = new Map<string, Set<(row?: any, event?: string) => void>>();

function resolve(t: string) { return LEGACY_ALIAS[t] || t; }

function emit(table: string) {
  const subs = listeners.get(table);
  if (subs) subs.forEach(fn => { try { fn(); } catch {} });
}

let initialized = false;
async function initStore() {
  if (initialized) return;
  initialized = true;
  for (const t of REAL_TABLES) {
    const { data } = await supabase.from(t).select("*");
    cache[t] = data || [];
    // Emit under legacy aliases too
    emit(t);
    for (const [alias, real] of Object.entries(LEGACY_ALIAS)) if (real === t) emit(alias);
  }
}
initStore();

export const store = {
  subscribe(table: TableName, fn: (row?: any, event?: string) => void) {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table)!.add(fn);
    return () => { listeners.get(table)?.delete(fn); };
  },

  all<T = any>(table: TableName): T[] {
    const real = resolve(table);
    return (cache[real] || []) as T[];
  },

  find<T = any>(table: TableName, predicate: (row: T) => boolean): T | undefined {
    return (this.all<T>(table)).find(predicate);
  },

  where<T = any>(table: TableName, predicate: (row: T) => boolean): T[] {
    return (this.all<T>(table)).filter(predicate);
  },

  insert<T extends Record<string, any>>(table: TableName, row: T): T {
    const real = resolve(table);
    if (!REAL_TABLES.includes(real as any)) return row;
    const full = { ...row, id: row.id || crypto.randomUUID(), created_at: row.created_at || new Date().toISOString() };
    if (!cache[real]) cache[real] = [];
    cache[real].push(full);
    emit(real); emit(table);
    supabase.from(real).insert([full]).then(({ data, error }) => {
      if (error) { console.error(`insert ${real}:`, error.message); return; }
      if (data && data[0]) {
        const i = cache[real].findIndex(r => r.id === full.id);
        if (i >= 0) cache[real][i] = data[0];
        emit(real); emit(table);
      }
    });
    return full as T;
  },

  update<T = any>(table: TableName, id: string, patch: Partial<T>): T | undefined {
    const real = resolve(table);
    if (!REAL_TABLES.includes(real as any)) return undefined;
    const rows = cache[real] || [];
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx >= 0) { rows[idx] = { ...rows[idx], ...patch }; emit(real); emit(table); }
    supabase.from(real).update(patch).eq("id", id).then(({ error }) => {
      if (error) console.error(`update ${real}:`, error.message);
    });
    return rows[idx];
  },

  remove(table: TableName, id: string) {
    const real = resolve(table);
    if (!REAL_TABLES.includes(real as any)) return;
    const rows = cache[real] || [];
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx >= 0) { rows.splice(idx, 1); emit(real); emit(table); }
    supabase.from(real).delete().eq("id", id).then(({ error }) => {
      if (error) console.error(`remove ${real}:`, error.message);
    });
  },
};
