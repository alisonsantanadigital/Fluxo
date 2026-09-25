import React, { useState } from 'react';
import { IncomeItem } from '../types/finance';
import { formatBRL, formatPercent } from '../utils/formatters';
import { PALETTE_OPTIONS } from '../utils/constants';
import { AnimatedCounter } from './AnimatedCounter';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  Sparkles,
  Layers,
  Edit2
} from 'lucide-react';

interface MacroOverviewProps {
  incomes: IncomeItem[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  onUpdateIncome: (id: string, updates: Partial<IncomeItem>) => void;
  onAddIncome: (item: Omit<IncomeItem, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
}

export const MacroOverview: React.FC<MacroOverviewProps> = ({
  incomes,
  totalIncome,
  totalExpense,
  balance,
  onUpdateIncome,
  onAddIncome,
  onRemoveIncome,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(3000);
  const [newMax, setNewMax] = useState(15000);
  const [newColor, setNewColor] = useState(PALETTE_OPTIONS[0]);
  const [newCategory, setNewCategory] = useState('Receita Extra');

  const isPositive = balance >= 0;
  const commitmentRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddIncome({
      name: newName.trim(),
      amount: Number(newAmount) || 0,
      maxAmount: Math.max(Number(newMax) || 15000, Number(newAmount) || 15000),
      color: newColor,
      category: newCategory.trim() || 'Receita',
    });

    setNewName('');
    setNewAmount(3000);
    setNewMax(15000);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 3 Main Highlight Cards (High-Tech 3D Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Receita Total */}
        <div className="glass-surface specular-top-light rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-sky-500/40 group">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-mono">
              <ArrowUpRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Receita Total (Macro)
            </span>
            <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {incomes.length} {incomes.length === 1 ? 'fonte' : 'fontes'}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-mono">
              <AnimatedCounter value={totalIncome} />
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
              Entradas
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
            <span>Média por fonte:</span>
            <span className="font-mono text-neutral-200 font-semibold">
              {incomes.length > 0 ? formatBRL(Math.round(totalIncome / incomes.length)) : 'R$ 0'}
            </span>
          </div>
        </div>

        {/* 2. Total a Pagar */}
        <div className="glass-surface specular-top-light rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-amber-500/40 group">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
              <ArrowDownRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              Total a Pagar (Despesas)
            </span>
            <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {formatPercent(commitmentRate)} da renda
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-mono">
              <AnimatedCounter value={totalExpense} />
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Saídas
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
            <span>Comprometimento:</span>
            <span className={`font-mono font-bold ${commitmentRate > 100 ? 'text-rose-400 font-extrabold' : 'text-neutral-200'}`}>
              {formatPercent(commitmentRate)}
            </span>
          </div>
        </div>

        {/* 3. Saldo Restante / Sobra (Vibrant Neon Glow) */}
        <div
          className={`specular-top-light rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-300 relative overflow-hidden ${
            isPositive
              ? 'bg-gradient-to-br from-emerald-950/40 via-[#13161C] to-[#1A1E26] border border-emerald-500/50 shadow-[0_0_28px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30'
              : 'bg-gradient-to-br from-rose-950/40 via-[#13161C] to-[#1A1E26] border border-rose-500/50 shadow-[0_0_28px_rgba(239,68,68,0.25)] ring-1 ring-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              {isPositive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Saldo Restante / Sobra</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300">Déficit no Orçamento</span>
                </>
              )}
            </span>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                isPositive
                  ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-emerald-500/20'
                  : 'bg-rose-500/25 text-rose-200 border-rose-400 shadow-rose-500/20 animate-pulse'
              }`}
            >
              {isPositive ? 'SUPERÁVIT NÉON' : 'DÉFICIT CARMIM'}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2 relative z-10">
            <span
              className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-mono ${
                isPositive ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'text-rose-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              }`}
            >
              <AnimatedCounter value={balance} />
            </span>
            <span className="text-xs font-mono text-neutral-300 font-semibold bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
              {isPositive
                ? `${formatPercent(totalIncome > 0 ? (balance / totalIncome) * 100 : 0)} livre`
                : 'Ajuste urgente'}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs relative z-10">
            <span className="text-neutral-400">Status Operacional:</span>
            <span className={`font-semibold ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isPositive
                ? 'Arrecadação cobre 100% com folga'
                : 'Insuficiente para honrar todos os lançamentos'}
            </span>
          </div>
        </div>
      </div>

      {/* MACRO ADJUSTMENT SLIDERS & CONTROLS FOR INCOMES */}
      <div className="glass-surface specular-top-light rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.08] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Controles MACRO de Entradas (Receitas)
              </h3>
              <p className="text-xs text-neutral-400">
                Ajuste os sliders com trilha brilhante e manipulador 3D ou digite o valor exato para simular em tempo real.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-bold border border-sky-500/30 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            + Adicionar Entrada (Ganho)
          </button>
        </div>

        {/* Incomes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomes.map((income) => {
            const pctOfTotal = totalIncome > 0 ? (income.amount / totalIncome) * 100 : 0;

            return (
              <div
                key={income.id}
                className="rounded-xl bg-[#0F1115]/80 border border-white/[0.08] p-4 transition-all hover:border-white/20 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-md ring-1 ring-white/10"
                      style={{ backgroundColor: income.color, boxShadow: `0 0 8px ${income.color}80` }}
                    />
                    <input
                      type="text"
                      value={income.name}
                      onChange={(e) => onUpdateIncome(income.id, { name: e.target.value })}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b focus:border-sky-400 border-b border-transparent transition-colors px-0 py-0.5 truncate w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                      {formatPercent(pctOfTotal)} do total
                    </span>
                    {incomes.length > 1 && (
                      <button
                        onClick={() => onRemoveIncome(income.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Remover Entrada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Number Input */}
                <div className="flex items-center justify-between gap-3 bg-[#13161C] rounded-lg px-3 py-2 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                    <span>Valor da Receita:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-neutral-400">R$</span>
                    <input
                      type="number"
                      min={0}
                      max={income.maxAmount * 2}
                      step={100}
                      value={income.amount}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        onUpdateIncome(income.id, {
                          amount: val,
                          maxAmount: Math.max(income.maxAmount, val),
                        });
                      }}
                      className="bg-transparent text-right font-mono font-bold text-white text-base focus:outline-none w-32 tabular-nums"
                    />
                  </div>
                </div>

                {/* Slider with High-Tech Glowing Track & 3D Thumb */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>R$ 0</span>
                    <span className="text-neutral-300">
                      Limite slider: {formatBRL(income.maxAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={income.maxAmount}
                    step={100}
                    value={income.amount}
                    onChange={(e) =>
                      onUpdateIncome(income.id, { amount: Number(e.target.value) })
                    }
                    className="w-full"
                    style={{
                      accentColor: income.color,
                    }}
                  />
                </div>

                {/* Quick adjustments: -10%, +10%, Máx */}
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono pt-1">
                  <button
                    type="button"
                    onClick={() => onUpdateIncome(income.id, { amount: Math.round(income.amount * 0.9) })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 transition-colors cursor-pointer"
                  >
                    -10%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = Math.round(income.amount * 1.1);
                      onUpdateIncome(income.id, {
                        amount: nextVal,
                        maxAmount: Math.max(income.maxAmount, nextVal),
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 transition-colors cursor-pointer"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateIncome(income.id, { amount: income.maxAmount })}
                    className="px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors font-bold cursor-pointer"
                  >
                    Máx ({formatBRL(income.maxAmount)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL ADICIONAR ENTRADA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl glass-surface p-6 shadow-2xl space-y-4 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-md shadow-sky-400/50" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Adicionar Nova Fonte de Entrada
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Nome da Entrada:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Consultoria, Bônus, Aluguel Recebido"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Valor Mensal (R$):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value) || 0)}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Limite do Slider (R$):
                  </label>
                  <input
                    type="number"
                    min={newAmount}
                    step={500}
                    value={newMax}
                    onChange={(e) => setNewMax(Number(e.target.value) || 15000)}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Categoria da Receita:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Freelance, Trabalho, Dividendos"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Cor no Diagrama de Sankey:
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PALETTE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        newColor === c
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#181B20]'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
