import ExcelJS from 'exceljs';

async function list() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('2026');
    for (let r = 1; r <= 45; r++) {
        const txt = ws.getRow(r).getCell(1).text;
        if (txt.trim()) {
            console.log(`${r}: ${txt.trim()}`);
        }
    }
}
list();
