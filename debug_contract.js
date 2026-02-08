import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import path from 'path';

const filePath = path.resolve('src/assets/docs/modelo_contrato.docx');

try {
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const text = doc.getFullText();
    console.log("Full Text Content Preview (first 3000 chars):");
    console.log(text.substring(0, 3000));

    // Check for different patterns
    console.log("\n--- Pattern Check ---");
    console.log("{{tags}}: ", text.match(/{{.*?}}/g));
    console.log("{tags}: ", text.match(/{.*?}/g));
    console.log("[tags]: ", text.match(/\[.*?\]/g));
    console.log("<tags>: ", text.match(/<.*?>/g));

    // Look for uppercase words that might be placeholders (e.g., NOME, ENDERECO)
    const upperCaseWords = text.match(/\b[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ_]{4,}\b/g);
    if (upperCaseWords) {
        // Filter out common words to reduce noise (optional, but let's just show unique ones)
        const uniqueUpper = [...new Set(upperCaseWords)].slice(0, 50);
        console.log("UPPERCASE candidates: ", uniqueUpper);
    }

} catch (e) {
    console.error("Error reading file:", e);
}
