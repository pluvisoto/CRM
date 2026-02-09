-- CLEANUP SCRIPT FOR PRODUCTION READINESS
-- Removes all simulated data

BEGIN;

-- 1. Finance Tables (Child tables first)
DELETE FROM finance_transactions;
DELETE FROM finance_snapshots;

-- 2. CRM Tables
DELETE FROM central_vendas WHERE created_at > '2025-01-01'; -- Safety filter, though user asked for ALL simulated data. 
-- Ideally we delete everything if it's all simulated.
-- Assuming all current data is simulated/test data based on user request.
DELETE FROM central_vendas;

-- 3. Reset Sequences if needed (optional)
-- ALTER SEQUENCE central_vendas_id_seq RESTART WITH 1;

COMMIT;
