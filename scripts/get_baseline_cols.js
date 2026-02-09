import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('financial_baseline').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data && data[0]) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample:', data[0]);
    }
}
run();
