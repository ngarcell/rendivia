-- Caption editor + Lambda fields
alter table caption_jobs add column if not exists edits jsonb default '{}'::jsonb;
alter table caption_jobs add column if not exists aspect_ratio text check (aspect_ratio in ('9:16','1:1','16:9')) default '9:16';
alter table caption_jobs add column if not exists render_id text;
alter table caption_jobs add column if not exists render_status text check (render_status in ('queued','rendering','completed','failed'));
alter table caption_jobs add column if not exists render_error text;
alter table caption_jobs add column if not exists rendered_at timestamptz;
alter table caption_jobs add column if not exists suggested_cuts jsonb;

create index if not exists caption_jobs_render_status on caption_jobs(render_status);

-- Brand presets
create table if not exists brand_presets (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  team_id uuid,
  name text not null,
  style_json jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  constraint brand_presets_user_or_team check (user_id is not null or team_id is not null)
);
create index if not exists brand_presets_user_id on brand_presets(user_id);
create index if not exists brand_presets_team_id on brand_presets(team_id);

-- Usage: track renders separately
alter table usage add column if not exists renders_count int not null default 0;
