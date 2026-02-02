-- CHECK POST SIMULATION STATE
-- Vamos ver O QUE foi inserido na tabela central_vendas

-- 1. Pipelines
SELECT id, name FROM pipelines;

-- 2. Stages (Apenas para conferência dos IDs)
SELECT id, name, pipeline_id, position 
FROM pipeline_stages 
ORDER BY pipeline_id, position;

-- 3. Top 5 Deals Inseridos (Verificar coluna 'stage')
SELECT id, empresa_cliente, tipo_pipeline, stage, faturamento_mensal, created_at 
FROM central_vendas 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Contagem de Deals Agrupados por Stage
SELECT stage, count(*) 
FROM central_vendas 
GROUP BY stage;
