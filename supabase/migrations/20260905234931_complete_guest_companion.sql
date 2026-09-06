BEGIN;

ALTER TABLE public.in_app_notifications ADD COLUMN IF NOT EXISTS recipient_rsvp_id uuid REFERENCES public.rsvps(id) ON DELETE CASCADE;
ALTER TABLE public.in_app_notifications ADD COLUMN IF NOT EXISTS notification_event_id uuid REFERENCES public.notification_events(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS guest_inbox_event_recipient_idx ON public.in_app_notifications(notification_event_id, recipient_rsvp_id);
CREATE INDEX IF NOT EXISTS guest_inbox_lookup_idx ON public.in_app_notifications(wedding_id, recipient_rsvp_id, created_at DESC);
UPDATE public.in_app_notifications n SET recipient_rsvp_id = r.id FROM public.rsvps r
WHERE n.recipient_type = 'guest' AND n.recipient_rsvp_id IS NULL AND n.recipient_device_id = r.id AND n.wedding_id = r.wedding_id;

CREATE POLICY "Members read wedding notification history" ON public.in_app_notifications FOR SELECT TO authenticated
USING (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Members read wedding delivery history" ON public.notification_deliveries FOR SELECT TO authenticated
USING (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.in_app_notifications, public.notification_deliveries TO authenticated;

CREATE TABLE public.wedding_guest_details (
  wedding_id uuid PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
  parking text NOT NULL DEFAULT '' CHECK (length(parking) <= 2000),
  transport text NOT NULL DEFAULT '' CHECK (length(transport) <= 2000),
  accessibility text NOT NULL DEFAULT '' CHECK (length(accessibility) <= 2000),
  children text NOT NULL DEFAULT '' CHECK (length(children) <= 2000),
  contact_name text NOT NULL DEFAULT '' CHECK (length(contact_name) <= 150),
  contact_email text NOT NULL DEFAULT '' CHECK (length(contact_email) <= 254),
  contact_phone text NOT NULL DEFAULT '' CHECK (length(contact_phone) <= 80),
  other_details text NOT NULL DEFAULT '' CHECK (length(other_details) <= 4000)
);
ALTER TABLE public.wedding_guest_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published guest information" ON public.wedding_guest_details FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published));
CREATE POLICY "Members manage guest information" ON public.wedding_guest_details FOR ALL TO authenticated
USING (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.wedding_guest_details TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_guest_details TO authenticated;

CREATE TABLE public.wedding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  due_date date,
  target_tab text NOT NULL DEFAULT 'calendar' CHECK (target_tab IN ('guests','calendar','updates','profile','moments')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wedding_tasks_date_idx ON public.wedding_tasks(wedding_id, due_date);
ALTER TABLE public.wedding_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage wedding tasks" ON public.wedding_tasks FOR ALL TO authenticated
USING (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_tasks TO authenticated;

-- Create inbox entries atomically with the event, independent of device permission.
CREATE OR REPLACE FUNCTION public.populate_guest_inbox() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE w public.weddings%ROWTYPE;
BEGIN
  IF NEW.event_type NOT IN ('rsvp_reminder', 'wedding_update') THEN RETURN NEW; END IF;
  SELECT * INTO w FROM public.weddings WHERE id = NEW.wedding_id FOR UPDATE;
  IF NOT w.published THEN RAISE EXCEPTION 'Publish your wedding before sending guest updates'; END IF;
  INSERT INTO public.in_app_notifications(wedding_id, recipient_type, recipient_rsvp_id, notification_event_id, category, title, body, target_url)
  SELECT NEW.wedding_id, 'guest', r.id, NEW.id, NEW.event_type,
    CASE WHEN NEW.event_type = 'rsvp_reminder' THEN 'A reminder from ' || w.couple_names ELSE 'An update from ' || w.couple_names END,
    CASE WHEN NEW.event_type = 'rsvp_reminder' THEN 'Please let us know whether you can celebrate with us.' ELSE left(coalesce(NEW.payload->>'message', 'Your wedding has a new update.'), 2000) END,
    '/wedding/' || w.slug || CASE WHEN NEW.event_type = 'rsvp_reminder' THEN '?view=rsvp' ELSE '?view=updates' END
  FROM public.rsvps r WHERE r.wedding_id = NEW.wedding_id
    AND (NEW.event_type <> 'rsvp_reminder' OR r.attending IS NULL)
    AND (NEW.payload->>'target_rsvp_id' IS NULL OR r.id = (NEW.payload->>'target_rsvp_id')::uuid)
    AND (NEW.event_type <> 'rsvp_reminder' OR NOT EXISTS (
      SELECT 1 FROM public.in_app_notifications old WHERE old.recipient_rsvp_id = r.id AND old.wedding_id = r.wedding_id
        AND old.category = 'rsvp_reminder' AND old.created_at > now() - interval '24 hours'))
  ON CONFLICT (notification_event_id, recipient_rsvp_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.populate_guest_inbox() FROM PUBLIC;
CREATE TRIGGER populate_guest_inbox AFTER INSERT ON public.notification_events FOR EACH ROW EXECUTE FUNCTION public.populate_guest_inbox();

CREATE OR REPLACE FUNCTION public.queue_rsvp_reminder(p_wedding_id uuid, p_rsvp_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE event_id uuid; recipients integer;
BEGIN
  IF auth.uid() IS NULL OR NOT (public.is_wedding_member(p_wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)) THEN
    RAISE EXCEPTION 'Wedding access required' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.notification_events(wedding_id,event_type,actor_type,payload,priority)
    VALUES(p_wedding_id,'rsvp_reminder','couple',CASE WHEN p_rsvp_id IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('target_rsvp_id',p_rsvp_id) END,'high') RETURNING id INTO event_id;
  SELECT count(*) INTO recipients FROM public.in_app_notifications WHERE notification_event_id = event_id;
  RETURN jsonb_build_object('event_id',event_id,'recipients',recipients);
END;
$$;
REVOKE ALL ON FUNCTION public.queue_rsvp_reminder(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.queue_rsvp_reminder(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.announce_wedding_update() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.weddings WHERE id = NEW.wedding_id AND published) THEN
    INSERT INTO public.notification_events(wedding_id,event_type,actor_type,subject_id,payload)
      VALUES(NEW.wedding_id,'wedding_update','couple',NEW.id,jsonb_build_object('message',NEW.message));
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.announce_wedding_update() FROM PUBLIC;
CREATE TRIGGER announce_wedding_update AFTER INSERT ON public.wedding_updates FOR EACH ROW EXECUTE FUNCTION public.announce_wedding_update();

-- Lease events so overlapping cron runs do not both send the same batch.
ALTER TABLE public.notification_events ADD COLUMN claimed_at timestamptz;
ALTER TABLE public.notification_events DROP CONSTRAINT notification_events_status_check;
ALTER TABLE public.notification_events ADD CONSTRAINT notification_events_status_check CHECK (status IN ('pending','processing','processed','failed'));
CREATE OR REPLACE FUNCTION public.claim_notification_events() RETURNS SETOF public.notification_events
LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  UPDATE public.notification_events SET status = 'processing', claimed_at = now()
  WHERE id IN (SELECT id FROM public.notification_events WHERE status = 'pending' OR (status = 'processing' AND claimed_at < now() - interval '10 minutes')
    ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 10) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.claim_notification_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_notification_events() TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
