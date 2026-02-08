import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('public/contrato_v4.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const xml = zip.files['word/document.xml'].asText();

    const offset = 40526;
    console.log(`XML Length: ${xml.length}`);
    console.log(`Inspecting around offset ${offset}:`);

    const start = Math.max(0, offset - 100);
    const end = Math.min(xml.length, offset + 100);

    console.log(xml.substring(start, end));

    // Also point to the char
    const snippet = xml.substring(start, end);
    const pointerIndex = offset - start;
    let pointer = '';
    for (let i = 0; i < pointerIndex; i++) pointer += ' ';
    pointer += '^';

    console.log(pointer);

} catch (e) {
    console.error("Error:", e);
}
