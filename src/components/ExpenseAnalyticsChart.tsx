import React, { useState } from 'react';
import { ExpenseItem, InstallmentMonthRecord } from '../types/finance';
import { formatBRL, formatPercent } from '../utils/formatters';
import { BarChart3, PieChart, TrendingDown, Layers } from 'lucide-react';

interface ExpenseAnalyticsChartProps {
  currentExpense: ExpenseItem;
  allExpenses: ExpenseItem[];
  totalExpense: number;
}

export const ExpenseAnalyticsChart: React.FC<ExpenseAnalyticsChartProps> = ({
  currentExpense,
  allExpenses,
  totalExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'comparative'>('individual');

  const history = currentExpense.installmentHistory || [];

  // Dados para o Gráfico Comparativo Global
  const sortedExpenses = [...allExpenses].sort((a, b) => b.amount - a.amount);
  const maxExpenseAmount = Math.max(...allExpenses.map((e) => e.amount), 1);

  return (
    <div className="space-y-3 p-4 rounded-xl bg-[#0F1115] border border-[#2A2E35]">
      {/* Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2A2E35]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Visualização Gráfica Integrada
          </h5>
        </div>

        <div className="flex items-center gap-1 bg-[#181B20] p-0.5 rounded-lg border border-[#2A2E35]">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Evolução Individual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparative')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'comparative'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Comparativo Global ({allExpenses.length} despesas)
          </button>
        </div>
      </div>

      {/* 1. GRÁFICO DO LANÇAMENTO: Evolução Mensal Individual */}
      {activeTab === 'individual' && (
        <div className="space-y-3 pt-1 animate-in fade-in">
          {history.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Evolução da Amortização e Saldo Devedor por Parcela</span>
                <span className="font-mono text-neutral-300">
                  {history.filter((h) => h.status === 'paid').length} de {history.length} pagas
                </span>
              </div>

              {/* Bar Chart Representation */}
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 pt-2">
                {history.map((item) => {
                  const isPaid = item.status === 'paid';
                  const isPartial = item.status === 'partial';
                  const maxVal = Math.max(...history.map((h) => h.originalAmount), 1);
                  const paidHeight = Math.min(100, Math.max(15, (item.paidAmount / maxVal) * 100));

                  return (
                    <div key={item.id} className="flex flex-col items-center gap-1 group">
                      <div className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatBRL(item.paidAmount)}
                      </div>
                      <div className="w-full h-24 bg-[#181B20] rounded-t-md flex flex-col justify-end p-0.5 border border-[#2A2E35]">
                        <div
                          className={`w-full rounded-sm transition-all duration-300 ${
                            isPaid
                              ? 'bg-emerald-400'
                              : isPartial
                              ? 'bg-amber-400'
                              : 'bg-neutral-600'
                          }`}
                          style={{ height: `${paidHeight}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400">
                        P{item.installmentNumber}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Liquidado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Parcial
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                  Pendente
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-400">
              Esta é uma parcela fixa contínua (sem cronograma mensal finito de amortização).
            </div>
          )}
        </div>
      )}

      {/* 2. GRÁFICO COMPARATIVO GLOBAL: Sobreposição com todas as outras despesas */}
      {activeTab === 'comparative' && (
        <div className="space-y-3 pt-1 animate-in fade-in">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Peso deste lançamento frente a todos os outros lançamentos simultâneos</span>
            <span className="font-mono text-emerald-400 font-bold">
              Total: {formatBRL(totalExpense)}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {sortedExpenses.map((exp) => {
              const isCurrent = exp.id === currentExpense.id;
              const pctOfTotal = totalExpense > 0 ? (exp.amount / totalExpense) * 100 : 0;
              const barWidth = Math.min(100, Math.max(8, (exp.amount / maxExpenseAmount) * 100));

              return (
                <div
                  key={exp.id}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-[#181B20] border-sky-500/50 ring-1 ring-sky-500/30'
                      : 'bg-[#13151A] border-[#2A2E35] opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: exp.color }}
                      />
                      <span className={`font-semibold ${isCurrent ? 'text-white font-bold' : 'text-neutral-300'}`}>
                        {exp.name} {isCurrent && '(Este Lançamento)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-white font-bold">{formatBRL(exp.amount)}</span>
                      <span className="text-neutral-400">({formatPercent(pctOfTotal)})</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCurrent ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-neutral-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
