import XLSX from 'xlsx';

// Read the Excel file
const workbook = XLSX.readFile('business_plan.xlsx');
const sheetName = 'Lucro e Perda';
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON (array of arrays)
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Print all row labels to find what we need
console.log('All row labels (rows 0-70):');
rawData.forEach((row, index) => {
    if (row[0]) {
        console.log(`Row ${index}: "${row[0].toString().trim()}"`);
    }
});
