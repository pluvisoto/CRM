import * as XLSX from 'xlsx';
import fs from 'fs';

try {
    const buf = fs.readFileSync('business_plan.xlsx');
    const workbook = XLSX.read(buf, { type: 'buffer' });

    console.log("Sheets found:", workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 10); // First 10 rows
        console.log(JSON.stringify(data, null, 2));
    });
} catch (e) {
    console.error("Error reading file:", e.message);
}
