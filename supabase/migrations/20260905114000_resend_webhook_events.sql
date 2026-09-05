create table if not exists public.resend_webhook_events (
  id uuid primary key default gen_random_uuid(),
  svix_id text not null unique,
  audience text not null check (audience in ('admin', 'couple')),
  event_type text not null,
  event_created_at timestamptz,
  email_id text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists resend_webhook_events_email_id_idx
  on public.resend_webhook_events (email_id)
  where email_id is not null;

create index if not exists resend_webhook_events_audience_received_at_idx
  on public.resend_webhook_events (audience, received_at desc);

alter table public.resend_webhook_events enable row level security;

comment on table public.resend_webhook_events is
  'Verified, deduplicated Resend delivery events. Accessible only through trusted server-side service-role code.';
