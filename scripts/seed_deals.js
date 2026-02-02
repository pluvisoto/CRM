
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from root
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais do Supabase não encontradas no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const INBOUND_STAGES = [
    'receptivo_lead', 'receptivo_qualificacao', 'receptivo_agendada', 'receptivo_proposta', 'receptivo_fechamento'
];

const OUTBOUND_STAGES = [
    'ativo_abordagem', 'ativo_aguardando', 'ativo_rvp', 'ativo_proposta', 'ativo_followup'
];

const generateRandomDeal = (i, type, stages, userId) => {
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const value = Math.floor(Math.random() * (15000 - 1000) + 1000);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    return {
        empresa_cliente: `Cliente ${type} ${i + 1}`,
        nome_contato: `Contato ${i + 1}`,
        faturamento_mensal: value,
        stage: stage,
        tipo_pipeline: type === 'Inbound' ? 'Receptivo' : 'Ativo_Diagnostico',
        created_at: date.toISOString(),
        created_by: userId,
        origem: type === 'Inbound' ? 'Google' : 'Outbound', // Mock source
        status_contrato: 'Ativo'
    };
};

const seed = async () => {
    console.log('🌱 Iniciando Seed de Dados...');

    // 1. Get a valid User ID to bypass RLS or link data
    // Try to get from existing deals first
    const { data: existingDeal } = await supabase.from('central_vendas').select('created_by').limit(1).single();
    let userId = existingDeal?.created_by;

    if (!userId) {
        console.warn('⚠️ Nenhum deal existente encontrado para pegar ID de usuário. Tentando inserir sem ID (pode falhar se RLS exigir).');
        // You might want to hardcode your ID here if you know it from the browser session
        // userId = 'YOUR_UUID'; 
    } else {
        console.log(`👤 Usando User ID encontrado: ${userId}`);
    }

    const deals = [];

    // 10 Inbound
    for (let i = 0; i < 10; i++) {
        deals.push(generateRandomDeal(i, 'Inbound', INBOUND_STAGES, userId));
    }

    // 10 Outbound
    for (let i = 0; i < 10; i++) {
        deals.push(generateRandomDeal(i, 'Outbound', OUTBOUND_STAGES, userId));
    }

    const { data, error } = await supabase.from('central_vendas').insert(deals).select();

    if (error) {
        console.error('❌ Erro ao inserir dados:', error);
    } else {
        console.log(`✅ Sucesso! ${data.length} negócios inseridos.`);
        console.log('⚠️ Atualize a página do Dashboard para ver as mudanças.');
    }
};

seed();
