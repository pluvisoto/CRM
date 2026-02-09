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
        if (!map[d.subcategoria]) map[d.subcategoria] = d.categoria;
    });

    console.log('--- BASESLINE CATEGORIES MAP ---');
    Object.keys(map).sort((a, b) => parseInt(a) - parseInt(b)).forEach(id => {
        console.log(`${id}: ${map[id]}`);
    });
}
run();
