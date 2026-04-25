import React, { useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { Header } from './components/Header';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpensesChart } from './components/ExpensesChart';
import { CATEGORIAS } from './constants';
import { Filter } from 'lucide-react';

function App() {
  const {
    currentDate,
    currentMonthExpenses,
    monthTotal,
    addExpense,
    editExpense,
    deleteExpense,
    nextMonth,
    prevMonth,
  } = useExpenses();

  const [editingExpense, setEditingExpense] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  // Reset filters when month changes
  React.useEffect(() => {
    setCategoryFilter('');
    setDayFilter('');
  }, [currentDate]);

  const uniqueDays = [...new Set(currentMonthExpenses.map(exp => exp.data.split('-')[2]))].sort();

  const filteredExpenses = currentMonthExpenses.filter(exp => {
    if (categoryFilter && exp.categoria !== categoryFilter) return false;
    if (dayFilter) {
      const expDay = exp.data.split('-')[2];
      if (expDay !== dayFilter) return false;
    }
    return true;
  });

  const filteredTotal = filteredExpenses.reduce((acc, exp) => acc + exp.valor, 0);

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

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 bg-slate-50 text-slate-800 font-sans">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start pb-12">
        
        <aside className="w-full lg:w-[35%] lg:sticky lg:top-8 z-10 shrink-0">
          <ExpenseForm 
            key={editingExpense ? `edit-${editingExpense.id}` : 'new'}
            onSubmit={handleFormSubmit}
            initialData={editingExpense}
            onCancel={handleCancelEdit}
            currentDate={currentDate}
          />
        </aside>

        <main id="dashboard-exportable-area" className="w-full lg:w-[65%] flex flex-col gap-6 xl:gap-8">
          <Header 
            currentDate={currentDate}
            nextMonth={nextMonth}
            prevMonth={prevMonth}
            total={monthTotal}
            count={currentMonthExpenses.length}
            expenses={currentMonthExpenses}
          />
          
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all">
            <div className="flex items-center gap-3 text-slate-700 font-bold w-full sm:w-auto tracking-tight">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Filter size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span>Filtros</span>
                {(categoryFilter || dayFilter) && (
                  <span className="text-xs font-semibold text-slate-500 mt-0.5">
                    Total: <span className="text-blue-600 font-extrabold">R$ {filteredTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 justify-end">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-sm w-full sm:w-auto cursor-pointer shadow-sm appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem', paddingRight: '2.5rem' }}
              >
                <option value="">Todas as Categorias</option>
                {Object.keys(CATEGORIAS).map(cat => (
                  <option key={cat} value={cat}>{CATEGORIAS[cat].emoji} {cat}</option>
                ))}
              </select>

              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-sm w-full sm:w-auto cursor-pointer shadow-sm appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem', paddingRight: '2.5rem' }}
              >
                <option value="">Todos os Dias</option>
                {uniqueDays.map(day => (
                  <option key={day} value={day}>Dia {day}</option>
                ))}
              </select>
            </div>
          </div>
          
          <ExpenseList 
            expenses={filteredExpenses}
            onEdit={handleEdit}
            onDelete={deleteExpense}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-2">
            <ExpensesChart expenses={filteredExpenses} />
          </div>
        </main>

      </div>

      <footer className="text-center mt-8 text-slate-500 font-medium text-sm">
        Controle de Gastos &copy; {new Date().getFullYear()} - Gerencie suas finanças com inteligência
      </footer>
    </div>
  );
}

export default App;
