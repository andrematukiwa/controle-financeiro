import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Agrupa os itens de texto do PDF em linhas visuais (mesma altura) e ordena da esquerda
// para a direita, já que o pdfjs entrega os fragmentos sem garantir a ordem de leitura.
async function extractLines(pdf) {
  const lines = [];
  const TOLERANCE = 3;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items
      .filter((item) => item.str.trim().length > 0)
      .map((item) => ({ str: item.str, x: item.transform[4], y: item.transform[5] }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    let currentLine = [];
    let currentY = null;

    items.forEach((item) => {
      if (currentY === null || Math.abs(item.y - currentY) <= TOLERANCE) {
        currentLine.push(item);
        currentY = currentY === null ? item.y : currentY;
      } else {
        lines.push(currentLine.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim());
        currentLine = [item];
        currentY = item.y;
      }
    });
    if (currentLine.length) {
      lines.push(currentLine.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim());
    }
  }

  return lines.filter(Boolean);
}

export async function extractPdfLines(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  return extractLines(pdf);
}
