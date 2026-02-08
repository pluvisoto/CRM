
-- Verify Data for Diagnosis

-- 1. Monthly Breakdown for Q1 2026 to check for shifting
SELECT 
    competencia,
    categoria,
    valor_planejado
FROM financial_baseline
WHERE competencia IN ('2026-01-01', '2026-02-01', '2026-03-01')
  AND categoria = 'Receita Total'
ORDER BY competencia;

-- 2. Yearly Total for 2026 (Check "10x" claim)
SELECT 
    EXTRACT(YEAR FROM competencia) as ano,
    categoria,
    SUM(valor_planejado) as total_anual
FROM financial_baseline
WHERE competencia BETWEEN '2026-01-01' AND '2026-12-31'
  AND categoria = 'Receita Total'
GROUP BY ano, categoria;

-- 3. Check "Percentage" values to see how they stored
SELECT * FROM financial_baseline 
WHERE categoria LIKE '%(%)%' 
   OR categoria ILIKE '%margem%'
LIMIT 5;

-- 4. Check "Unit" values (Usuários)
SELECT * FROM financial_baseline 
WHERE categoria ILIKE '%usuários%'
LIMIT 5;
