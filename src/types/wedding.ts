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
  x: number;
  y: number;
};

export type GalleryItem = {
  id: string;
  wedding_id: string;
  url: string;
  caption: string | null;
  created_at: string;
};

export type WeddingUpdate = {
  id: string;
  wedding_id: string;
  title: string;
  message: string;
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

export type GuestMoment = {
  id: string;
  wedding_id: string;
  guest_name: string;
  message: string;
  status?: string;
  created_at: string;
};

export type Checkin = {
  id: string;
  wedding_id: string;
  guest_name: string;
  message: string | null;
  created_at: string;
};

export type RSVP = {
  id: string;
  wedding_id: string;
  guest_name: string;
  email: string | null;
  phone?: string | null;
  attending: string;
  guest_count: number;
  dietary_preference: string | null;
  song_request?: string | null;
  message: string | null;
  table_id?: string | null;
  submitted_at: string;
};

export type BudgetItem = {
  id: string;
  wedding_id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  deposit_paid: number;
  due_date: string | null;
  status: "paid" | "pending" | "overdue";
};

export type VendorItem = {
  id: string;
  wedding_id: string;
  name: string;
  role: string;
  contact_email: string | null;
  phone: string | null;
  contract_url: string | null;
  pending_decision: string | null;
};

export type MoodItem = {
  id: string;
  wedding_id: string;
  type: "palette" | "photo";
  title: string;
  value: string;
  notes: string | null;
};

export type GiftItem = {
  id: string;
  wedding_id: string;
  guest_name: string;
  gift_item: string;
  status: "pending" | "drafted" | "sent";
  note_text: string | null;
};

export type TaskItem = {
  id: string;
  wedding_id: string;
  title: string;
  category: string;
  assignee: string | null;
  due_date: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "normal" | "high";
};

export type TableItem = {
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
  duration: string | null;
  title: string;
  owner: string | null;
  location: string | null;
  notes: string | null;
};

export type BroadcastItem = {
  id: string;
  wedding_id: string;
  subject: string;
  template: string | null;
  target: string;
  sent_at: string;
  recipient_count: number;
};
