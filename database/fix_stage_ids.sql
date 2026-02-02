-- FIX: Update central_vendas stage IDs to match real pipeline_stages IDs

DO $$
DECLARE
    -- Pipeline IDs
    inbound_pipeline_id UUID;
    outbound_pipeline_id UUID;
    
    -- Stage IDs (Inbound)
    inbound_lead_id VARCHAR;
    inbound_won_id VARCHAR;
    
    -- Stage IDs (Outbound)
    outbound_lead_id VARCHAR;
    outbound_won_id VARCHAR;
BEGIN
    -- 1. Get Pipeline IDs
    SELECT id INTO inbound_pipeline_id FROM pipelines WHERE name = 'Receptivo';
    SELECT id INTO outbound_pipeline_id FROM pipelines WHERE name = 'Ativo';

    -- 2. Get Stage IDs (using partial matching or position)
    -- Inbound: First and Last
    SELECT id INTO inbound_lead_id FROM pipeline_stages WHERE pipeline_id = inbound_pipeline_id ORDER BY position ASC LIMIT 1;
    SELECT id INTO inbound_won_id FROM pipeline_stages WHERE pipeline_id = inbound_pipeline_id ORDER BY position DESC LIMIT 1;

    -- Outbound: First and Last
    SELECT id INTO outbound_lead_id FROM pipeline_stages WHERE pipeline_id = outbound_pipeline_id ORDER BY position ASC LIMIT 1;
    SELECT id INTO outbound_won_id FROM pipeline_stages WHERE pipeline_id = outbound_pipeline_id ORDER BY position DESC LIMIT 1;
    
    -- 3. Update 'central_vendas'
    
    -- Update Inbound 'Won' (receptivo_fechamento -> real ID)
    IF inbound_won_id IS NOT NULL THEN
        UPDATE central_vendas 
        SET stage = inbound_won_id 
        WHERE tipo_pipeline = 'Receptivo' AND (stage = 'receptivo_fechamento' OR stage = 'Ganho');
    END IF;

    -- Update Inbound 'New' (receptivo_lead, etc)
    IF inbound_lead_id IS NOT NULL THEN
         UPDATE central_vendas 
        SET stage = inbound_lead_id 
        WHERE tipo_pipeline = 'Receptivo' AND stage NOT IN (inbound_won_id, 'receptivo_fechamento', 'Ganho');
    END IF;

    -- Update Outbound 'Won'
    IF outbound_won_id IS NOT NULL THEN
        UPDATE central_vendas 
        SET stage = outbound_won_id 
        WHERE tipo_pipeline = 'Ativo_Diagnostico' AND (stage = 'ativo_fechamento' OR stage = 'Ganho');
    END IF;
    
    -- Update Outbound 'Active'
    IF outbound_lead_id IS NOT NULL THEN
        UPDATE central_vendas 
        SET stage = outbound_lead_id 
        WHERE tipo_pipeline = 'Ativo_Diagnostico' AND stage NOT IN (outbound_won_id, 'ativo_fechamento', 'Ganho');
    END IF;

END $$;
