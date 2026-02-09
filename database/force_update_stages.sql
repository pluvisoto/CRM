-- FORCE UPDATE DIAGNOSIS
-- Este script força a substituição dos "nomes" antigos pelos IDs reais (UUIDs)
-- Isso vai consertar a cor (Amarelo -> Verde) e os Funis Vazios.

DO $$
DECLARE
    -- IDs de Pipeline
    pid_inbound UUID;
    pid_outbound UUID;

    -- IDs de Stage Reais (buscados do banco)
    sid_inbound_won VARCHAR; 
    sid_outbound_won VARCHAR;
    sid_outbound_new VARCHAR;
    sid_outbound_mid VARCHAR;
BEGIN
    -------------------------------------------------------
    -- 1. IDENTIFICAR PIPELINES (Busca aproximada para garantir)
    -------------------------------------------------------
    SELECT id INTO pid_inbound FROM pipelines WHERE name ILIKE '%Receptivo%' LIMIT 1;
    -- Fallback se não achar pelo nome
    IF pid_inbound IS NULL THEN 
        SELECT id INTO pid_inbound FROM pipelines ORDER BY created_at ASC LIMIT 1; 
    END IF;

    SELECT id INTO pid_outbound FROM pipelines WHERE name ILIKE '%Ativo%' LIMIT 1;
    IF pid_outbound IS NULL THEN 
        SELECT id INTO pid_outbound FROM pipelines WHERE id != pid_inbound LIMIT 1; 
    END IF;

    -------------------------------------------------------
    -- 2. IDENTIFICAR STAGES (IDs Reais)
    -------------------------------------------------------
    
    -- INBOUND: Última etapa = GANHO (Verde)
    SELECT id INTO sid_inbound_won FROM pipeline_stages 
    WHERE pipeline_id = pid_inbound 
    ORDER BY position DESC LIMIT 1;

    -- OUTBOUND: Última etapa = GANHO (Verde)
    SELECT id INTO sid_outbound_won FROM pipeline_stages 
    WHERE pipeline_id = pid_outbound 
    ORDER BY position DESC LIMIT 1;

    -- OUTBOUND: Primeira etapa = ABORDAGEM
    SELECT id INTO sid_outbound_new FROM pipeline_stages 
    WHERE pipeline_id = pid_outbound 
    ORDER BY position ASC LIMIT 1;

    -- OUTBOUND: Etapa do meio = RVP/Diagnóstico
    SELECT id INTO sid_outbound_mid FROM pipeline_stages 
    WHERE pipeline_id = pid_outbound 
    ORDER BY position ASC OFFSET 1 LIMIT 1;

    -------------------------------------------------------
    -- 3. EXECUTAR UPDATES (Correção dos Dados)
    -------------------------------------------------------

    -- Corrigir 'receptivo_fechamento' -> ID Real (Ficará Verde)
    IF sid_inbound_won IS NOT NULL THEN
        UPDATE central_vendas 
        SET stage = sid_inbound_won 
        WHERE stage = 'receptivo_fechamento';
        
        RAISE NOTICE 'Corrigido receptivo_fechamento para %', sid_inbound_won;
    END IF;

    -- Corrigir 'ativo_rvp' -> ID Real
    IF sid_outbound_mid IS NOT NULL THEN
        UPDATE central_vendas 
        SET stage = sid_outbound_mid
        WHERE stage = 'ativo_rvp';
    END IF;

    -- Corrigir 'ativo_abordagem' -> ID Real
    IF sid_outbound_new IS NOT NULL THEN
        UPDATE central_vendas 
        SET stage = sid_outbound_new
        WHERE stage = 'ativo_abordagem';
    END IF;

END $$;
