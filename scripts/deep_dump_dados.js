import ExcelJS from 'exceljs';

async function deepDumpDados() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('Dados');

    const rows = [];
    for (let r = 1; r <= 30; r++) {
        const row = ws.getRow(r);
        const cells = [];
        for (let c = 1; c <= 15; c++) {
            const cell = row.getCell(c);
            let v = cell.value;
            let display = '';
            if (v && v.formula) display = `[F:${v.formula}] ${v.result || ''}`;
            else if (v === null || v === undefined) display = '-';
            else display = v.toString();
            cells.push(display.padEnd(25).substring(0, 25));
        }
        rows.push(`R${r.toString().padStart(2)}: ${cells.join('|')}`);
    }
    console.log(rows.join('\n'));
}

deepDumpDados().catch(console.error);
