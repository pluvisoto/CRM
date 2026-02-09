-- Revert anonymous access for data import (Security Best Practice)
DROP POLICY IF EXISTS "Allow anon full access" ON financial_baseline;

-- Restore default secure policy (Read-only for authenticated, or whatever was default)
-- (The original create_business_plan_tables.sql defined specific policies)
-- This script just removes the wide-open anon policy.
