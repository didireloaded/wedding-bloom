
-- Fix weddings
DROP POLICY IF EXISTS "Anyone can look up wedding by access code" ON public.weddings;
DROP POLICY IF EXISTS "Admins can manage weddings" ON public.weddings;
CREATE POLICY "Public can view published weddings" ON public.weddings FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage weddings" ON public.weddings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix events
DROP POLICY IF EXISTS "Public can view events for published weddings" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Public can view events for published weddings" ON public.events FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = events.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix vendors
DROP POLICY IF EXISTS "Public can view vendors for published weddings" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage vendors" ON public.vendors;
CREATE POLICY "Public can view vendors for published weddings" ON public.vendors FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = vendors.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage vendors" ON public.vendors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix gallery
DROP POLICY IF EXISTS "Public can view gallery for published weddings" ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can add gallery images" ON public.gallery;
CREATE POLICY "Public can view gallery for published weddings" ON public.gallery FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = gallery.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can add gallery images" ON public.gallery FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM weddings w WHERE w.id = gallery.wedding_id));

-- Fix wedding_updates
DROP POLICY IF EXISTS "Public can view updates for published weddings" ON public.wedding_updates;
DROP POLICY IF EXISTS "Admins can manage updates" ON public.wedding_updates;
CREATE POLICY "Public can view updates for published weddings" ON public.wedding_updates FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = wedding_updates.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage updates" ON public.wedding_updates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix accommodations
DROP POLICY IF EXISTS "Public can view accommodations for published weddings" ON public.accommodations;
DROP POLICY IF EXISTS "Admins can manage accommodations" ON public.accommodations;
CREATE POLICY "Public can view accommodations for published weddings" ON public.accommodations FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = accommodations.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage accommodations" ON public.accommodations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix registries
DROP POLICY IF EXISTS "Public can view registries for published weddings" ON public.registries;
DROP POLICY IF EXISTS "Admins can manage registries" ON public.registries;
CREATE POLICY "Public can view registries for published weddings" ON public.registries FOR SELECT USING (EXISTS (SELECT 1 FROM weddings w WHERE w.id = registries.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage registries" ON public.registries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix rsvps
DROP POLICY IF EXISTS "Anyone can insert RSVP for published weddings" ON public.rsvps;
DROP POLICY IF EXISTS "Admins can manage RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Public can view RSVPs" ON public.rsvps;
CREATE POLICY "Anyone can insert RSVP for published weddings" ON public.rsvps FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM weddings w WHERE w.id = rsvps.wedding_id AND w.published = true));
CREATE POLICY "Admins can manage RSVPs" ON public.rsvps FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view RSVPs" ON public.rsvps FOR SELECT USING (true);

-- Fix guests
DROP POLICY IF EXISTS "Public can view guests" ON public.guests;
DROP POLICY IF EXISTS "Admins can manage guests" ON public.guests;
CREATE POLICY "Public can view guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Admins can manage guests" ON public.guests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- Fix user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
