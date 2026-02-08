-- Check Jan 2026 data specifically
SELECT 
    categoria, 
    valor_planejado 
FROM financial_baseline 
WHERE competencia = '2026-01-01'
ORDER BY valor_planejado DESC;
