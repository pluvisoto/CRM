import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugYear(year) {
    const { data } = await supabase
        .from('financial_baseline')
        .select('*')
        .in('subcategoria', ['2', '4', '8', '9', '40', '41', '42'])
        .gte('competencia', `${year}-01-01`)
        .lte('competencia', `${year}-12-31`)
        .order('subcategoria')
        .order('competencia');

    console.log(`\n========== ${year} - AGREGAÇÃO ==========`);

    const groups = {};
    data.forEach(r => {
        const sub = r.subcategoria;
        if (!groups[sub]) groups[sub] = { name: r.categoria, total: 0, count: 0 };
        groups[sub].total += r.valor_planejado;
        groups[sub].count++;
    });

    Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(k => {
        const g = groups[k];
        console.log(`[${k}] ${g.name}:`);
        console.log(`  Total: ${g.total.toFixed(2)}`);
        console.log(`  Meses: ${g.count}/12`);

        // Simular o que o dashboard faz
        if (k === '2' || k === '42') {
            console.log(`  Dashboard usa: ÚLTIMO MÊS (tipo: 'last')`);
        } else {
            console.log(`  Dashboard usa: SOMA TOTAL (tipo: 'sum')`);
        }
    });
}

debugYear('2028');
debugYear('2029');
debugYear('2030');
