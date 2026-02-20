alter table if exists public.early_access_requests
  add column if not exists landing_path text,
  add column if not exists cluster text,
  add column if not exists intent_slug text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists referrer text;

create index if not exists early_access_requests_cluster_idx
  on public.early_access_requests (cluster);

create index if not exists early_access_requests_intent_slug_idx
  on public.early_access_requests (intent_slug);
