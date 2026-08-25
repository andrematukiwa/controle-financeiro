import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIAS, CATEGORIAS_ENTRADA } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, AlertCircle, Loader2, FileText, LayoutGrid, Calendar, Lightbulb } from 'lucide-react';

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
  const [tipo, setTipo] = useState('saida');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valorInputRef = useRef(null);

  const categoriaOptions = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS;

  useEffect(() => {
    if (initialData) {
      setValor(initialData.valor.toString());
      setCategoria(initialData.categoria);
      setData(initialData.data);
      setDescricao(initialData.descricao || '');
      setTipo(initialData.tipo === 'entrada' ? 'entrada' : 'saida');
    } else {
      setData(getDefaultDate());
    }
  }, [initialData, currentDate]);

  const handleTipoChange = (novoTipo) => {
    setTipo(novoTipo);
    const opcoes = novoTipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS;
    if (!opcoes[categoria]) setCategoria('');
  };

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
      tipo,
      origem: initialData ? (initialData.origem || 'manual') : 'manual',
      criadoEm: initialData ? initialData.criadoEm : new Date().toISOString(),
    };

    // Simulate slight delay to prevent instant double-click and show loading
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit(expense);

    if (!initialData) {
      setSuccessMsg(tipo === 'entrada' ? 'Entrada registrada com sucesso!' : 'Gasto registrado com sucesso!');
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
  const inputClass = "w-full h-12 px-4 bg-[#F4F7FB] border border-[#E5EAF2] rounded-[14px] hover:border-blue-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-slate-800 font-medium disabled:opacity-50 placeholder:text-slate-400";

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="p-8 rounded-[24px] bg-white border border-[#E5EAF2] shadow-[0_8px_30px_rgba(15,23,42,0.05)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 via-blue-600 to-violet-600"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-[14px] flex items-center justify-center bg-violet-100 text-violet-600 shrink-0">
          <FileText size={20} strokeWidth={2.25} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {initialData ? 'Editar Registro' : 'Novo Registro'}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {initialData ? 'Ajuste os dados do lançamento.' : 'Adicione um novo lançamento'}
          </p>
        </div>
      </div>

      {!isEditing && (
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-full mb-6">
          <button
            type="button"
            onClick={() => handleTipoChange('saida')}
            disabled={isSubmitting}
            className={`h-10 rounded-full text-sm font-bold transition-all ${
              tipo === 'saida'
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]'
                : 'bg-red-50 text-red-500'
            }`}
          >
            Saída
          </button>
          <button
            type="button"
            onClick={() => handleTipoChange('entrada')}
            disabled={isSubmitting}
            className={`h-10 rounded-full text-sm font-bold transition-all ${
              tipo === 'entrada'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            Entrada
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-[14px] border border-red-100 mb-4 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-[14px] border border-emerald-100 mb-4 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense_valor" className="font-medium text-sm text-slate-600">Valor (R$)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">R$</span>
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
              className={`${inputClass} pl-11 text-lg font-bold`}
              placeholder="0,00"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense_categoria" className="font-medium text-sm text-slate-600">Categoria</label>
          <div className="relative">
            <LayoutGrid size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              id="expense_categoria"
              name="expense_categoria_unique"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={isSubmitting}
              className={`${inputClass} pl-11`}
            >
              <option value="" disabled>Selecione uma categoria</option>
              {Object.keys(categoriaOptions).map(cat => (
                <option key={cat} value={cat}>
                  {categoriaOptions[cat].emoji} {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense_data" className="font-medium text-sm text-slate-600">Data</label>
          <div className="relative">
            <Calendar size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="expense_data"
              name="expense_data_unique"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              disabled={isSubmitting}
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense_descricao" className="font-medium text-sm text-slate-600 flex justify-between">
            Descrição
            <span className="text-slate-400 font-normal text-xs">({descricao.length}/100)</span>
          </label>
          <textarea
            id="expense_descricao"
            name="expense_desc_unique"
            maxLength={100}
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            disabled={isSubmitting}
            autoComplete="off"
            data-form-type="other"
            className={`${inputClass} h-auto py-3 resize-none`}
            placeholder="Ex: Almoço, Supermercado, Transferência..."
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3 flex-col sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-[52px] text-white font-semibold rounded-[16px] active:scale-[0.98] focus:ring-4 focus:ring-blue-200 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_28px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-violet-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : initialData ? (
            'Salvar Alterações'
          ) : (
            '+ Registrar Lançamento'
          )}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-[52px] bg-slate-100 text-slate-700 font-semibold rounded-[16px] hover:bg-slate-200 active:scale-[0.98] focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="mt-5 bg-violet-50 border border-violet-100 rounded-[14px] p-3.5 flex items-start gap-2.5">
          <Lightbulb size={16} className="text-violet-500 shrink-0 mt-0.5" strokeWidth={2.25} />
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">Dica:</span> mantenha seus lançamentos organizados para ter melhor controle financeiro.
          </p>
        </div>
      )}
    </form>
  );
}
