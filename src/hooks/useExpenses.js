import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = '@gastos-mensais:expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load expenses from storage', e);
      return [];
    }
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = useCallback((expense) => {
    setExpenses((prev) => [...prev, expense]);
  }, []);

  const editExpense = useCallback((id, updatedExpense) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updatedExpense } : exp)));
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Filter expenses by current month and year
  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.data);
    // Considering the string is YYYY-MM-DD, the parsing using new Date()
    // might resolve to UTC, which could cause timezone shifts.
    // It's safer to extract parts if it's YYYY-MM-DD
    const [year, month] = exp.data.split('-').map(Number);
    return year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;
  });

  const monthTotal = currentMonthExpenses.reduce((acc, curr) => acc + curr.valor, 0);

  return {
    expenses,
    currentDate,
    currentMonthExpenses,
    monthTotal,
    addExpense,
    editExpense,
    deleteExpense,
    nextMonth,
    prevMonth,
  };
}
