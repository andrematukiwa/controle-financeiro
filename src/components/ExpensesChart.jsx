import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CATEGORIAS } from '../constants';
import { formatCurrency } from '../utils/format';

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div
      style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', minWidth: '150px' }}
    >
      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
        {data.emoji} {data.name}
      </p>
      <p style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>
        R$ {formatCurrency(data.value)}
      </p>
    </div>
  );
}

export function ExpensesChart({ expenses }) {
  const data = useMemo(() => {
    const totals = {};
    expenses
      .filter((expense) => expense.tipo !== 'entrada')
      .forEach((expense) => {
        if (!totals[expense.categoria]) {
          totals[expense.categoria] = 0;
        }
        totals[expense.categoria] += expense.valor;
      });

    return Object.keys(totals)
      .map(cat => ({
        name: cat,
        value: totals[cat],
        emoji: CATEGORIAS[cat]?.emoji || '📌',
        color: CATEGORIAS[cat]?.cor || '#cbd5e1',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) return null;

  return (
    <div id="expenses-chart" style={{ padding: '20px', backgroundColor: '#ffffff', minHeight: '360px' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 600, color: '#1e293b', textAlign: 'center', letterSpacing: '-0.025em' }}>
        Total por Categoria
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
              tickFormatter={(value) => {
                const item = data.find(d => d.name === value);
                // Simplify to just the emoji for tight mobile fits, but on responsive this is fine
                return `${item ? item.emoji : ''} ${value.substring(0,3)}`;
              }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
              tickFormatter={(value) => `R$ ${value}`}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={false} 
              position={{ y: -10 }}
              isAnimationActive={false}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color + '4D'} 
                  stroke={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
