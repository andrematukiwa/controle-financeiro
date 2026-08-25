import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileDown, Upload, Loader2, ArrowDownLeft, ArrowUpRight, Wallet, Calendar, Pencil, Check, X as XIcon } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/exportPdf';

const formatMoeda = (valor) => Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const THEMES = {
  saidas: {
    bg: '#FEF2F2', iconBg: '#FEE2E2', icon: '#EF4444', valueColor: '#EF4444', titleColor: '#991B1B',
    badgeBg: '#FECACA', badgeText: '#B91C1C',
  },
  entradas: {
    bg: '#ECFDF5', iconBg: '#D1FAE5', icon: '#10B981', valueColor: '#059669', titleColor: '#047857',
    badgeBg: '#A7F3D0', badgeText: '#065F46',
  },
  saldo: {
    bg: '#EFF6FF', iconBg: '#DBEAFE', icon: '#3B82F6', valueColor: '#1D4ED8', titleColor: '#1E40AF',
  },
};

function StatCard({ theme, title, value, sign, Icon, count, overrideActive, onOverride }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = (e) => {
    e.stopPropagation();
    // Inputs type="number" exigem ponto como separador decimal — usar vírgula aqui
    // faz o navegador rejeitar o valor e mostrar o campo vazio.
    setDraft(Math.abs(value).toFixed(2));
    setEditing(true);
  };

  const confirm = () => {
    const parsed = parseFloat(draft.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) onOverride(parsed);
    setEditing(false);
  };

  return (
    <div
      className="group rounded-2xl p-4 shadow-sm flex items-center gap-3 h-full"
      style={{ backgroundColor: theme.bg }}
    >
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: theme.iconBg, color: theme.icon }}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={2.5} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="uppercase whitespace-nowrap"
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: theme.titleColor }}
          >
            {title}
          </span>
          {count != null && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
            >
              {count} {count === 1 ? 'registro' : 'registros'}
            </span>
          )}
          {onOverride && !editing && (
            <button
              onClick={startEdit}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity shrink-0"
              style={{ color: theme.titleColor }}
              aria-label={`Editar ${title} manualmente`}
            >
              <Pencil size={12} />
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="number"
              step="0.01"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirm();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="w-24 h-8 px-2 rounded-lg border border-white bg-white text-base font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button onClick={confirm} className="p-1 text-emerald-600 hover:bg-white/60 rounded-md" aria-label="Confirmar valor">
              <Check size={14} strokeWidth={3} />
            </button>
            <button onClick={() => setEditing(false)} className="p-1 text-slate-500 hover:bg-white/60 rounded-md" aria-label="Cancelar edição">
              <XIcon size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="whitespace-nowrap" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, color: theme.valueColor }}>
              {sign}R$ {formatMoeda(value)}
            </span>
            {overrideActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onOverride(null); }}
                className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full hover:bg-amber-200 transition-colors shrink-0"
                title="Valor manual — clique para voltar ao automático"
              >
                manual
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Header({
  currentDate, nextMonth, prevMonth,
  total, entradas, saldo,
  saidasCount, entradasCount,
  saidasOverrideActive, entradasOverrideActive, onSaidasOverride, onEntradasOverride,
  expenses, onImportClick, importLoading,
}) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleExport = () => {
    exportDashboardToPDF(currentDate.getMonth(), currentDate.getFullYear(), total, entradas, expenses);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          theme={THEMES.saidas}
          title="Saídas"
          value={total}
          sign=""
          Icon={ArrowDownLeft}
          count={saidasCount}
          overrideActive={saidasOverrideActive}
          onOverride={onSaidasOverride}
        />
        <StatCard
          theme={THEMES.entradas}
          title="Entradas"
          value={entradas}
          sign="+ "
          Icon={ArrowUpRight}
          count={entradasCount}
          overrideActive={entradasOverrideActive}
          onOverride={onEntradasOverride}
        />
        <StatCard
          theme={THEMES.saldo}
          title="Saldo do Mês"
          value={saldo}
          sign={saldo < 0 ? '- ' : '+ '}
          Icon={Wallet}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-[#E5EAF2] rounded-[14px] p-1.5 shadow-sm shrink-0">
          <button
            onClick={prevMonth}
            className="h-9 w-9 flex items-center justify-center bg-[#F4F7FB] rounded-[10px] text-slate-600 hover:text-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 active:scale-95 shrink-0"
            aria-label="Mês anterior"
          >
            <ChevronLeft strokeWidth={3} size={18} />
          </button>
          <div className="flex items-center gap-1.5 min-w-[130px] justify-center text-slate-800">
            <Calendar size={15} strokeWidth={2.5} className="text-slate-400 shrink-0" aria-hidden="true" />
            <span className="text-base font-bold capitalize tracking-wide whitespace-nowrap">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
          <button
            onClick={nextMonth}
            className="h-9 w-9 flex items-center justify-center bg-[#F4F7FB] rounded-[10px] text-slate-600 hover:text-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 active:scale-95 shrink-0"
            aria-label="Próximo mês"
          >
            <ChevronRight strokeWidth={3} size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onImportClick}
            disabled={importLoading}
            className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-all px-4 rounded-[14px] font-semibold text-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {importLoading ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin shrink-0" />
            ) : (
              <Upload size={18} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
            )}
            <span>{importLoading ? 'Lendo PDF...' : 'Importar PDF'}</span>
          </button>

          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 transition-all px-4 rounded-[14px] font-semibold text-sm active:scale-95 whitespace-nowrap"
          >
            <FileDown size={18} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
