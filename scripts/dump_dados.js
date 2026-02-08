import ExcelJS from 'exceljs';

async function dumpDados() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('Dados');

    console.log('--- DADOS SHEET DUMP ---');
    for (let r = 1; r <= 50; r++) {
        const row = ws.getRow(r);
        const vals = [];
        for (let c = 1; c <= 15; c++) {
            const cell = row.getCell(c);
            let v = cell.value;
            if (v && v.formula) v = `[F] ${cell.result || ''}`;
            vals.push(v === null || v === undefined ? '' : v.toString().substring(0, 30));
        }
        console.log(`R${r}: ${vals.join(' | ')}`);
    }
}

dumpDados().catch(console.error);
