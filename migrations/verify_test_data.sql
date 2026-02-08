-- Verify test data was inserted
SELECT 
    competencia,
    categoria,
    valor_planejado,
    tipo_custo
FROM financial_baseline
ORDER BY competencia, categoria;

-- Count by month
SELECT 
    competencia,
    COUNT(*) as categorias,
    SUM(valor_planejado) as total
FROM financial_baseline
GROUP BY competencia
ORDER BY competencia;
