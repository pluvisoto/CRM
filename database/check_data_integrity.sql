-- DIAGNOSTIC SCRIPT
-- Run this to see what is actually inside the DB

-- 1. Check Pipelines
SELECT id, name FROM pipelines;

-- 2. Check Stages per Pipeline
SELECT p.name as pipeline_name, s.id as stage_id, s.name as stage_name, s.position 
FROM pipeline_stages s
JOIN pipelines p ON s.pipeline_id = p.id
ORDER BY p.name, s.position;

-- 3. Check Deals and their Stages
SELECT 
    d.id as deal_id, 
    d.empresa_cliente, 
    d.tipo_pipeline, 
    d.stage as deal_stage_id,
    s.name as matched_stage_name,
    p.name as matched_pipeline_name
FROM central_vendas d
LEFT JOIN pipeline_stages s ON d.stage = s.id
LEFT JOIN pipelines p ON s.pipeline_id = p.id;

-- 4. Count Deals per Stage ID
SELECT stage, count(*) 
FROM central_vendas 
GROUP BY stage;
