-- ==============================================
-- DASHBOARD SNAPSHOTS TABLE (Safe Version)
-- Checks if exists before creating
-- ==============================================

-- Create table (skip if exists)
create table if not exists public.dashboard_snapshots (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  pipeline_id uuid references public.pipelines(id),
  snapshot_date date not null,
  
  -- KPI Metrics
  new_leads integer default 0,
  active_deals integer default 0,
  closed_deals integer default 0,
  lost_deals integer default 0,
  total_revenue numeric default 0,
  lost_revenue numeric default 0,
  avg_ticket numeric default 0,
  forecast numeric default 0,
  conversion_rate numeric default 0,
  
  -- Metadata
  scope text default 'all' -- 'all', 'team', 'personal'
);

-- Create indexes (skip if exists)
create index if not exists idx_snapshots_date on public.dashboard_snapshots(snapshot_date desc);
create index if not exists idx_snapshots_user on public.dashboard_snapshots(user_id, snapshot_date desc);
create index if not exists idx_snapshots_pipeline on public.dashboard_snapshots(pipeline_id, snapshot_date desc);

-- Enable RLS
alter table public.dashboard_snapshots enable row level security;

-- ==============================================
-- DROP OLD POLICIES (SAFE - ignore if not exist)
-- ==============================================
drop policy if exists "Users read own snapshots" on public.dashboard_snapshots;
drop policy if exists "Users insert own snapshots" on public.dashboard_snapshots;

-- ==============================================
-- CREATE NEW RLS POLICIES
-- ==============================================

-- Users can read their own snapshots + admins can read all
create policy "Users read own snapshots" on public.dashboard_snapshots for select using (
  auth.uid() = user_id or 
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- Only admins or the user can insert snapshots
create policy "Users insert own snapshots" on public.dashboard_snapshots for insert with check (
  auth.uid() = user_id
);

-- ==============================================
-- COMMENT
-- ==============================================
comment on table public.dashboard_snapshots is 'Stores monthly dashboard KPI snapshots for historical comparisons';

-- ==============================================
-- EXAMPLE: How to populate initial data
-- ==============================================
-- Uncomment and run AFTER the table is created:
/*
INSERT INTO public.dashboard_snapshots (
  user_id, snapshot_date, scope,
  new_leads, active_deals, closed_deals, lost_deals,
  total_revenue, lost_revenue, avg_ticket, forecast, conversion_rate
) VALUES (
  auth.uid(),
  '2025-12-01', -- December 2025 snapshot
  'all',
  10, 15, 8, 3,
  40000, 12000, 5000, 60000, 42.5
)
ON CONFLICT DO NOTHING; -- Prevents duplicates
*/
