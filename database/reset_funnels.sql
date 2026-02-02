-- SCRIPT: RESET AND SEED FUNNELS
-- Apaga todas as vendas atuais e insere novas conectadas corretamente às etapas (stages) existentes.

BEGIN;

-- 1. Limpar tabela de vendas (apenas para o teste, remove TUDO)
TRUNCATE TABLE central_vendas CASCADE;

-- 2. Inserir dados frescos usando IDs dinâmicos
DO $$
DECLARE
    -- Pipeline Variables
    v_inbound_id UUID;
    v_outbound_id UUID;
    
    -- Stage Variables (IDs podem ser VARCHAR ou UUID)
    v_stage_inbound_new VARCHAR;
    v_stage_inbound_mid VARCHAR;
    v_stage_inbound_won VARCHAR;
    
    v_stage_outbound_new VARCHAR;
    v_stage_outbound_mid VARCHAR;
    v_stage_outbound_won VARCHAR;
    
    -- User
    v_user_id UUID;
BEGIN
    -- Busca o primeiro usuário (apenas para atribuir o dono)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    -- Busca Pipelines pelo nome (ou pega o primeiro e segundo se falhar)
    SELECT id INTO v_inbound_id FROM pipelines WHERE name ILIKE '%Receptivo%' LIMIT 1;
    IF v_inbound_id IS NULL THEN SELECT id INTO v_inbound_id FROM pipelines ORDER BY created_at ASC LIMIT 1; END IF;
    
    SELECT id INTO v_outbound_id FROM pipelines WHERE name ILIKE '%Ativo%' LIMIT 1;
    IF v_outbound_id IS NULL THEN SELECT id INTO v_outbound_id FROM pipelines WHERE id != v_inbound_id LIMIT 1; END IF;

    -- Busca Stages do Inbound (Ordenados por posição)
    SELECT id INTO v_stage_inbound_new FROM pipeline_stages WHERE pipeline_id = v_inbound_id ORDER BY position ASC LIMIT 1;
    SELECT id INTO v_stage_inbound_mid FROM pipeline_stages WHERE pipeline_id = v_inbound_id ORDER BY position ASC OFFSET 1 LIMIT 1; -- Segunda etapa
    SELECT id INTO v_stage_inbound_won FROM pipeline_stages WHERE pipeline_id = v_inbound_id ORDER BY position DESC LIMIT 1;

    -- Busca Stages do Outbound
    SELECT id INTO v_stage_outbound_new FROM pipeline_stages WHERE pipeline_id = v_outbound_id ORDER BY position ASC LIMIT 1;
    SELECT id INTO v_stage_outbound_mid FROM pipeline_stages WHERE pipeline_id = v_outbound_id ORDER BY position ASC OFFSET 1 LIMIT 1;
    SELECT id INTO v_stage_outbound_won FROM pipeline_stages WHERE pipeline_id = v_outbound_id ORDER BY position DESC LIMIT 1;

    -- INSERTS: INBOUND
    IF v_stage_inbound_new IS NOT NULL THEN
        INSERT INTO central_vendas (empresa_cliente, faturamento_mensal, tipo_pipeline, stage, status_contrato, created_by, created_at)
        VALUES 
        ('Lead Novo 01', 5000, 'Receptivo', v_stage_inbound_new, 'Nao_Gerado', v_user_id, NOW()),
        ('Lead Novo 02', 3500, 'Receptivo', v_stage_inbound_new, 'Nao_Gerado', v_user_id, NOW() - INTERVAL '2 days');
    END IF;

    IF v_stage_inbound_mid IS NOT NULL THEN
        INSERT INTO central_vendas (empresa_cliente, faturamento_mensal, tipo_pipeline, stage, status_contrato, created_by, created_at)
        VALUES 
        ('Lead Qualificado A', 12000, 'Receptivo', v_stage_inbound_mid, 'Nao_Gerado', v_user_id, NOW() - INTERVAL '5 days');
    END IF;

    IF v_stage_inbound_won IS NOT NULL THEN
        INSERT INTO central_vendas (empresa_cliente, faturamento_mensal, tipo_pipeline, stage, status_contrato, created_by, created_at, data_fechamento)
        VALUES 
        ('Cliente Fechado X', 25000, 'Receptivo', v_stage_inbound_won, 'Assinado', v_user_id, NOW() - INTERVAL '10 days', NOW()),
        ('Cliente Fechado Y', 8000, 'Receptivo', v_stage_inbound_won, 'Gerado', v_user_id, NOW() - INTERVAL '1 day', NOW());
    END IF;

    -- INSERTS: OUTBOUND
    IF v_stage_outbound_new IS NOT NULL THEN
        INSERT INTO central_vendas (empresa_cliente, faturamento_mensal, tipo_pipeline, stage, status_contrato, created_by, created_at)
        VALUES 
        ('Prospect Cold A', 15000, 'Ativo_Diagnostico', v_stage_outbound_new, 'Nao_Gerado', v_user_id, NOW()),
        ('Prospect Cold B', 20000, 'Ativo_Diagnostico', v_stage_outbound_new, 'Nao_Gerado', v_user_id, NOW());
    END IF;

    IF v_stage_outbound_won IS NOT NULL THEN
        INSERT INTO central_vendas (empresa_cliente, faturamento_mensal, tipo_pipeline, stage, status_contrato, created_by, created_at, data_fechamento)
        VALUES 
        ('Conta Enterprise Z', 45000, 'Ativo_Diagnostico', v_stage_outbound_won, 'Assinado', v_user_id, NOW() - INTERVAL '15 days', NOW());
    END IF;
    
END $$;

COMMIT;
