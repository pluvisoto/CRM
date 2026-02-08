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

async function finalImport() {
    console.log('🚀 INICIANDO IMPORTAÇÃO CONTROLADA\n');

    // 1. Limpar
    console.log('🧹 Limpando banco...');
    await supabase.from('financial_baseline').delete().neq('subcategoria', '99999');

    const { count } = await supabase.from('financial_baseline').select('*', { count: 'exact', head: true });
    console.log(`✅ Banco limpo. Registros restantes: ${count}`);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2026', '2027', '2028', '2029', '2030'];

    for (const year of years) {
        console.log(`\n📅 Processando ${year}...`);
        const ws = wb.getWorksheet(year);
        const yearData = [];

        for (let rowIdx = 2; rowIdx <= 43; rowIdx++) {
            const row = ws.getRow(rowIdx);
            const category = extractText(row.getCell(1).value).trim();
            if (!category) continue;

            for (let m = 1; m <= 12; m++) {
                yearData.push({
                    competencia: `${year}-${m.toString().padStart(2, '0')}-01`,
                    categoria: category,
                    subcategoria: rowIdx.toString(),
                    valor_planejado: await getCellValue(row.getCell(m + 1)),
                    tipo_custo: 'Fixo'
                });
            }
        }

        console.log(`  - Extraídos ${yearData.length} registros para ${year}. Inserindo...`);

        const BATCH = 100;
        for (let i = 0; i < yearData.length; i += BATCH) {
            const batch = yearData.slice(i, i + BATCH);
            const { error } = await supabase.from('financial_baseline').insert(batch);
            if (error) throw new Error(`Erro no ano ${year}: ${error.message}`);
        }

        const { count: currentCount } = await supabase.from('financial_baseline').select('*', { count: 'exact', head: true });
        console.log(`  ✅ Total no banco após ${year}: ${currentCount}`);
    }

    console.log('\n✨ IMPORTAÇÃO FINALIZADA COM SUCESSO!');
}

finalImport().catch(e => console.error('\n❌ ERRO FATAL:', e.message));
