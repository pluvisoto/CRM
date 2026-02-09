-- Verify import results
SELECT COUNT(*) as total_records FROM financial_baseline;

-- Check distribution by year
SELECT 
    DATE_PART('year', competencia) as ano,
    COUNT(*) as registros,
    COUNT(DISTINCT categoria) as categorias_distintas
FROM financial_baseline
GROUP BY DATE_PART('year', competencia)
ORDER BY ano;

-- Check categories
SELECT 
    categoria,
    COUNT(*) as meses_com_dados,
    SUM(valor_planejado) as total_valores
FROM financial_baseline
GROUP BY categoria
ORDER BY total_valores DESC
LIMIT 15;

-- Check HR tagged records
SELECT 
    COUNT(*) FILTER (WHERE future_module_hr = true) as hr_records,
    COUNT(*) FILTER (WHERE future_module_hr = false) as regular_records
FROM financial_baseline;

-- Sample first few records
SELECT * FROM financial_baseline 
ORDER BY competencia, categoria 
LIMIT 10;
