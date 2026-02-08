import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fullReset() {
    console.log('🚀 INICIANDO HARD RESET DE TODOS OS DADOS...');

    const tablesToDelete = [
        'central_vendas',
        'deals',
        'accounts_receivable',
        'accounts_payable',
        'dashboard_snapshots',
        'deal_notes',
        'deal_tasks',
        'user_goals'
    ];

    for (const table of tablesToDelete) {
        console.log(`Clearing ${table}...`);
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) {
                console.warn(`⚠️ [${table}] Warn:`, error.message);
            } else {
                console.log(`✅ [${table}] cleared.`);
            }
        } catch (e) {
            console.error(`❌ Error on ${table}:`, e.message);
        }
    }

    // Reset Wallets
    console.log('Resetting wallet balances...');
    try {
        const { error: errorWallets } = await supabase
            .from('wallets')
            .update({ balance: 0, current_usage: 0 })
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (errorWallets) console.warn('Warn wallets:', errorWallets.message);
        else console.log('✅ Wallets zeroed out.');
    } catch (e) {
        console.error('❌ Error on wallets:', e.message);
    }

    // Reset Local schema_financeiro.json
    console.log('Resetting local schema_financeiro.json...');
    try {
        const schemaPath = path.resolve('schema_financeiro.json');
        if (fs.existsSync(schemaPath)) {
            const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

            // Recursive function to zero out REAL_2026 and inadimplencia_total
            const zeroReal = (obj) => {
                if (Array.isArray(obj)) {
                    obj.forEach(zeroReal);
                } else if (obj && typeof obj === 'object') {
                    if ('REAL_2026' in obj) obj.REAL_2026 = 0;
                    if ('inadimplencia_total' in obj) obj.inadimplencia_total = 0;
                    Object.values(obj).forEach(zeroReal);
                }
            };

            zeroReal(schemaData);
            fs.writeFileSync(schemaPath, JSON.stringify(schemaData, null, 4));
            console.log('✅ schema_financeiro.json reset to 0.');
        }
    } catch (e) {
        console.error('❌ Error resetting local schema:', e.message);
    }

    // Clear log
    try {
        fs.writeFileSync('transacoes.log', '');
        console.log('✅ transacoes.log cleared.');
    } catch (e) { }

    console.log('✨ HARD RESET COMPLETO.');
}

fullReset();
