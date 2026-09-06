BEGIN;
CREATE TABLE public.wedding_budgets (
  wedding_id uuid PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
  planned_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (planned_amount >= 0),
  currency text NOT NULL DEFAULT 'NAD' CHECK (length(currency) BETWEEN 3 AND 3),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.wedding_budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (length(trim(category)) BETWEEN 1 AND 100),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  spent_on date NOT NULL DEFAULT current_date,
  notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 2000),
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wedding_budget_entries_idx ON public.wedding_budget_entries(wedding_id, spent_on DESC);
ALTER TABLE public.wedding_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_budget_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage wedding budgets" ON public.wedding_budgets FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Members manage budget entries" ON public.wedding_budget_entries FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_budgets, public.wedding_budget_entries TO authenticated;
COMMIT;
