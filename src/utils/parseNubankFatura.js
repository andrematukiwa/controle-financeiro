import { guessCategoria } from '../constants/categoryKeywords';
import { MESES_ABREVIADOS as MESES } from '../constants/dates';

// "•••• 5830" antes do nome do estabelecimento só aparece em transações reais do cartão,
// o que já filtra headers, resumos e a linha de pagamento (que não tem esse trecho).
const TRANSACTION_LINE = /^(\d{2})\s+([A-ZÇÃÕ]{3})\s+••••\s*\d{4}\s+(.+?)\s+R\$\s*(-?[\d.,]+)\s*$/;
const DUE_DATE_LINE = /Data de vencimento:\s*(\d{2})\s+([A-ZÇÃÕ]{3})\s+(\d{4})/;

function parseValor(raw) {
  const cleaned = raw.replace(/[.\s]/g, '').replace(',', '.').replace('−', '-');
  return Math.abs(parseFloat(cleaned));
}

// A ordem das palavras nessa linha varia entre páginas ("TRANSAÇÕES DE X A Y" vs
// "DE X A Y TRANSAÇÕES"), então checamos os termos sem exigir uma ordem fixa.
export function isFaturaDocument(lines) {
  return lines.some((line) => line.includes('TRANSAÇÕES') && /\bDE\b.*\bA\b/.test(line)) &&
    lines.some((line) => DUE_DATE_LINE.test(line));
}

/**
 * Extrai as transações de uma fatura do Nubank a partir das linhas de texto do PDF.
 * Devolve candidatos a gasto: { data, descricao, valor, categoria, tipo: 'saida' }.
 */
export function parseFaturaLines(lines) {
  let dueMonth = null;
  let dueYear = null;
  for (const line of lines) {
    const match = line.match(DUE_DATE_LINE);
    if (match) {
      dueMonth = MESES[match[2]];
      dueYear = parseInt(match[3], 10);
      break;
    }
  }
  if (dueMonth == null || dueYear == null) {
    const today = new Date();
    dueMonth = today.getMonth();
    dueYear = today.getFullYear();
  }

  const results = [];
  for (const line of lines) {
    const match = line.match(TRANSACTION_LINE);
    if (!match) continue;

    const [, dia, mesAbbr, descricaoBruta, valorBruto] = match;
    const mes = MESES[mesAbbr];
    if (mes === undefined) continue;

    // O período da fatura pode cruzar a virada do ano (ex: fatura com vencimento
    // em janeiro contendo compras de dezembro do ano anterior).
    const ano = mes > dueMonth ? dueYear - 1 : dueYear;
    const valor = parseValor(valorBruto);
    if (!valor || valor <= 0) continue;

    const descricao = descricaoBruta.trim();

    results.push({
      data: `${ano}-${String(mes + 1).padStart(2, '0')}-${dia}`,
      descricao,
      valor,
      categoria: guessCategoria(descricao),
      tipo: 'saida',
      origem: 'fatura',
      // Identifica a qual fatura (documento) essa compra pertence — o período de uma
      // fatura quase sempre cruza dois meses (ex: 28 JUL a 28 AGO), então agrupar o
      // total pelo mês de cada compra individual (em vez de por fatura) subestima o
      // valor total na hora de conciliar com o pagamento no extrato.
      faturaVencimento: `${dueYear}-${String(dueMonth + 1).padStart(2, '0')}`,
    });
  }

  return results;
}
