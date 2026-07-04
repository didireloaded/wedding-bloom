
DROP POLICY IF EXISTS "Guests can post moments" ON public.wedding_moments;
CREATE POLICY "Guests can post moments to published weddings"
ON public.wedding_moments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = wedding_moments.wedding_id AND w.published = true
  )
);

DROP POLICY IF EXISTS "Anyone can react" ON public.moment_reactions;
CREATE POLICY "Anyone can react to moments from published weddings"
ON public.moment_reactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_moments m
    JOIN public.weddings w ON w.id = m.wedding_id
    WHERE m.id = moment_reactions.moment_id AND w.published = true
  )
);
