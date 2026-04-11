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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sortedExpenses.map((expense, index) => {
        const catInfo = CATEGORIAS[expense.categoria] || { emoji: '📌', cor: '#E5E5E5' };
        const isDeleting = deletingId === expense.id;
        const randomRotation = `rot-rand-${(index % 4) + 1}`;

        return (
          <div 
            key={expense.id}
            className={`p-5 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${isDeleting ? 'bg-red-100' : ''}`}
            style={{ 
              backgroundColor: isDeleting ? '#fef2f2' : catInfo.cor
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center text-3xl">
                  {catInfo.emoji}
                </div>
                <div>
                  <h4 className="font-black text-xl text-black uppercase tracking-wide leading-none mb-1">{expense.categoria}</h4>
                  <span className="text-sm font-bold text-black/70">
                    {new Date(expense.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                </div>
              </div>

              {!isDeleting && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(expense)}
                    className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 size={18} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => setDeletingId(expense.id)}
                    className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Trash2 size={18} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>

            {expense.descricao && !isDeleting && (
              <p className="text-black font-extrabold text-lg flex-1">
                {expense.descricao}
              </p>
            )}

            <div className="mt-2">
              {!isDeleting ? (
                <div className="text-right">
                  <span className="text-3xl font-black text-black bg-white/50 px-3 py-1 rounded border-2 border-black">
                    R$ {expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 bg-white p-3 rounded border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                   <div className="text-red-600 font-bold flex items-center gap-2 justify-center text-lg">
                     <AlertTriangle size={20} strokeWidth={3} /> Apagar?
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setDeletingId(null)}
                       className="flex-1 px-3 py-2 bg-gray-200 text-black font-black border-2 border-black rounded hover:bg-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                     >
                       Não
                     </button>
                     <button 
                       onClick={() => onDelete(expense.id)}
                       className="flex-1 px-3 py-2 bg-red-400 text-white font-black border-2 border-black rounded hover:bg-red-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                     >
                       Sim
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
