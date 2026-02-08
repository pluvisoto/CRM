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
    return val.toString();
}

async function importBP() {
    console.log('💎 INICIANDO IMPORT COMPLETO DO BUSINESS PLAN CORRIGIDO\n');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2026', '2027', '2028', '2029', '2030'];
    const allData = [];

    for (const year of years) {
        const ws = wb.getWorksheet(year);
        if (!ws) {
            console.error(`❌ ABA NÃO ENCONTRADA: ${year}`);
            continue;
        }

        let yearCount = 0;
        for (let rowIdx = 2; rowIdx <= 43; rowIdx++) {
            const row = ws.getRow(rowIdx);
            const rawLabel = row.getCell(1).value;
            const category = extractText(rawLabel).trim();

            if (!category || category === '') continue;

            for (let m = 1; m <= 12; m++) {
                const colNum = m + 1; // Jan = Col 2
                const val = getCellValue(row.getCell(colNum));
                const competencia = `${year}-${m.toString().padStart(2, '0')}-01`;

                allData.push({
                    competencia,
                    categoria: category,
                    subcategoria: rowIdx.toString(),
                    valor_planejado: val,
                    tipo_custo: 'Fixo',
                    future_module_hr: false
                });
                yearCount++;
            }
        }
        console.log(`📊 Processado ${year}: ${yearCount} registros extraídos.`);
    }

    console.log(`\n📦 Total geral extraído para todos os anos: ${allData.length} registros.`);
    if (allData.length < 2000) {
        console.error('❌ ERRO: Poucos registros extraídos! Verifique a lógica ou o arquivo Excel.');
    }

    // Limpeza do banco
    console.log('🧹 Limpando dados antigos (usando range para garantir limpeza total)...');
    await supabase.from('financial_baseline').delete().gte('subcategoria', '0');
    await supabase.from('financial_baseline').delete().is('subcategoria', null);

    console.log('💾 Inserindo dados...');
    const BATCH = 100; // Batch menor para evitar timeouts
    for (let i = 0; i < allData.length; i += BATCH) {
        const batch = allData.slice(i, i + BATCH);
        const { error } = await supabase.from('financial_baseline').insert(batch);
        if (error) {
            console.error(`\n❌ Erro ao inserir lote ${i}-${i + BATCH}:`, error.message);
            throw error;
        }
        process.stdout.write('.');
    }

    console.log('\n\n🎉 IMPORT CONCLUÍDO!');
    console.log(`📋 Total de registros inseridos: ${allData.length}`);
}

importBP().catch(console.error);
