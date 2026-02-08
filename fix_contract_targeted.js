import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

const inputPath = path.resolve('src/assets/docs/modelo_contrato.docx');
const outputPath = path.resolve('src/assets/docs/modelo_contrato_final.docx');

// List of tags to fix
const TAGS = [
    'RAZAO_SOCIAL',
    'CNPJ',
    'ENDERECO',
    'REPRESENTANTE',
    'CPF_REPRESENTANTE',
    'EMAIL',
    'DATA_ATUAL',
    'VALOR_MENSAL'
];

function createLooseRegex(tag) {
    // Escape tag chars if needed (letters are fine)
    // Create regex that allows XML tags <...> between any char
    // We also match the {{ and }} with optional XML tags in between

    // Pattern: {{ (xml)* T (xml)* A (xml)* G (xml)* }}
    // But user might have typed {{TAG}} or {{ TAG }}

    const xmlTag = '(?:<[^>]+>)*'; // Match 0 or more XML tags
    const whitespace = '(?:\\s|<[^>]+>)*'; // Match whitespace or tags

    let pattern = '\\{\\{' + xmlTag; // Start with {{ and optional tags

    for (let char of tag) {
        pattern += char + xmlTag;
    }

    pattern += '\\}\\}'; // End with }}

    // We want to replace this whole sequence with {{TAG}}
    return new RegExp(pattern, 'g');
}

try {
    const content = fs.readFileSync(inputPath, 'binary');
    const zip = new PizZip(content);
    let xml = zip.files['word/document.xml'].asText();

    console.log("Original XML length:", xml.length);
    let totalFixed = 0;

    TAGS.forEach(tag => {
        const regex = createLooseRegex(tag);
        let count = 0;
        xml = xml.replace(regex, (match) => {
            count++;
            return `{{${tag}}}`; // Replace with clean tag
        });
        if (count > 0) {
            console.log(`Fixed ${count} occurrences of {{${tag}}}`);
            totalFixed += count;
        }
    });

    TAGS.forEach(tag => {
        // Also try to catch {{TAG}} where TAG is clean but {{ is split
        // Actually the loop above handles that provided {{ is two chars.
        // What if {{ is { (xml) { ?
        // My regex start was \\{\\{ which matches {{ literal.
        // I need to support split {{ as well.

        let pattern = '\\{' + '(?:<[^>]+>)*' + '\\{' + '(?:<[^>]+>)*';
        for (let char of tag) {
            pattern += char + '(?:<[^>]+>)*';
        }
        pattern += '\\}' + '(?:<[^>]+>)*' + '\\}';

        const regex2 = new RegExp(pattern, 'g');
        let count2 = 0;
        xml = xml.replace(regex2, (match) => {
            count2++;
            return `{{${tag}}}`;
        });
        if (count2 > 0) {
            console.log(`Fixed ${count2} occurrences of split {{${tag}}}`);
            totalFixed += count2;
        }
    });

    zip.file('word/document.xml', xml);

    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    console.log("Final fixed contract saved to:", outputPath);

    // Verify
    const doc = new Docxtemplater(new PizZip(buffer), {
        paragraphLoop: true,
        linebreaks: true,
    });
    console.log("Verification Success: File parsed cleanly!");

} catch (e) {
    console.error("Error fixing/verifying:", e);
}
