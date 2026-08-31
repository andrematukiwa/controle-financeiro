import React from 'react';
import { ExpensesChart } from './ExpensesChart';

// Fixo (sticky) ao lado da lista só no desktop — no mobile ele desce naturalmente com
// o restante da página, como qualquer outra seção.
export function ChartSection({ expenses }) {
  return (
    <div className="xl:sticky xl:top-8 bg-white rounded-[18px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-[#E5EAF2] overflow-hidden">
      <ExpensesChart expenses={expenses} />
    </div>
  );
}
