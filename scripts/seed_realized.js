import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seedRealizedData() {
    console.log('🌱 Populando dados REALIZADOS para teste (Jan/Fev 2026)...');

    // Pegar o ID de um admin para o created_by
    const { data: profiles } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1);
    if (!profiles || profiles.length === 0) {
        console.error('❌ Nenhum perfil admin encontrado. Rode as migrações de auth primeiro.');
        return;
    }
    const adminId = profiles[0].id;

    // 1. Receitas Realizadas (Janeiro 2026)
    const receivables = [
        { description: 'Mensalidade Cliente A', category: 'Receita Fixa - Mensalidade', amount: 15000, due_date: '2026-01-05', received_date: '2026-01-05', status: 'received', created_by: adminId },
        { description: 'Mensalidade Cliente B', category: 'Receita Fixa - Mensalidade', amount: 12000, due_date: '2026-01-10', received_date: '2026-01-10', status: 'received', created_by: adminId },
        { description: 'Comissão Projeto X', category: 'Receita Variável - Comissão sobre Vendas Recuperadas', amount: 5000, due_date: '2026-01-15', received_date: '2026-01-15', status: 'received', created_by: adminId }
    ];

    // 2. Despesas Realizadas (Janeiro 2026)
    const payables = [
        { description: 'Aluguel Escritório', category: 'Aluguel', amount: 4500, due_date: '2026-01-10', paid_date: '2026-01-08', status: 'paid', created_by: adminId },
        { description: 'Energia Elétrica', category: 'Energia Elétrica', amount: 450, due_date: '2026-01-15', paid_date: '2026-01-14', status: 'paid', created_by: adminId },
        { description: 'Anúncios Meta', category: 'Anúncios Online', amount: 8000, due_date: '2026-01-15', paid_date: '2026-01-15', status: 'paid', created_by: adminId },
        { description: 'Salários Devs', category: 'Desenvolvedor', amount: 25000, due_date: '2026-01-30', paid_date: '2026-01-30', status: 'paid', created_by: adminId }
    ];

    console.log('Inserting receivables...');
    await supabase.from('accounts_receivable').insert(receivables);

    console.log('Inserting payables...');
    await supabase.from('accounts_payable').insert(payables);

    console.log('✅ Dados de teste inseridos com sucesso!');
}

seedRealizedData();
