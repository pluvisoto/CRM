import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

const inputPath = path.resolve('src/assets/docs/modelo_contrato.docx'); // Start from original if possible, or v2
// Let's use v2 as base since it has some fixes
const basePath = path.resolve('public/contrato_v2.docx');
const outputPath = path.resolve('public/contrato_v3.docx');

try {
    const content = fs.readFileSync(basePath, 'binary');
    const zip = new PizZip(content);
    let xml = zip.files['word/document.xml'].asText();

    console.log("Original XML length:", xml.length);

    // ROBUST FIX STRATEGY
    // We want to find {{ ... }} and remove any <...> inside it.
    // Since JS regex doesn't support recursive nesting well, and we want to be careful,
    // let's exact match the known tags but allow ANYTHING in between the characters.

    // We will construct a regex for each known tag that is extremely permissive of junk
    const TAGS = [
        'RAZAO_SOCIAL', 'CNPJ', 'ENDERECO', 'REPRESENTANTE',
        'CPF_REPRESENTANTE', 'EMAIL', 'DATA_ATUAL', 'VALOR_MENSAL'
    ];

    TAGS.forEach(tag => {
        // Build regex:  Curly + junk + Curly + junk + Char + junk + Char ...
        // start with \{ (junk) \{ (junk)
        let pattern = '\\{(?:<[^>]+>)*\\{(?:<[^>]+>)*';
        for (let char of tag) {
            pattern += char + '(?:<[^>]+>)*';
        }
        pattern += '\\}(?:<[^>]+>)*\\}';

        const regex = new RegExp(pattern, 'g');

        xml = xml.replace(regex, `{{${tag}}}`);
    });

    // Also, let's try to fix ANY {{ ... }} that might be split
    // Regex to find {{ by looking for { then optional tags then {
    // and replace with {{
    xml = xml.replace(/\{(?:<[^>]+>)*\{/g, '{{');

    // Same for }}
    xml = xml.replace(/\}(?:<[^>]+>)*\}/g, '}}');

    // Now, finding {{TAG}} is easy if we removed interruptions between {{ and }}
    // But we only removed interruptions between { and {

    // Let's go deeper: Remove all XML between {{ and }}
    // Warning: valid XML might be needed if the tag spans paragraphs. 
    // But for simple text tags, it shouldn't.

    // Convert {{ to a placeholder to avoid messing it up
    xml = xml.replace(/\{\{/g, '____OPEN____');
    xml = xml.replace(/\}\}/g, '____CLOSE____');

    // Now assume user tags are plain text likely.

    // Actually, stick to the known tags replacement, that is safest.
    // The loop above already did:
    // {{<tag>C<tag>N<tag>P<tag>J}} -> {{CNPJ}}

    // Let's write the file
    zip.file('word/document.xml', xml);

    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    console.log("Saved robust fix to:", outputPath);

    // Verify immediately
    new Docxtemplater(new PizZip(buffer), { paragraphLoop: true, linebreaks: true });
    console.log("Verified: No Parse Errors!");

} catch (e) {
    console.error("Error:", e);
    if (e.properties && e.properties.errors) console.error(e.properties.errors);
}
