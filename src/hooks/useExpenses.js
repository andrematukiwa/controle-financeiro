import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = '@gastos-mensais:expenses';
const OVERRIDES_KEY = '@gastos-mensais:overrides';

function monthKeyFor(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// O pagamento raramente bate centavo a centavo com o total "de compras" da fatura —
// sobra/falta um resíduo de saldo anterior, arredondamento etc. Uma fatura de ~R$2.750
// já teve um resíduo de R$6+ num caso real, então a tolerância é relativa ao tamanho
// da fatura (3%), com um piso de R$5 pra faturas pequenas.
const TOLERANCIA_RELATIVA = 0.03;
const TOLERANCIA_MINIMA = 5;

// Soma o total de tudo que veio de cada fatura importada, agrupado pela fatura em si
// (identificada pelo mês de vencimento), não pelo mês de cada compra individual — o
// período de uma fatura quase sempre cruza dois meses civis (ex: 28 JUL a 28 AGO),
// então agrupar por mês de compra subestimaria o valor total dela.
// Itens salvos antes dessa marcação existir (sem faturaVencimento) caem de volta no
// mês da própria compra, mantendo o comportamento antigo pra dados já importados.
function calcularFaturaTotaisPorFatura(todasDespesas) {
  const totais = {};
  todasDespesas
    .filter((exp) => exp.origem === 'fatura')
    .forEach((exp) => {
      const chave = exp.faturaVencimento || exp.data.slice(0, 7);
      totais[chave] = (totais[chave] || 0) + exp.valor;
    });
  return totais;
}

// Um "Pagamento de fatura" do extrato é o mesmo dinheiro que já entrou como gasto
// individual quando a fatura correspondente foi importada — contar os dois duplicaria
// o valor. Isso é recalculado sempre (não só no momento da importação), então não
// depende da ordem em que fatura/extrato foram importados nem de checkbox marcado
// por engano.
function ehPagamentoFaturaDuplicado(exp, faturaTotaisPorFatura) {
  if (exp.tipo === 'entrada') return false;
  if (exp.origem !== 'extrato') return false;
  if (exp.categoria !== 'Fatura Cartão') return false;
  return Object.values(faturaTotaisPorFatura).some((totalFatura) => {
    const tolerancia = Math.max(TOLERANCIA_MINIMA, totalFatura * TOLERANCIA_RELATIVA);
    return Math.abs(totalFatura - exp.valor) <= tolerancia;
  });
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load expenses from storage', e);
      return [];
    }
  });

  const [overrides, setOverrides] = useState(() => {
    try {
      const stored = localStorage.getItem(OVERRIDES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Failed to load overrides from storage', e);
      return {};
    }
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch(e) {
      console.warn("Storage bloqueado ou cheio", e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (e) {
      console.warn('Storage bloqueado ou cheio', e);
    }
  }, [overrides]);

  const addExpense = useCallback((expense) => {
    setExpenses((prev) => [...prev, expense]);
  }, []);

  const addExpenses = useCallback((newExpenses) => {
    setExpenses((prev) => [...prev, ...newExpenses]);
  }, []);

  const editExpense = useCallback((id, updatedExpense) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updatedExpense } : exp)));
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Filter expenses by current month and year
  const currentMonthExpenses = expenses.filter((exp) => {
    const [year, month] = exp.data.split('-').map(Number);
    return year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;
  });

  const faturaTotaisPorFatura = calcularFaturaTotaisPorFatura(expenses);
  const duplicatasPagamentoFatura = new Set(
    expenses.filter((exp) => ehPagamentoFaturaDuplicado(exp, faturaTotaisPorFatura)).map((exp) => exp.id)
  );

  const sumByTipo = (list, tipo) => list
    .filter((exp) => (tipo === 'entrada' ? exp.tipo === 'entrada' : exp.tipo !== 'entrada'))
    .filter((exp) => !duplicatasPagamentoFatura.has(exp.id))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const resolveMonthTotals = (date, monthExpenses) => {
    const key = monthKeyFor(date);
    const override = overrides[key] || {};
    const computedSaidas = sumByTipo(monthExpenses, 'saida');
    const computedEntradas = sumByTipo(monthExpenses, 'entrada');
    return {
      saidas: override.saidas != null ? override.saidas : computedSaidas,
      entradas: override.entradas != null ? override.entradas : computedEntradas,
      saidasOverrideActive: override.saidas != null,
      entradasOverrideActive: override.entradas != null,
    };
  };

  // Itens sem "tipo" são gastos legados (fatura/manual) e contam como saída.
  const currentMonthKey = monthKeyFor(currentDate);
  const currentTotals = resolveMonthTotals(currentDate, currentMonthExpenses);

  const monthTotal = currentTotals.saidas;
  const monthEntradas = currentTotals.entradas;
  const saidasOverrideActive = currentTotals.saidasOverrideActive;
  const entradasOverrideActive = currentTotals.entradasOverrideActive;

  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const prevMonthExpenses = expenses.filter((exp) => {
    const [year, month] = exp.data.split('-').map(Number);
    return year === prevMonthDate.getFullYear() && month === prevMonthDate.getMonth() + 1;
  });
  const prevTotals = resolveMonthTotals(prevMonthDate, prevMonthExpenses);

  const pctChange = (atual, anterior) => {
    if (!anterior) return null;
    return ((atual - anterior) / anterior) * 100;
  };

  const saidasTrend = pctChange(monthTotal, prevTotals.saidas);
  const entradasTrend = pctChange(monthEntradas, prevTotals.entradas);
  const monthSaldo = monthEntradas - monthTotal;
  const prevSaldo = prevTotals.entradas - prevTotals.saidas;
  const saldoTrend = pctChange(monthSaldo, prevSaldo);

  const saidasCount = currentMonthExpenses.filter((exp) => exp.tipo !== 'entrada' && !duplicatasPagamentoFatura.has(exp.id)).length;
  const entradasCount = currentMonthExpenses.filter((exp) => exp.tipo === 'entrada').length;

  const setSaidasOverride = useCallback((valor) => {
    setOverrides((prev) => ({
      ...prev,
      [currentMonthKey]: { ...prev[currentMonthKey], saidas: valor },
    }));
  }, [currentMonthKey]);

  const setEntradasOverride = useCallback((valor) => {
    setOverrides((prev) => ({
      ...prev,
      [currentMonthKey]: { ...prev[currentMonthKey], entradas: valor },
    }));
  }, [currentMonthKey]);

  return {
    expenses,
    currentDate,
    currentMonthExpenses,
    duplicatasPagamentoFatura,
    monthTotal,
    monthEntradas,
    monthSaldo,
    prevSaldo,
    saidasTrend,
    entradasTrend,
    saldoTrend,
    saidasCount,
    entradasCount,
    saidasOverrideActive,
    entradasOverrideActive,
    setSaidasOverride,
    setEntradasOverride,
    addExpense,
    addExpenses,
    editExpense,
    deleteExpense,
    nextMonth,
    prevMonth,
  };
}
