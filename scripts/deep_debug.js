import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function deepDebug() {
    const { data: result } = await supabase
        .from('financial_baseline')
        .select('*')
        .order('subcategoria', { ascending: true })
        .limit(5000);

    console.log(`Total registros: ${result.length}\n`);

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

    console.log('Subcategorias em tempGroups:');
    const keys = Object.keys(tempGroups).map(k => parseInt(k)).sort((a, b) => a - b);
    console.log(keys.join(', '));

    console.log('\nVerificando linhas críticas:');
    [2, 4, 5, 6, 7, 8, 9, 10, 12, 40, 41, 42].forEach(n => {
        const g = tempGroups[String(n)];
        if (g) {
            const jan = g.rawMonths['2026']?.[0] || 0;
            console.log(`✅ [${n}] ${g.name.substring(0, 30)} | Jan 2026 = ${jan}`);
        } else {
            console.log(`❌ [${n}] NÃO EXISTE EM tempGroups`);
        }
    });

    // Processar valores para ano 2026
    const finalGroups = Object.values(tempGroups);
    finalGroups.forEach(g => {
        const months = g.rawMonths['2026'] || Array(12).fill(0);
        months.forEach((v, i) => { g.values[i] = v; });
    });

    const pivotedData = finalGroups.sort((a, b) => parseInt(a.idx) - parseInt(b.idx));

    console.log('\n📊 Verificando pivotedData:');
    [2, 4, 5, 12, 41, 42].forEach(n => {
        const row = pivotedData.find(r => parseInt(r.idx) === n);
        if (row) {
            const total = Object.values(row.values).reduce((a, b) => (a || 0) + (b || 0), 0);
            console.log(`✅ [${n}] ${row.name.substring(0, 30)} | Total = ${total}`);
        } else {
            console.log(`❌ [${n}] NÃO ENCONTRADO em pivotedData`);
        }
    });
}

deepDebug();
