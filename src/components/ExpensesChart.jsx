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

const BrutalistBar = (props) => {
  const { fill, x, y, width, height } = props;
  const safeFill = fill || '#000000';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={safeFill}
        stroke="#000"
        strokeWidth="4"
      />
    </g>
  );
};

export function ExpensesChart({ expenses }) {
  const data = useMemo(() => {
    const totals = {};
    expenses.forEach((expense) => {
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
        color: CATEGORIAS[cat]?.cor || '#ccc',
      }))
      .sort((a, b) => b.value - a.value); // Order descending by value
  }, [expenses]);

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <p className="font-black text-xl mb-1 flex items-center gap-2 uppercase tracking-tight text-black">
            {data.emoji} {data.name}
          </p>
          <p className="text-2xl font-black text-[#4ade80]" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="expenses-chart" className="mt-12 bg-white p-6 md:p-8 border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] rot-rand-2 mb-10">
      <h3 className="text-3xl mb-8 text-center font-black uppercase tracking-tight text-black">
        TOTAL POR CATEGORIA
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#000" strokeWidth={2} opacity={0.1} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#000', fontSize: 16, fontWeight: '900', fontFamily: 'sans-serif' }}
              tickFormatter={(value, index) => {
                const item = data.find(d => d.name === value);
                return `${item ? item.emoji : ''} ${value.substring(0,3).toUpperCase()}`;
              }}
              axisLine={{ stroke: '#000', strokeWidth: 4 }}
              tickLine={{ stroke: '#000', strokeWidth: 4 }}
            />
            <YAxis 
              tick={{ fill: '#000', fontSize: 16, fontWeight: '900', fontFamily: 'sans-serif' }}
              tickFormatter={(value) => `R$ ${value}`}
              axisLine={{ stroke: '#000', strokeWidth: 4 }}
              tickLine={{ stroke: '#000', strokeWidth: 4 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
            <Bar dataKey="value" shape={<BrutalistBar />}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
