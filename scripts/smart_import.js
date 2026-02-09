import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import ExcelJS from 'exceljs';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function getCellValue(cell) {
    if (!cell || !cell.value) return 0;
    if (cell.value && typeof cell.value === 'object' && cell.value.result !== undefined) return cell.value.result;
    if (typeof cell.value === 'number') return cell.value;
    return 0;
}

function extractText(val) {
    if (!val) return '';
    if (typeof val === 'object' && val.richText) return val.richText.map(t => t.text).join('');
    return val.toString();
}

async function smartImport() {
    console.log('🚀 INICIANDO IMPORTAÇÃO INTELIGENTE POR ANO\n');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2026', '2027', '2028', '2029', '2030'];

    for (const year of years) {
        console.log(`\n📅 Sincronizando ${year}...`);

        // Deletar APENAS o ano atual para garantir que não ultrapassamos limites desnecessários
        await supabase.from('financial_baseline').delete().gte('competencia', `${year}-01-01`).lte('competencia', `${year}-12-31`);

        const ws = wb.getWorksheet(year);
        const yearData = [];
        for (let rowIdx = 2; rowIdx <= 43; rowIdx++) {
            const row = ws.getRow(rowIdx);
            const label = extractText(row.getCell(1).value).trim();
            if (!label) continue;

            for (let m = 1; m <= 12; m++) {
                yearData.push({
                    competencia: `${year}-${m.toString().padStart(2, '0')}-01`,
                    categoria: label,
                    subcategoria: rowIdx.toString(),
                    valor_planejado: await getCellValue(row.getCell(m + 1)),
                    tipo_custo: 'Fixo'
                });
            }
        }

        const BATCH = 50;
        for (let i = 0; i < yearData.length; i += BATCH) {
            await supabase.from('financial_baseline').insert(yearData.slice(i, i + BATCH));
        }

        console.log(`  ✅ ${year} sincronizado com ${yearData.length} registros.`);
    }
}

smartImport();
