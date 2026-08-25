import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIAS, CATEGORIAS_ENTRADA } from '../constants';
import { Edit2, Trash2, AlertTriangle, MoreVertical, Calendar, Receipt } from 'lucide-react';

function CardMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Mais opções"
      >
        <MoreVertical size={17} strokeWidth={2.25} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-[12px] border border-[#E5EAF2] shadow-[0_18px_45px_rgba(15,23,42,0.10)] py-1.5 z-10 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Edit2 size={14} strokeWidth={2.25} /> Editar
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} strokeWidth={2.25} /> Apagar
          </button>
        </div>
      )}
    </div>
  );
}

export function ExpenseList({ expenses, onEdit, onDelete, duplicatasPagamentoFatura }) {
  const [deletingId, setDeletingId] = useState(null);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[18px] border border-[#E5EAF2] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        <h3 className="text-xl font-bold text-slate-700">
          Nenhum lançamento neste mês!
        </h3>
        <p className="text-slate-400 mt-1 text-sm">
          Sua carteira está a salvo... por enquanto.
        </p>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {sortedExpenses.map((expense) => {
        const isEntrada = expense.tipo === 'entrada';
        const categoriaMap = isEntrada ? CATEGORIAS_ENTRADA : CATEGORIAS;
        const catInfo = categoriaMap[expense.categoria] || { emoji: '📌', cor: '#94a3b8' };
        const isDeleting = deletingId === expense.id;
        const isDuplicado = duplicatasPagamentoFatura?.has(expense.id);

        return (
          <div
            key={expense.id}
            className={`relative rounded-[18px] bg-white border border-l-[5px] p-4 flex flex-col gap-2.5 transition-all duration-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] hover:-translate-y-[3px] ${
              isDeleting
                ? 'border-red-300 ring-2 ring-red-200 shadow-[0_4px_16px_rgba(15,23,42,0.04)]'
                : isDuplicado
                ? 'border-slate-200 opacity-60 shadow-none'
                : 'border-[#E5EAF2] shadow-[0_4px_16px_rgba(15,23,42,0.04)]'
            }`}
            style={{ borderLeftColor: isDeleting ? undefined : catInfo.cor }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: catInfo.cor + '1F' }}
                >
                  {catInfo.emoji}
                </div>
                <h4 className="font-bold text-slate-800 tracking-tight truncate">{expense.categoria}</h4>
              </div>

              {!isDeleting && <CardMenu onEdit={() => onEdit(expense)} onDelete={() => setDeletingId(expense.id)} />}
            </div>

            {expense.descricao && !isDeleting && (
              <p className="text-sm text-slate-500 break-words leading-snug pl-[46px] -mt-1.5">
                {expense.descricao}
              </p>
            )}

            {isDuplicado && !isDeleting && (
              <span
                className="flex items-center gap-1 text-amber-600 text-xs font-semibold pl-[46px] -mt-1"
                title="O valor bate com a fatura desse mês já importada — não entra no total pra não contar o gasto duas vezes"
              >
                <Receipt size={12} /> Já contabilizado na fatura, não soma no total
              </span>
            )}

            {!isDeleting ? (
              <div className="flex items-center justify-between pl-[46px] mt-0.5">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar size={12} strokeWidth={2.5} />
                  {new Date(expense.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })}
                </span>
                <span className={`text-xl font-extrabold tracking-tight ${isEntrada ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {isEntrada ? (
                    '+ '
                  ) : (
                    <span className="text-red-500">- </span>
                  )}
                  R$ {expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mt-1">
                <div className="text-red-600 font-semibold flex items-center gap-2 justify-center text-sm">
                  <AlertTriangle size={16} strokeWidth={2.5} /> Deseja apagar?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-[10px] hover:bg-slate-200 transition-colors text-sm"
                  >
                    Não
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white font-semibold rounded-[10px] hover:bg-red-600 transition-colors text-sm"
                  >
                    Sim, Apagar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
