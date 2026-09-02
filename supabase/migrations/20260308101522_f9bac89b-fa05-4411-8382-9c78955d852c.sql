
CREATE TABLE public.guestbook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  message text NOT NULL,
  photo_url text DEFAULT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_guestbook_wedding_id ON public.guestbook (wedding_id, approved, created_at DESC);

ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert guestbook for published weddings"
  ON public.guestbook FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM weddings w WHERE w.id = guestbook.wedding_id AND w.published = true
  ));

CREATE POLICY "Public can view approved guestbook messages"
  ON public.guestbook FOR SELECT
  USING (
    (approved = true AND EXISTS (
      SELECT 1 FROM weddings w WHERE w.id = guestbook.wedding_id AND w.published = true
    ))
  );

CREATE POLICY "Admins can manage guestbook"
  ON public.guestbook FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
