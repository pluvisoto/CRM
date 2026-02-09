import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function getCellValue(cell) {
    if (!cell || !cell.value) return 0;
    if (cell.value && typeof cell.value === 'object' && cell.value.result !== undefined) return cell.value.result;
    if (typeof cell.value === 'number') return cell.value;
    return 0;
}

function extractText(val) {
    if (!val) return '';
    if (typeof val === 'object' && val.richText) {
        return val.richText.map(t => t.text).join('');
    }
    return val.toString().trim();
}

async function importBP() {
    console.log('💎 INICIANDO IMPORT DO BUSINESS PLAN CORRIGIDO\n');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2026', '2027', '2028', '2029', '2030'];
    const allData = [];

    for (const year of years) {
        const ws = wb.getWorksheet(year);
        if (!ws) continue;
        console.log(`📊 Processando ${year}...`);

        // Row headers are actually in row 1, but we know Col 4 is Jan, 5 is Feb...
        // Let's use indices 4 to 15 (12 months)
        for (let rowIdx = 2; rowIdx <= 43; rowIdx++) {
            const row = ws.getRow(rowIdx);
            const category = extractText(row.getCell(1).value);
            if (!category) continue;

            for (let m = 1; m <= 12; m++) {
                const colNum = m + 1; // Jan is Col 2
                const val = getCellValue(row.getCell(colNum));
                const competencia = `${year}-${m.toString().padStart(2, '0')}-01`;

                allData.push({
                    competencia,
                    categoria: category,
                    subcategoria: rowIdx.toString(), // Store row index for ordering
                    valor_planejado: val,
                    tipo_custo: 'Fixo',
                    future_module_hr: false
                });
            }
        }
    }

    console.log(`\n✅ Extraídos ${allData.length} registros.`);

    // Cleaning DB
    console.log('🧹 Limpando dados antigos...');
    await supabase.from('financial_baseline').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('💾 Inserindo dados...');
    const BATCH = 500;
    for (let i = 0; i < allData.length; i += BATCH) {
        const batch = allData.slice(i, i + BATCH);
        const { error } = await supabase.from('financial_baseline').insert(batch);
        if (error) console.error(`Error inserting batch at ${i}:`, error.message);
        process.stdout.write('.');
    }

    console.log('\n\n🎉 IMPORT CONCLUÍDO!');
}

importBP().catch(console.error);
