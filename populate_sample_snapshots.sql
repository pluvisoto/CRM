-- ==============================================
-- POPULATE SAMPLE SNAPSHOTS FOR TESTING TRENDS
-- ==============================================
-- This script creates fake historical data for the last 3 months
-- so you can see the trend arrows (green/red/yellow) in action

-- ==============================================
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual auth.uid()
-- Get it by running: SELECT auth.uid();
-- Or use this query to auto-insert for current user
-- ==============================================

-- Snapshot 1: 3 months ago (bad month)
INSERT INTO public.dashboard_snapshots (
  user_id, 
  pipeline_id,
  snapshot_date, 
  scope,
  new_leads, 
  active_deals, 
  closed_deals, 
  lost_deals,
  total_revenue, 
  lost_revenue, 
  avg_ticket,
  forecast, 
  conversion_rate
) VALUES (
  auth.uid(), -- Auto-detects your user
  null, -- null = "all pipelines"
  date_trunc('month', current_date - interval '3 months')::date, -- 3 months ago
  'all',
  5,      -- new_leads
  8,      -- active_deals
  3,      -- closed_deals
  4,      -- lost_deals (high = bad)
  15000,  -- total_revenue (low)
  20000,  -- lost_revenue (high = bad)
  5000,   -- avg_ticket
  25000,  -- forecast
  30.0    -- conversion_rate (low)
)
ON CONFLICT DO NOTHING;

-- Snapshot 2: 2 months ago (average month)
INSERT INTO public.dashboard_snapshots (
  user_id, 
  pipeline_id,
  snapshot_date, 
  scope,
  new_leads, 
  active_deals, 
  closed_deals, 
  lost_deals,
  total_revenue, 
  lost_revenue, 
  avg_ticket,
  forecast, 
  conversion_rate
) VALUES (
  auth.uid(),
  null,
  date_trunc('month', current_date - interval '2 months')::date, -- 2 months ago
  'all',
  8,      -- new_leads (↑ better)
  12,     -- active_deals (↑ better)
  5,      -- closed_deals (↑ better)
  3,      -- lost_deals (↓ better - less losses!)
  25000,  -- total_revenue (↑ better)
  15000,  -- lost_revenue (↓ better - less losses!)
  5000,   -- avg_ticket (= same)
  35000,  -- forecast (↑ better)
  38.5    -- conversion_rate (↑ better)
)
ON CONFLICT DO NOTHING;

-- Snapshot 3: Last month (GREAT month!)
INSERT INTO public.dashboard_snapshots (
  user_id, 
  pipeline_id,
  snapshot_date, 
  scope,
  new_leads, 
  active_deals, 
  closed_deals, 
  lost_deals,
  total_revenue, 
  lost_revenue, 
  avg_ticket,
  forecast, 
  conversion_rate
) VALUES (
  auth.uid(),
  null,
  date_trunc('month', current_date - interval '1 month')::date, -- Last month
  'all',
  12,     -- new_leads (↑ better)
  18,     -- active_deals (↑ better)
  8,      -- closed_deals (↑ better)
  2,      -- lost_deals (↓ better - even less losses! GREEN ARROW!)
  40000,  -- total_revenue (↑ better)
  8000,   -- lost_revenue (↓ better - GREEN ARROW!)
  5000,   -- avg_ticket (= same - YELLOW ARROW)
  50000,  -- forecast (↑ better)
  50.0    -- conversion_rate (↑ better)
)
ON CONFLICT DO NOTHING;

-- ==============================================
-- VERIFY THE DATA WAS INSERTED
-- ==============================================
-- Run this query to check:
SELECT 
  snapshot_date,
  new_leads,
  total_revenue,
  lost_revenue,
  conversion_rate
FROM public.dashboard_snapshots
WHERE user_id = auth.uid()
ORDER BY snapshot_date DESC;

-- ==============================================
-- EXPECTED RESULTS WHEN YOU OPEN DASHBOARD:
-- ==============================================
-- If you select "Últimos 30 dias", it will compare with last month's snapshot
-- 
-- Assuming your CURRENT stats are better than last month:
-- ✅ Green Arrows (↑): New Leads, Revenue, Active Deals
-- ✅ Red Arrows (↓): Lost Revenue (GOOD! Less losses!)
-- ✅ Yellow Arrows (↔): Ticket Médio (if same value)
