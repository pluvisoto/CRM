import ExcelJS from 'exceljs';

async function mapInputs() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('Dados');

    const inputs = [];
    ws.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            const val = cell.value;
            const labelCell = colNumber > 1 ? ws.getRow(rowNumber).getCell(colNumber - 1) : null;
            const label = labelCell ? labelCell.text : '';

            // If it's a number and not a formula, it might be an input
            if (typeof val === 'number' && !cell.formula) {
                inputs.push({
                    row: rowNumber,
                    col: colNumber,
                    label: label.trim(),
                    value: val
                });
            }
        });
    });

    console.log('--- POTENTIAL INPUTS DETECTED ---');
    inputs.forEach(i => {
        if (i.label && i.label.length > 2) {
            console.log(`[${i.row},${i.col}] ${i.label}: ${i.value}`);
        }
    });
}

mapInputs().catch(console.error);
