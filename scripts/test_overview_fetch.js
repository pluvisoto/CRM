import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testFetch() {
    console.log("🛠️ TESTANDO FETCH OVERVIEW EXACTLY AS UI DOES");

    let query = supabase
        .from('financial_baseline')
        .select('*')
        .order('subcategoria', { ascending: true })
        .limit(5000);

    query = query.gte('competencia', '2026-01-01')
        .lte('competencia', '2030-12-31');

    const { data, error } = await query;
    if (error) {
        console.error("Erro:", error);
        return;
    }

    console.log(`Total records: ${data.length}`);
    const subcats = [...new Set(data.map(d => d.subcategoria))].sort((a, b) => parseInt(a) - parseInt(b));
    console.log("Subcats found:", subcats.join(', '));

    const row4 = data.filter(d => d.subcategoria === '4');
    console.log(`Row 4 records: ${row4.length}`);
    if (row4.length > 0) {
        console.log(`Row 4 Category: ${row4[0].categoria}`);
    }
}

testFetch();
