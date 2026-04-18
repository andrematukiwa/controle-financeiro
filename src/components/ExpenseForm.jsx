import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIAS } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ExpenseForm({ onSubmit, initialData = null, onCancel, currentDate }) {
  const getDefaultDate = () => {
    if (currentDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const today = new Date();
      let day = String(currentDate.getDate()).padStart(2, '0');
      if (year === today.getFullYear() && currentDate.getMonth() === today.getMonth()) {
        day = String(today.getDate()).padStart(2, '0');
      }
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(getDefaultDate());
  const [descricao, setDescricao] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valorInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setValor(initialData.valor.toString());
      setCategoria(initialData.categoria);
      setData(initialData.data);
      setDescricao(initialData.descricao || '');
    } else {
      setData(getDefaultDate());
    }
  }, [initialData, currentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setSuccessMsg('');

    const parsedValor = parseFloat(valor.replace(',', '.'));
    if (isNaN(parsedValor) || parsedValor < 0.01) {
      setError('Por favor, insira um valor válido maior que 0.');
      return;
    }
    if (!categoria) {
      setError('A categoria é obrigatória.');
      return;
    }
    if (!data) {
      setError('A data é obrigatória.');
      return;
    }

    setIsSubmitting(true);

    const expense = {
      id: initialData ? initialData.id : uuidv4(),
      valor: parsedValor,
      categoria,
      data,
      descricao: descricao.trim(),
      criadoEm: initialData ? initialData.criadoEm : new Date().toISOString(),
    };

    // Simulate slight delay to prevent instant double-click and show loading
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit(expense);

    if (!initialData) {
      setSuccessMsg('Gasto registrado com sucesso!');
      setValor('');
      setCategoria('');
      setDescricao('');
      setData(getDefaultDate());
      
      if (valorInputRef.current) {
        valorInputRef.current.focus();
      }
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } else {
      // For edit, the parent handles closing, but we format the message if it stays open
      setSuccessMsg('Alterações salvas!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }

    setIsSubmitting(false);
  };

  const isEditing = !!initialData;
  const editingCatColor = (isEditing && categoria && CATEGORIAS[categoria]) ? CATEGORIAS[categoria].cor : null;

  return (
    <form 
      onSubmit={handleSubmit} 
      autoComplete="off"
      className={`p-6 md:p-8 rounded-2xl transition-all duration-300 min-h-[60vh] flex flex-col justify-between relative overflow-hidden ${editingCatColor ? 'border-2 shadow-md' : 'bg-white shadow-sm border border-slate-200'}`}
      style={{
        backgroundColor: editingCatColor ? editingCatColor + '1A' : undefined,
        borderColor: editingCatColor ? editingCatColor + '66' : undefined
      }}
    >
      {editingCatColor ? (
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: editingCatColor }}></div>
      ) : (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-400"></div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          {initialData ? '✏️ Editar Registro' : '📝 Novo Registro'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 mb-6 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 mb-6 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        <div className="flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense_valor" className="font-semibold text-sm text-slate-600">Valor (R$)</label>
            <input
              id="expense_valor"
              name="expense_valor_unique"
              ref={valorInputRef}
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-slate-800 font-medium disabled:opacity-50"
              placeholder="0,00"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense_categoria" className="font-semibold text-sm text-slate-600">Categoria</label>
            <select
              id="expense_categoria"
              name="expense_categoria_unique"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-slate-800 font-medium disabled:opacity-50"
            >
              <option value="" disabled>Selecione uma categoria</option>
              {Object.keys(CATEGORIAS).map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORIAS[cat].emoji} {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense_data" className="font-semibold text-sm text-slate-600">Data</label>
            <input
              id="expense_data"
              name="expense_data_unique"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-slate-800 font-medium disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense_descricao" className="font-semibold text-sm text-slate-600 flex justify-between">
              Descrição
              <span className="text-slate-400 font-normal text-xs">({descricao.length}/100)</span>
            </label>
            <input
              id="expense_descricao"
              name="expense_desc_unique"
              type="text"
              maxLength={100}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
              data-form-type="other"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-slate-800 font-medium disabled:opacity-50"
              placeholder="Ex: Almoço, Supermercado..."
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3 flex-col sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] focus:ring-4 focus:ring-blue-200 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            initialData ? 'Salvar Alterações' : '+ Registrar Gasto'
          )}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-slate-100 text-slate-700 font-bold text-lg py-4 px-4 rounded-xl shadow-sm hover:bg-slate-200 active:scale-[0.98] focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
