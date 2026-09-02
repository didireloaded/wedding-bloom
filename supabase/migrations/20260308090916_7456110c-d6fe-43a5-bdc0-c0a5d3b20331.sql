
-- Live wedding updates table for real-time mode
CREATE TABLE public.live_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  message text NOT NULL,
  update_type text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view live updates for published weddings" ON public.live_updates FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = live_updates.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage live updates" ON public.live_updates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_updates;

-- Add live_mode flag to weddings
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS live_mode boolean NOT NULL DEFAULT false;

-- Guest photo wall table with approval workflow
CREATE TABLE public.guest_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  guest_name text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved guest photos" ON public.guest_photos FOR SELECT USING (approved = true AND EXISTS (SELECT 1 FROM weddings w WHERE w.id = guest_photos.wedding_id AND w.published = true));
CREATE POLICY "Anyone can upload guest photos" ON public.guest_photos FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM weddings w WHERE w.id = guest_photos.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage guest photos" ON public.guest_photos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for guest photos
ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_photos;

-- Seating planner tables
CREATE TABLE public.seating_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  capacity integer NOT NULL DEFAULT 8,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage seating tables" ON public.seating_tables FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view seating for published weddings" ON public.seating_tables FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = seating_tables.wedding_id AND w.published = true));

CREATE TABLE public.seating_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  rsvp_id uuid REFERENCES public.rsvps(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage seating assignments" ON public.seating_assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view seating assignments" ON public.seating_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM seating_tables st JOIN weddings w ON w.id = st.wedding_id WHERE st.id = seating_assignments.table_id AND w.published = true));
