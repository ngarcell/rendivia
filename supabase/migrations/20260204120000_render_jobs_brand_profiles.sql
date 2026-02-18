-- Render jobs for programmatic templates
create table if not exists render_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  team_id uuid,
  template_id text not null,
  template_version text not null,
  input_data jsonb not null default '{}'::jsonb,
  input_props jsonb not null default '{}'::jsonb,
  brand_id uuid,
  status text not null default 'queued' check (status in ('queued','rendering','completed','failed')),
  output_url text,
  render_id text,
  render_error text,
  webhook_url text,
  webhook_secret text,
  webhook_status text,
  webhook_error text,
  duration_seconds numeric,
  resolution text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint render_jobs_user_or_team check (user_id is not null or team_id is not null)
);

create index if not exists render_jobs_user_id on render_jobs(user_id);
create index if not exists render_jobs_team_id on render_jobs(team_id);
create index if not exists render_jobs_status on render_jobs(status);
create index if not exists render_jobs_template_id on render_jobs(template_id);

-- Brand profiles for programmatic templates
create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  team_id uuid,
  name text not null,
  logo_url text,
  colors jsonb not null default '{}'::jsonb,
  font_family text,
  intro_text text,
  outro_text text,
  created_at timestamptz default now(),
  constraint brand_profiles_user_or_team check (user_id is not null or team_id is not null)
);

create index if not exists brand_profiles_user_id on brand_profiles(user_id);
create index if not exists brand_profiles_team_id on brand_profiles(team_id);
create index if not exists brand_profiles_name on brand_profiles(name);

-- Extend usage for render metrics
alter table usage add column if not exists render_seconds numeric not null default 0;
alter table usage add column if not exists render_pixels bigint not null default 0;
