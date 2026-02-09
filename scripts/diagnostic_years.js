import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSubcategories() {
    const years = ['2026', '2027', '2028', '2029', '2030'];
    const targetCategories = ['Receita Líquida', 'EBITDA', 'Resultado Bruto', 'Margem Líquida'];

    console.log('Análise de Subcategorias por Ano (Buscando pelo Nome):\n');

    for (const year of years) {
        console.log(`--- ${year} ---`);
        for (const catName of targetCategories) {
            const { data } = await supabase
                .from('financial_baseline')
                .select('subcategoria, categoria, valor_planejado')
                .ilike('categoria', `%${catName}%`)
                .eq('competencia', `${year}-01-01`)
                .limit(5);

            if (data && data.length > 0) {
                data.forEach(d => {
                    console.log(`  [${d.subcategoria}] ${d.categoria} = ${d.valor_planejado}`);
                });
            } else {
                console.log(`  ❌ Nenhuma linha encontrada para "${catName}"`);
            }
        }
    }
}

checkSubcategories();
