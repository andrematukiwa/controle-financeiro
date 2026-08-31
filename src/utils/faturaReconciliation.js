// O pagamento raramente bate centavo a centavo com o total "de compras" da fatura —
// sobra/falta um resíduo de saldo anterior, arredondamento etc. Uma fatura de ~R$2.750
// já teve um resíduo de R$6+ num caso real, então a tolerância é relativa ao tamanho
// da fatura (3%), com um piso de R$5 pra faturas pequenas.
const TOLERANCIA_RELATIVA = 0.03;
const TOLERANCIA_MINIMA = 5;

// Uma fatura não costuma ter mais de ~35 dias de período, então um intervalo de mais
// de 10 dias entre duas compras seguidas provavelmente indica duas faturas diferentes.
const GAP_MAXIMO_DIAS = 10;

/**
 * Soma o total de tudo que veio de cada fatura importada, agrupado pela fatura em si
 * (identificada pelo mês de vencimento, marcado em `faturaVencimento`), não pelo mês
 * de cada compra individual — o período de uma fatura quase sempre cruza dois meses
 * civis (ex: 28 JUL a 28 AGO), então agrupar por mês de compra subestimaria o total.
 *
 * Compras de fatura salvas antes dessa marcação existir (importadas com uma versão
 * antiga do app) não têm como ser agrupadas pelo vencimento — nesse caso agrupamos
 * por proximidade de datas, para que dados antigos continuem sendo conciliados
 * corretamente sem precisar apagar e reimportar.
 */
export function calcularFaturaTotaisPorFatura(todasDespesas) {
  const totais = {};

  todasDespesas
    .filter((exp) => exp.origem === 'fatura' && exp.faturaVencimento)
    .forEach((exp) => {
      totais[exp.faturaVencimento] = (totais[exp.faturaVencimento] || 0) + exp.valor;
    });

  const semTag = todasDespesas
    .filter((exp) => exp.origem === 'fatura' && !exp.faturaVencimento)
    .sort((a, b) => a.data.localeCompare(b.data));

  let grupoAtual = [];
  let dataAnterior = null;
  let indiceGrupo = 0;

  const finalizarGrupo = () => {
    if (grupoAtual.length === 0) return;
    totais[`legado-${indiceGrupo}`] = grupoAtual.reduce((acc, exp) => acc + exp.valor, 0);
    indiceGrupo += 1;
  };

  semTag.forEach((exp) => {
    const dataAtual = new Date(exp.data);
    if (dataAnterior && (dataAtual - dataAnterior) / (1000 * 60 * 60 * 24) > GAP_MAXIMO_DIAS) {
      finalizarGrupo();
      grupoAtual = [];
    }
    grupoAtual.push(exp);
    dataAnterior = dataAtual;
  });
  finalizarGrupo();

  return totais;
}

/**
 * Um "Pagamento de fatura" do extrato é o mesmo dinheiro que já entrou como gasto
 * individual quando a fatura correspondente foi importada — contar os dois duplicaria
 * o valor. Isso é recalculado sempre (não só no momento da importação), então não
 * depende da ordem em que fatura/extrato foram importados nem de checkbox marcado
 * por engano.
 */
export function ehPagamentoFaturaDuplicado(exp, faturaTotaisPorFatura) {
  if (exp.tipo === 'entrada') return false;
  if (exp.origem !== 'extrato') return false;
  if (exp.categoria !== 'Fatura Cartão') return false;
  return Object.values(faturaTotaisPorFatura).some((totalFatura) => {
    const tolerancia = Math.max(TOLERANCIA_MINIMA, totalFatura * TOLERANCIA_RELATIVA);
    return Math.abs(totalFatura - exp.valor) <= tolerancia;
  });
}

/**
 * Encontra a fatura (se houver) que concilia com um item de pagamento, devolvendo a
 * chave (mês de vencimento, ou uma chave sintética "legado-N" para dados antigos sem
 * marcação) e o total dela — usado na tela de importação para já sugerir excluir o
 * pagamento e explicar por quê.
 */
export function encontrarFaturaConciliada(item, existingExpenses) {
  const totaisPorFatura = calcularFaturaTotaisPorFatura(existingExpenses);
  const encontrado = Object.entries(totaisPorFatura).find(([, total]) => {
    const tolerancia = Math.max(TOLERANCIA_MINIMA, total * TOLERANCIA_RELATIVA);
    return Math.abs(total - item.valor) <= tolerancia;
  });
  return encontrado ? { chave: encontrado[0], valor: encontrado[1] } : null;
}
