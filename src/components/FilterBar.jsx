import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { CATEGORIAS } from '../constants';

const SELECT_CLASS = "h-10 bg-[#F4F7FB] border border-[#E5EAF2] text-slate-700 rounded-[12px] px-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-sm cursor-pointer appearance-none";
const SELECT_ARROW_STYLE = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.6rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.1rem', paddingRight: '2.25rem' };

// No mobile os filtros ficam recolhidos por padrão (economiza espaço vertical antes da
// lista); no desktop (lg+) sempre visíveis, sem precisar do toggle.
export function FilterBar({
  tipoFilter, setTipoFilter,
  categoryFilter, setCategoryFilter,
  dayFilter, setDayFilter,
  uniqueDays, hasActiveFilters, onClear,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white p-3 rounded-[18px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-[#E5EAF2] flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 text-slate-500 pl-1">
        <Filter size={16} strokeWidth={2.5} />
        <span className="text-sm font-semibold text-slate-700">Filtros</span>
        {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="filter-bar-fields"
          className="lg:hidden ml-auto flex items-center gap-1 text-xs font-semibold text-blue-600 px-2 py-1"
        >
          {open ? 'Ocultar' : 'Filtrar'}
          <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div id="filter-bar-fields" className={`${open ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-2.5`}>
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
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-default transition-colors px-2"
        >
          <RotateCcw size={14} strokeWidth={2.5} />
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
