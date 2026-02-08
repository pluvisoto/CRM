import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Run from root or scripts? Assuming root based on CWD
const ROOT_DIR = process.cwd();

// Paths
const EXCEL_PATH = path.resolve(ROOT_DIR, 'business_plan.xlsx');
const JSON_PATH = path.resolve(ROOT_DIR, 'src/data/business_plan_data.json');

// 1. Read Excel
console.log('Reading Excel from:', EXCEL_PATH);
const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = 'Lucro e Perda';
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// 2. Find "Diego" Row
// User said "Row 49". In 0-indexed array, this is index 48.
const diegoRowIndex = 48;
const row = rawData[diegoRowIndex];
console.log(`Row ${diegoRowIndex} content (first cell):`, row ? row[0] : 'UNDEFINED');

if (!row || !row[0] || !row[0].toString().includes('Diego')) {
    console.error('CRITICAL: Row 48 does not contain "Diego". Found:', row ? row[0] : 'nothing');
    // Try searching
    const foundIndex = rawData.findIndex(r => r[0] && r[0].toString().trim().includes('Diego'));
    if (foundIndex === -1) {
        console.error('Could not find row with "Diego" in entire sheet.');
        process.exit(1);
    }
    console.log(`Found "Diego" at row index ${foundIndex}`);
    // Use found index
    row = rawData[foundIndex];
}

// 3. Extract Values using same logic as extract_business_plan.js
const cleanCurrency = (value) => {
    if (!value || value === '') return 0;
    if (typeof value === 'number') return value;
    let str = value.toString();
    const isNegative = str.includes('(') || str.includes(')');
    str = str.replace(/R\$\s*/g, '').replace(/[\s\(\)]/g, '').replace(/,/g, '');
    let num = parseFloat(str) || 0;
    return isNegative ? -num : num;
};

const monthsRow = rawData[0];
const totalCols = monthsRow.length;

console.log('Reading JSON...');
const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
const currentOpex = jsonData.opex;

console.log(`JSON Months: ${jsonData.months.length}`);
console.log(`JSON OpEx length: ${currentOpex.length}`);

// We need to extract the Diego values corresponding to the filtered months
const diegoValues = [];
let monthCount = 0;
// Assuming column 1 is first month
for (let i = 1; i < totalCols; i++) {
    // Logic from extract script: Filter out every 13th column (Annual Totals)
    // 0-based col index i=1 -> Month 1.
    // i=12 -> Month 12.
    // i=13 -> Total.
    const colIndex0 = i - 1;
    if ((colIndex0 + 1) % 13 === 0) {
        continue;
    }

    // Safety check
    if (monthCount >= jsonData.months.length) break;

    const val = cleanCurrency(row[i]);
    diegoValues.push(val);
    monthCount++;
}

console.log(`Extracted ${diegoValues.length} Diego values.`);
// console.log('Sample Diego values:', diegoValues.slice(0, 5));

// 4. Update OpEx
// NewOpEx = OldOpEx - DiegoValue
const newOpex = currentOpex.map((val, i) => {
    const deduction = diegoValues[i] || 0;
    return val - deduction;
});

// Calculate total reduction
const totalReduction = diegoValues.reduce((a, b) => a + b, 0);
console.log(`Total reduction in OpEx: ${totalReduction}`);

// Update JSON
jsonData.opex = newOpex;

// We also need to update 'totalExpenses' if it exists and matters
if (jsonData.totalExpenses) {
    jsonData.totalExpenses = jsonData.totalExpenses.map((val, i) => val - (diegoValues[i] || 0));
}

// Write back
fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2));
console.log('✅ Updated business_plan_data.json');
