-- Plans (reference; app uses src/lib/plans.ts)
create table if not exists plans (
  id text primary key check (id in ('starter','pro','team','enterprise')),
  name text not null,
  created_at timestamptz default now()
);
insert into plans (id, name) values
  ('starter', 'Starter'),
  ('pro', 'Pro'),
  ('team', 'Team'),
  ('enterprise', 'Enterprise')
on conflict (id) do nothing;

-- Subscriptions: which plan a user (or org) is on
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  team_id uuid,
  plan_id text not null references plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  current_period_start timestamptz not null default date_trunc('month', now()),
  current_period_end timestamptz not null default date_trunc('month', now()) + interval '1 month',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint sub_user_or_team check (user_id is not null or team_id is not null)
);
create index if not exists subscriptions_user_id on subscriptions(user_id);
create index if not exists subscriptions_team_id on subscriptions(team_id);
create index if not exists subscriptions_plan_id on subscriptions(plan_id);

-- Usage: per user/team per month
create table if not exists usage (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  team_id uuid,
  period_start date not null,
  period_end date not null,
  videos_count int not null default 0,
  api_calls_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint usage_user_or_team check (user_id is not null or team_id is not null),
  unique (user_id, team_id, period_start)
);
create index if not exists usage_user_period on usage(user_id, period_start);
create index if not exists usage_team_period on usage(team_id, period_start);

-- API keys (hashed)
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  team_id uuid,
  key_prefix text not null,
  key_hash text not null,
  name text,
  last_used_at timestamptz,
  created_at timestamptz default now(),
  constraint api_keys_user_or_team check (user_id is not null or team_id is not null)
);
create unique index if not exists api_keys_key_hash on api_keys(key_hash);
create index if not exists api_keys_user_id on api_keys(user_id);
create index if not exists api_keys_team_id on api_keys(team_id);

-- Teams (for Team / Enterprise)
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id text not null,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique (team_id, user_id)
);
create index if not exists team_members_team_id on team_members(team_id);
create index if not exists team_members_user_id on team_members(user_id);

-- Extend caption_jobs for pipeline options
alter table caption_jobs add column if not exists options jsonb default '{}';
alter table caption_jobs add column if not exists plan_id text;
alter table caption_jobs add column if not exists team_id uuid;
