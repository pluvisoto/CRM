import ExcelJS from 'exceljs';

async function checkFinalExcel() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('2026');

    console.log('--- ESTRUTURA FINAL (2026) ---');
    for (let i = 2; i <= 45; i++) {
        const cell = ws.getRow(i).getCell(1);
        let val = cell.value;
        if (val && typeof val === 'object' && val.richText) {
            val = val.richText.map(t => t.text).join('');
        }
        if (val) console.log(`Linha ${i}: ${val.trim()}`);
    }
}

checkFinalExcel();
