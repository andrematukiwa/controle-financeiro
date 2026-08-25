import { extractPdfLines } from './pdfTextExtraction';
import { isFaturaDocument, parseFaturaLines } from './parseNubankFatura';
import { isExtratoDocument, parseExtratoLines } from './parseNubankExtrato';

/**
 * Lê um PDF do Nubank (fatura de cartão OU extrato de conta) e devolve uma lista
 * unificada de candidatos a lançamento: { data, descricao, valor, categoria, tipo }.
 * O tipo de documento é detectado pelo conteúdo do próprio PDF, não pelo nome do arquivo.
 */
export async function parseNubankPdf(file) {
  const lines = await extractPdfLines(file);

  if (isExtratoDocument(lines)) {
    return parseExtratoLines(lines);
  }

  if (isFaturaDocument(lines)) {
    return parseFaturaLines(lines);
  }

  throw new Error('Documento não reconhecido: não parece ser uma fatura nem um extrato do Nubank.');
}
