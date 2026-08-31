export function formatCurrency(valor) {
  return Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
