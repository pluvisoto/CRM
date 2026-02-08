import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verifyAllYears() {
    const years = ['2026', '2027', '2028', '2029', '2030'];

    console.log('Verificando dados importados para todos os anos:\n');
    console.log('ANO  | EBITDA (41) | Margem % (42) | Receita Líq (8) | Despesa (40)');
    console.log('-----+-------------+---------------+------------------+--------------');

    for (const year of years) {
        const { data } = await supabase
            .from('financial_baseline')
            .select('subcategoria, valor_planejado')
            .in('subcategoria', ['8', '40', '41', '42'])
            .eq('competencia', `${year}-01-01`)
            .order('subcategoria');

        const values = {};
        data.forEach(d => values[d.subcategoria] = d.valor_planejado);

        const ebitda = values['41'] || 0;
        const margem = values['42'] || 0;
        const receita = values['8'] || 0;
        const despesa = values['40'] || 0;

        console.log(
            `${year} | ${ebitda.toFixed(2).padStart(11)} | ` +
            `${(margem * 100).toFixed(2).padStart(12)}% | ` +
            `${receita.toFixed(2).padStart(16)} | ` +
            `${despesa.toFixed(2).padStart(12)}`
        );
    }

    console.log('\n✅ Verificação concluída!');
}

verifyAllYears();
