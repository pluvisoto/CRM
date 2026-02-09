import ExcelJS from 'exceljs';

async function analyzeDados() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('Dados');

    console.log('--- DADOS SHEET STRUCTURE ---');
    ws.eachRow((row, rowNumber) => {
        if (rowNumber > 40) return;
        const values = row.values.slice(1, 15);
        console.log(`Row ${rowNumber}:`, values.map(v => {
            if (v && v.result !== undefined) return v.result;
            if (v && v.formula !== undefined) return `{${v.formula}}`;
            if (typeof v === 'object' && v !== null) return JSON.stringify(v);
            return v;
        }).join(' | '));
    });
}

analyzeDados().catch(console.error);
