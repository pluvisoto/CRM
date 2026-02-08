
import ExcelJS from 'exceljs';
import fs from 'fs';

async function analyze2026() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('business_plan.xlsx');

    // Try to find the sheet
    const sheetName = '2026'; // User said "2026"
    const sheet = workbook.getWorksheet(sheetName);

    if (!sheet) {
        console.error(`❌ Sheet "${sheetName}" not found!`);
        console.log('Available sheets:', workbook.worksheets.map(ws => ws.name));
        return;
    }

    console.log(`✅ Analyzing Sheet: "${sheet.name}"`);
    let output = `Structure of ${sheet.name}\n`;
    output += '------------------------------------------------\n';

    // Dump first 20 rows and 15 columns
    for (let r = 1; r <= 20; r++) {
        const row = sheet.getRow(r);
        const cells = [];
        for (let c = 1; c <= 15; c++) {
            let val = row.getCell(c).value;
            // Handle formulas
            if (val && val.result !== undefined) val = val.result;
            cells.push(val === null ? '' : val);
        }
        output += `Row ${r}: [${cells.join(' | ')}]\n`;
    }

    fs.writeFileSync('sheet_2026_dump.txt', output);
    console.log('Dumped 2026 sheet to sheet_2026_dump.txt');
}

analyze2026();
