-- Add wallet_id column to accounts_receivable
ALTER TABLE public.accounts_receivable 
ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES public.wallets(id);

-- Add wallet_id column to accounts_payable
ALTER TABLE public.accounts_payable 
ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES public.wallets(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_receivable_wallet ON public.accounts_receivable(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payable_wallet ON public.accounts_payable(wallet_id);
