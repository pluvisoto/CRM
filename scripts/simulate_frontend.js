import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function simulateFrontend() {
    // Simular exatamente o que o componente React faz
    console.log('📡 Simulando fetch do frontend...\n');

    const { data: result, error } = await supabase
        .from('financial_baseline')
        .select('*')
        .order('subcategoria', { ascending: true })
        .limit(5000);

    if (error) {
        console.error('❌ Erro:', error);
        return;
    }

    console.log(`✅ Total de registros recebidos: ${result.length}\n`);

    // Simular o useMemo pivotedData
    const tempGroups = {};
    const years = ['2026', '2027', '2028', '2029', '2030'];

    result.forEach(row => {
        const idx = row.subcategoria;
        if (!tempGroups[idx]) {
            tempGroups[idx] = { idx, name: row.categoria, values: {}, rawMonths: {} };
        }
        const y = row.competencia.split('-')[0];
        const m = parseInt(row.competencia.split('-')[1], 10) - 1;

        if (!tempGroups[idx].rawMonths[y]) tempGroups[idx].rawMonths[y] = Array(12).fill(0);
        tempGroups[idx].rawMonths[y][m] = row.valor_planejado || 0;
    });

    // Processar para selectedYear = 2026
    const finalGroups = Object.values(tempGroups);
    finalGroups.forEach(g => {
        const yearStr = '2026';
        const months = g.rawMonths[yearStr] || Array(12).fill(0);
        months.forEach((v, i) => { g.values[i] = v; });
    });

    const pivotedData = finalGroups.sort((a, b) => parseInt(a.idx) - parseInt(b.idx));

    console.log('📊 Primeiras 10 linhas processadas:');
    pivotedData.slice(0, 10).forEach(row => {
        const jan = row.values[0] || 0;
        const total = Object.values(row.values).reduce((a, b) => a + b, 0);
        console.log(`  [${row.idx.padStart(2)}] ${row.name.substring(0, 30).padEnd(30)} | Jan=${jan.toFixed(2).padStart(10)} | Total=${total.toFixed(2).padStart(12)}`);
    });

    // Stats
    console.log('\n📈 STATS (simulando o componente):');
    const receitaRow = pivotedData.find(r => parseInt(r.idx) === 4);
    const despesaRow = pivotedData.find(r => parseInt(r.idx) === 12);
    const ebitdaRow = pivotedData.find(r => parseInt(r.idx) === 41);
    const margemRow = pivotedData.find(r => parseInt(r.idx) === 42);

    const sumValues = (row) => row ? Object.values(row.values).reduce((a, b) => (a || 0) + (b || 0), 0) : 0;

    console.log(`  Receita Total (linha 4):  R$ ${sumValues(receitaRow).toFixed(2)}`);
    console.log(`  Despesa Total (linha 12): R$ ${sumValues(despesaRow).toFixed(2)}`);
    console.log(`  EBITDA (linha 41):        R$ ${sumValues(ebitdaRow).toFixed(2)}`);
    console.log(`  Margem % (linha 42):      ${sumValues(margemRow).toFixed(2)}%`);
}

simulateFrontend();
