import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('financial_baseline')
        .select('categoria, subcategoria')
        .order('subcategoria');

    if (error) {
        console.error(error);
        return;
    }

    const map = {};
    data.forEach(d => {
        map[d.subcategoria] = d.categoria;
    });

    console.log(JSON.stringify(map, null, 2));
}
run();
