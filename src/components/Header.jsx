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
    <header className="mb-0 p-6 md:p-8 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="flex flex-col items-center flex-1 order-1 md:order-none w-full md:w-auto mt-4 md:mt-0">
        <span className="text-sm uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
          Total do Mês
          <span className="bg-blue-100 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-extrabold shadow-sm">
            {count} {count === 1 ? 'registro' : 'registros'}
          </span>
        </span>
        <span className="text-4xl md:text-5xl font-extrabold mt-2 text-slate-800 tracking-tight flex items-baseline">
          <span className="text-2xl text-blue-600 font-bold mr-1.5">R$</span>
          {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 w-full md:w-auto justify-between shadow-sm">
        <button 
          onClick={prevMonth} 
          className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 active:scale-95"
          aria-label="Mês anterior"
        >
          <ChevronLeft strokeWidth={3} size={20} />
        </button>
        <div className="text-lg md:text-xl font-extrabold min-w-[150px] text-center text-slate-800 capitalize tracking-wide">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button 
          onClick={nextMonth} 
          className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 active:scale-95"
          aria-label="Próximo mês"
        >
          <ChevronRight strokeWidth={3} size={20} />
        </button>
      </div>

      <button
        onClick={handleExport}
        className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all px-5 py-3 rounded-xl shadow-sm font-semibold text-sm focus:ring-4 focus:ring-slate-100 active:scale-95"
      >
        <FileDown size={20} strokeWidth={2.5} />
        <span>Exportar PDF</span>
      </button>
    </header>
  );
}
