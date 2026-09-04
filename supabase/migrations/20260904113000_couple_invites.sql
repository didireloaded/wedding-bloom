CREATE TABLE IF NOT EXISTS public.couple_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid REFERENCES public.weddings(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  created_by uuid REFERENCES auth.users(id)
);
ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage couple invites" ON public.couple_invites FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS couple_invites_email_idx ON public.couple_invites(lower(email), status);
