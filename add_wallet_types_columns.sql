-- Add Credit Card specific columns to wallets table
ALTER TABLE public.wallets
ADD COLUMN IF NOT EXISTS due_day INTEGER, -- Dia do Vencimento
ADD COLUMN IF NOT EXISTS closing_day INTEGER; -- Dia do Fechamento

-- Add comment to explain columns
COMMENT ON COLUMN public.wallets.due_day IS 'Day of the month the invoice is due (1-31)';
COMMENT ON COLUMN public.wallets.closing_day IS 'Day of the month the invoice closes (1-31)';
