-- Add is_recurring column to accounts_receivable
ALTER TABLE public.accounts_receivable
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Add is_recurring column to accounts_payable
ALTER TABLE public.accounts_payable
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
