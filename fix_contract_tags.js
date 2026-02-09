import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

const inputPath = path.resolve('src/assets/docs/modelo_contrato.docx');
const outputPath = path.resolve('src/assets/docs/modelo_contrato_fixed.docx');

try {
    const content = fs.readFileSync(inputPath, 'binary');
    const zip = new PizZip(content);

    // Get the XML content of the document body
    let xml = zip.files['word/document.xml'].asText();

    console.log("Original XML length:", xml.length);

    // Heuristic fix: Remove XML tags between {{ and }}
    // This is a naive but often effective way to join split tags
    // e.g. <w:t>{</w:t></w:r><w:r><w:t>{</w:t>  becomes {{

    // 1. Remove XML between {{
    // We look for `{` followed by XML tags followed by `{`
    // Regex explanation:
    // \{ : literal {
    // (?:<[^>]+>)* : match 0 or more XML tags
    // \{ : literal {

    // We want to normalize `{{`
    // Pattern: { (xml)* {  => {{
    xml = xml.replace(/\{(?:<[^>]+>)*\{/g, '{{');

    // Pattern: } (xml)* }  => }}
    xml = xml.replace(/\}(?:<[^>]+>)*\}/g, '}}');

    // Now updates the zip
    zip.file('word/document.xml', xml);

    // Write to a new file to avoid EBUSY
    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer);
    console.log("Fixed contract saved to:", outputPath);

    // Verify
    const doc = new Docxtemplater(new PizZip(buffer), {
        paragraphLoop: true,
        linebreaks: true,
    });
    console.log("Verification: No TemplateError thrown.");

} catch (e) {
    console.error("Error fixing/verifying file:", e);
}
