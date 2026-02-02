import * as XLSX from 'xlsx';
import fs from 'fs';

try {
    const buf = fs.readFileSync('business_plan.xlsx');
    const workbook = XLSX.read(buf, { type: 'buffer' });
    console.log("SHEET_LIST:", workbook.SheetNames);
} catch (e) {
    console.error("Error:", e.message);
}
