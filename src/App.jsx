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
    <div className="min-h-screen px-4 py-8 md:px-8 bg-[#f3f0ea]">
      <div className="w-[95%] max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-[4fr_6fr] lg:grid-cols-[3.5fr_6.5fr] gap-8 items-start pb-12">
        
        <aside className="lg:sticky lg:top-8 w-full z-10">
          <ExpenseForm 
            key={editingExpense ? `edit-${editingExpense.id}` : 'new'}
            onSubmit={handleFormSubmit}
            initialData={editingExpense}
            onCancel={handleCancelEdit}
            currentDate={currentDate}
          />
        </aside>

        <main id="dashboard-exportable-area" className="flex flex-col gap-8 w-full">
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

          <ExpensesChart expenses={currentMonthExpenses} />
        </main>

      </div>

      <footer className="text-center mt-12 text-gray-500 font-bold">
        Controle de Gastos © {new Date().getFullYear()} - Cuidando do seu dinheiro 💰
      </footer>
    </div>
  );
}

export default App;
