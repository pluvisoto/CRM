import ExcelJS from 'exceljs';

async function checkRows() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const years = ['2026', '2027', '2028', '2029', '2030'];

    for (const year of years) {
        const ws = wb.getWorksheet(year);
        console.log(`\n--- ${year} ---`);
        for (let r = 7; r <= 9; r++) {
            const cell = ws.getRow(r).getCell(1);
            let val = cell.value;
            if (val && typeof val === 'object' && val.richText) {
                val = val.richText.map(t => t.text).join('');
            }
            console.log(`Linha ${r}: ${val || '(VAZIO)'}`);
        }
    }
}

checkRows();
