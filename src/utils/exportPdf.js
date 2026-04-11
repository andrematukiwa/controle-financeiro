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
        headStyles: { fillColor: [168, 200, 232], textColor: 20 }, // Sketch blue
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: { font: 'helvetica', fontSize: 10 },
        margin: { top: 40 }
      });
      
      finalY = pdf.lastAutoTable.finalY + 15;
    } else {
      pdf.setFontSize(12);
      pdf.text("Nenhum gasto registrado neste mês.", 14, 45);
      finalY = 60;
    }

    // Capturar e anexar o gráfico (se existir e estiver renderizado na tela)
    const chartElement = document.getElementById('expenses-chart');
    if (chartElement) {
      // Evitar que o gráfico passe para a próxima página e quebre
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (finalY > pageHeight - 80) {
        pdf.addPage();
        finalY = 20;
      }

      pdf.setFontSize(14);
      pdf.text("Resumo por Categoria:", 14, finalY);
      
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#FFFDF7',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 28; // margem de 14mm em cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 14, finalY + 5, imgWidth, imgHeight);
    }
    
    const safeMonthName = monthName.toLowerCase().replace('ç', 'c');
    pdf.save(`gastos-${safeMonthName}-${year}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Verifique o console.');
  }
};
