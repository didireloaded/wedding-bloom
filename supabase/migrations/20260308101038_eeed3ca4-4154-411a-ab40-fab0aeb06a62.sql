
CREATE TABLE public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  checkin_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkins_wedding_id ON public.checkins (wedding_id);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Anyone can check in to a published wedding
CREATE POLICY "Anyone can insert checkin for published weddings"
  ON public.checkins FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM weddings w WHERE w.id = checkins.wedding_id AND w.published = true
  ));

-- Public can view checkins for published weddings
CREATE POLICY "Public can view checkins for published weddings"
  ON public.checkins FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM weddings w WHERE w.id = checkins.wedding_id AND w.published = true
  ));

-- Admins can manage checkins
CREATE POLICY "Admins can manage checkins"
  ON public.checkins FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for live arrival tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;
