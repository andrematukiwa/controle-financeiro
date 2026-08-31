import React from 'react';
import { ExpensesChart } from './ExpensesChart';

// Sempre em largura total, logo abaixo dos lançamentos — inclusive no desktop, onde
// colocá-lo ao lado da lista deixava os cards estreitos demais para ler a descrição.
export function ChartSection({ expenses }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-slate-800 px-1">Análise financeira</h3>
      <div className="bg-white rounded-[18px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-[#E5EAF2] overflow-hidden">
        <ExpensesChart expenses={expenses} />
      </div>
    </div>
  );
}
