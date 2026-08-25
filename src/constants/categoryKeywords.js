// Palavras-chave (em minúsculo) usadas para sugerir a categoria de gastos importados da fatura.
// A primeira categoria cuja lista contiver uma palavra presente na descrição é usada.
export const CATEGORY_KEYWORDS = {
  // Checado primeiro e com prioridade: é uma frase exata, então não faz sentido competir
  // com as outras categorias por palavras genéricas.
  'Fatura Cartão': ['pagamento de fatura'],
  Transporte: [
    'uber', '99 ride', '99ride', 'táxi', 'taxi', 'metro', 'onibus', 'ônibus', 'transp colet', 'trip help',
    'easyjet', 'latam', 'gol linhas', 'azul linhas', 'passagem aerea', 'passagem aérea', 'cia aerea', 'mobilidade',
  ],
  Alimentação: [
    'ifood', 'lanchon', 'hamburgueria', 'pizza', 'doceria', 'gyoza', 'sushi',
    'restaurante', 'ristorante', 'churrasc', 'festval', 'festival', 'cafe', 'café', 'coffee',
    'acai', 'açai', 'quitandinha', 'fogazza', 'yummizza', 'alimentos', 'lanches', 'burger', 'boi tata',
  ],
  Mercado: ['mercado', 'supermercado', 'hortifruti', 'atacad', 'quitanda'],
  Saúde: ['farma', 'drogaria', 'academia', 'clinica', 'clínica', 'hospital', 'laborat', 'dojo'],
  Assinaturas: ['apple.com', 'google one', 'netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'assinatura', 'icloud'],
  Lazer: ['netshoes', 'centauro', 'cinema', 'steam', 'playstation', 'ingresso', 'runningland'],
  Educação: ['curso', 'escola', 'faculdade', 'udemy', 'alura', 'centro de estudos', 'universidade', 'colegio', 'colégio', 'livraria'],
  // Checado por último: pega qualquer Pix enviado que não bateu com nenhum estabelecimento
  // conhecido acima (normalmente transferência pra pessoa física, sem como saber o motivo).
  Pix: ['transferência enviada', 'transferencia enviada', 'pix'],
};

export function guessCategoria(descricao) {
  const texto = descricao.toLowerCase();
  for (const [categoria, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => texto.includes(kw))) return categoria;
  }
  return 'Outros';
}

// Palavras-chave para sugerir a categoria de entradas (dinheiro recebido) importadas do extrato.
export const CATEGORY_KEYWORDS_ENTRADA = {
  Salário: ['salário', 'salario', 'folha de pagamento', 'pró-labore', 'pro-labore'],
  Reembolso: ['reembolso'],
  Transferência: ['transferência', 'transferencia', 'pix', 'ted', 'doc'],
};

export function guessCategoriaEntrada(descricao) {
  const texto = descricao.toLowerCase();
  for (const [categoria, keywords] of Object.entries(CATEGORY_KEYWORDS_ENTRADA)) {
    if (keywords.some((kw) => texto.includes(kw))) return categoria;
  }
  return 'Outros';
}
