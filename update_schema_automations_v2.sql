-- Add columns for Fixed Amount support
ALTER TABLE finance_automation_rules 
ADD COLUMN IF NOT EXISTS calculation_type TEXT DEFAULT 'percent', -- 'percent' or 'fixed'
ADD COLUMN IF NOT EXISTS fixed_amount DECIMAL(10, 2) DEFAULT 0;

-- Optional: Rename percentage to generic 'value' if we wanted, but keeping both is safer for migration.
