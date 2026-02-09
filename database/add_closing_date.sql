-- Add data_fechamento column to central_vendas for precise accounting
ALTER TABLE public.central_vendas 
ADD COLUMN IF NOT EXISTS data_fechamento TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.central_vendas.data_fechamento IS 'Date when the deal was won or lost. Used for dashboard accounting.';

-- Create index for performance on date filtering
CREATE INDEX IF NOT EXISTS idx_central_vendas_data_fechamento ON public.central_vendas(data_fechamento);
