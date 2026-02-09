import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkStructure() {
    const years = ['2026', '2028', '2030'];
    console.log('Verificando IDs de subcategoria (numeros das linhas) em cada ano:\n');

    for (const year of years) {
        console.log(`--- ${year} ---`);
        const { data } = await supabase
            .from('financial_baseline')
            .select('subcategoria, categoria')
            .gte('competencia', `${year}-01-01`)
            .lte('competencia', `${year}-01-01`)
            .order('subcategoria');

        if (data) {
            data.forEach(d => {
                if (d.categoria.toLowerCase().includes('ebitda') ||
                    d.categoria.toLowerCase().includes('receita liquida') ||
                    d.categoria.toLowerCase().includes('bruto')) {
                    console.log(`  [${d.subcategoria}] ${d.categoria}`);
                }
            });
        }
    }
}

checkStructure();
