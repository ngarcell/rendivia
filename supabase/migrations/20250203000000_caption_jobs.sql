create table if not exists caption_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  video_url text not null,
  output_url text,
  status text not null default 'pending' check (status in ('pending','transcribing','rendering','completed','failed')),
  segments jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists caption_jobs_user_id on caption_jobs(user_id);
create index if not exists caption_jobs_status on caption_jobs(status);
