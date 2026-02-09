const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('Searching for "Diego" in accounts_payable...');

    // Check if we can search
    const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .ilike('description', '%Diego%');

    if (error) {
        console.error('Error selecting:', error);
        return;
    }

    console.log(`Found ${data.length} records.`);

    if (data.length > 0) {
        console.log('Deleting...');
        const { error: delErr } = await supabase
            .from('accounts_payable')
            .delete()
            .ilike('description', '%Diego%');

        if (delErr) {
            console.error('Error deleting:', delErr);
        } else {
            console.log('Successfully deleted records.');
        }
    } else {
        console.log('No records found to delete in Realized data.');
    }
}

run();
