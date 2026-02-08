import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check2027() {
    const { data } = await supabase
        .from('financial_baseline')
        .select('*')
        .in('subcategoria', ['41', '42'])
        .gte('competencia', '2027-01-01')
        .lte('competencia', '2027-01-01')
        .order('subcategoria');

    console.log('2027-01-01 (linhas 41 e 42):');
    if (data.length === 0) {
        console.log('❌ SEM DADOS!');
    } else {
        data.forEach(d => {
            console.log(`[${d.subcategoria}] ${d.categoria} = ${d.valor_planejado}`);
        });
    }
}

check2027();
