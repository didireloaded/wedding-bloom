-- Wedding-scoped notification foundation. Delivery is deliberately separate from source events.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  audience_type text NOT NULL CHECK (audience_type IN ('guest', 'couple')),
  guest_id uuid NULL,
  couple_device_id uuid NULL,
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  user_agent text,
  platform text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, endpoint)
);

CREATE TABLE IF NOT EXISTS public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_type text,
  actor_id uuid,
  subject_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  notification_event_id uuid REFERENCES public.notification_events(id) ON DELETE SET NULL,
  push_subscription_id uuid REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('guest', 'couple')),
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  target_url text NOT NULL,
  read_at timestamptz,
  sent_at timestamptz,
  opened_at timestamptz,
  delivery_status text NOT NULL DEFAULT 'pending',
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.notification_events(id) ON DELETE CASCADE,
  category text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('guest', 'couple')),
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'partial', 'failed', 'cancelled')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('guest', 'couple')),
  recipient_device_id uuid,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  target_url text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notification_deliveries_dedupe_idx ON public.notification_deliveries(notification_event_id, push_subscription_id, category);

CREATE TABLE IF NOT EXISTS public.couple_device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  device_token_hash text NOT NULL UNIQUE,
  device_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_device_session_id uuid NOT NULL REFERENCES public.couple_device_sessions(id) ON DELETE CASCADE,
  category text NOT NULL,
  delivery_mode text NOT NULL DEFAULT 'grouped' CHECK (delivery_mode IN ('immediate', 'grouped', 'off')),
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_device_session_id, category)
);

CREATE TABLE IF NOT EXISTS public.guest_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  push_subscription_id uuid NOT NULL UNIQUE REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  important_alerts boolean NOT NULL DEFAULT true,
  social_alerts boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_events_wedding_created_idx ON public.notification_events(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notification_deliveries_wedding_created_idx ON public.notification_deliveries(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notification_jobs_due_idx ON public.notification_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS in_app_notifications_recipient_idx ON public.in_app_notifications(wedding_id, recipient_type, created_at DESC);

CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  rsvp_id uuid REFERENCES public.rsvps(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '180 days'),
  revoked_at timestamptz
);

ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS rsvp_id uuid REFERENCES public.rsvps(id) ON DELETE SET NULL;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS party_size integer NOT NULL DEFAULT 1;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS checkin_method text NOT NULL DEFAULT 'manual_staff';
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS location_accuracy numeric;
ALTER TABLE public.guest_photos ADD COLUMN IF NOT EXISTS guest_session_id uuid REFERENCES public.guest_sessions(id) ON DELETE SET NULL;
ALTER TABLE public.guest_photos ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.guest_photos ADD COLUMN IF NOT EXISTS display_storage_path text;
ALTER TABLE public.guest_photos ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE public.guest_photos ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS public.wedding_checkin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL UNIQUE REFERENCES public.weddings(id) ON DELETE CASCADE,
  latitude numeric,
  longitude numeric,
  radius_meters integer NOT NULL DEFAULT 150 CHECK (radius_meters BETWEEN 25 AND 1000),
  checkin_enabled boolean NOT NULL DEFAULT true,
  geolocation_enabled boolean NOT NULL DEFAULT true,
  qr_checkin_enabled boolean NOT NULL DEFAULT true,
  checkin_opens_at timestamptz,
  checkin_closes_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_checkin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage guest sessions" ON public.guest_sessions FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage wedding checkin settings" ON public.wedding_checkin_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Public guests can register a subscription for a published wedding; privileged delivery work stays server-side.
CREATE POLICY "Published weddings can register push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true)
);
CREATE POLICY "Admins can manage notification subsystem" ON public.push_subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage notification events" ON public.notification_events FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage notification deliveries" ON public.notification_deliveries FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage couple device sessions" ON public.couple_device_sessions FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage notification preferences" ON public.notification_preferences FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage guest notification preferences" ON public.guest_notification_preferences FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage notification jobs" ON public.notification_jobs FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage in app notifications" ON public.in_app_notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
