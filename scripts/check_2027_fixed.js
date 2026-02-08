import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check2027Data() {
    const { data } = await supabase
        .from('financial_baseline')
        .select('*')
        .in('subcategoria', ['41', '42'])
        .gte('competencia', '2027-01-01')
        .lte('competencia', '2027-12-31')
        .order('subcategoria')
        .order('competencia');

    const groups = {};
    data.forEach(r => {
        if (!groups[r.subcategoria]) groups[r.subcategoria] = { name: r.categoria, total: 0 };
        groups[r.subcategoria].total += r.valor_planejado;
    });

    console.log('2027 - Dados corrigidos:');
    Object.keys(groups).forEach(k => {
        const g = groups[k];
        const avg = g.total / 12;
        console.log(`\n[${k}] ${g.name}:`);
        console.log('  Total acumulado:', g.total.toFixed(2));
        console.log('  Média mensal:', avg.toFixed(6), '=', (avg * 100).toFixed(2) + '%');
    });
}

check2027Data();
