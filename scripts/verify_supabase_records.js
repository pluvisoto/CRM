/**
 * Verification Script - Check Supabase Records
 * Verifies that receivables and payables were created correctly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function verifySupabaseRecords() {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 VERIFICANDO REGISTROS NO SUPABASE`);
    console.log(`${'='.repeat(70)}\n`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get current month date range
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    // Calculate last day of month properly
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    console.log(`Período: ${startDate} a ${endDate}\n`);

    // === CHECK RECEIVABLES ===
    console.log(`📈 CONTAS A RECEBER (Accounts Receivable):`);
    console.log(`${'─'.repeat(70)}`);

    const { data: receivables, error: recError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .order('created_at', { ascending: false })
        .limit(10);

    if (recError) {
        console.error('❌ Erro ao buscar receivables:', recError.message);
    } else {
        console.log(`Total de registros: ${receivables.length}\n`);
        receivables.forEach((rec, idx) => {
            console.log(`${idx + 1}. ${rec.description}`);
            console.log(`   Valor: R$ ${Number(rec.amount).toFixed(2)}`);
            console.log(`   Status: ${rec.status}`);
            console.log(`   Data: ${rec.due_date}`);
            console.log(``);
        });

        const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
        console.log(`TOTAL A RECEBER: R$ ${totalReceivables.toFixed(2)}`);
    }

    // === CHECK PAYABLES ===
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📉 CONTAS A PAGAR (Accounts Payable):`);
    console.log(`${'─'.repeat(70)}`);

    const { data: payables, error: payError } = await supabase
        .from('accounts_payable')
        .select('*')
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .order('created_at', { ascending: false })
        .limit(10);

    if (payError) {
        console.error('❌ Erro ao buscar payables:', payError.message);
    } else {
        console.log(`Total de registros: ${payables.length}\n`);
        payables.forEach((pay, idx) => {
            console.log(`${idx + 1}. ${pay.description}`);
            console.log(`   Valor: R$ ${Number(pay.amount).toFixed(2)}`);
            console.log(`   Status: ${pay.status}`);
            console.log(`   Data: ${pay.due_date}`);
            console.log(``);
        });

        const totalPayables = payables.reduce((sum, p) => sum + Number(p.amount), 0);
        console.log(`TOTAL A PAGAR: R$ ${totalPayables.toFixed(2)}`);
    }

    // === BALANCE ===
    if (!recError && !payError) {
        const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
        const totalPayables = payables.reduce((sum, p) => sum + Number(p.amount), 0);
        const balance = totalReceivables - totalPayables;

        console.log(`\n${'='.repeat(70)}`);
        console.log(`💰 SALDO PROJETADO (Mês Atual)`);
        console.log(`${'='.repeat(70)}`);
        console.log(`Total a Receber:  R$ ${totalReceivables.toFixed(2).padStart(12)}`);
        console.log(`Total a Pagar:    R$ ${totalPayables.toFixed(2).padStart(12)}`);
        console.log(`${'─'.repeat(70)}`);
        console.log(`SALDO:            R$ ${balance.toFixed(2).padStart(12)}`);
        console.log(`${'='.repeat(70)}\n`);
    }
}

verifySupabaseRecords().catch(console.error);
