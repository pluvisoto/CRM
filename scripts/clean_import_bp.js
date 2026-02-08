import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function getCellValue(cell) {
    if (!cell || !cell.value) return 0;
    if (typeof cell.value === 'object' && cell.value.result !== undefined) return cell.value.result;
    if (typeof cell.value === 'number') return cell.value;
    return 0;
}

function getLabel(cell) {
    if (!cell || !cell.value) return '';
    if (typeof cell.value === 'object' && cell.value.richText) {
        return cell.value.richText.map(t => t.text).join('');
    }
    if (typeof cell.value === 'string') return cell.value;
    return String(cell.value);
}

async function main() {
    console.log('🚀 IMPORTAÇÃO COMPLETA DO BUSINESS PLAN\n');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2026', '2027', '2028', '2029', '2030'];
    const records = [];

    for (const year of years) {
        const sheet = wb.getWorksheet(year);
        if (!sheet) {
            console.log(`⚠️  Sheet ${year} não encontrada`);
            continue;
        }

        console.log(`📊 Processando ${year}...`);

        // Linhas 2 a 43
        for (let rowNum = 2; rowNum <= 43; rowNum++) {
            const row = sheet.getRow(rowNum);
            const label = getLabel(row.getCell(1)).trim();

            if (!label) continue; // Pula linhas vazias

            // Colunas 2-13 = Jan-Dez
            for (let month = 1; month <= 12; month++) {
                const colNum = month + 1;
                const value = getCellValue(row.getCell(colNum));
                const competencia = `${year}-${String(month).padStart(2, '0')}-01`;

                records.push({
                    competencia,
                    categoria: label,
                    subcategoria: String(rowNum),
                    valor_planejado: value,
                    tipo_custo: 'Fixo',
                    future_module_hr: false
                });
            }
        }
    }

    console.log(`\n✅ ${records.length} registros preparados`);
    console.log('\n📋 Amostra (primeiros 3 registros):');
    records.slice(0, 3).forEach(r => {
        console.log(`  [${r.subcategoria}] ${r.categoria.substring(0, 30)} | ${r.competencia} = ${r.valor_planejado}`);
    });

    // Limpar banco
    console.log('\n🧹 Limpando tabela financial_baseline...');
    const { error: delError } = await supabase
        .from('financial_baseline')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (delError) {
        console.error('❌ Erro ao limpar:', delError);
        return;
    }

    // Inserir em lotes
    console.log('💾 Inserindo dados...');
    const BATCH_SIZE = 500;
    let inserted = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('financial_baseline').insert(batch);

        if (error) {
            console.error(`\n❌ Erro no lote ${i}:`, error.message);
        } else {
            inserted += batch.length;
            process.stdout.write('.');
        }
    }

    console.log(`\n\n🎉 CONCLUÍDO!`);
    console.log(`📊 Total inserido: ${inserted} registros`);

    // Verificação final
    const { count } = await supabase
        .from('financial_baseline')
        .select('*', { count: 'exact', head: true });
    console.log(`✅ Registros no banco: ${count}`);

    // Testar linhas críticas
    console.log('\n🔍 Verificando linhas críticas:');
    const criticas = [2, 4, 5, 12, 41, 42];
    for (const num of criticas) {
        const { data } = await supabase
            .from('financial_baseline')
            .select('categoria, valor_planejado')
            .eq('subcategoria', String(num))
            .eq('competencia', '2026-01-01')
            .maybeSingle();

        if (data) {
            console.log(`  ✅ [${num}] ${data.categoria.substring(0, 25).padEnd(25)} = ${data.valor_planejado}`);
        } else {
            console.log(`  ❌ [${num}] NÃO ENCONTRADO`);
        }
    }
}

main().catch(console.error);
