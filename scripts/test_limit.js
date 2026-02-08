import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import ExcelJS from 'exceljs';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testImport() {
    console.log('🧪 TESTE: IMPORTANDO ANOS FINAIS PRIMEIRO\n');

    await supabase.from('financial_baseline').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    // Inverter os anos: Começar pelo fim
    const years = ['2030', '2029', '2028', '2027', '2026'];

    for (const year of years) {
        const ws = wb.getWorksheet(year);
        const data = [];
        for (let r = 2; r <= 43; r++) {
            const label = ws.getRow(r).getCell(1).value;
            if (!label) continue;
            for (let m = 1; m <= 12; m++) {
                data.push({
                    competencia: `${year}-${m.toString().padStart(2, '0')}-01`,
                    categoria: 'TESTE',
                    subcategoria: r.toString(),
                    valor_planejado: 1,
                    tipo_custo: 'Fixo'
                });
            }
        }
        await supabase.from('financial_baseline').insert(data);
        const { count } = await supabase.from('financial_baseline').select('*', { count: 'exact', head: true });
        console.log(`✅ Após ${year}, total no banco: ${count}`);
    }
}

testImport();
