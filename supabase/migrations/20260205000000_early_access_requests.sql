create table if not exists public.early_access_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  company text,
  role text,
  company_size text,
  use_case text,
  data_source text,
  timeline text,
  monthly_renders integer,
  cohort text,
  source text,
  created_at timestamptz not null default now()
);

create unique index if not exists early_access_requests_email_key
  on public.early_access_requests (email);
