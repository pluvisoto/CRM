
import ExcelJS from 'exceljs';
import fs from 'fs';

async function analyzeBottom() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('business_plan.xlsx');
    const sheet = workbook.getWorksheet('2026');

    let output = `Bottom Rows of 2026\n`;
    const rowCount = sheet.rowCount;

    for (let r = rowCount - 20; r <= rowCount; r++) {
        const row = sheet.getRow(r);
        const cell = row.getCell(1);
        let cat = '';
        if (cell.value && cell.value.richText) {
            cat = cell.value.richText.map(t => t.text).join('');
        } else {
            cat = cell.value ? cell.value.toString() : '';
        }
        output += `Row ${r}: ${cat}\n`;
    }

    console.log(output);
}

analyzeBottom();
