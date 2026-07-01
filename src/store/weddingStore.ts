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
  reception_venue?: string | null;
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
  schedule?: any;
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
  url?: string;
  image_url?: string;
  title?: string;
  caption: string | null;
  is_official?: boolean; // Distinguishes between Couple Gallery and Guest Photos
  sort_order?: number;
  created_at?: string;
};

export type GuestPhoto = {
  id: string;
  wedding_id: string;
  guest_name: string;
  photo_url: string;
  caption?: string | null;
  likes?: number;
  created_at: string;
};

export type RSVP = {
  id: string;
  wedding_id: string;
  guest_name: string;
  guest_count: number;
  attending: 'confirmed' | 'declined' | 'maybe' | 'pending';
  dietary_preference?: string | null;
  dietary_requirements?: string | null;
  vip_status?: boolean;
  table_id?: string;
  household?: string;
  notes?: string;
  message: string | null;
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

export type TaskItem = {
  id: string;
  wedding_id: string;
  title: string;
  category: string;
  assignee: string;
  due_date: string;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "normal";
};

export type FloorTable = {
  id: string;
  wedding_id: string;
  name: string;
  type: "round" | "rect" | "vip";
  capacity: number;
  assigned_guests: string[];
};

export type RunSheetItem = {
  id: string;
  wedding_id: string;
  time: string;
  duration: string;
  title: string;
  owner: string;
  location: string;
  notes: string;
};

export type BroadcastItem = {
  id: string;
  wedding_id: string;
  subject: string;
  template: string;
  target: string;
  sent_at: string;
  recipient_count: number;
};

export type BudgetItem = {
  id: string;
  wedding_id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  deposit_paid: number;
  due_date: string;
  status: "pending" | "paid";
};

export type VendorItem = {
  id: string;
  wedding_id: string;
  name: string;
  role: string;
  contact_email: string;
  phone: string;
  contract_url?: string;
  pending_decision: string | null;
};

export type MoodItem = {
  id: string;
  wedding_id: string;
  type: "photo" | "palette" | "swatch";
  title: string;
  value: string;
  notes: string;
};

export type GiftItem = {
  id: string;
  wedding_id: string;
  guest_name: string;
  gift_item: string;
  status: "pending" | "drafted" | "sent";
  note_text: string | null;
};

export type SeatAssignment = {
  id: string;
  wedding_id: string;
  guest_id: string;
  guest_name: string;
  table_id: string;
  seat_index: number;
};

type TableName = "weddings" | "events" | "accommodations" | "venue_markers" | "gallery" | "guest_photos" | "rsvps" | "guest_moments" | "checkins" | "updates" | "tasks" | "tables" | "run_sheet" | "broadcasts" | "budgets" | "vendors" | "mood_items" | "gifts" | "seat_assignments";

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
  tasks: TaskItem[];
  tables: FloorTable[];
  run_sheet: RunSheetItem[];
  broadcasts: BroadcastItem[];
  budgets: BudgetItem[];
  vendors: VendorItem[];
  mood_items: MoodItem[];
  gifts: GiftItem[];
  seat_assignments: SeatAssignment[];
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const defaultDB = (): DB => {
  const w1Id = "w-demo-1";
  const w2Id = "w-demo-2";
  return {
    weddings: [
      {
        id: w1Id,
        slug: "elara-julian",
        couple_names: "Elara Vance & Julian Thorne",
        access_code: "ELARA2026",
        wedding_date: "2026-09-18",
        ceremony_venue: "Villa Balbiano, Lake Como",
        venue_address: "Via Regina 43, Ossuccio CO, Italy",
        reception_venue: "Grand Garden Pavilion",
        story: "We met under the autumn leaves in Kyoto and knew our journey would last forever. Join us as we celebrate our love on the shores of Lake Como.",
        schedule: [],
        travel_info: null,
        registry_url: "https://zola.com",
        cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        hero_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        created_at: new Date().toISOString(),
        published: true,
        archived: false,
      },
      {
        id: w2Id,
        slug: "sophia-marcus",
        couple_names: "Sophia Laurent & Marcus Sterling",
        access_code: "SOPHIA2026",
        wedding_date: "2026-11-14",
        ceremony_venue: "Château de Chambord, France",
        venue_address: "Chambord, 41250 France",
        reception_venue: "The Glass Ballroom",
        story: "A celebration of modern elegance, wine, and lifelong friendships in the heart of the Loire Valley.",
        schedule: [],
        travel_info: null,
        registry_url: "https://zola.com",
        cover_image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
        hero_image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
        created_at: new Date().toISOString(),
        published: true,
        archived: false,
      }
    ],
    events: [
      { id: "e-1", wedding_id: w1Id, title: "Welcome Cocktail & Sunset Aperitivo", description: "Sip fine Italian prosecco as we watch the sun dip below the mountains.", location: "Lakeside Terrace", event_date: "2026-09-17", event_time: "18:00", sort_order: 1 },
      { id: "e-2", wedding_id: w1Id, title: "The Wedding Ceremony", description: "Vows exchanged amidst the historic gardens.", location: "Main Lawn", event_date: "2026-09-18", event_time: "16:30", sort_order: 2 },
    ],
    accommodations: [],
    venue_markers: [],
    gallery: [
      { id: "g-1", wedding_id: w1Id, title: "Engagement in Kyoto", image_url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80", caption: "The moment we said yes.", sort_order: 1 }
    ],
    guest_photos: [
      { id: "gp-1", wedding_id: w1Id, guest_name: "Elena Rostova", photo_url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80", caption: "So excited for you both!!", created_at: new Date().toISOString() }
    ],
    rsvps: [
      { id: "r-1", wedding_id: w1Id, guest_name: "Alexander Wright", email: "alex@wright.co", attending: "confirmed", guest_count: 2, dietary_requirements: "Vegetarian", vip_status: true, table_id: "tb-1", household: "Wright Family", notes: "Prefers sparkling water", message: "Can't wait to celebrate with you in Como!", submitted_at: new Date().toISOString() },
      { id: "r-2", wedding_id: w1Id, guest_name: "Chloe Bennett", email: "chloe@bennett.design", attending: "confirmed", guest_count: 1, dietary_requirements: "Gluten-Free", vip_status: true, table_id: "tb-1", household: "Chloe Bennett", notes: "Needs shuttle pick-up", message: "Counting down the days!", submitted_at: new Date().toISOString() },
      { id: "r-3", wedding_id: w1Id, guest_name: "Elena Rostova", email: "elena@rostova.it", attending: "confirmed", guest_count: 2, dietary_requirements: "None", vip_status: false, table_id: "tb-2", household: "Rostova Household", notes: "", message: "See you lakeside!", submitted_at: new Date().toISOString() }
    ],
    guest_moments: [],
    checkins: [],
    updates: [
      { id: "u-1", wedding_id: w1Id, title: "Dress Code & Shuttle Schedule", message: "Shuttles will depart from Hotel Tremezzo at 3:45 PM sharp. Black tie optional.", created_at: new Date().toISOString() }
    ],
    tasks: [
      { id: "t-1", wedding_id: w1Id, title: "Finalize floral mockup with Studio Flora Como", category: "Vendors", assignee: "Elara Vance", due_date: "2026-08-15", status: "in_progress", priority: "high" },
      { id: "t-2", wedding_id: w1Id, title: "Confirm shuttle bus headcount & driver routes", category: "Logistics", assignee: "Coordinator Team", due_date: "2026-09-01", status: "todo", priority: "high" },
      { id: "t-3", wedding_id: w1Id, title: "Curate vintage prosecco selection for aperitivo", category: "Catering", assignee: "Julian Thorne", due_date: "2026-08-10", status: "done", priority: "normal" },
      { id: "t-4", wedding_id: w1Id, title: "Deliver welcome gift baskets to Hotel Tremezzo", category: "Hospitality", assignee: "Bridal Party", due_date: "2026-09-16", status: "todo", priority: "normal" }
    ],
    tables: [
      { id: "tb-1", wedding_id: w1Id, name: "Table 1 (VIP Head Table)", type: "vip", capacity: 8, assigned_guests: ["Alexander Wright", "Chloe Bennett"] },
      { id: "tb-2", wedding_id: w1Id, name: "Table 2 (Lakeside View)", type: "round", capacity: 10, assigned_guests: ["Elena Rostova"] },
      { id: "tb-3", wedding_id: w1Id, name: "Table 3 (Orchard Alcove)", type: "rect", capacity: 12, assigned_guests: [] }
    ],
    run_sheet: [
      { id: "rs-1", wedding_id: w1Id, time: "10:00", duration: "120 min", title: "Bridal Suite Hair & Makeup Setup", owner: "Beauty Artist Team", location: "Villa Balbiano Master Suite", notes: "Fresh berries, pastries, and chilled champagne delivered to suite." },
      { id: "rs-2", wedding_id: w1Id, time: "14:30", duration: "60 min", title: "First Look & Orchard Editorial Photoshoot", owner: "Lead Photographer", location: "South Olive Grove", notes: "Private security clears orchard pathways for couple arrival." },
      { id: "rs-3", wedding_id: w1Id, time: "16:30", duration: "45 min", title: "Sunset Ceremony & Processional", owner: "Officiant & Quartet", location: "Lakefront Promenade Pavilion", notes: "String quartet begins prelude at 16:15 sharp." },
      { id: "rs-4", wedding_id: w1Id, time: "18:00", duration: "90 min", title: "Grand Aperitivo & Sunset Reception Toast", owner: "Catering & DJ", location: "Main Garden Terraces", notes: "Prosecco fountain live, acoustic jazz trio playing." }
    ],
    broadcasts: [
      { id: "bc-1", wedding_id: w1Id, subject: "Lake Como Welcome Guide & Shuttle Times", template: "Logistics Reminder", target: "confirmed", sent_at: new Date().toISOString(), recipient_count: 42 }
    ],
    budgets: [
      { id: "b-1", wedding_id: w1Id, category: "Venue & Catering", item_name: "Villa Balbiano Exclusive Rental & Banquet", estimated_cost: 38000, actual_cost: 38500, deposit_paid: 19000, due_date: "2026-08-01", status: "pending" },
      { id: "b-2", wedding_id: w1Id, category: "Floral & Decor", item_name: "Studio Flora Como Bespoke Installations", estimated_cost: 12000, actual_cost: 11800, deposit_paid: 6000, due_date: "2026-08-15", status: "pending" },
      { id: "b-3", wedding_id: w1Id, category: "Photography", item_name: "Milan Luxury Editorial Photo & Video Package", estimated_cost: 9500, actual_cost: 9500, deposit_paid: 9500, due_date: "2026-07-01", status: "paid" },
      { id: "b-4", wedding_id: w1Id, category: "Entertainment", item_name: "Venice Acoustic Quartet & DJ Lounge Set", estimated_cost: 5500, actual_cost: 5500, deposit_paid: 2750, due_date: "2026-08-20", status: "pending" }
    ],
    vendors: [
      { id: "v-1", wedding_id: w1Id, name: "Villa Balbiano Events", role: "Primary Venue", contact_email: "events@villabalbiano.it", phone: "+39 031 555 0192", contract_url: "https://forevervow.app/contracts/vb-2026", pending_decision: "Approve final midnight curfew extension" },
      { id: "v-2", wedding_id: w1Id, name: "Studio Flora Como", role: "Florist & Styling", contact_email: "design@studiofloracomo.com", phone: "+39 031 555 0844", contract_url: "https://forevervow.app/contracts/sfc-2026", pending_decision: "Select white orchid vs. Amalfi lemon centerpieces" },
      { id: "v-3", wedding_id: w1Id, name: "Marco Vieri Photography", role: "Lead Photographer", contact_email: "marco@vieri.photo", phone: "+39 02 555 0141", contract_url: "https://forevervow.app/contracts/mv-2026", pending_decision: null }
    ],
    mood_items: [
      { id: "m-1", wedding_id: w1Id, type: "palette", title: "Sunset Gold Accent", value: "#D4A853", notes: "Primary foil stamp color for stationery and menus" },
      { id: "m-2", wedding_id: w1Id, type: "palette", title: "Obsidian Silk Noir", value: "#09090B", notes: "Lounge velvet drape and evening lighting contrast" },
      { id: "m-3", wedding_id: w1Id, type: "photo", title: "Lakeside Floral Arch Inspiration", value: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", notes: "Open structure overlooking Lake Como water" }
    ],
    gifts: [
      { id: "gf-1", wedding_id: w1Id, guest_name: "Alexander Wright", gift_item: "Baccarat Crystal Champagne Flutes (Set of 4)", status: "drafted", note_text: "Dearest Alex, thank you so much for the stunning Baccarat crystal flutes! We will toast with them on our first anniversary." },
      { id: "gf-2", wedding_id: w1Id, guest_name: "Chloe Bennett", gift_item: "KitchenAid Pro Artisan Stand Mixer (Matte Black)", status: "sent", note_text: "Chloe, your thoughtful gift is the centerpiece of our kitchen! Thank you for celebrating with us lakeside." },
      { id: "gf-3", wedding_id: w1Id, guest_name: "Elena Rostova", gift_item: "Honeymoon Experience Fund Contribution ($500)", status: "pending", note_text: null }
    ],
    seat_assignments: [
      { id: "sa-1", wedding_id: w1Id, guest_id: "r-1", guest_name: "Alexander Wright", table_id: "tb-1", seat_index: 1 },
      { id: "sa-2", wedding_id: w1Id, guest_id: "r-2", guest_name: "Chloe Bennett", table_id: "tb-1", seat_index: 2 },
      { id: "sa-3", wedding_id: w1Id, guest_id: "r-3", guest_name: "Elena Rostova", table_id: "tb-2", seat_index: 1 }
    ]
  };
};

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultDB();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.weddings || parsed.weddings.length === 0) {
      const fresh = defaultDB();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const fresh = defaultDB();
    if (!parsed.tasks) parsed.tasks = fresh.tasks;
    if (!parsed.tables) parsed.tables = fresh.tables;
    if (!parsed.run_sheet) parsed.run_sheet = fresh.run_sheet;
    if (!parsed.broadcasts) parsed.broadcasts = fresh.broadcasts;
    if (!parsed.budgets) parsed.budgets = fresh.budgets;
    if (!parsed.vendors) parsed.vendors = fresh.vendors;
    if (!parsed.mood_items) parsed.mood_items = fresh.mood_items;
    if (!parsed.gifts) parsed.gifts = fresh.gifts;
    if (!parsed.seat_assignments) parsed.seat_assignments = fresh.seat_assignments;
    return parsed;
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
