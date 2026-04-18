import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const exportDashboardToPDF = async (month, year, total, expenses) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = monthNames[month];
    
    // Título e Header
    pdf.setFontSize(22);
    pdf.text(`Controle de Gastos - ${monthName} de ${year}`, 14, 20);
    
    // Total
    pdf.setFontSize(16);
    pdf.text(`Total do Mês: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 30);
    
    let finalY = 40;

    // Tabela de Gastos
    if (expenses && expenses.length > 0) {
      const tableColumn = ["Data", "Categoria", "Valor (R$)", "Descrição"];
      
      // Ordenar por data
      const sortedExpenses = [...expenses].sort((a, b) => new Date(b.data) - new Date(a.data));
      
      const tableRows = sortedExpenses.map(exp => {
        return [
          new Date(exp.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          exp.categoria,
          exp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          exp.descricao || '-'
        ];
      });

      autoTable(pdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 }, // Cores mais vivas (Azul 500 Tailwind)
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: { font: 'helvetica', fontSize: 10 },
        margin: { top: 40 }
      });
      
      finalY = (pdf.lastAutoTable && pdf.lastAutoTable.finalY) ? pdf.lastAutoTable.finalY + 15 : 40 + (tableRows.length * 10) + 15;
    } else {
      pdf.setFontSize(12);
      pdf.text("Nenhum gasto registrado neste mês.", 14, 45);
      finalY = 60;
    }

    // Tabela de Resumo por Categorias
    if (expenses && expenses.length > 0) {
      const totalsByCategory = expenses.reduce((acc, exp) => {
        if (!acc[exp.categoria]) acc[exp.categoria] = 0;
        acc[exp.categoria] += exp.valor;
        return acc;
      }, {});

      const summaryRows = Object.keys(totalsByCategory)
        .map(cat => ({
          categoria: cat,
          valor: totalsByCategory[cat]
        }))
        .sort((a, b) => b.valor - a.valor)
        .map(item => [
          item.categoria,
          `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);

      // Verificar se vai precisar quebrar a página
      if (finalY > pdf.internal.pageSize.getHeight() - 60) {
        pdf.addPage();
        finalY = 20;
      }

      pdf.setFontSize(14);
      pdf.text("Resumo por Categoria", 14, finalY + 5);

      autoTable(pdf, {
        head: [["Categoria", "Valor Total"]],
        body: summaryRows,
        startY: finalY + 10,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // Blue 600 do tailwind para mais vivo
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { font: 'helvetica', fontSize: 10 },
      });

      finalY = (pdf.lastAutoTable && pdf.lastAutoTable.finalY) ? pdf.lastAutoTable.finalY + 15 : finalY + 50 + (summaryRows.length * 10);
    }

    // Salvar diretamente após desenhar as tabelas, removendo a dependência do html2canvas 
    // que não possui parser para OKLCH do Tailwind v4.
    const safeMonthName = monthName.toLowerCase().replace('ç', 'c');
    pdf.save(`gastos-${safeMonthName}-${year}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Verifique o console.');
  }
};
