-- Create wedding_reports table for daily AI summaries
CREATE TABLE public.wedding_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  report_date date NOT NULL,
  report_text text NOT NULL,
  highlights jsonb DEFAULT '[]'::jsonb,
  action_items jsonb DEFAULT '[]'::jsonb,
  stats jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(wedding_id, report_date)
);

-- Enable RLS
ALTER TABLE public.wedding_reports ENABLE ROW LEVEL SECURITY;

-- Admins can manage reports
CREATE POLICY "Admins can manage wedding reports"
  ON public.wedding_reports
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view reports for published weddings (couples access via access code)
CREATE POLICY "Public can view reports for published weddings"
  ON public.wedding_reports
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM weddings w WHERE w.id = wedding_reports.wedding_id AND w.published = true
  ));

-- Allow inserts from service role (for cron job)
CREATE POLICY "Service role can insert reports"
  ON public.wedding_reports
  FOR INSERT
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX wedding_reports_wedding_date_idx ON public.wedding_reports(wedding_id, report_date DESC);