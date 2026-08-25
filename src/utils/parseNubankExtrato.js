import { guessCategoria, guessCategoriaEntrada } from '../constants/categoryKeywords';

const MESES = {
  JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5,
  JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11,
};

// Valor no formato brasileiro (ex: "1.914,16"). Exigir a vírgula com 2 decimais evita
// confundir números de página, telefones e CNPJs (que não usam esse formato) com valores.
const VALOR = '(\\d{1,3}(?:\\.\\d{3})*,\\d{2})';
const HEADER_WITH_DATE_RE = new RegExp(`^(\\d{2})\\s+([A-ZÇ]{3})\\s+(\\d{4})\\s+Total de (entradas|sa[íi]das)\\s*([+-])\\s*${VALOR}\\s*$`, 'i');
const HEADER_CONT_RE = new RegExp(`^Total de (entradas|sa[íi]das)\\s*([+-])\\s*${VALOR}\\s*$`, 'i');
const TRANSACTION_RE = new RegExp(`^(.+?)\\s+${VALOR}\\s*$`);
const MOVIMENTACOES_MARKER = 'Movimentações';

function parseValor(raw) {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
}

export function isExtratoDocument(lines) {
  return lines.some((line) => line.trim() === MOVIMENTACOES_MARKER) && lines.some((line) => /Total de (entradas|sa[íi]das)/i.test(line));
}

/**
 * Extrai as movimentações de um extrato do Nubank a partir das linhas de texto do PDF.
 * Cada linha de transação não tem sinal próprio — o tipo (entrada/saída) é herdado do
 * cabeçalho "Total de entradas/saídas" mais recente, que às vezes se repete sem a data
 * quando o mesmo dia tem os dois tipos de movimentação.
 * Devolve candidatos: { data, descricao, valor, categoria, tipo }.
 */
export function parseExtratoLines(lines) {
  let started = false;
  let currentDate = null;
  let currentTipo = null;
  const results = [];

  for (const line of lines) {
    if (!started) {
      if (line.trim() === MOVIMENTACOES_MARKER) started = true;
      continue;
    }

    let match = line.match(HEADER_WITH_DATE_RE);
    if (match) {
      const [, dia, mesAbbr, ano, tipoLabel] = match;
      const mes = MESES[mesAbbr];
      if (mes === undefined) continue;
      currentDate = { dia, mes, ano: parseInt(ano, 10) };
      currentTipo = /entradas/i.test(tipoLabel) ? 'entrada' : 'saida';
      continue;
    }

    match = line.match(HEADER_CONT_RE);
    if (match) {
      const [, tipoLabel] = match;
      currentTipo = /entradas/i.test(tipoLabel) ? 'entrada' : 'saida';
      continue;
    }

    match = line.match(TRANSACTION_RE);
    if (match && currentDate && currentTipo) {
      const [, descricaoBruta, valorBruto] = match;
      const valor = parseValor(valorBruto);
      if (!valor || valor <= 0) continue;

      const descricao = descricaoBruta.trim();
      const data = `${currentDate.ano}-${String(currentDate.mes + 1).padStart(2, '0')}-${currentDate.dia}`;

      results.push({
        data,
        descricao,
        valor,
        categoria: currentTipo === 'entrada' ? guessCategoriaEntrada(descricao) : guessCategoria(descricao),
        tipo: currentTipo,
        origem: 'extrato',
      });
    }
  }

  return results;
}
