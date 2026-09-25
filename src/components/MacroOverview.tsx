import React, { useState } from 'react';
import { IncomeItem, ExpenseItem, FutureIncomeItem } from '../types/finance';
import { formatBRL, formatPrivacyBRL, formatPercent, maskName } from '../utils/formatters';
import { PALETTE_OPTIONS } from '../utils/constants';
import { AnimatedCounter } from './AnimatedCounter';
import { FutureIncomesManager } from './FutureIncomesManager';
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
  Edit2,
  Wallet,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface MacroOverviewProps {
  incomes: IncomeItem[];
  expenses?: ExpenseItem[];
  futureIncomes?: FutureIncomeItem[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  isPrivacyMode?: boolean;
  hideItemNames?: boolean;
  onUpdateIncome: (id: string, updates: Partial<IncomeItem>) => void;
  onAddIncome: (item: Omit<IncomeItem, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
  onAddFutureIncome?: (item: Omit<FutureIncomeItem, 'id'>) => void;
  onUpdateFutureIncome?: (id: string, updates: Partial<FutureIncomeItem>) => void;
  onRemoveFutureIncome?: (id: string) => void;
  onMarkAsReceivedAndCredit?: (item: FutureIncomeItem) => void;
}

export const MacroOverview: React.FC<MacroOverviewProps> = ({
  incomes,
  expenses = [],
  futureIncomes = [],
  totalIncome,
  totalExpense,
  balance,
  isPrivacyMode = false,
  hideItemNames = false,
  onUpdateIncome,
  onAddIncome,
  onRemoveIncome,
  onAddFutureIncome,
  onUpdateFutureIncome,
  onRemoveFutureIncome,
  onMarkAsReceivedAndCredit,
}) => {
  const [activeTab, setActiveTab] = useState<'incomes' | 'future'>('incomes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(3000);
  const [newMax, setNewMax] = useState(15000);
  const [newColor, setNewColor] = useState(PALETTE_OPTIONS[0]);
  const [newCategory, setNewCategory] = useState('Receita Extra');

  // Calculations for Caixa no Momento & Entradas Futuras
  const paidExpensesTotal = expenses
    .filter((e) => e.monthlyStatus === 'paid')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const unpaidExpensesTotal = totalExpense - paidExpensesTotal;

  // Caixa no Momento: Entradas Realizadas menos Despesas Já Pagas
  const currentCash = totalIncome - paidExpensesTotal;
  const isCashNegative = currentCash < 0;

  // Entradas Futuras Previstas (status pending)
  const pendingFutureIncomesTotal = futureIncomes
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Previsão Final: Caixa Atual + Futuras Pendentes - Despesas a Pagar
  const projectedFinalBalance = currentCash + pendingFutureIncomesTotal - unpaidExpensesTotal;
  const isProjectedNegative = projectedFinalBalance < 0;

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
      {/* 4 Main Highlight Cards (High-Tech 3D Glassmorphism including Caixa no Momento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Receita Total (Entradas Ativas) */}
        <div className="glass-surface specular-top-light rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 hover:border-sky-500/40 group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-mono">
                <ArrowUpRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                Receita Total
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {incomes.length} {incomes.length === 1 ? 'fonte' : 'fontes'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl sm:text-3xl font-black text-white tracking-tight font-mono ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}>
                {isPrivacyMode ? 'R$ ••••••' : <AnimatedCounter value={totalIncome} />}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                Entradas
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
            <span>Média por fonte:</span>
            <span className={`font-mono text-neutral-200 font-semibold ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}>
              {isPrivacyMode
                ? 'R$ ••••'
                : incomes.length > 0
                ? formatBRL(Math.round(totalIncome / incomes.length))
                : 'R$ 0'}
            </span>
          </div>
        </div>

        {/* 2. Total a Pagar (Despesas do Mês) */}
        <div className="glass-surface specular-top-light rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 hover:border-amber-500/40 group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                <ArrowDownRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
                Despesas Mês
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {formatPercent(commitmentRate)} da renda
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl sm:text-3xl font-black text-white tracking-tight font-mono ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}>
                {isPrivacyMode ? 'R$ ••••••' : <AnimatedCounter value={totalExpense} />}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Saídas
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
            <span>Pagas: {formatPrivacyBRL(paidExpensesTotal, isPrivacyMode)}</span>
            <span className="text-amber-400 font-bold font-mono text-[11px]">
              A Pagar: {formatPrivacyBRL(unpaidExpensesTotal, isPrivacyMode)}
            </span>
          </div>
        </div>

        {/* 3. CAIXA NO MOMENTO (REAL-TIME LIQUID CASH) */}
        <div
          className={`specular-top-light rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
            isCashNegative
              ? 'bg-gradient-to-br from-rose-950/60 via-[#161216] to-[#1C1217] border border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/50'
              : 'bg-gradient-to-br from-emerald-950/50 via-[#12161A] to-[#141C18] border border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Wallet className={`w-4 h-4 ${isCashNegative ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
                <span className={isCashNegative ? 'text-rose-300 font-extrabold' : 'text-emerald-300'}>
                  Caixa no Momento
                </span>
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${
                  isCashNegative
                    ? 'bg-rose-500/30 text-rose-200 border-rose-400 shadow-rose-500/25 animate-pulse'
                    : 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-emerald-500/20'
                }`}
              >
                {isCashNegative ? '🔴 SALDO NEGATIVO' : '🟢 CAIXA ATIVO'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2 relative z-10">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                  isCashNegative
                    ? 'text-rose-400 drop-shadow-[0_0_14px_rgba(244,63,94,0.6)]'
                    : 'text-emerald-400 drop-shadow-[0_0_14px_rgba(16,185,129,0.5)]'
                } ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}
              >
                {isPrivacyMode ? (
                  isCashNegative ? '- R$ ••••••' : '+ R$ ••••••'
                ) : (
                  <AnimatedCounter value={currentCash} />
                )}
              </span>
              <span className="text-[10px] font-mono text-neutral-300 font-semibold bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
                Líquido Hoje
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs relative z-10">
            <span className="text-neutral-400">Status do Caixa:</span>
            <span className={`font-semibold ${isCashNegative ? 'text-rose-300 font-bold' : 'text-emerald-300'}`}>
              {isCashNegative ? '⚠️ Déficit em conta' : 'Disponível na conta'}
            </span>
          </div>
        </div>

        {/* 4. PREVISÃO COM ENTRADAS FUTURAS (PROJECTED FINAL BALANCE) */}
        <div
          className={`specular-top-light rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
            isProjectedNegative
              ? 'bg-gradient-to-br from-rose-950/40 via-[#13161C] to-[#1A1E26] border border-rose-500/50 shadow-[0_0_24px_rgba(239,68,68,0.2)]'
              : 'bg-gradient-to-br from-sky-950/40 via-[#13161C] to-[#1A1E26] border border-sky-500/50 shadow-[0_0_24px_rgba(56,189,248,0.2)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className={isProjectedNegative ? 'text-rose-300' : 'text-sky-300'}>
                  Previsão Final Mês
                </span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isProjectedNegative
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                }`}
              >
                + Futuras
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2 relative z-10">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                  isProjectedNegative ? 'text-rose-400' : 'text-sky-300'
                } ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}
              >
                {isPrivacyMode ? (
                  isProjectedNegative ? '- R$ ••••••' : '+ R$ ••••••'
                ) : (
                  <AnimatedCounter value={projectedFinalBalance} />
                )}
              </span>
              <span className="text-[10px] font-mono text-neutral-300 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                Projetado
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs relative z-10">
            <span className="text-neutral-400">A Receber:</span>
            <span className="font-mono text-emerald-400 font-bold text-[11px]">
              +{formatPrivacyBRL(pendingFutureIncomesTotal, isPrivacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* TABS SWITCHER: ENTRADAS ATIVAS (MACRO) vs ENTRADAS FUTURAS (PREVISÕES) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('incomes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'incomes'
              ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Controles MACRO de Receitas ({incomes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('future')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'future'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Entradas Futuras & Previsões ({futureIncomes.length})</span>
          {futureIncomes.filter((f) => f.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* TAB 1: MACRO ADJUSTMENT SLIDERS & CONTROLS FOR INCOMES */}
      {activeTab === 'incomes' && (
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
                        value={hideItemNames ? maskName(income.name, true) : income.name}
                        readOnly={hideItemNames}
                        onChange={(e) => {
                          if (!hideItemNames) {
                            onUpdateIncome(income.id, { name: e.target.value });
                          }
                        }}
                        className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b focus:border-sky-400 border-b border-transparent transition-colors px-0 py-0.5 truncate w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {formatPercent(pctOfTotal)}
                      </span>
                      {incomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveIncome(income.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity cursor-pointer"
                          title="Remover fonte de renda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Value and Direct Input */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400">
                      {income.category || 'Receita'}
                    </span>
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-xs text-neutral-500">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={isPrivacyMode ? 9999 : income.amount}
                        disabled={isPrivacyMode}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          onUpdateIncome(income.id, {
                            amount: val,
                            maxAmount: Math.max(income.maxAmount, val * 1.3),
                          });
                        }}
                        className={`w-28 text-right bg-black/40 border border-white/10 rounded px-2 py-0.5 text-base font-bold text-white focus:outline-none focus:border-sky-400 ${
                          isPrivacyMode ? 'privacy-masked-text select-none' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* 3D Glass Range Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max={income.maxAmount || 20000}
                      step="50"
                      value={income.amount}
                      disabled={isPrivacyMode}
                      onChange={(e) => onUpdateIncome(income.id, { amount: Number(e.target.value) })}
                      className="w-full accent-sky-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>R$ 0</span>
                      <span>Máx: {formatPrivacyBRL(income.maxAmount, isPrivacyMode)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FUTURE INCOMES MANAGER */}
      {activeTab === 'future' && onAddFutureIncome && onUpdateFutureIncome && onRemoveFutureIncome && onMarkAsReceivedAndCredit && (
        <div className="glass-surface specular-top-light rounded-2xl p-5 sm:p-6 shadow-2xl">
          <FutureIncomesManager
            futureIncomes={futureIncomes}
            isPrivacyMode={isPrivacyMode}
            hideItemNames={hideItemNames}
            onAddFutureIncome={onAddFutureIncome}
            onUpdateFutureIncome={onUpdateFutureIncome}
            onRemoveFutureIncome={onRemoveFutureIncome}
            onMarkAsReceivedAndCredit={onMarkAsReceivedAndCredit}
          />
        </div>
      )}

      {/* MODAL: ADICIONAR ENTRADA ATIVA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#14171E] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Nova Fonte de Receita Ativa
              </h3>
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
                  Nome da Entrada / Fonte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salário Principal, Consultoria, Rendimentos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Valor Mensal (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="50"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Teto do Slider (R$)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newMax}
                    onChange={(e) => setNewMax(Number(e.target.value))}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Categoria
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
