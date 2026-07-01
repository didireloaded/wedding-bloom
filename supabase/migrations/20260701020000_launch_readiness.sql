-- ForeverVow Launch Readiness & Observability Schema
-- Platform monitoring, health logs, and data governance export archives.

CREATE TABLE IF NOT EXISTS public.platform_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  export_type TEXT DEFAULT 'archive',
  status TEXT DEFAULT 'completed',
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_health_logs_created_at ON public.platform_health_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_data_exports_wedding_id ON public.data_exports(wedding_id);

ALTER TABLE public.platform_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admin read health logs" ON public.platform_health_logs FOR SELECT USING (true);
CREATE POLICY "Platform admin insert health logs" ON public.platform_health_logs FOR ALL USING (true);

CREATE POLICY "Platform read data exports" ON public.data_exports FOR SELECT USING (true);
CREATE POLICY "Platform insert data exports" ON public.data_exports FOR ALL USING (true);
