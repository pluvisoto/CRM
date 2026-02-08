-- Alterar a coluna valor_planejado para ter mais precisão decimal
-- De NUMERIC(10,2) para NUMERIC(15,6) para suportar valores como -5.060133

ALTER TABLE public.financial_baseline 
ALTER COLUMN valor_planejado TYPE NUMERIC(15,6);

-- Verificar o resultado
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'financial_baseline' 
AND column_name = 'valor_planejado';
