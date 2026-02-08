import * as XLSX from 'xlsx';
import fs from 'fs';

try {
    const buf = fs.readFileSync('business_plan_corrigido.xlsx');
    const workbook = XLSX.read(buf, { type: 'buffer' });

    let sheetName = workbook.SheetNames.find(name =>
        name.includes('Lucro') || name.includes('2026')
    ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    console.log('First 50 rows with column 0 values:\n');
    data.slice(0, 50).forEach((row, idx) => {
        if (row[0]) {
            console.log(`Row ${idx}: "${row[0]}"`);
        }
    });
} catch (e) {
    console.error(e);
}
