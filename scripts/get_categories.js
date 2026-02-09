import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('financial_baseline')
        .select('categoria, subcategoria, item')
        .order('subcategoria');

    if (error) {
        console.error(error);
        return;
    }

    const seen = new Set();
    const filtered = data.filter(d => {
        if (seen.has(d.subcategoria)) return false;
        seen.add(d.subcategoria);
        return true;
    });
    console.log(JSON.stringify(filtered, null, 2));
}
run();
