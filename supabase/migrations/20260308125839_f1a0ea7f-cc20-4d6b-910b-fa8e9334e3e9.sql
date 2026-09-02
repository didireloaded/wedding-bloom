
-- Table: wedding_moments
CREATE TABLE public.wedding_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT,
  photo_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT message_or_photo CHECK (message IS NOT NULL OR photo_url IS NOT NULL)
);

ALTER TABLE public.wedding_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can post moments"
  ON public.wedding_moments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read approved moments"
  ON public.wedding_moments FOR SELECT
  USING (
    approved = true AND
    EXISTS (SELECT 1 FROM weddings w WHERE w.id = wedding_id AND w.published = true)
  );

CREATE POLICY "Admins can manage moments"
  ON public.wedding_moments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX wedding_moments_wedding_created_idx ON public.wedding_moments(wedding_id, created_at DESC);

-- Table: moment_reactions
CREATE TABLE public.moment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES public.wedding_moments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'applause')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can react"
  ON public.moment_reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read reactions"
  ON public.moment_reactions FOR SELECT
  USING (true);

CREATE INDEX moment_reactions_moment_idx ON public.moment_reactions(moment_id);

-- Auto-approve trigger
CREATE OR REPLACE FUNCTION public.auto_approve_moment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (SELECT live_mode FROM public.weddings WHERE id = NEW.wedding_id) THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_moment_inserted
  BEFORE INSERT ON public.wedding_moments
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_moment();

-- Enable realtime for wedding_moments
ALTER PUBLICATION supabase_realtime ADD TABLE public.wedding_moments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moment_reactions;
