-- Create dashboard_snapshots table for historical KPI tracking
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

-- Create index for faster queries
create index if not exists idx_snapshots_date on public.dashboard_snapshots(snapshot_date desc);
create index if not exists idx_snapshots_user on public.dashboard_snapshots(user_id, snapshot_date desc);
create index if not exists idx_snapshots_pipeline on public.dashboard_snapshots(pipeline_id, snapshot_date desc);

-- RLS Policies
alter table public.dashboard_snapshots enable row level security;

-- Users can read their own snapshots + admins can read all
create policy "Users read own snapshots" on public.dashboard_snapshots for select using (
  auth.uid() = user_id or 
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- Only admins or the user can insert snapshots
create policy "Users insert own snapshots" on public.dashboard_snapshots for insert with check (
  auth.uid() = user_id
);

-- Comment: To populate initial data, run a manual INSERT with last month's date
-- Example:
-- INSERT INTO public.dashboard_snapshots (user_id, snapshot_date, new_leads, active_deals, closed_deals, lost_deals, total_revenue, lost_revenue, forecast, conversion_rate, scope)
-- VALUES (auth.uid(), (current_date - interval '1 month'), 10, 5, 3, 2, 15000, 5000, 25000, 30, 'all');
