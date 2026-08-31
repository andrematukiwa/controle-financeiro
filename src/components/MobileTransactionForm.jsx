import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// Bottom sheet exclusivo do mobile (escondido em telas lg+ via CSS) que reaproveita
// o ExpenseForm existente como children — nenhuma regra de validação é duplicada aqui.
export function MobileTransactionForm({ onClose, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-h-[92vh] overflow-y-auto transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-slate-300" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 p-2 rounded-full bg-white text-slate-500 shadow-md hover:text-slate-800 transition-colors"
          aria-label="Fechar formulário"
        >
          <X size={18} />
        </button>
        <div className="px-3 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
