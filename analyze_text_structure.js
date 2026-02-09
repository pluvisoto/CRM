import fs from 'fs';
import PizZip from 'pizzip';
import path from 'path';

const filePath = path.resolve('src/assets/docs/modelo_contrato_final.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    let xml = zip.files['word/document.xml'].asText();

    // Naive HTML/XML strip
    const text = xml.replace(/<[^>]+>/g, '');

    console.log("Extracted Text Length:", text.length);

    // Find all {{ occurrences
    let regex = /\{\{/g;
    let match;
    let indices = [];
    while ((match = regex.exec(text)) !== null) {
        indices.push(match.index);
    }

    console.log(`Found ${indices.length} occurrences of '{{'.`);

    indices.forEach((index, i) => {
        const nextClose = text.indexOf('}}', index);
        const nextOpen = text.indexOf('{{', index + 2);

        if (nextOpen !== -1 && nextOpen < nextClose) {
            console.log(`\n⚠️  ERROR FOUND at index ${index}:`);
            const snippet = text.substring(index, nextClose + 10); // +10 to see context
            console.log(`Snippet: ${snippet}`);
            console.log("Found nested '{{' inside a tag!");
        }
    });

    console.log("Analysis Complete.");

} catch (e) {
    console.error("Error:", e);
}
