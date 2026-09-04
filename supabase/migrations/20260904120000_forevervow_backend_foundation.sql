-- Additive ForeverVow domain model. Legacy tables remain the compatibility layer
-- until each route is migrated to these normalized records.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  display_name text,
  avatar_path text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wedding_public_profiles (
  wedding_id uuid PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
  couple_names text NOT NULL,
  partner_one_name text,
  partner_two_name text,
  story text,
  wedding_date date,
  ceremony_time time,
  ceremony_venue text,
  ceremony_address text,
  reception_time time,
  reception_venue text,
  reception_address text,
  dress_code text,
  rsvp_deadline date,
  cover_image_path text,
  story_image_path text,
  rsvp_image_path text,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wedding_setup (
  wedding_id uuid PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 7),
  couple_completed boolean NOT NULL DEFAULT false,
  wedding_completed boolean NOT NULL DEFAULT false,
  story_completed boolean NOT NULL DEFAULT false,
  celebration_completed boolean NOT NULL DEFAULT false,
  guest_settings_completed boolean NOT NULL DEFAULT false,
  photos_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wedding_story_details (
  wedding_id uuid PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
  how_we_met text,
  first_date text,
  when_we_knew text,
  proposal_story text,
  additional_story text,
  generated_story text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wedding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text,
  event_date date,
  start_time time,
  end_time time,
  venue_name text,
  venue_address text,
  guest_visible boolean NOT NULL DEFAULT true,
  reminder_enabled boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.couple_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed')),
  ai_result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.wedding_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'pending', 'completed', 'dismissed')),
  source text NOT NULL DEFAULT 'system' CHECK (source IN ('couple', 'ai_update', 'system', 'admin')),
  source_id uuid,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  due_date date,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  dismissed_at timestamptz
);

CREATE INDEX IF NOT EXISTS wedding_events_scope_idx ON public.wedding_events(wedding_id, event_date, sort_order);
CREATE INDEX IF NOT EXISTS couple_updates_scope_idx ON public.couple_updates(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS action_items_scope_idx ON public.wedding_action_items(wedding_id, status, due_date);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_story_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "Public can read published wedding profiles" ON public.wedding_public_profiles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Members manage public wedding profile" ON public.wedding_public_profiles FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id));
CREATE POLICY "Members manage wedding setup" ON public.wedding_setup FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id));
CREATE POLICY "Members manage wedding story" ON public.wedding_story_details FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id));
CREATE POLICY "Guests read visible normalized events" ON public.wedding_events FOR SELECT TO anon, authenticated USING (guest_visible = true AND EXISTS (SELECT 1 FROM public.wedding_public_profiles profile WHERE profile.wedding_id = wedding_events.wedding_id AND profile.published = true));
CREATE POLICY "Members manage normalized events" ON public.wedding_events FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id));
CREATE POLICY "Members manage couple updates" ON public.couple_updates FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id) AND author_user_id = (SELECT auth.uid()));
CREATE POLICY "Members manage action items" ON public.wedding_action_items FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id));

GRANT SELECT ON public.wedding_public_profiles, public.wedding_events TO anon, authenticated;
GRANT ALL ON public.profiles, public.wedding_setup, public.wedding_story_details, public.wedding_events, public.couple_updates, public.wedding_action_items TO authenticated;
