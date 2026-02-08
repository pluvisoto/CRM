import ExcelJS from 'exceljs';

async function compareYears() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');

    const ws2026 = wb.getWorksheet('2026');
    const ws2027 = wb.getWorksheet('2027');

    const extractText = (val) => {
        if (!val) return '';
        if (typeof val === 'object' && val.richText) return val.richText.map(t => t.text).join('');
        return val.toString();
    };

    console.log('COMPARAÇÃO 2026 vs 2027:');
    console.log('LINHA | 2026 | 2027');
    console.log('------+------+------');

    for (let r = 2; r <= 43; r++) {
        const label2026 = extractText(ws2026.getRow(r).getCell(1).value).trim();
        const label2027 = extractText(ws2027.getRow(r).getCell(1).value).trim();

        if (label2026 !== label2027) {
            console.log(`[${r}] ${label2026.substring(0, 35).padEnd(35)} | ${label2027.substring(0, 35)}`);
        }
    }

    console.log('\nLinhas 40-43 em detalhe:');
    [40, 41, 42, 43].forEach(r => {
        const label2026 = extractText(ws2026.getRow(r).getCell(1).value).trim() || '(vazio)';
        const val2026 = ws2026.getRow(r).getCell(2).result || ws2026.getRow(r).getCell(2).value;

        const label2027 = extractText(ws2027.getRow(r).getCell(1).value).trim() || '(vazio)';
        const val2027 = ws2027.getRow(r).getCell(2).result || ws2027.getRow(r).getCell(2).value;

        console.log(`\n[${r}] 2026: ${label2026} = ${val2026}`);
        console.log(`[${r}] 2027: ${label2027} = ${val2027}`);
    });
}

compareYears();
