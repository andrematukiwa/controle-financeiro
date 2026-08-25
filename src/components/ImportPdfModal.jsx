import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Check, AlertTriangle, FileWarning, Receipt } from 'lucide-react';
import { CATEGORIAS, CATEGORIAS_ENTRADA } from '../constants';

const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function formatarMesAno(mesAno) {
  const [ano, mes] = mesAno.split('-').map(Number);
  return `${MESES_NOMES[mes - 1]} de ${ano}`;
}

function isDuplicate(item, existingExpenses) {
  return existingExpenses.some((exp) =>
    exp.data === item.data &&
    exp.valor === item.valor &&
    exp.descricao.trim().toLowerCase() === item.descricao.trim().toLowerCase()
  );
}

const PAGAMENTO_FATURA_RE = /pagamento de fatura/i;

// Um "Pagamento de fatura" no extrato é o mesmo dinheiro que já entrou como gasto
// individual quando a fatura daquele mês foi importada — contar os dois duplicaria o valor.
// Só concilia quando o valor bate exatamente com o total de alguma fatura já importada;
// pagamentos parciais/rotativo não têm como ser conciliados automaticamente.
function encontrarFaturaConciliada(item, existingExpenses) {
  if (item.tipo === 'entrada') return null;
  if (!PAGAMENTO_FATURA_RE.test(item.descricao)) return null;

  const totaisPorMes = {};
  existingExpenses
    .filter((exp) => exp.origem === 'fatura')
    .forEach((exp) => {
      const mesAno = exp.data.slice(0, 7);
      totaisPorMes[mesAno] = (totaisPorMes[mesAno] || 0) + exp.valor;
    });

  const TOLERANCIA = 0.01;
  const encontrado = Object.entries(totaisPorMes).find(
    ([, total]) => Math.abs(total - item.valor) < TOLERANCIA
  );

  return encontrado ? { mesAno: encontrado[0], valor: encontrado[1] } : null;
}

export function ImportPdfModal({ parsedItems, existingExpenses, onConfirm, onClose }) {
  const [rows, setRows] = useState(() =>
    parsedItems.map((item) => {
      const duplicado = isDuplicate(item, existingExpenses);
      const faturaConciliada = encontrarFaturaConciliada(item, existingExpenses);
      return { tempId: uuidv4(), ...item, duplicado, faturaConciliada, incluido: !duplicado && !faturaConciliada };
    })
  );

  const updateRow = (tempId, changes) => {
    setRows((prev) => prev.map((row) => (row.tempId === tempId ? { ...row, ...changes } : row)));
  };

  const handleTipoChange = (tempId, novoTipo) => {
    setRows((prev) => prev.map((row) => {
      if (row.tempId !== tempId) return row;
      const opcoes = novoTipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS;
      const categoria = opcoes[row.categoria] ? row.categoria : '';
      return { ...row, tipo: novoTipo, categoria };
    }));
  };

  const selectedRows = rows.filter((row) => row.incluido);
  const selectedEntradas = selectedRows.filter((row) => row.tipo === 'entrada').reduce((acc, row) => acc + (parseFloat(row.valor) || 0), 0);
  const selectedSaidas = selectedRows.filter((row) => row.tipo !== 'entrada').reduce((acc, row) => acc + (parseFloat(row.valor) || 0), 0);

  const handleConfirm = () => {
    const expenses = selectedRows.map((row) => ({
      id: uuidv4(),
      valor: parseFloat(row.valor),
      categoria: row.categoria,
      data: row.data,
      descricao: row.descricao.trim(),
      tipo: row.tipo === 'entrada' ? 'entrada' : 'saida',
      origem: row.origem,
      criadoEm: new Date().toISOString(),
    }));
    onConfirm(expenses);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Importar PDF</h2>
            <p className="text-sm text-slate-500 mt-1">
              {rows.length} transações encontradas · {selectedRows.length} selecionadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2">
          {rows.map((row) => {
            const isEntrada = row.tipo === 'entrada';
            const categoriaOptions = isEntrada ? CATEGORIAS_ENTRADA : CATEGORIAS;

            return (
              <div
                key={row.tempId}
                className={`flex flex-col sm:flex-row gap-3 p-3 rounded-xl border items-start sm:items-center ${
                  row.duplicado
                    ? 'border-amber-200 bg-amber-50'
                    : row.faturaConciliada
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={row.incluido}
                  onChange={(e) => updateRow(row.tempId, { incluido: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 shrink-0 mt-1 sm:mt-0"
                  aria-label="Incluir na importação"
                />

                <div className="flex gap-0.5 p-0.5 bg-slate-200/60 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTipoChange(row.tempId, 'saida')}
                    className={`px-2 h-7 rounded-md text-xs font-semibold transition-colors ${!isEntrada ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoChange(row.tempId, 'entrada')}
                    className={`px-2 h-7 rounded-md text-xs font-semibold transition-colors ${isEntrada ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                  >
                    Entrada
                  </button>
                </div>

                <input
                  type="date"
                  value={row.data}
                  onChange={(e) => updateRow(row.tempId, { data: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium bg-white w-full sm:w-36"
                />

                <input
                  type="text"
                  value={row.descricao}
                  onChange={(e) => updateRow(row.tempId, { descricao: e.target.value })}
                  maxLength={100}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium bg-white flex-1 min-w-0"
                />

                <select
                  value={row.categoria}
                  onChange={(e) => updateRow(row.tempId, { categoria: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium bg-white w-full sm:w-40"
                >
                  <option value="" disabled>Categoria</option>
                  {Object.keys(categoriaOptions).map((cat) => (
                    <option key={cat} value={cat}>
                      {categoriaOptions[cat].emoji} {cat}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={row.valor}
                  onChange={(e) => updateRow(row.tempId, { valor: e.target.value })}
                  className={`px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold bg-white w-full sm:w-28 text-right ${isEntrada ? 'text-emerald-700' : 'text-slate-800'}`}
                />

                {row.duplicado && (
                  <span
                    className="flex items-center gap-1 text-amber-700 text-xs font-semibold shrink-0"
                    title="Já existe um lançamento com a mesma data, valor e descrição"
                  >
                    <AlertTriangle size={14} /> Possível duplicata
                  </span>
                )}

                {!row.duplicado && row.faturaConciliada && (
                  <span
                    className="flex items-center gap-1 text-indigo-700 text-xs font-semibold shrink-0"
                    title="O valor bate com a fatura desse mês já importada — contar os dois duplicaria o gasto"
                  >
                    <Receipt size={14} /> Já contabilizado na fatura de {formatarMesAno(row.faturaConciliada.mesAno)}
                  </span>
                )}
              </div>
            );
          })}

          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <FileWarning size={48} className="mb-3" />
              Nenhuma transação encontrada nesse PDF.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm font-semibold text-slate-600">
            {selectedEntradas > 0 && (
              <span>
                Entradas:{' '}
                <span className="text-emerald-600 font-extrabold">
                  + R$ {selectedEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            )}
            {selectedSaidas > 0 && (
              <span>
                Saídas:{' '}
                <span className="text-blue-600 font-extrabold">
                  R$ {selectedSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedRows.length === 0}
              className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={18} strokeWidth={2.5} />
              Importar{selectedRows.length > 0 ? ` (${selectedRows.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
