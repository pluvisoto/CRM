-- Quick check: How many records were imported?
SELECT COUNT(*) as total_records FROM financial_baseline;

-- Show distribution by year
SELECT 
    DATE_PART('year', competencia) as ano,
    COUNT(*) as registros
FROM financial_baseline
GROUP BY DATE_PART('year', competencia)
ORDER BY ano;

-- Show HR-tagged records
SELECT 
    COUNT(*) as hr_records,
    COUNT(*) FILTER (WHERE future_module_hr = false) as regular_records
FROM financial_baseline;

-- Sample data check
SELECT 
    competencia,
    categoria,
    subcategoria,
    valor_planejado,
    tipo_custo,
    future_module_hr
FROM financial_baseline
ORDER BY competencia
LIMIT 10;
