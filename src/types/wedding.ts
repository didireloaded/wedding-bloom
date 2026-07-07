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
  story_image?: string | null;
  rsvp_image?: string | null;
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
  image_url?: string;
  caption: string | null;
  promoted_from_guest_photo_id?: string;
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
  status?: "approved" | "pending" | "rejected" | "pinned";
  is_promoted?: boolean;
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
  checkin_time?: string;
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
  dietary_requirements?: string | null;
  vip_status?: boolean | null;
  household?: string | null;
  notes?: string | null;
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

export type FloorTable = TableItem;

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

export type CoupleProfile = {
  id: string;
  user_id?: string | null;
  wedding_id: string;
  partner_a_name: string;
  partner_b_name: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at?: string;
};

export type Venue = {
  id: string;
  wedding_id: string;
  name: string;
  type: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  website_url?: string | null;
  created_at: string;
};

export type VenueMap = {
  id: string;
  wedding_id: string;
  venue_id?: string | null;
  title: string;
  image_url: string;
  width: number;
  height: number;
  config?: Record<string, unknown>;
  created_at: string;
};

export type GuestUpload = {
  id: string;
  wedding_id: string;
  guest_id?: string | null;
  guest_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes?: number;
  status: string;
  created_at: string;
};

export type GuestbookEntry = {
  id: string;
  wedding_id: string;
  guest_name: string;
  email?: string | null;
  message: string;
  media_url?: string | null;
  status: string;
  created_at: string;
};

export type MemoryItem = {
  id: string;
  wedding_id: string;
  title: string;
  description?: string | null;
  moment_date?: string | null;
  photo_url?: string | null;
  category: string;
  created_at: string;
};

export type AnalyticsRecord = {
  id: string;
  wedding_id: string;
  event_type: string;
  path?: string | null;
  visitor_id?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type ThemeConfig = {
  id: string;
  name: string;
  slug: string;
  palette: Record<string, string>;
  typography: Record<string, string>;
  layout_style: string;
  is_default: boolean;
  created_at: string;
};

export type TemplateItem = {
  id: string;
  name: string;
  category: string;
  thumbnail_url?: string | null;
  config_schema?: Record<string, unknown>;
  is_premium: boolean;
  created_at: string;
};

export type QRCodeItem = {
  id: string;
  wedding_id: string;
  label: string;
  target_url: string;
  code_data: string;
  scan_count: number;
  is_active: boolean;
  created_at: string;
};

export type InvitationLink = {
  id: string;
  wedding_id: string;
  guest_id?: string | null;
  unique_token: string;
  url: string;
  open_count: number;
  last_opened_at?: string | null;
  created_at: string;
};

