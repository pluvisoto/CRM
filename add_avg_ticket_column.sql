-- ==============================================
-- ADD MISSING COLUMN TO EXISTING TABLE
-- ==============================================
-- Run this to add avg_ticket column to dashboard_snapshots

ALTER TABLE public.dashboard_snapshots 
ADD COLUMN IF NOT EXISTS avg_ticket numeric default 0;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'dashboard_snapshots'
ORDER BY ordinal_position;
