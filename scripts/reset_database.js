import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: VITE_SUPABASE_URL ou Chave de API não encontrada no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
    console.log('🚨 INICIANDO LIMPEZA DE DADOS (RESET) 🚨');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Key Type: ${supabaseKey.length > 50 ? 'Service Role (Provavel)' : 'Anon (Pode falhar)'}`);

    try {
        // 1. Finance Transactions
        console.log('🗑️  Deletando finance_transactions...');
        const { error: e1 } = await supabase.from('finance_transactions').delete().not('id', 'is', null); // Delete ALL
        if (e1) console.error('Erro finance_transactions:', e1.message);

        // 2. Finance Snapshots
        console.log('🗑️  Deletando finance_snapshots...');
        const { error: e2 } = await supabase.from('finance_snapshots').delete().not('id', 'is', null);
        if (e2) console.error('Erro finance_snapshots:', e2.message);

        // 3. Central Vendas (Deals)
        console.log('🗑️  Deletando central_vendas...');
        const { error: e3 } = await supabase.from('central_vendas').delete().not('id', 'is', null);
        if (e3) console.error('Erro central_vendas:', e3.message);

        // 4. Accounts Receivable (if exists)
        console.log('🗑️  Deletando accounts_receivable...');
        const { error: e4 } = await supabase.from('accounts_receivable').delete().not('id', 'is', null);
        if (e4) console.warn('Aviso accounts_receivable:', e4.message);

        // 5. Accounts Payable (if exists)
        console.log('🗑️  Deletando accounts_payable...');
        const { error: e5 } = await supabase.from('accounts_payable').delete().not('id', 'is', null);
        if (e5) console.warn('Aviso accounts_payable:', e5.message);


        console.log('✅ BASE DE DADOS LIMPA COM SUCESSO!');

    } catch (error) {
        console.error('❌ CRITICAL ERROR:', error);
    }
}

resetDatabase();
