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

const SEED_WEDDING_ID = "wb_demo_01";
const SEED_WEDDING: Wedding = {
  id: SEED_WEDDING_ID,
  slug: "elara-julian",
  access_code: "VOWS2026",
  couple_names: "Elara & Julian",
  wedding_date: "2026-10-18",
  ceremony_time: "16:00",
  ceremony_venue: "Villa Rosa Alba",
  venue_address: "Strada in Chianti, 50022 Greve, Tuscany",
  venue_map_url: "https://images.pexels.com/photos/35030159/pexels-photo-35030159.jpeg?auto=compress&cs=tinysrgb&w=1200",
  cover_image: "https://images.pexels.com/photos/17019893/pexels-photo-17019893.jpeg?auto=compress&cs=tinysrgb&w=1400",
  hero_image: "https://images.pexels.com/photos/17487414/pexels-photo-17487414.jpeg?auto=compress&cs=tinysrgb&w=1400",
  story: "Six years, four cities, one shared sketchbook. We met shelving returns at La Feltrinelli in Florence, spent a summer residency in Swakopmund under Namibian stars, and got engaged under a wisteria tunnel in Kyoto. Now we're gathering everyone we love in Tuscany for a slow golden Sunday.",
  dress_code: "Garden formal. Warm earth, blush, sage, soft black. Block heels for lawn and stone.",
  hashtag: "ElAndJuTuscany",
  published: true,
  legacy_mode: false,
  soundtrack_url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808f3030e.mp3",
  theme: { background: "38 35% 97%", foreground: "30 20% 15%", primary: "30 55% 42%", accent: "30 55% 52%" },
  created_at: new Date().toISOString(),
};

const SEED_EVENTS: WeddingEvent[] = [
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Welcome Spritz", description: "Negroni sbagliati, small plates, string quartet. Linen casual.", location: "Terrazza Limonaia", event_date: "2026-10-16", event_time: "18:30", sort_order: 1 },
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Olive Grove Picnic", description: "Woven blankets, chilled Lambrusco, polaroids provided.", location: "Ulivi Secolari", event_date: "2026-10-17", event_time: "12:00", sort_order: 2 },
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Ceremony", description: "Unplugged ceremony in the peony garden. 34 minutes.", location: "Giardino delle Peonie", event_date: "2026-10-18", event_time: "16:00", sort_order: 3 },
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Dinner & Dancing", description: "Family-style Tuscan feast. Vows to vinyl after midnight.", location: "Loggia Bianca", event_date: "2026-10-18", event_time: "18:30", sort_order: 4 },
];

const SEED_ACCOMMODATIONS: Accommodation[] = [
  { id: uid(), wedding_id: SEED_WEDDING_ID, name: "Albergo La Fontana", photo_url: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg", price: "€120/night", phone: "+39 055 123456", distance: "2 km from venue", booking_url: "https://booking.com" },
  { id: uid(), wedding_id: SEED_WEDDING_ID, name: "Il Sole Resort", photo_url: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg", price: "€250/night", phone: "+39 055 654321", distance: "5 km from venue", booking_url: "https://booking.com" }
];

const SEED_MARKERS: VenueMarker[] = [
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Ceremony Garden", category: "Ceremony", icon: "Heart", description: "Where the vows happen.", x: 30, y: 40 },
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Cocktail Bar", category: "Bar", icon: "Cocktail", description: "Open bar all night.", x: 60, y: 55 },
  { id: uid(), wedding_id: SEED_WEDDING_ID, title: "Dance Floor", category: "Entertainment", icon: "Dance", description: "Live vinyl DJ.", x: 45, y: 70 },
];

const SEED_GALLERY: GalleryItem[] = [
  "https://images.pexels.com/photos/17487414/pexels-photo-17487414.jpeg",
  "https://images.pexels.com/photos/28584778/pexels-photo-28584778.jpeg",
  "https://images.pexels.com/photos/21629078/pexels-photo-21629078.jpeg",
  "https://images.pexels.com/photos/12093891/pexels-photo-12093891.jpeg",
].map((url, i) => ({
  id: uid(),
  wedding_id: SEED_WEDDING_ID,
  url,
  caption: ["Gardens, morning", "Vows rehearsal", "Golden hour", "Villa walk"][i],
  is_official: true,
  created_at: new Date().toISOString(),
}));

const SEED_GUEST_PHOTOS: GuestPhoto[] = [
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Luca", photo_url: "https://images.pexels.com/photos/10792793/pexels-photo-10792793.jpeg", likes: 12, created_at: new Date().toISOString() },
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Sofia", photo_url: "https://images.pexels.com/photos/10792778/pexels-photo-10792778.jpeg", likes: 8, created_at: new Date().toISOString() },
];

const SEED_RSVPS: RSVP[] = [
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Nandi Okafor", guest_count: 2, attending: "confirmed", dietary_preference: "Vegetarian", message: "So happy for you both!", email: "nandi@example.com", submitted_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Luca Maretti", guest_count: 1, attending: "confirmed", dietary_preference: "No Restrictions", message: "Bringing the camera.", email: "luca@example.com", submitted_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Sofia Reyes", guest_count: 2, attending: "maybe", dietary_preference: "Gluten-free", message: null, email: "sofia@example.com", submitted_at: new Date(Date.now() - 86400000).toISOString() },
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Theo Yamaguchi", guest_count: 4, attending: "pending", dietary_preference: null, message: null, email: "theo@example.com", submitted_at: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Chef Amara", guest_count: 1, attending: "declined", dietary_preference: null, message: "So sorry I can't make it, sending love!", email: "amara@example.com", submitted_at: new Date(Date.now() - 86400000 * 3).toISOString() },
];

const SEED_GUEST_MOMENTS: GuestMoment[] = [
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Nandi & Theo", message: "My favourite moment was seeing Julian's face when Elara walked down the aisle. Pure magic.", created_at: new Date().toISOString() },
  { id: uid(), wedding_id: SEED_WEDDING_ID, guest_name: "Luca", message: "Dancing under the Tuscan stars with everyone. A night to remember forever.", created_at: new Date().toISOString() },
];

// Demo weddings for the onboarding gallery
const DEMO_WEDDINGS: Wedding[] = [
  // Elara & Julian already seeded above (VOWS2026)
  {
    id: "demo_wb_02",
    slug: "towa-mathew",
    access_code: "TM9821KX",
    couple_names: "Towa & Mathew",
    wedding_date: "2026-07-22",
    ceremony_time: "15:00",
    ceremony_venue: "Sankei-en Garden",
    venue_address: "58-1 Honmoku Sannotani, Naka-ku, Yokohama",
    venue_map_url: null,
    cover_image: "https://images.pexels.com/photos/5729059/pexels-photo-5729059.jpeg?auto=compress&cs=tinysrgb&w=1400",
    hero_image: "https://images.pexels.com/photos/5729059/pexels-photo-5729059.jpeg?auto=compress&cs=tinysrgb&w=1400",
    story: "Towa and Mathew met during a summer arts residency in Yokohama. Their love for Japanese gardens and tea ceremonies became the heart of their story.",
    dress_code: "Summer garden formal. Light fabrics, pastels.",
    hashtag: "TowaAndMathew",
    published: true,
    legacy_mode: false,
    soundtrack_url: null,
    theme: { background: "50 25% 96%", foreground: "330 15% 20%", primary: "340 45% 52%", accent: "340 45% 52%" },
    created_at: new Date().toISOString(),
  },
  {
    id: "demo_wb_03",
    slug: "john-anna",
    access_code: "JA4472QV",
    couple_names: "John & Anna",
    wedding_date: "2026-09-12",
    ceremony_time: "14:30",
    ceremony_venue: "Chapelle du Château",
    venue_address: "Route de la Chapelle, 06320 Cap d'Ail, France",
    venue_map_url: null,
    cover_image: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg?auto=compress&cs=tinysrgb&w=1400",
    hero_image: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg?auto=compress&cs=tinysrgb&w=1400",
    story: "An architect and a pastry chef met in Provence. Their wedding blends stone chapel elegance with lavender fields under the Côte d'Azur sun.",
    dress_code: "Riviera chic. Ivory, sand, soft blue.",
    hashtag: "JohnAndAnnaCoteDAzur",
    published: true,
    legacy_mode: false,
    soundtrack_url: null,
    theme: { background: "45 28% 96%", foreground: "200 18% 18%", primary: "200 55% 44%", accent: "200 55% 44%" },
    created_at: new Date().toISOString(),
  },
  {
    id: "demo_wb_04",
    slug: "emma-david",
    access_code: "ED3361PM",
    couple_names: "Emma & David",
    wedding_date: "2026-06-05",
    ceremony_time: "17:30",
    ceremony_venue: "Pippin Hill Farm",
    venue_address: "5022 Plank Rd, North Garden, VA 22959, USA",
    venue_map_url: null,
    cover_image: "https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=1400",
    hero_image: "https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=1400",
    story: "Childhood sweethearts who grew up on neighboring Virginia farms. Their wedding is a celebration of wildflower meadows and farm-to-table feasts.",
    dress_code: "Garden party. Florals encouraged.",
    hashtag: "EmmaDavidForever",
    published: true,
    legacy_mode: false,
    soundtrack_url: null,
    theme: { background: "35 30% 96%", foreground: "80 12% 16%", primary: "80 40% 38%", accent: "80 40% 38%" },
    created_at: new Date().toISOString(),
  },
  {
    id: "demo_wb_05",
    slug: "lisa-michael",
    access_code: "LM5519RB",
    couple_names: "Lisa & Michael",
    wedding_date: "2026-12-20",
    ceremony_time: "18:00",
    ceremony_venue: "The Glasshouse",
    venue_address: "42–44 New York St, Manchester M1 7DY, UK",
    venue_map_url: null,
    cover_image: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=1400",
    hero_image: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=1400",
    story: "Two graphic designers who fell in love at a Manchester letterpress workshop. Their winter wedding is candlelit, minimalist, and deeply warm.",
    dress_code: "Cocktail. Jewel tones, velvet, silk.",
    hashtag: "LisaAndMichaelMCR",
    published: true,
    legacy_mode: false,
    soundtrack_url: null,
    theme: { background: "0 0% 97%", foreground: "250 15% 15%", primary: "250 40% 42%", accent: "250 40% 42%" },
    created_at: new Date().toISOString(),
  },
];

const defaultDB = (): DB => ({
  weddings: [SEED_WEDDING, ...DEMO_WEDDINGS.map(w => ({ ...w, gallery: undefined }))] as any,
  events: SEED_EVENTS,
  accommodations: SEED_ACCOMMODATIONS,
  venue_markers: SEED_MARKERS,
  gallery: SEED_GALLERY,
  guest_photos: SEED_GUEST_PHOTOS,
  rsvps: SEED_RSVPS,
  guest_moments: SEED_GUEST_MOMENTS,
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
