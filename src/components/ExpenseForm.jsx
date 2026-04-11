import React, { useState, useEffect } from 'react';
import { CATEGORIAS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

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

    const expense = {
      id: initialData ? initialData.id : uuidv4(),
      valor: parsedValor,
      categoria,
      data,
      descricao: descricao.trim(),
      criadoEm: initialData ? initialData.criadoEm : new Date().toISOString(),
    };

    onSubmit(expense);

    if (!initialData) {
      setValor('');
      setCategoria('');
      setDescricao('');
      setData(getDefaultDate());
    }
  };

  const catColor = initialData && categoria && CATEGORIAS[categoria] 
    ? CATEGORIAS[categoria].cor 
    : '#f9fafb';

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-6 md:p-8 border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] rot-rand-3 mb-10 transition-colors duration-300 min-h-[75vh] flex flex-col justify-between"
      style={{ backgroundColor: catColor }}
    >
      <div>
        <h2 className="text-3xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight black-text-shadow">
        {initialData ? '✏️ Editar Registro' : '📝 Novo Registro'}
      </h2>

      {error && (
        <div className="bg-[#f472b6] text-black px-4 py-3 border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-6 text-center rot-rand-4 font-black text-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-2">
          <label className="font-black text-lg text-black uppercase tracking-wide">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 bg-white focus:outline-none transition-all text-xl font-bold text-black"
            placeholder="0,00"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-black text-lg text-black uppercase tracking-wide">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 bg-white focus:outline-none transition-all text-lg font-bold text-black"
          >
            <option value="" disabled>Selecione uma categoria</option>
            {Object.keys(CATEGORIAS).map(cat => (
              <option key={cat} value={cat}>
                {CATEGORIAS[cat].emoji} {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-black text-lg text-black uppercase tracking-wide">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 bg-white focus:outline-none transition-all text-lg font-bold text-black"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-black text-lg text-black uppercase tracking-wide flex justify-between">
            Descrição 
            <span className="text-black/70 font-bold text-sm">({descricao.length}/100)</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 bg-white focus:outline-none transition-all text-lg font-bold text-black"
            placeholder="Ex: Almoço de domingo"
          />
        </div>
      </div>
      </div>

      <div className="mt-8 flex gap-4 flex-col lg:flex-row">
        <button
          type="submit"
          className="flex-1 bg-[#4ade80] text-black text-xl font-black py-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] rot-rand-1 transition-all md:hover:-translate-y-1"
        >
          {initialData ? 'SALVAR ALTERAÇÕES' : '+ REGISTRAR'}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-black text-xl font-black py-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] rot-rand-4 transition-all md:hover:-translate-y-1"
          >
            CANCELAR
          </button>
        )}
      </div>
    </form>
  );
}
