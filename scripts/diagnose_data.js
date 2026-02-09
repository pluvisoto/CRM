import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log('=== DIAGNÓSTICO COMPLETO ===\n');

    // 1. Total de registros
    const { count } = await supabase
        .from('financial_baseline')
        .select('*', { count: 'exact', head: true });
    console.log(`📊 Total de registros no banco: ${count}\n`);

    // 2. Verificar linha 4 (Receita Total)
    const { data: receita } = await supabase
        .from('financial_baseline')
        .select('*')
        .eq('subcategoria', '4')
        .eq('competencia', '2026-01-01')
        .single();
    console.log('💰 Receita Total (linha 4) em Jan/2026:', receita?.valor_planejado || 'NÃO ENCONTRADO');

    // 3. Verificar linha 41 (EBITDA)
    const { data: ebitda } = await supabase
        .from('financial_baseline')
        .select('*')
        .eq('subcategoria', '41')
        .eq('competencia', '2026-01-01')
        .single();
    console.log('📈 EBITDA (linha 41) em Jan/2026:', ebitda?.valor_planejado || 'NÃO ENCONTRADO');

    // 4. Verificar linha 2 (Usuários)
    const { data: users } = await supabase
        .from('financial_baseline')
        .select('*')
        .eq('subcategoria', '2')
        .eq('competencia', '2026-12-01')
        .single();
    console.log('👥 Usuários (linha 2) em Dez/2026:', users?.valor_planejado || 'NÃO ENCONTRADO');

    // 5. Listar todas subcategorias únicas
    const { data: all } = await supabase
        .from('financial_baseline')
        .select('subcategoria, categoria')
        .limit(1000);

    const unique = {};
    all.forEach(r => unique[r.subcategoria] = r.categoria);

    console.log('\n📋 Subcategorias encontradas:');
    Object.keys(unique).sort((a, b) => parseInt(a) - parseInt(b)).forEach(k => {
        console.log(`  ${k}: ${unique[k]}`);
    });
}
run();
