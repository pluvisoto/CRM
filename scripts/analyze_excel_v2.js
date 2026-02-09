import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('business_plan.xlsx');
// Check if file exists first
if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetNames = workbook.SheetNames;

console.log("Sheets found:", sheetNames.join(", "));

// Preview the first 5 rows of each sheet to help identify the structure
sheetNames.forEach(name => {
    console.log(`\n--- Preview of Sheet: ${name} ---`);
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: "" });
    // Print first 5 rows
    data.slice(0, 5).forEach((row, i) => {
        console.log(`Row ${i}: ${JSON.stringify(row)}`);
    });
});
