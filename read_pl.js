import * as XLSX from 'xlsx';
import fs from 'fs';

try {
    const buf = fs.readFileSync('business_plan.xlsx');
    const workbook = XLSX.read(buf, { type: 'buffer' });
    const sheet = workbook.Sheets['Lucro e Perda'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 30); // First 30 rows
    console.log(JSON.stringify(data, null, 2));
} catch (e) {
    console.error("Error:", e.message);
}
