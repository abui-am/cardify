Your task is to make feature that parse pdf to MD, then integrate it with AI flashcard creator.

Here is the flow:

1. User upload pdf file to the website
2. The pdf will be parsed to MD
3. The MD will be used to generate flashcards with AI
4. The flashcards will be displayed on the website

Here is the example of pdfjs:
const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

// Load PDF
async function convertPdfToMarkdown(pdfPath) {
const data = new Uint8Array(fs.readFileSync(pdfPath));
const loadingTask = pdfjsLib.getDocument({ data });
const pdf = await loadingTask.promise;

let fullText = '';

for (let i = 1; i <= pdf.numPages; i++) {
const page = await pdf.getPage(i);
const content = await page.getTextContent();
const pageText = content.items.map(item => item.str).join(' ');
fullText += pageText + '\n\n';
}

// Simple conversion to markdown: add line breaks, handle bullets, etc.
const markdown = convertToMarkdown(fullText);
fs.writeFileSync('output.md', markdown);
}

function convertToMarkdown(text) {
return text
.replace(/•/g, '- ') // Convert bullets
.replace(/\n\s\*\n/g, '\n\n') // Clean up empty lines
.replace(/([A-Z ]{3,})/g, '# $1') // Naive way to guess headings
.trim();
}
s
convertPdfToMarkdown('your.pdf');
