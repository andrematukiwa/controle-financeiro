import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function desenharTabelaLancamentos(pdf, titulo, itens, startY, headColor) {
  pdf.setFontSize(13);
  pdf.setTextColor(30, 41, 59);
  pdf.text(titulo, 14, startY);

  const sortedItens = [...itens].sort((a, b) => new Date(b.data) - new Date(a.data));
  const rows = sortedItens.map((item) => [
    new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    item.categoria,
    formatMoeda(item.valor),
    item.descricao || '-',
  ]);

  autoTable(pdf, {
    head: [['Data', 'Categoria', 'Valor (R$)', 'Descrição']],
    body: rows,
    startY: startY + 4,
    theme: 'grid',
    headStyles: { fillColor: headColor, textColor: 255 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    styles: { font: 'helvetica', fontSize: 9 },
  });

  return pdf.lastAutoTable.finalY;
}

function desenharResumoPorCategoria(pdf, titulo, itens, startY, headColor) {
  const totalsByCategory = itens.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = 0;
    acc[item.categoria] += item.valor;
    return acc;
  }, {});

  const rows = Object.entries(totalsByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, valor]) => [categoria, `R$ ${formatMoeda(valor)}`]);

  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text(titulo, 14, startY);

  autoTable(pdf, {
    head: [['Categoria', 'Valor Total']],
    body: rows,
    startY: startY + 4,
    theme: 'grid',
    headStyles: { fillColor: headColor, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { font: 'helvetica', fontSize: 9 },
  });

  return pdf.lastAutoTable.finalY;
}

function garantirEspaco(pdf, finalY, espacoNecessario = 50) {
  if (finalY > pdf.internal.pageSize.getHeight() - espacoNecessario) {
    pdf.addPage();
    return 20;
  }
  return finalY;
}

export const exportDashboardToPDF = (month, year, totalSaidas, totalEntradas, expenses, duplicatasPagamentoFatura) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = monthNames[month];
    const saldo = totalEntradas - totalSaidas;
    const duplicatas = duplicatasPagamentoFatura || new Set();

    // "Pagamento de fatura" do extrato que já bate com uma fatura importada não entra
    // aqui — o gasto já está detalhado item a item na tabela de compras da fatura.
    const saidas = (expenses || []).filter((exp) => exp.tipo !== 'entrada' && !duplicatas.has(exp.id));
    const entradas = (expenses || []).filter((exp) => exp.tipo === 'entrada');
    const totalExcluidas = duplicatas.size;

    // Título
    pdf.setFontSize(20);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`Controle Financeiro - ${monthName} de ${year}`, 14, 18);

    // Resumo: Entradas / Saídas / Saldo
    pdf.setFontSize(11);
    pdf.setTextColor(5, 150, 105);
    pdf.text(`Entradas: +R$ ${formatMoeda(totalEntradas)}`, 14, 28);
    pdf.setTextColor(37, 99, 235);
    pdf.text(`Saídas: R$ ${formatMoeda(totalSaidas)}`, 90, 28);
    pdf.setTextColor(saldo >= 0 ? 5 : 220, saldo >= 0 ? 150 : 38, saldo >= 0 ? 105 : 38);
    pdf.text(`Saldo: ${saldo >= 0 ? '+' : '-'}R$ ${formatMoeda(Math.abs(saldo))}`, 160, 28);

    let finalY = 38;

    if (totalExcluidas > 0) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      const plural = totalExcluidas > 1 ? 'pagamentos de fatura já contabilizados' : 'pagamento de fatura já contabilizado';
      pdf.text(`* ${totalExcluidas} ${plural} nas compras detalhadas da fatura não estão listados abaixo, para não contar o gasto duas vezes.`, 14, 34);
      finalY = 40;
    }

    if (saidas.length > 0) {
      finalY = desenharTabelaLancamentos(pdf, 'Saídas', saidas, finalY, [37, 99, 235]);
      finalY += 8;
      finalY = garantirEspaco(pdf, finalY);
      finalY = desenharResumoPorCategoria(pdf, 'Resumo de Saídas por Categoria', saidas, finalY, [37, 99, 235]) + 12;
    }

    if (entradas.length > 0) {
      finalY = garantirEspaco(pdf, finalY);
      finalY = desenharTabelaLancamentos(pdf, 'Entradas', entradas, finalY, [5, 150, 105]);
      finalY += 8;
      finalY = garantirEspaco(pdf, finalY);
      desenharResumoPorCategoria(pdf, 'Resumo de Entradas por Categoria', entradas, finalY, [5, 150, 105]);
    }

    if (saidas.length === 0 && entradas.length === 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Nenhum lançamento registrado neste mês.', 14, finalY + 5);
    }

    const safeMonthName = monthName.toLowerCase().replace('ç', 'c');
    pdf.save(`gastos-${safeMonthName}-${year}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Verifique o console.');
  }
};
