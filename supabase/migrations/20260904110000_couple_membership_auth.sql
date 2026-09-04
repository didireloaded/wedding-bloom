CREATE TABLE IF NOT EXISTS public.wedding_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'partner' CHECK (role IN ('owner', 'partner')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  UNIQUE (wedding_id, user_id)
);

ALTER TABLE public.wedding_members ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.is_wedding_member(target_wedding_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.wedding_members WHERE wedding_id = target_wedding_id AND user_id = auth.uid()); $$;

CREATE POLICY "Members can view their wedding membership" ON public.wedding_members FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Members can update their membership" ON public.wedding_members FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage wedding memberships" ON public.wedding_members FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS wedding_members_user_idx ON public.wedding_members(user_id, wedding_id);
