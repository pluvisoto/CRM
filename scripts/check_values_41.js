import ExcelJS from 'exceljs';

async function checkValues() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const years = ['2027', '2028', '2029', '2030'];

    for (const year of years) {
        const ws = wb.getWorksheet(year);
        const row41 = ws.getRow(41);
        console.log(`\n--- ${year} (Linha 41) ---`);

        let sample = [];
        for (let i = 2; i <= 13; i++) {
            const cell = row41.getCell(i);
            const val = cell.result !== undefined ? cell.result : cell.value;
            sample.push(val);
        }
        console.log('Meses 1-12:', sample.join(', '));
    }
}

checkValues();
