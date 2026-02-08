import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase
        .from('financial_baseline')
        .select('competencia, valor_planejado')
        .eq('subcategoria', '42')
        .order('competencia');

    console.log('Linha 42 - Margem Líquida % (2026):');
    data.filter(r => r.competencia.startsWith('2026')).forEach(r => {
        const mes = r.competencia.split('-')[1];
        console.log(`  Mês ${mes}: ${r.valor_planejado} = ${(r.valor_planejado * 100).toFixed(2)}%`);
    });

    const total2026 = data.filter(r => r.competencia.startsWith('2026')).reduce((sum, r) => sum + r.valor_planejado, 0);
    const dezVal = data.find(r => r.competencia === '2026-12-01')?.valor_planejado || 0;

    console.log('\nTotal acumulado 2026:', total2026, '=', (total2026 * 100).toFixed(2) + '%');
    console.log('Valor de Dezembro:', dezVal, '=', (dezVal * 100).toFixed(2) + '%');
}

run();
