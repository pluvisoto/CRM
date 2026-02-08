const ExcelJS = require('exceljs');

async function analyzeDados() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('Dados');

    console.log('--- DADOS SHEET STRUCTURE ---');
    ws.eachRow((row, rowNumber) => {
        if (rowNumber > 30) return;
        const values = row.values.slice(1, 10);
        console.log(`Row ${rowNumber}:`, values.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(' | '));
    });
}

analyzeDados();
