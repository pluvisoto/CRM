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

async function definitiveImport() {
    console.log('🚀 INICIANDO IMPORTAÇÃO DEFINITIVA\n');

    // 1. Limpeza Total
    console.log('🧹 Limpando banco com DELETE sem filtro...');
    // Se o RLS estiver ativo, ele pode impedir o delete. Vamos tentar bater no ID.
    const { error: delError } = await supabase.from('financial_baseline').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    if (delError) console.log('Aviso Delete:', delError.message);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2026', '2027', '2028', '2029', '2030'];

    for (const year of years) {
        const ws = wb.getWorksheet(year);
        if (!ws) {
            console.log(`❌ Aba ${year} não encontrada!`);
            continue;
        }

        const yearData = [];
        for (let rowIdx = 2; rowIdx <= 43; rowIdx++) {
            const row = ws.getRow(rowIdx);
            const label = extractText(row.getCell(1).value).trim();
            if (!label) continue;

            for (let m = 1; m <= 12; m++) {
                const val = await getCellValue(row.getCell(m + 1));
                yearData.push({
                    competencia: `${year}-${m.toString().padStart(2, '0')}-01`,
                    categoria: label,
                    subcategoria: rowIdx.toString(),
                    valor_planejado: val,
                    tipo_custo: 'Fixo'
                });
            }
        }

        console.log(`📦 Inserindo ${yearData.length} registros para ${year}...`);

        // Inserir em chunks pequenos
        const CHUNK = 50;
        for (let i = 0; i < yearData.length; i += CHUNK) {
            const batch = yearData.slice(i, i + CHUNK);
            const { error } = await supabase.from('financial_baseline').insert(batch);
            if (error) {
                console.error(`❌ Erro no ano ${year}, linha ${yearData[i].subcategoria}:`, error.message);
            }
        }

        const { count } = await supabase.from('financial_baseline').select('*', { count: 'exact', head: true }).like('competencia', `${year}-%`);
        console.log(`✅ ${year} concluído. Total no banco para este ano: ${count}`);
    }
}

definitiveImport();
