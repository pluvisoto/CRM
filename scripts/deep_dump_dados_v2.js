import ExcelJS from 'exceljs';
import fs from 'fs';

async function deepDumpDados() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('Dados');

    let rows = [];
    for (let r = 1; r <= 50; r++) {
        const row = ws.getRow(r);
        const cells = [];
        for (let c = 1; c <= 15; c++) {
            const cell = row.getCell(c);
            let v = cell.value;
            let display = '';
            if (v && v.formula) display = `[F:${v.formula}] ${v.result || ''}`;
            else if (v === null || v === undefined) display = '-';
            else display = v.toString();
            cells.push(display);
        }
        rows.push(cells.join('\t'));
    }
    fs.writeFileSync('dados_dump_utf8.tsv', rows.join('\n'), 'utf8');
}

deepDumpDados().catch(console.error);
