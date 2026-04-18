import React, { useState } from 'react';
import { CATEGORIAS } from '../constants';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';

export function ExpenseList({ expenses, onEdit, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-sketch shadow-sketch bg-white rot-rand-4">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        <h3 className="text-2xl font-bold text-gray-500" style={{ fontFamily: 'var(--font-sketch-title)' }}>
          Nenhum gasto neste mês!
        </h3>
        <p className="text-gray-400 mt-2 text-lg">
          Sua carteira está a salvo... por enquanto.
        </p>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
      {sortedExpenses.map((expense) => {
        const catInfo = CATEGORIAS[expense.categoria] || { emoji: '📌', cor: '#E5E5E5' };
        const isDeleting = deletingId === expense.id;

        return (
          <div 
            key={expense.id}
            className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isDeleting ? 'ring-4 ring-red-500 bg-red-100/80 border-red-500' : 'shadow-sm'}`}
            style={{
              backgroundColor: isDeleting ? '' : catInfo.cor + '4D', // 30% opacity para bem vivo
              borderColor: isDeleting ? '' : catInfo.cor // Borda 100% sólida da cor
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-sm"
                  style={{ backgroundColor: catInfo.cor + '40', color: catInfo.cor }} // 40 is hex for 25% opacity
                >
                  {catInfo.emoji}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 tracking-tight leading-tight mb-0.5">{expense.categoria}</h4>
                  <span className="text-xs font-semibold text-slate-500">
                    {new Date(expense.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                </div>
              </div>

              {!isDeleting && (
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => onEdit(expense)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
                    aria-label="Editar"
                  >
                    <Edit2 size={18} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setDeletingId(expense.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
                    aria-label="Apagar"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

            {expense.descricao && !isDeleting && (
              <p className="text-slate-600 font-medium text-sm flex-1 break-words">
                {expense.descricao}
              </p>
            )}

            <div className="mt-2">
              {!isDeleting ? (
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    <span className="text-sm text-slate-400 font-semibold mr-1">R$</span>
                    {expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-red-100 shadow-sm">
                   <div className="text-red-600 font-semibold flex items-center gap-2 justify-center text-sm">
                     <AlertTriangle size={18} strokeWidth={2.5} /> Deseja apagar?
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setDeletingId(null)}
                       className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm"
                     >
                       Não
                     </button>
                     <button 
                       onClick={() => onDelete(expense.id)}
                       className="flex-1 px-3 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm"
                     >
                       Sim, Apagar
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
