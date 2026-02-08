import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAllYears() {
    const years = ['2028', '2029', '2030'];
    const criticalLines = ['2', '4', '8', '9', '40', '41', '42'];

    console.log('Verificando linhas críticas importadas:\n');

    for (const year of years) {
        console.log(`\n========== ${year} ==========`);

        for (const line of criticalLines) {
            const { data, count } = await supabase
                .from('financial_baseline')
                .select('*', { count: 'exact' })
                .eq('subcategoria', line)
                .gte('competencia', `${year}-01-01`)
                .lte('competencia', `${year}-12-31`);

            if (count === 0) {
                console.log(`❌ [${line}] FALTANDO - Nenhum registro encontrado!`);
            } else if (count < 12) {
                console.log(`⚠️  [${line}] ${data[0].categoria} - INCOMPLETO (${count}/12 meses)`);
            } else {
                const jan = data.find(d => d.competencia === `${year}-01-01`);
                console.log(`✅ [${line}] ${jan.categoria} - OK (Jan: ${jan.valor_planejado})`);
            }
        }
    }
}

checkAllYears();
