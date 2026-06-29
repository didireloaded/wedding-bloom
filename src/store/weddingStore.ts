// ForeverVow Store Schema
// Updated for multi-portal mobile app architecture with Venue Maps, Accommodations, and Legacy Mode.

export type Wedding = {
  id: string;
  slug: string;
  access_code: string;
  couple_names: string;
  wedding_date: string | null;
  ceremony_time: string | null;
  ceremony_venue: string | null;
  venue_address: string | null;
  venue_map_url: string | null;
  cover_image: string | null;
  hero_image: string | null;
  story: string | null;
  dress_code: string | null;
  hashtag: string | null;
  published: boolean;
  legacy_mode: boolean;
  soundtrack_url: string | null;
  theme: Record<string, string>;
  created_at: string;
};

export type WeddingEvent = {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_time: string | null;
  sort_order: number;
};

export type Accommodation = {
  id: string;
  wedding_id: string;
  name: string;
  photo_url: string | null;
  price: string | null;
  phone: string | null;
  distance: string | null;
  booking_url: string | null;
};

export type VenueMarker = {
  id: string;
  wedding_id: string;
  title: string;
  category: string;
  icon: string;
  description: string | null;
  x: number; // Percentage X
  y: number; // Percentage Y
};

export type GalleryItem = {
  id: string;
  wedding_id: string;
  url: string;
  caption: string | null;
  is_official: boolean; // Distinguishes between Couple Gallery and Guest Photos
  created_at: string;
};

export type GuestPhoto = {
  id: string;
  wedding_id: string;
  guest_name: string;
  photo_url: string;
  likes: number;
  created_at: string;
};

export type RSVP = {
  id: string;
  wedding_id: string;
  guest_name: string;
  guest_count: number;
  attending: 'confirmed' | 'declined' | 'maybe' | 'pending';
  dietary_preference: string | null;
  message: string | null; // Replaced song request with message
  email: string | null;
  submitted_at: string;
};

export type GuestMoment = {
  id: string;
  wedding_id: string;
  guest_name: string;
  message: string;
  created_at: string;
};

export type Checkin = {
  id: string;
  wedding_id: string;
  guest_name: string;
  checkin_time: string;
};

export type WeddingUpdate = {
  id: string;
  wedding_id: string;
  title: string;
  message: string;
  created_at: string;
};

type TableName = "weddings" | "events" | "accommodations" | "venue_markers" | "gallery" | "guest_photos" | "rsvps" | "guest_moments" | "checkins" | "updates";

type Listener = (row: any, event: "INSERT" | "UPDATE" | "DELETE") => void;

const STORAGE_KEY = "forevervow_db_v2";

type DB = {
  weddings: Wedding[];
  events: WeddingEvent[];
  accommodations: Accommodation[];
  venue_markers: VenueMarker[];
  gallery: GalleryItem[];
  guest_photos: GuestPhoto[];
  rsvps: RSVP[];
  guest_moments: GuestMoment[];
  checkins: Checkin[];
  updates: WeddingUpdate[];
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const defaultDB = (): DB => ({
  weddings: [],
  events: [],
  accommodations: [],
  venue_markers: [],
  gallery: [],
  guest_photos: [],
  rsvps: [],
  guest_moments: [],
  checkins: [],
  updates: [],
});

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultDB();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw);
  } catch {
    return defaultDB();
  }
}

function save(db: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const listeners = new Map<TableName, Set<Listener>>();

function emit(table: TableName, row: any, event: "INSERT" | "UPDATE" | "DELETE") {
  const subs = listeners.get(table);
  if (!subs) return;
  subs.forEach((fn) => {
    try { fn(row, event); } catch {}
  });
}

export const store = {
  subscribe(table: TableName, fn: Listener) {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table)!.add(fn);
    return () => { listeners.get(table)?.delete(fn); };
  },

  all<T = any>(table: TableName): T[] {
    return (load() as any)[table] as T[];
  },
  find<T = any>(table: TableName, predicate: (row: T) => boolean): T | undefined {
    return (load() as any)[table].find(predicate);
  },
  where<T = any>(table: TableName, predicate: (row: T) => boolean): T[] {
    return (load() as any)[table].filter(predicate);
  },
  insert<T extends Record<string, any>>(table: TableName, row: T): T {
    const db = load();
    const full = { ...(row as any), id: (row as any).id || uid(), created_at: new Date().toISOString() };
    (db as any)[table].push(full);
    save(db);
    emit(table, full, "INSERT");
    return full;
  },
  update<T = any>(table: TableName, id: string, patch: Partial<T>): T | undefined {
    const db = load();
    const rows = (db as any)[table];
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx < 0) return undefined;
    rows[idx] = { ...rows[idx], ...patch };
    save(db);
    emit(table, rows[idx], "UPDATE");
    return rows[idx];
  },
  remove(table: TableName, id: string) {
    const db = load();
    const rows = (db as any)[table];
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx >= 0) {
      const [removed] = rows.splice(idx, 1);
      save(db);
      emit(table, removed, "DELETE");
    }
  },
  resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    load();
    location.reload();
  },
  isAdmin(email: string, password: string) {
    return email === "admin@forevervow.app" && password === "vows2026";
  },
};
