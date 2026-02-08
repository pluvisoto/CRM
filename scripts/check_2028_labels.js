import ExcelJS from 'exceljs';

async function check2028() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('business_plan_corrigido.xlsx');
    const ws = wb.getWorksheet('2028');

    console.log('--- ABA 2028 ---');
    for (let i = 1; i <= 45; i++) {
        const cell = ws.getRow(i).getCell(1);
        let val = cell.value;
        if (val && typeof val === 'object' && val.richText) {
            val = val.richText.map(t => t.text).join('');
        }
        console.log(`Linha ${i}: ${val || '(VAZIO)'}`);
    }
}

check2028();
