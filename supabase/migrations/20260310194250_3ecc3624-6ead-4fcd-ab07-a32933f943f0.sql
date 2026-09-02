
-- Create themes table
CREATE TABLE public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  background_color text NOT NULL DEFAULT '30 30% 96%',
  foreground_color text NOT NULL DEFAULT '0 0% 10%',
  font_display text NOT NULL DEFAULT 'Cormorant Garamond',
  font_body text NOT NULL DEFAULT 'Josefin Sans',
  generated_by_ai boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Everyone can read themes
CREATE POLICY "Public can view themes" ON public.themes FOR SELECT TO public USING (true);

-- Admins can manage themes
CREATE POLICY "Admins can manage themes" ON public.themes FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Add theme_id to weddings
ALTER TABLE public.weddings ADD COLUMN theme_id uuid REFERENCES public.themes(id) ON DELETE SET NULL;

-- Seed default themes
INSERT INTO public.themes (name, primary_color, secondary_color, accent_color, background_color, foreground_color, font_display, font_body, generated_by_ai) VALUES
  ('Romantic floral', '340 60% 55%', '330 40% 45%', '350 70% 65%', '30 30% 96%', '340 20% 15%', 'Cormorant Garamond', 'Josefin Sans', false),
  ('Luxury black and gold', '45 80% 50%', '45 60% 35%', '0 0% 15%', '0 0% 5%', '45 50% 90%', 'Playfair Display', 'Montserrat', false),
  ('Modern minimal', '0 0% 20%', '0 0% 50%', '0 0% 70%', '0 0% 98%', '0 0% 10%', 'Inter', 'Inter', false),
  ('Classic white', '30 20% 60%', '30 15% 45%', '30 30% 75%', '30 30% 97%', '30 15% 15%', 'Cormorant Garamond', 'EB Garamond', false),
  ('Boho outdoor', '35 50% 45%', '140 25% 40%', '25 60% 55%', '40 30% 95%', '35 25% 15%', 'Amatic SC', 'Quicksand', false),
  ('Traditional African elegance', '15 70% 40%', '45 80% 50%', '0 65% 35%', '30 25% 94%', '15 30% 12%', 'Playfair Display', 'Lora', false),
  ('Garden party', '120 35% 45%', '150 30% 55%', '80 40% 60%', '100 25% 96%', '120 20% 15%', 'Cormorant Garamond', 'Quicksand', false),
  ('Art deco glamour', '45 70% 45%', '0 0% 15%', '45 50% 60%', '0 0% 8%', '45 50% 88%', 'Poiret One', 'Montserrat', false),
  ('Rustic charm', '25 40% 40%', '140 20% 35%', '30 50% 55%', '35 25% 94%', '25 25% 15%', 'Amatic SC', 'Lora', false),
  ('Coastal blue', '200 60% 50%', '190 40% 60%', '210 70% 40%', '200 25% 96%', '200 30% 12%', 'Cormorant Garamond', 'Josefin Sans', false);
