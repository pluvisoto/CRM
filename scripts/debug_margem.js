import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase
        .from('financial_baseline')
        .select('*')
        .in('subcategoria', ['4', '8', '41', '42'])
        .gte('competencia', '2026-01-01')
        .lte('competencia', '2026-12-31')
        .order('subcategoria')
        .order('competencia');

    const groups = {};
    data.forEach(r => {
        const sub = r.subcategoria;
        if (!groups[sub]) groups[sub] = { name: r.categoria, total: 0, values: [] };
        groups[sub].total += r.valor_planejado;
        groups[sub].values.push(r.valor_planejado);
    });

    console.log('2026 - Totais Acumulados:');
    Object.keys(groups).sort().forEach(k => {
        const g = groups[k];
        console.log(`[${k}] ${g.name}: R$ ${g.total.toFixed(2)}`);
    });

    const receita4 = groups['4']?.total || 0;
    const receita8 = groups['8']?.total || 0;
    const ebitda41 = groups['41']?.total || 0;
    const margem42 = groups['42']?.total || 0;

    console.log('\nCálculos possíveis:');
    console.log('EBITDA / Receita Bruta (4)   =', ebitda41, '/', receita4, '=', (ebitda41 / receita4 * 100).toFixed(2) + '%');
    console.log('EBITDA / Receita Líquida (8) =', ebitda41, '/', receita8, '=', (ebitda41 / receita8 * 100).toFixed(2) + '%');
    console.log('Margem linha 42 (soma)       =', (margem42 * 100).toFixed(2) + '%');
    console.log('Margem linha 42 (média)      =', (margem42 / 12 * 100).toFixed(2) + '%');
}

run();
