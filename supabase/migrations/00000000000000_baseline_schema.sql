-- Baseline schema for ForeverVow
-- Captured from live database on 2026-07-01
-- This is a snapshot of the current production schema; do not re-run against
-- an existing database. New changes go in later timestamped migrations.

--
-- PostgreSQL database dump
--

\restrict fM44vtRybUDPnVwW7nlrBypgn3tAdE9dH0oCjdTfYAH9qFsS2YFbFbScrswE4VG

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user',
    'vendor'
);


--
-- Name: auto_approve_moment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_approve_moment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF (SELECT live_mode FROM public.weddings WHERE id = NEW.wedding_id) THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: increment_page_view(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_page_view(p_wedding_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.wedding_analytics (wedding_id, page_views)
  VALUES (p_wedding_id, 1)
  ON CONFLICT (wedding_id)
  DO UPDATE SET page_views = wedding_analytics.page_views + 1;
END;
$$;


--
-- Name: increment_qr_scan(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_qr_scan(p_wedding_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.wedding_analytics (wedding_id, qr_scans)
  VALUES (p_wedding_id, 1)
  ON CONFLICT (wedding_id)
  DO UPDATE SET qr_scans = wedding_analytics.qr_scans + 1;
END;
$$;


--
-- Name: regenerate_access_code(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.regenerate_access_code(wedding_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := substring(md5(random()::text), 1, 8);
  UPDATE public.weddings SET access_code = new_code WHERE id = wedding_id;
  RETURN new_code;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accommodations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    items text[] DEFAULT '{}'::text[] NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checkins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    guest_name text NOT NULL,
    checkin_time timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    title text NOT NULL,
    event_date date,
    event_time text,
    location text,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    image_url text NOT NULL,
    uploaded_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: guest_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    image_url text NOT NULL,
    guest_name text,
    approved boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: guestbook; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guestbook (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    guest_name text NOT NULL,
    message text NOT NULL,
    photo_url text,
    approved boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    invited_guests integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: live_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.live_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    message text NOT NULL,
    update_type text DEFAULT 'info'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: moment_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moment_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    moment_id uuid NOT NULL,
    reaction_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT moment_reactions_reaction_type_check CHECK ((reaction_type = ANY (ARRAY['heart'::text, 'applause'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: registries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: rsvps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rsvps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    guest_name text NOT NULL,
    email text,
    phone text,
    attending boolean,
    guest_count integer DEFAULT 1 NOT NULL,
    message text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    dietary_preference text,
    dietary_note text
);


--
-- Name: seating_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seating_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_id uuid NOT NULL,
    guest_name text NOT NULL,
    rsvp_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: seating_tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seating_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    table_name text NOT NULL,
    capacity integer DEFAULT 8 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: themes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    primary_color text NOT NULL,
    secondary_color text NOT NULL,
    accent_color text NOT NULL,
    background_color text DEFAULT '30 30% 96%'::text NOT NULL,
    foreground_color text DEFAULT '0 0% 10%'::text NOT NULL,
    font_display text DEFAULT 'Cormorant Garamond'::text NOT NULL,
    font_body text DEFAULT 'Josefin Sans'::text NOT NULL,
    generated_by_ai boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    vendor_name text NOT NULL,
    category text NOT NULL,
    logo text,
    website text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wedding_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    page_views integer DEFAULT 0 NOT NULL,
    qr_scans integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wedding_moments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_moments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    guest_name text NOT NULL,
    message text,
    photo_url text,
    approved boolean DEFAULT false NOT NULL,
    highlighted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT message_or_photo CHECK (((message IS NOT NULL) OR (photo_url IS NOT NULL)))
);


--
-- Name: wedding_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    report_date date NOT NULL,
    report_text text NOT NULL,
    highlights jsonb DEFAULT '[]'::jsonb,
    action_items jsonb DEFAULT '[]'::jsonb,
    stats jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wedding_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wedding_id uuid NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: weddings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weddings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_user_id uuid NOT NULL,
    couple_names text NOT NULL,
    slug text NOT NULL,
    wedding_date date,
    ceremony_venue text,
    ceremony_time text,
    reception_venue text,
    reception_time text,
    story text,
    cover_image text,
    dress_code text,
    access_code text DEFAULT "substring"(md5((random())::text), 1, 8) NOT NULL,
    published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    live_mode boolean DEFAULT false NOT NULL,
    theme jsonb,
    wedding_style text,
    rsvp_deadline date,
    whatsapp_group_url text,
    max_guests integer,
    contact_email text,
    theme_id uuid,
    dashboard_tour_completed boolean DEFAULT false NOT NULL,
    story_image text,
    rsvp_image text,
    cover_focal_point text DEFAULT 'center center'::text,
    story_focal_point text DEFAULT 'center center'::text,
    rsvp_focal_point text DEFAULT 'center center'::text
);


--
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- Name: checkins checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: gallery gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_pkey PRIMARY KEY (id);


--
-- Name: guest_photos guest_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_photos
    ADD CONSTRAINT guest_photos_pkey PRIMARY KEY (id);


--
-- Name: guestbook guestbook_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guestbook
    ADD CONSTRAINT guestbook_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: live_updates live_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.live_updates
    ADD CONSTRAINT live_updates_pkey PRIMARY KEY (id);


--
-- Name: moment_reactions moment_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_reactions
    ADD CONSTRAINT moment_reactions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: registries registries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registries
    ADD CONSTRAINT registries_pkey PRIMARY KEY (id);


--
-- Name: rsvps rsvps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_pkey PRIMARY KEY (id);


--
-- Name: seating_assignments seating_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_pkey PRIMARY KEY (id);


--
-- Name: seating_tables seating_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_tables
    ADD CONSTRAINT seating_tables_pkey PRIMARY KEY (id);


--
-- Name: themes themes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_name_key UNIQUE (name);


--
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wedding_analytics wedding_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_analytics
    ADD CONSTRAINT wedding_analytics_pkey PRIMARY KEY (id);


--
-- Name: wedding_analytics wedding_analytics_wedding_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_analytics
    ADD CONSTRAINT wedding_analytics_wedding_id_key UNIQUE (wedding_id);


--
-- Name: wedding_moments wedding_moments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_moments
    ADD CONSTRAINT wedding_moments_pkey PRIMARY KEY (id);


--
-- Name: wedding_reports wedding_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_reports
    ADD CONSTRAINT wedding_reports_pkey PRIMARY KEY (id);


--
-- Name: wedding_reports wedding_reports_wedding_id_report_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_reports
    ADD CONSTRAINT wedding_reports_wedding_id_report_date_key UNIQUE (wedding_id, report_date);


--
-- Name: wedding_updates wedding_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_updates
    ADD CONSTRAINT wedding_updates_pkey PRIMARY KEY (id);


--
-- Name: weddings weddings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weddings
    ADD CONSTRAINT weddings_pkey PRIMARY KEY (id);


--
-- Name: weddings weddings_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weddings
    ADD CONSTRAINT weddings_slug_key UNIQUE (slug);


--
-- Name: idx_accommodations_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accommodations_wedding_id ON public.accommodations USING btree (wedding_id);


--
-- Name: idx_checkins_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checkins_wedding_id ON public.checkins USING btree (wedding_id);


--
-- Name: idx_events_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_wedding_id ON public.events USING btree (wedding_id, sort_order);


--
-- Name: idx_gallery_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_wedding_id ON public.gallery USING btree (wedding_id, created_at DESC);


--
-- Name: idx_guest_photos_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_photos_wedding_id ON public.guest_photos USING btree (wedding_id, approved);


--
-- Name: idx_guestbook_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guestbook_wedding_id ON public.guestbook USING btree (wedding_id, approved, created_at DESC);


--
-- Name: idx_rsvps_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsvps_wedding_id ON public.rsvps USING btree (wedding_id);


--
-- Name: idx_wedding_updates_wedding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wedding_updates_wedding_id ON public.wedding_updates USING btree (wedding_id, created_at DESC);


--
-- Name: idx_weddings_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weddings_slug ON public.weddings USING btree (slug);


--
-- Name: idx_weddings_slug_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weddings_slug_published ON public.weddings USING btree (slug, published);


--
-- Name: moment_reactions_moment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moment_reactions_moment_idx ON public.moment_reactions USING btree (moment_id);


--
-- Name: wedding_moments_wedding_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wedding_moments_wedding_created_idx ON public.wedding_moments USING btree (wedding_id, created_at DESC);


--
-- Name: wedding_reports_wedding_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wedding_reports_wedding_date_idx ON public.wedding_reports USING btree (wedding_id, report_date DESC);


--
-- Name: weddings_slug_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX weddings_slug_unique ON public.weddings USING btree (slug);


--
-- Name: wedding_moments on_moment_inserted; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_moment_inserted BEFORE INSERT ON public.wedding_moments FOR EACH ROW EXECUTE FUNCTION public.auto_approve_moment();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weddings update_weddings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON public.weddings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: accommodations accommodations_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: checkins checkins_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: events events_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: gallery gallery_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: guest_photos guest_photos_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_photos
    ADD CONSTRAINT guest_photos_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: guestbook guestbook_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guestbook
    ADD CONSTRAINT guestbook_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: guests guests_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: live_updates live_updates_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.live_updates
    ADD CONSTRAINT live_updates_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: moment_reactions moment_reactions_moment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_reactions
    ADD CONSTRAINT moment_reactions_moment_id_fkey FOREIGN KEY (moment_id) REFERENCES public.wedding_moments(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: registries registries_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registries
    ADD CONSTRAINT registries_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: rsvps rsvps_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: seating_assignments seating_assignments_rsvp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_rsvp_id_fkey FOREIGN KEY (rsvp_id) REFERENCES public.rsvps(id) ON DELETE SET NULL;


--
-- Name: seating_assignments seating_assignments_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.seating_tables(id) ON DELETE CASCADE;


--
-- Name: seating_tables seating_tables_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_tables
    ADD CONSTRAINT seating_tables_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: wedding_analytics wedding_analytics_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_analytics
    ADD CONSTRAINT wedding_analytics_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: wedding_moments wedding_moments_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_moments
    ADD CONSTRAINT wedding_moments_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: wedding_reports wedding_reports_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_reports
    ADD CONSTRAINT wedding_reports_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: wedding_updates wedding_updates_wedding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_updates
    ADD CONSTRAINT wedding_updates_wedding_id_fkey FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;


--
-- Name: weddings weddings_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weddings
    ADD CONSTRAINT weddings_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON DELETE SET NULL;


--
-- Name: rsvps Admins can manage RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage RSVPs" ON public.rsvps USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: accommodations Admins can manage accommodations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage accommodations" ON public.accommodations USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_analytics Admins can manage analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage analytics" ON public.wedding_analytics USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: checkins Admins can manage checkins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage checkins" ON public.checkins USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: events Admins can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage events" ON public.events USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: gallery Admins can manage gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage gallery" ON public.gallery USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: guest_photos Admins can manage guest photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage guest photos" ON public.guest_photos USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: guestbook Admins can manage guestbook; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage guestbook" ON public.guestbook USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: guests Admins can manage guests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage guests" ON public.guests USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: live_updates Admins can manage live updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage live updates" ON public.live_updates USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_moments Admins can manage moments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage moments" ON public.wedding_moments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: registries Admins can manage registries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage registries" ON public.registries USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seating_assignments Admins can manage seating assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage seating assignments" ON public.seating_assignments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seating_tables Admins can manage seating tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage seating tables" ON public.seating_tables USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: themes Admins can manage themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage themes" ON public.themes USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_updates Admins can manage updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage updates" ON public.wedding_updates USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendors Admins can manage vendors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage vendors" ON public.vendors USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_reports Admins can manage wedding reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage wedding reports" ON public.wedding_reports USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: weddings Admins can manage weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage weddings" ON public.weddings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: gallery Anyone can add gallery images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can add gallery images" ON public.gallery FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE (w.id = gallery.wedding_id))));


--
-- Name: rsvps Anyone can insert RSVP for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert RSVP for published weddings" ON public.rsvps FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = rsvps.wedding_id) AND (w.published = true)))));


--
-- Name: wedding_analytics Anyone can insert analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert analytics" ON public.wedding_analytics FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = wedding_analytics.wedding_id) AND (w.published = true)))));


--
-- Name: checkins Anyone can insert checkin for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert checkin for published weddings" ON public.checkins FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = checkins.wedding_id) AND (w.published = true)))));


--
-- Name: guestbook Anyone can insert guestbook for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert guestbook for published weddings" ON public.guestbook FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = guestbook.wedding_id) AND (w.published = true)))));


--
-- Name: moment_reactions Anyone can react; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can react" ON public.moment_reactions FOR INSERT WITH CHECK (true);


--
-- Name: moment_reactions Anyone can read reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read reactions" ON public.moment_reactions FOR SELECT USING (true);


--
-- Name: wedding_analytics Anyone can update analytics counters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update analytics counters" ON public.wedding_analytics FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = wedding_analytics.wedding_id) AND (w.published = true)))));


--
-- Name: guest_photos Anyone can upload guest photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can upload guest photos" ON public.guest_photos FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = guest_photos.wedding_id) AND (w.published = true)))));


--
-- Name: wedding_moments Guests can post moments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Guests can post moments" ON public.wedding_moments FOR INSERT WITH CHECK (true);


--
-- Name: wedding_moments Public can read approved moments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read approved moments" ON public.wedding_moments FOR SELECT USING (((approved = true) AND (EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = wedding_moments.wedding_id) AND (w.published = true))))));


--
-- Name: rsvps Public can view RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view RSVPs" ON public.rsvps FOR SELECT USING (true);


--
-- Name: accommodations Public can view accommodations for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view accommodations for published weddings" ON public.accommodations FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = accommodations.wedding_id) AND (w.published = true)))));


--
-- Name: wedding_analytics Public can view analytics for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view analytics for published weddings" ON public.wedding_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = wedding_analytics.wedding_id) AND (w.published = true)))));


--
-- Name: guest_photos Public can view approved guest photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view approved guest photos" ON public.guest_photos FOR SELECT USING (((approved = true) AND (EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = guest_photos.wedding_id) AND (w.published = true))))));


--
-- Name: checkins Public can view checkins for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view checkins for published weddings" ON public.checkins FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = checkins.wedding_id) AND (w.published = true)))));


--
-- Name: events Public can view events for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view events for published weddings" ON public.events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = events.wedding_id) AND (w.published = true)))));


--
-- Name: gallery Public can view gallery for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view gallery for published weddings" ON public.gallery FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = gallery.wedding_id) AND (w.published = true)))));


--
-- Name: guestbook Public can view guestbook for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view guestbook for published weddings" ON public.guestbook FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = guestbook.wedding_id) AND (w.published = true)))));


--
-- Name: guests Public can view guests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view guests" ON public.guests FOR SELECT USING (true);


--
-- Name: live_updates Public can view live updates for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view live updates for published weddings" ON public.live_updates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = live_updates.wedding_id) AND (w.published = true)))));


--
-- Name: weddings Public can view published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published weddings" ON public.weddings FOR SELECT USING ((published = true));


--
-- Name: registries Public can view registries for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view registries for published weddings" ON public.registries FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = registries.wedding_id) AND (w.published = true)))));


--
-- Name: wedding_reports Public can view reports for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view reports for published weddings" ON public.wedding_reports FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = wedding_reports.wedding_id) AND (w.published = true)))));


--
-- Name: seating_assignments Public can view seating assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view seating assignments" ON public.seating_assignments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.seating_tables st
     JOIN public.weddings w ON ((w.id = st.wedding_id)))
  WHERE ((st.id = seating_assignments.table_id) AND (w.published = true)))));


--
-- Name: seating_tables Public can view seating for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view seating for published weddings" ON public.seating_tables FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = seating_tables.wedding_id) AND (w.published = true)))));


--
-- Name: themes Public can view themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view themes" ON public.themes FOR SELECT USING (true);


--
-- Name: wedding_updates Public can view updates for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view updates for published weddings" ON public.wedding_updates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = wedding_updates.wedding_id) AND (w.published = true)))));


--
-- Name: vendors Public can view vendors for published weddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view vendors for published weddings" ON public.vendors FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.weddings w
  WHERE ((w.id = vendors.wedding_id) AND (w.published = true)))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: accommodations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

--
-- Name: checkins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: guestbook; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

--
-- Name: guests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

--
-- Name: live_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: moment_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.moment_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: registries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.registries ENABLE ROW LEVEL SECURITY;

--
-- Name: rsvps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

--
-- Name: seating_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: seating_tables; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: themes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: vendors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

--
-- Name: wedding_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wedding_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: wedding_moments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wedding_moments ENABLE ROW LEVEL SECURITY;

--
-- Name: wedding_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wedding_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: wedding_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wedding_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: weddings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict fM44vtRybUDPnVwW7nlrBypgn3tAdE9dH0oCjdTfYAH9qFsS2YFbFbScrswE4VG


-- Grants

