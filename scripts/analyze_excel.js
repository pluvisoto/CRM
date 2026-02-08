import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('business_plan.xlsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

try {
    const workbook = XLSX.readFile(filePath);
    console.log("Sheets found:", workbook.SheetNames.join(", "));

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Preview of Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON (array of arrays) for first 15 rows
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: "" });
        const preview = data.slice(0, 20); // Check first 20 rows

        preview.forEach((row, i) => {
            console.log(`Row ${i}: ${JSON.stringify(row)}`);
        });
    });

} catch (err) {
    console.error("Error reading Excel:", err);
}
