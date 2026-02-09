
-- Adiciona coluna deal_id para rastrear origem do CRM
ALTER TABLE public.accounts_receivable ADD COLUMN IF NOT EXISTS deal_id UUID;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS deal_id UUID;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_deal_id ON public.accounts_receivable(deal_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_deal_id ON public.accounts_payable(deal_id);
