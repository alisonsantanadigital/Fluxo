import React, { useState, useEffect } from 'react';
import {
  SelectedNodeDetail,
  IncomeItem,
  ExpenseItem,
  PaymentType,
  PriorityLevel,
  InterestConfig,
  FinalAdjustmentOption,
  InstallmentMonthRecord,
} from '../types/finance';
import { formatBRL, formatPrivacyBRL, formatPercent, maskName } from '../utils/formatters';
import { PALETTE_OPTIONS } from '../utils/constants';
import { evaluateDueDate } from '../utils/dateHelpers';
import { SmartInstallmentForm, SmartInstallmentFormData } from './SmartInstallmentForm';
import { ExpenseAnalyticsChart } from './ExpenseAnalyticsChart';
import {
  X,
  Calendar,
  Layers,
  Percent,
  Sliders,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
  Edit3,
  Tag,
  Palette,
  CalendarClock,
  Undo2,
  BarChart3,
  ShieldAlert
} from 'lucide-react';

interface ItemDetailModalProps {
  detail: SelectedNodeDetail | null;
  allExpenses?: ExpenseItem[];
  totalExpense?: number;
  isPrivacyMode?: boolean;
  hideItemNames?: boolean;
  onClose: () => void;
  onUpdateIncome?: (id: string, updates: Partial<IncomeItem>) => void;
  onUpdateExpense?: (id: string, updates: Partial<ExpenseItem>) => void;
  onRemoveIncome?: (id: string) => void;
  onRemoveExpense?: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  detail,
  allExpenses = [],
  totalExpense = 0,
  isPrivacyMode = false,
  hideItemNames = false,
  onClose,
  onUpdateIncome,
  onUpdateExpense,
  onRemoveIncome,
  onRemoveExpense,
}) => {
  if (!detail) return null;

  const isIncome = detail.type === 'income';
  const isExpense = detail.type === 'expense';
  const isCenter = detail.type === 'center';
  const isSurplus = detail.type === 'surplus';
  const isDeficit = detail.type === 'deficit';

  // Editable basic fields
  const [name, setName] = useState(detail.name);
  const [category, setCategory] = useState(detail.category || '');
  const [color, setColor] = useState(detail.color);
  const [dueDateDay, setDueDateDay] = useState(detail.dueDateDay || 10);
  const [priority, setPriority] = useState<PriorityLevel>(detail.priority || 'high');
  const [monthlyStatus, setMonthlyStatus] = useState<'paid' | 'unpaid'>(detail.monthlyStatus || 'unpaid');
  const [debtStatus, setDebtStatus] = useState<'settled' | 'pending'>(detail.debtStatus || 'pending');
  const [isPostponed, setIsPostponed] = useState<boolean>(!!detail.isPostponed);
  const [incomeAmount, setIncomeAmount] = useState(detail.amount);
  const [notes, setNotes] = useState(detail.notes || '');

  // Form state for expense smart installments
  const [smartData, setSmartData] = useState<SmartInstallmentFormData | null>(null);

  useEffect(() => {
    setName(detail.name);
    setCategory(detail.category || '');
    setColor(detail.color);
    setDueDateDay(detail.dueDateDay || 10);
    setPriority(detail.priority || 'high');
    setMonthlyStatus(detail.monthlyStatus || 'unpaid');
    setDebtStatus(detail.debtStatus || 'pending');
    setIsPostponed(!!detail.isPostponed);
    setIncomeAmount(detail.amount);
    setNotes(detail.notes || '');
  }, [detail]);

  const handleIncomeAmountChange = (newVal: number) => {
    setIncomeAmount(newVal);
    if (detail.itemId && onUpdateIncome) {
      onUpdateIncome(detail.itemId, { amount: newVal });
    }
  };

  const handleSmartFormChange = (data: SmartInstallmentFormData) => {
    setSmartData(data);
    // Real-time update to parent so Sankey and totals reflect instantly
    if (detail.itemId && onUpdateExpense) {
      onUpdateExpense(detail.itemId, {
        name,
        category,
        color,
        dueDateDay,
        priority,
        monthlyStatus,
        debtStatus,
        isPostponed,
        amount: isPostponed ? 0 : data.amount,
        paymentType: data.paymentType,
        principalDebt: data.principalDebt,
        totalWithInterest: data.totalWithInterest,
        totalInterestCost: data.totalInterestCost,
        totalInstallments: data.totalInstallments,
        currentInstallment: data.currentInstallment,
        installmentNote: data.installmentNote,
        interestConfig: data.interestConfig,
        finalAdjustment: data.finalAdjustment,
        installmentHistory: data.installmentHistory,
        totalDebt: data.installmentHistory.reduce((s, r) => s + r.balanceDue, 0),
      });
    }
  };

  const handleTogglePostpone = () => {
    const nextPostponed = !isPostponed;
    setIsPostponed(nextPostponed);
    if (detail.itemId && onUpdateExpense) {
      const amt = nextPostponed ? 0 : smartData ? smartData.amount : detail.amount;
      onUpdateExpense(detail.itemId, {
        isPostponed: nextPostponed,
        amount: amt,
        postponedAmount: nextPostponed ? (smartData ? smartData.amount : detail.amount) : undefined,
      });
    }
  };

  const handleToggleMonthlyStatus = () => {
    const nextStatus = monthlyStatus === 'paid' ? 'unpaid' : 'paid';
    setMonthlyStatus(nextStatus);
    if (detail.itemId && onUpdateExpense) {
      onUpdateExpense(detail.itemId, { monthlyStatus: nextStatus });
    }
  };

  const handleSaveAndClose = () => {
    if (isExpense && detail.itemId && onUpdateExpense && smartData) {
      onUpdateExpense(detail.itemId, {
        name: name.trim() || detail.name,
        category: category.trim() || 'Geral',
        color,
        dueDateDay,
        priority,
        monthlyStatus,
        debtStatus,
        isPostponed,
        amount: isPostponed ? 0 : smartData.amount,
        paymentType: smartData.paymentType,
        principalDebt: smartData.principalDebt,
        totalWithInterest: smartData.totalWithInterest,
        totalInterestCost: smartData.totalInterestCost,
        totalInstallments: smartData.totalInstallments,
        currentInstallment: smartData.currentInstallment,
        installmentNote: smartData.installmentNote,
        interestConfig: smartData.interestConfig,
        finalAdjustment: smartData.finalAdjustment,
        installmentHistory: smartData.installmentHistory,
        totalDebt: smartData.installmentHistory.reduce((s, r) => s + r.balanceDue, 0),
        notes,
      });
    } else if (isIncome && detail.itemId && onUpdateIncome) {
      onUpdateIncome(detail.itemId, {
        name: name.trim() || detail.name,
        category: category.trim() || 'Receita',
        color,
        amount: incomeAmount,
        notes,
      });
    }
    onClose();
  };

  const displayAmount =
    isExpense && smartData
      ? isPostponed
        ? 0
        : smartData.amount
      : isIncome
      ? incomeAmount
      : detail.amount;

  const dateEval = isExpense ? evaluateDueDate(dueDateDay, monthlyStatus) : null;

  // Mock expense representation for the analytics chart
  const currentExpenseObj: ExpenseItem = {
    id: detail.itemId || 'temp',
    name,
    amount: displayAmount,
    maxAmount: 15000,
    color,
    category,
    paymentType: detail.paymentType || 'fixed',
    priority,
    dueDateDay,
    monthlyStatus,
    debtStatus,
    isPostponed,
    installmentHistory: smartData?.installmentHistory || detail.installmentHistory || [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl glass-surface p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-white/10">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-start justify-between pb-3 border-b border-white/[0.08] gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-md ring-2 ring-white/10"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 font-mono">
                  {isIncome ? 'Receita / Entrada' : isExpense ? 'Despesa / Dívida' : 'Fluxo Central'}
                </span>
                {category && (
                  <span className="text-[10px] text-neutral-400 font-medium">
                    · {category}
                  </span>
                )}
                {isExpense && dateEval && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${dateEval.colorClass.badge}`}>
                    {dateEval.label}
                  </span>
                )}
                {isExpense && smartData?.paymentType === 'installment' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    Parcelamento ({smartData.currentInstallment}/{smartData.totalInstallments}x)
                  </span>
                )}
              </div>

              {/* Editable Name Input */}
              {(isExpense || isIncome) ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={hideItemNames ? maskName(name, true) : name}
                    readOnly={hideItemNames}
                    onChange={(e) => {
                      if (!hideItemNames) setName(e.target.value);
                    }}
                    className="text-lg sm:text-xl font-bold text-white bg-transparent border-b border-white/10 focus:border-sky-400 focus:outline-none w-full"
                    placeholder="Nome do lançamento..."
                  />
                </div>
              ) : (
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                  {name}
                </h3>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Impact Banner */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#0F1115] border border-white/[0.08]">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              {isExpense ? 'Desembolso Mensal no Caixa:' : 'Valor do Lançamento:'}
            </span>
            <span className={`text-2xl sm:text-3xl font-black font-mono text-white tracking-tight tabular-nums ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}>
              {isPrivacyMode ? 'R$ ••••••' : formatBRL(displayAmount)}
            </span>
            {isPostponed && (
              <span className="text-[11px] text-indigo-400 font-bold block mt-1">
                (Adiado para o próximo mês)
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-400 block mb-1">Impacto no Fluxo Total:</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-sky-400 tabular-nums">
              {formatPercent(detail.percentageOfFlow)}
            </span>
          </div>
        </div>

        {/* Income Controls (se for entrada) */}
        {isIncome && (
          <div className="space-y-4 p-4 rounded-xl bg-[#0F1115] border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Ajuste Imediato da Receita (Alimenta o Sankey)
              </span>
              <span className="font-mono text-neutral-400">R$ {incomeAmount.toLocaleString('pt-BR')}</span>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(30000, incomeAmount * 1.5)}
              step={100}
              value={incomeAmount}
              onChange={(e) => handleIncomeAmountChange(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: color }}
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400 font-mono">R$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={incomeAmount}
                  onChange={(e) => handleIncomeAmountChange(Math.max(0, Number(e.target.value) || 0))}
                  className="w-32 rounded-lg bg-[#13161C] border border-white/10 px-2.5 py-1 text-sm font-mono font-bold text-white text-right focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleIncomeAmountChange(Math.round(incomeAmount * 0.9))}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 cursor-pointer"
                >
                  -10%
                </button>
                <button
                  type="button"
                  onClick={() => handleIncomeAmountChange(Math.round(incomeAmount * 1.1))}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 cursor-pointer"
                >
                  +10%
                </button>
              </div>
            </div>

            {/* Income Category & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Categoria da Receita
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-[#13161C] border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  placeholder="Ex: Trabalho, Freelance, Dividendos"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Cor no Sankey
                </label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {PALETTE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        color === c
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#181B20]'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PARCELAMENTO INTELIGENTE + JUROS + HISTÓRICO MÊS A MÊS   */}
        {/* ======================================================== */}
        {isExpense && (
          <div className="space-y-4">
            {/* Parâmetros Cadastrais Rápidos: Prioridade, Vencimento, Status e Adiar */}
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Prioridade:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full rounded-lg bg-[#13161C] border border-white/10 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="high">🔴 Alta (Urgência Máxima)</option>
                  <option value="medium">🟡 Média (Urgência Média)</option>
                  <option value="low">🟢 Baixa (Urgência Baixa)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Dia de Vencimento:
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full rounded-lg bg-[#13161C] border border-white/10 px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Status Mês Atual:
                </label>
                <button
                  type="button"
                  onClick={handleToggleMonthlyStatus}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    monthlyStatus === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${monthlyStatus === 'paid' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>{monthlyStatus === 'paid' ? 'Pago no Mês' : 'Pendente'}</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Adiar Parcela:
                </label>
                <button
                  type="button"
                  onClick={handleTogglePostpone}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPostponed
                      ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/50'
                      : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isPostponed ? 'Adiado' : 'Adiar Parcela'}</span>
                </button>
              </div>
            </div>

            {/* Smart Installment Form Engine */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#0F1115] border border-white/[0.08]">
              <SmartInstallmentForm
                initialPaymentType={detail.paymentType || 'fixed'}
                initialPrincipalDebt={detail.principalDebt || detail.totalDebt || detail.amount}
                initialAmount={detail.amount}
                initialTotalInstallments={detail.totalInstallments || 7}
                initialCurrentInstallment={detail.currentInstallment || 1}
                initialInterestConfig={
                  detail.interestConfig || {
                    enabled: false,
                    rateType: 'monthly_percent',
                    rateValue: 0,
                    applicationMethod: 'simple',
                  }
                }
                initialFinalAdjustment={detail.finalAdjustment || 'adjust_last'}
                initialInstallmentNote={detail.installmentNote || ''}
                initialInstallmentHistory={detail.installmentHistory || []}
                dueDateDay={dueDateDay}
                showMonthlyHistory={true}
                onChange={handleSmartFormChange}
              />
            </div>

            {/* Gráfico Integrado: Individual vs Comparativo Global */}
            <ExpenseAnalyticsChart
              currentExpense={currentExpenseObj}
              allExpenses={allExpenses}
              totalExpense={totalExpense}
            />
          </div>
        )}

        {/* General Notes & Observations */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            Notas Gerais & Acordos de Renegociação:
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações contratuais, detalhes de quitação, prazos ou acordos..."
            className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-400 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <div>
            {isExpense && detail.itemId && onRemoveExpense && (
              <button
                type="button"
                onClick={() => {
                  onRemoveExpense(detail.itemId!);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Despesa
              </button>
            )}
            {isIncome && detail.itemId && onRemoveIncome && (
              <button
                type="button"
                onClick={() => {
                  onRemoveIncome(detail.itemId!);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Receita
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors cursor-pointer border border-white/10"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              Salvar Parâmetros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
