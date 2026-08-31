import React, { useRef, useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { Header } from './components/Header';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpensesChart } from './components/ExpensesChart';
import { ImportPdfModal } from './components/ImportPdfModal';
import { CATEGORIAS } from './constants';
import { Filter, RotateCcw, Sparkles, BarChart3, X } from 'lucide-react';

const SELECT_CLASS = "h-10 bg-[#F4F7FB] border border-[#E5EAF2] text-slate-700 rounded-[12px] px-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-sm cursor-pointer appearance-none";
const SELECT_ARROW_STYLE = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.6rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.1rem', paddingRight: '2.25rem' };

function App() {
  const {
    expenses,
    currentDate,
    currentMonthExpenses,
    duplicatasPagamentoFatura,
    monthTotal,
    monthEntradas,
    monthSaldo,
    saidasTrend,
    entradasTrend,
    saldoTrend,
    saidasCount,
    entradasCount,
    saidasOverrideActive,
    entradasOverrideActive,
    setSaidasOverride,
    setEntradasOverride,
    addExpense,
    addExpenses,
    editExpense,
    deleteExpense,
    nextMonth,
    prevMonth,
  } = useExpenses();

  const [editingExpense, setEditingExpense] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  const fileInputRef = useRef(null);
  const [importCandidates, setImportCandidates] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');

  // Reset filters when month changes
  React.useEffect(() => {
    setCategoryFilter('');
    setDayFilter('');
    setTipoFilter('');
  }, [currentDate]);

  const uniqueDays = [...new Set(currentMonthExpenses.map(exp => exp.data.split('-')[2]))].sort();

  const filteredExpenses = currentMonthExpenses.filter(exp => {
    if (categoryFilter && exp.categoria !== categoryFilter) return false;
    if (tipoFilter && (exp.tipo === 'entrada' ? 'entrada' : 'saida') !== tipoFilter) return false;
    if (dayFilter) {
      const expDay = exp.data.split('-')[2];
      if (expDay !== dayFilter) return false;
    }
    return true;
  });

  const hasActiveFilters = categoryFilter || dayFilter || tipoFilter;

  const handleFormSubmit = (expense) => {
    if (editingExpense) {
      editExpense(editingExpense.id, expense);
      setEditingExpense(null);
    } else {
      addExpense(expense);
    }
  };

  const handleEdit = (expense) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingExpense(expense);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImportError('');
    setImportLoading(true);
    try {
      // Importado sob demanda: pdfjs-dist é pesado (~1.2MB, worker incluso) e só é
      // necessário quando o usuário realmente importa um PDF.
      const { parseNubankPdf } = await import('./utils/parseNubankPdf');
      const items = await parseNubankPdf(file);
      if (items.length === 0) {
        setImportError('Não foi possível encontrar transações nesse PDF. Confira se é uma fatura ou extrato do Nubank.');
      } else {
        setImportCandidates(items);
      }
    } catch (err) {
      console.error('Erro ao importar PDF', err);
      setImportError(err.message || 'Erro ao ler o PDF. Confira se o arquivo não está corrompido.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = (expensesToAdd) => {
    addExpenses(expensesToAdd);
    setImportCandidates(null);
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 bg-[#F4F7FB] text-slate-800 font-sans">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start pb-12">

        <aside className="w-full lg:w-[35%] lg:sticky lg:top-8 z-10 shrink-0">
          <ExpenseForm 
            key={editingExpense ? `edit-${editingExpense.id}` : 'new'}
            onSubmit={handleFormSubmit}
            initialData={editingExpense}
            onCancel={handleCancelEdit}
            currentDate={currentDate}
          />
        </aside>

        <main id="dashboard-exportable-area" className="w-full lg:w-[65%] flex flex-col gap-5">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <Header
            currentDate={currentDate}
            nextMonth={nextMonth}
            prevMonth={prevMonth}
            total={monthTotal}
            entradas={monthEntradas}
            saldo={monthSaldo}
            saidasTrend={saidasTrend}
            entradasTrend={entradasTrend}
            saldoTrend={saldoTrend}
            saidasCount={saidasCount}
            entradasCount={entradasCount}
            saidasOverrideActive={saidasOverrideActive}
            entradasOverrideActive={entradasOverrideActive}
            onSaidasOverride={setSaidasOverride}
            onEntradasOverride={setEntradasOverride}
            expenses={currentMonthExpenses}
            duplicatasPagamentoFatura={duplicatasPagamentoFatura}
            onImportClick={handleImportClick}
            importLoading={importLoading}
          />

          {importError && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 flex items-center justify-between gap-3 text-sm font-medium">
              <span>{importError}</span>
              <button onClick={() => setImportError('')} className="text-red-400 hover:text-red-600 shrink-0" aria-label="Fechar aviso">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="bg-white p-3 rounded-[18px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-[#E5EAF2] flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 pl-1 shrink-0">
              <Filter size={16} strokeWidth={2.5} />
              <span className="text-sm font-semibold">Filtros</span>
            </div>

            <select
              aria-label="Filtrar por tipo"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Entradas e Saídas</option>
              <option value="saida">Só Saídas</option>
              <option value="entrada">Só Entradas</option>
            </select>

            <select
              aria-label="Filtrar por categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Todas as Categorias</option>
              {Object.keys(CATEGORIAS).map(cat => (
                <option key={cat} value={cat}>{CATEGORIAS[cat].emoji} {cat}</option>
              ))}
            </select>

            <select
              aria-label="Filtrar por dia"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Todos os Dias</option>
              {uniqueDays.map(day => (
                <option key={day} value={day}>Dia {day}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setCategoryFilter('');
                setDayFilter('');
                setTipoFilter('');
              }}
              disabled={!hasActiveFilters}
              className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-default transition-colors px-2"
            >
              <RotateCcw size={14} strokeWidth={2.5} />
              Limpar filtros
            </button>
          </div>

          <ExpenseList
            expenses={filteredExpenses}
            onEdit={handleEdit}
            onDelete={deleteExpense}
            duplicatasPagamentoFatura={duplicatasPagamentoFatura}
          />

          <div className="bg-white rounded-[18px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-[#E5EAF2] overflow-hidden mt-2">
            <ExpensesChart expenses={filteredExpenses} />
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-[18px] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Sparkles size={20} className="text-violet-500 shrink-0" strokeWidth={2.25} />
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-800">Continue assim!</span> Você está no caminho certo para uma vida financeira saudável.
              </p>
            </div>
            <button
              onClick={() => document.getElementById('expenses-chart')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 bg-white text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors px-4 h-10 rounded-[12px] font-semibold text-sm shrink-0"
            >
              <BarChart3 size={16} strokeWidth={2.5} />
              Ver Relatórios
            </button>
          </div>
        </main>

      </div>

      <footer className="text-center mt-8 text-slate-500 font-medium text-sm">
        Controle de Gastos &copy; {new Date().getFullYear()} - Gerencie suas finanças com inteligência
      </footer>

      {importCandidates && (
        <ImportPdfModal
          parsedItems={importCandidates}
          existingExpenses={expenses}
          onConfirm={handleConfirmImport}
          onClose={() => setImportCandidates(null)}
        />
      )}
    </div>
  );
}

export default App;
