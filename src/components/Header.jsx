import React from 'react';
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/exportPdf';

export function Header({ currentDate, nextMonth, prevMonth, total, count, expenses }) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleExport = () => {
    exportDashboardToPDF(currentDate.getMonth(), currentDate.getFullYear(), total, expenses);
  };

  return (
    <header className="mb-10 p-6 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative rot-rand-1">
      <div className="flex items-center gap-4 bg-gray-100 border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2">
        <button 
          onClick={prevMonth} 
          className="p-1 bg-white border-2 border-black rounded md:hover:-translate-y-1 hover:bg-[#fb923c] hover:text-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          aria-label="Mês anterior"
        >
          <ChevronLeft strokeWidth={3} />
        </button>
        <div className="text-2xl font-black min-w-[200px] text-center uppercase tracking-wider">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button 
          onClick={nextMonth} 
          className="p-1 bg-white border-2 border-black rounded md:hover:-translate-y-1 hover:bg-[#fb923c] hover:text-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          aria-label="Próximo mês"
        >
          <ChevronRight strokeWidth={3} />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-800 uppercase tracking-widest font-black flex items-center gap-2">
          Total do Mês
          <span className="bg-[#60a5fa] text-black text-xs px-2 py-0.5 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">
            {count} {count === 1 ? 'registro' : 'registros'}
          </span>
        </span>
        <span className="text-5xl font-black mt-2 text-[#4ade80] tracking-tighter" style={{ textShadow: '3px 3px 0px rgba(0,0,0,1)' }}>
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <button
        onClick={handleExport}
        className="flex items-center gap-2 bg-[#facc15] text-black hover:bg-[#fde047] transition-all hover:-translate-y-1 px-5 py-3 border-4 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] font-black text-xl rot-rand-2"
      >
        <FileDown size={24} strokeWidth={3} />
        Gerar PDF
      </button>
    </header>
  );
}
