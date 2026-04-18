import React, { useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { Header } from './components/Header';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpensesChart } from './components/ExpensesChart';

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
          
          <ExpenseList 
            expenses={currentMonthExpenses}
            onEdit={handleEdit}
            onDelete={deleteExpense}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-2">
            <ExpensesChart expenses={currentMonthExpenses} />
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
