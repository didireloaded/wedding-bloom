
-- ==========================================
-- ROLE ENUM & USER ROLES
-- ==========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- WEDDINGS TABLE
-- ==========================================
CREATE TABLE public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_names TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  wedding_date DATE,
  ceremony_venue TEXT,
  ceremony_time TEXT,
  reception_venue TEXT,
  reception_time TEXT,
  story TEXT,
  cover_image TEXT,
  dress_code TEXT,
  access_code TEXT NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

-- Public can read published weddings by slug
CREATE POLICY "Anyone can view published weddings" ON public.weddings
  FOR SELECT USING (published = true);

-- Admin can manage all weddings
CREATE POLICY "Admins can manage weddings" ON public.weddings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- EVENTS TABLE
-- ==========================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE,
  event_time TEXT,
  location TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view events for published weddings" ON public.events
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true));

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- GUESTS TABLE
-- ==========================================
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  invited_guests INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage guests" ON public.guests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RSVPS TABLE
-- ==========================================
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  attending BOOLEAN,
  guest_count INT NOT NULL DEFAULT 1,
  message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit RSVP
CREATE POLICY "Anyone can insert RSVP" ON public.rsvps
  FOR INSERT WITH CHECK (true);

-- Admins can view/manage RSVPs
CREATE POLICY "Admins can manage RSVPs" ON public.rsvps
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- VENDORS TABLE
-- ==========================================
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view vendors for published weddings" ON public.vendors
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true));

CREATE POLICY "Admins can manage vendors" ON public.vendors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- GALLERY TABLE
-- ==========================================
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery for published weddings" ON public.gallery
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true));

CREATE POLICY "Admins can manage gallery" ON public.gallery
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- WEDDING UPDATES TABLE
-- ==========================================
CREATE TABLE public.wedding_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wedding_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view updates for published weddings" ON public.wedding_updates
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true));

CREATE POLICY "Admins can manage updates" ON public.wedding_updates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- ACCOMMODATION TABLE
-- ==========================================
CREATE TABLE public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  items TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view accommodations for published weddings" ON public.accommodations
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true));

CREATE POLICY "Admins can manage accommodations" ON public.accommodations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- REGISTRIES TABLE
-- ==========================================
CREATE TABLE public.registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.registries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view registries for published weddings" ON public.registries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true));

CREATE POLICY "Admins can manage registries" ON public.registries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- STORAGE BUCKET
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-images', 'wedding-images', true);

CREATE POLICY "Anyone can view wedding images" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-images');

CREATE POLICY "Authenticated users can upload wedding images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wedding-images');

CREATE POLICY "Authenticated users can update wedding images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'wedding-images');

CREATE POLICY "Authenticated users can delete wedding images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'wedding-images');

-- ==========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_weddings_updated_at
  BEFORE UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
