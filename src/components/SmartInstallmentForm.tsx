import React, { useState, useEffect, useMemo } from 'react';
import {
  PaymentType,
  InterestConfig,
  FinalAdjustmentOption,
  InstallmentMonthRecord,
  InterestRateType,
  InterestApplicationMethod,
} from '../types/finance';
import { calculateLoanInstallments } from '../utils/interestCalculator';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  Calculator,
  Percent,
  Calendar,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Zap,
  Info,
  BadgeCheck,
  Split
} from 'lucide-react';

export interface SmartInstallmentFormData {
  paymentType: PaymentType;
  amount: number; // Valor mensal ativo
  principalDebt: number; // Valor total original do débito
  totalWithInterest: number;
  totalInterestCost: number;
  totalInstallments: number;
  currentInstallment: number;
  interestConfig: InterestConfig;
  finalAdjustment: FinalAdjustmentOption;
  installmentNote: string;
  installmentHistory: InstallmentMonthRecord[];
}

interface SmartInstallmentFormProps {
  initialPaymentType?: PaymentType;
  initialPrincipalDebt?: number;
  initialAmount?: number;
  initialTotalInstallments?: number;
  initialCurrentInstallment?: number;
  initialInterestConfig?: InterestConfig;
  initialFinalAdjustment?: FinalAdjustmentOption;
  initialInstallmentNote?: string;
  initialInstallmentHistory?: InstallmentMonthRecord[];
  dueDateDay?: number;
  showMonthlyHistory?: boolean;
  onChange: (data: SmartInstallmentFormData) => void;
}

export const SmartInstallmentForm: React.FC<SmartInstallmentFormProps> = ({
  initialPaymentType = 'installment',
  initialPrincipalDebt = 7000,
  initialAmount = 1000,
  initialTotalInstallments = 7,
  initialCurrentInstallment = 1,
  initialInterestConfig = {
    enabled: false,
    rateType: 'monthly_percent',
    rateValue: 0,
    applicationMethod: 'simple',
  },
  initialFinalAdjustment = 'adjust_last',
  initialInstallmentNote = '',
  initialInstallmentHistory = [],
  dueDateDay = 20,
  showMonthlyHistory = true,
  onChange,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>(initialPaymentType);
  const [principalDebt, setPrincipalDebt] = useState<number>(initialPrincipalDebt || 7000);
  const [totalInstallments, setTotalInstallments] = useState<number>(initialTotalInstallments || 7);
  const [currentInstallment, setCurrentInstallment] = useState<number>(initialCurrentInstallment || 1);
  const [customMonthlyAmount, setCustomMonthlyAmount] = useState<number>(initialAmount || 1000);
  const [finalAdjustment, setFinalAdjustment] = useState<FinalAdjustmentOption>(initialFinalAdjustment);
  
  // Interest State
  const [interestEnabled, setInterestEnabled] = useState<boolean>(initialInterestConfig?.enabled || false);
  const [rateType, setRateType] = useState<InterestRateType>(initialInterestConfig?.rateType || 'monthly_percent');
  const [rateValue, setRateValue] = useState<number>(initialInterestConfig?.rateValue || 0);
  const [applicationMethod, setApplicationMethod] = useState<InterestApplicationMethod>(
    initialInterestConfig?.applicationMethod || 'simple'
  );

  const [installmentHistory, setInstallmentHistory] = useState<InstallmentMonthRecord[]>(initialInstallmentHistory);

  // Synchronize when initial props change
  useEffect(() => {
    setPaymentType(initialPaymentType);
    if (initialPrincipalDebt) setPrincipalDebt(initialPrincipalDebt);
    if (initialTotalInstallments) setTotalInstallments(initialTotalInstallments);
    if (initialCurrentInstallment) setCurrentInstallment(initialCurrentInstallment);
    if (initialAmount) setCustomMonthlyAmount(initialAmount);
    if (initialFinalAdjustment) setFinalAdjustment(initialFinalAdjustment);
    if (initialInterestConfig) {
      setInterestEnabled(initialInterestConfig.enabled);
      setRateType(initialInterestConfig.rateType);
      setRateValue(initialInterestConfig.rateValue);
      setApplicationMethod(initialInterestConfig.applicationMethod);
    }
    if (initialInstallmentHistory && initialInstallmentHistory.length > 0) {
      setInstallmentHistory(initialInstallmentHistory);
    }
  }, [initialPaymentType, initialPrincipalDebt, initialTotalInstallments, initialInterestConfig]);

  // Recalculate installments and interest
  const calcResult = useMemo(() => {
    return calculateLoanInstallments({
      principal: principalDebt,
      totalInstallments: totalInstallments,
      interestConfig: {
        enabled: interestEnabled,
        rateType,
        rateValue,
        applicationMethod,
      },
      finalAdjustment,
      dueDay: dueDateDay,
      currentInstallment,
      customMonthlyAmount: finalAdjustment === 'recalculate_months' ? customMonthlyAmount : undefined,
    });
  }, [
    principalDebt,
    totalInstallments,
    interestEnabled,
    rateType,
    rateValue,
    applicationMethod,
    finalAdjustment,
    dueDateDay,
    currentInstallment,
    customMonthlyAmount,
  ]);

  // Update schedule if history is empty or length differs
  useEffect(() => {
    if (installmentHistory.length === 0 && calcResult.schedule.length > 0) {
      setInstallmentHistory(calcResult.schedule);
    }
  }, [calcResult.schedule, installmentHistory.length]);

  // Emit changes to parent
  useEffect(() => {
    const noteText =
      paymentType === 'fixed'
        ? 'Parcela fixa recorrente'
        : interestEnabled && rateValue > 0
        ? `${calcResult.totalInstallments}x de ${formatBRL(calcResult.monthlyAmount)} (Total: ${formatBRL(calcResult.totalWithInterest)} com juros)`
        : `${calcResult.totalInstallments}x de ${formatBRL(calcResult.monthlyAmount)} (Total: ${formatBRL(principalDebt)} sem juros)`;

    onChange({
      paymentType,
      amount: calcResult.monthlyAmount,
      principalDebt,
      totalWithInterest: calcResult.totalWithInterest,
      totalInterestCost: calcResult.totalInterestCost,
      totalInstallments: calcResult.totalInstallments,
      currentInstallment,
      interestConfig: {
        enabled: interestEnabled,
        rateType,
        rateValue,
        applicationMethod,
      },
      finalAdjustment,
      installmentNote: noteText,
      installmentHistory: installmentHistory.length > 0 ? installmentHistory : calcResult.schedule,
    });
  }, [
    paymentType,
    calcResult,
    principalDebt,
    currentInstallment,
    interestEnabled,
    rateType,
    rateValue,
    applicationMethod,
    finalAdjustment,
    installmentHistory,
  ]);

  // Metrics:
  // 1. Débito Acumulado Atual: sum of pending balances for current & past months
  const currentAccumulatedDebt = useMemo(() => {
    const list = installmentHistory.length > 0 ? installmentHistory : calcResult.schedule;
    return list
      .filter((rec) => rec.isCurrentOrPast)
      .reduce((sum, rec) => sum + Math.max(0, rec.balanceDue), 0);
  }, [installmentHistory, calcResult.schedule]);

  // 2. Saldo Devedor Total Restante (Todas as parcelas)
  const totalRemainingDebt = useMemo(() => {
    const list = installmentHistory.length > 0 ? installmentHistory : calcResult.schedule;
    return list.reduce((sum, rec) => sum + Math.max(0, rec.balanceDue), 0);
  }, [installmentHistory, calcResult.schedule]);

  // 3. Total Já Pago (Soma dos pagamentos parciais ou integrais)
  const totalPaidSoFar = useMemo(() => {
    const list = installmentHistory.length > 0 ? installmentHistory : calcResult.schedule;
    return list.reduce((sum, rec) => sum + (rec.paidAmount || 0), 0);
  }, [installmentHistory, calcResult.schedule]);

  const handleUpdateRecord = (recId: string, updates: Partial<InstallmentMonthRecord>) => {
    const updated = (installmentHistory.length > 0 ? installmentHistory : calcResult.schedule).map((rec) => {
      if (rec.id === recId) {
        const next = { ...rec, ...updates };
        if (updates.paidAmount !== undefined || updates.originalAmount !== undefined) {
          const orig = updates.originalAmount !== undefined ? updates.originalAmount : rec.originalAmount;
          const paid = updates.paidAmount !== undefined ? updates.paidAmount : rec.paidAmount;
          next.balanceDue = Math.max(0, orig - paid);
          if (paid >= orig) next.status = 'paid';
          else if (paid > 0) next.status = 'partial';
          else next.status = 'pending';
        }
        return next;
      }
      return rec;
    });
    setInstallmentHistory(updated);
  };

  const handleQuickPayMonth = (recId: string) => {
    const target = (installmentHistory.length > 0 ? installmentHistory : calcResult.schedule).find(
      (r) => r.id === recId
    );
    if (!target) return;
    handleUpdateRecord(recId, {
      paidAmount: target.originalAmount,
      balanceDue: 0,
      status: 'paid',
      note: 'Quitado integralmente',
    });
  };

  const handleQuickPartialPayMonth = (recId: string) => {
    const target = (installmentHistory.length > 0 ? installmentHistory : calcResult.schedule).find(
      (r) => r.id === recId
    );
    if (!target) return;
    const half = Math.round((target.originalAmount / 2) * 100) / 100;
    const remaining = Math.round((target.originalAmount - half) * 100) / 100;
    handleUpdateRecord(recId, {
      paidAmount: half,
      balanceDue: remaining,
      status: 'partial',
      note: `Pago ${formatBRL(half)} parciais, restando ${formatBRL(remaining)}`,
    });
  };

  const handleResetMonth = (recId: string) => {
    const target = (installmentHistory.length > 0 ? installmentHistory : calcResult.schedule).find(
      (r) => r.id === recId
    );
    if (!target) return;
    handleUpdateRecord(recId, {
      paidAmount: 0,
      balanceDue: target.originalAmount,
      status: 'pending',
      note: 'Pendente no vencimento',
    });
  };

  const handleRegenerateSchedule = () => {
    setInstallmentHistory(calcResult.schedule);
  };

  // Quick preset shortcuts requested in specification
  const applyChefeTiagoPreset = () => {
    setPaymentType('installment');
    setPrincipalDebt(7000);
    setTotalInstallments(7);
    setInterestEnabled(false);
    setFinalAdjustment('adjust_last');
    setCurrentInstallment(1);
    const res = calculateLoanInstallments({
      principal: 7000,
      totalInstallments: 7,
      interestConfig: { enabled: false, rateType: 'monthly_percent', rateValue: 0, applicationMethod: 'simple' },
      finalAdjustment: 'adjust_last',
      dueDay: dueDateDay,
      currentInstallment: 1,
    });
    setInstallmentHistory(res.schedule);
  };

  const applyNonExactResidualPreset = () => {
    setPaymentType('installment');
    setPrincipalDebt(10000);
    setTotalInstallments(3);
    setInterestEnabled(false);
    setFinalAdjustment('adjust_last');
    const res = calculateLoanInstallments({
      principal: 10000,
      totalInstallments: 3,
      interestConfig: { enabled: false, rateType: 'monthly_percent', rateValue: 0, applicationMethod: 'simple' },
      finalAdjustment: 'adjust_last',
      dueDay: dueDateDay,
      currentInstallment: 1,
    });
    setInstallmentHistory(res.schedule);
  };

  const applyInterestPreset = () => {
    setPaymentType('installment');
    setPrincipalDebt(7000);
    setTotalInstallments(7);
    setInterestEnabled(true);
    setRateType('monthly_percent');
    setRateValue(2.5);
    setApplicationMethod('compound');
    const res = calculateLoanInstallments({
      principal: 7000,
      totalInstallments: 7,
      interestConfig: { enabled: true, rateType: 'monthly_percent', rateValue: 2.5, applicationMethod: 'compound' },
      finalAdjustment: 'adjust_last',
      dueDay: dueDateDay,
      currentInstallment: 1,
    });
    setInstallmentHistory(res.schedule);
  };

  return (
    <div className="space-y-5">
      {/* 1. SELETOR: TIPO DE PARCELA */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono flex items-center justify-between">
          <span>Tipo de Parcela</span>
          <span className="text-[10px] text-neutral-400 font-normal font-sans">
            Selecione se é um encargo fixo sem término ou um parcelamento
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setPaymentType('fixed')}
            className={`py-3 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              paymentType === 'fixed'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-[#0F1115] border-[#2A2E35] text-neutral-400 hover:text-white hover:border-neutral-500/40'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="block font-bold">1. Parcela Fixa Recorrente</span>
              <span className="block text-[10px] font-normal text-neutral-400">Sem data limite (ex: aluguel, assinatura)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentType('installment')}
            className={`py-3 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              paymentType === 'installment'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                : 'bg-[#0F1115] border-[#2A2E35] text-neutral-400 hover:text-white hover:border-neutral-500/40'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block font-bold">2. Parcelado com Valor Total</span>
              <span className="block text-[10px] font-normal text-neutral-400">Total do débito com limite de meses</span>
            </div>
          </button>
        </div>
      </div>

      {/* SE FOR PARCELADO: CONFIGURAÇÃO INTELIGENTE DE VALOR TOTAL E MESES */}
      {paymentType === 'installment' && (
        <div className="space-y-4 p-4 rounded-xl bg-[#0F1115] border border-[#2A2E35]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-[#2A2E35] gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                Parâmetros do Parcelamento Inteligente
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Digite o valor total do débito e defina como deseja amortizar.
              </p>
            </div>

            {/* Quick Presets Pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={applyChefeTiagoPreset}
                className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                title="Aplicar exemplo do Chefe Tiago: R$ 7.000 em 7x de R$ 1.000/mês"
              >
                <Zap className="w-2.5 h-2.5" />
                Exemplo: Chefe Tiago (7x R$ 1.000)
              </button>
            </div>
          </div>

          {/* Valor Total do Débito e N° de Parcelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Valor Total do Débito (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">
                  R$
                </span>
                <input
                  type="number"
                  min={1}
                  step={50}
                  value={principalDebt}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value) || 0);
                    setPrincipalDebt(val);
                  }}
                  className="w-full rounded-lg bg-[#181B20] border border-[#2A2E35] pl-9 pr-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Número de Parcelas (Meses):
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={totalInstallments}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  setTotalInstallments(val);
                }}
                className="w-full rounded-lg bg-[#181B20] border border-[#2A2E35] px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* OPÇÃO DE AJUSTE FINAL QUANDO NÃO FOR DIVISÃO EXATA */}
          <div className="space-y-2 pt-2 border-t border-[#2A2E35]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Opção de Ajuste Final (Divisões Não Exatas):
              </span>
              {calcResult.hasResidual && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                  Resíduo na última: {formatBRL(calcResult.lastInstallmentAmount)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFinalAdjustment('adjust_last')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  finalAdjustment === 'adjust_last'
                    ? 'bg-amber-500/15 border-amber-500/40 text-white'
                    : 'bg-[#181B20] border-[#2A2E35] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${finalAdjustment === 'adjust_last' ? 'text-amber-400' : 'text-neutral-500'}`} />
                  Ajustar na Última Parcela
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Mantém parcelas padrão iguais ({formatBRL(calcResult.monthlyAmount)}) e absorve resíduos na {totalInstallments}ª parcela.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFinalAdjustment('recalculate_months')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  finalAdjustment === 'recalculate_months'
                    ? 'bg-amber-500/15 border-amber-500/40 text-white'
                    : 'bg-[#181B20] border-[#2A2E35] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${finalAdjustment === 'recalculate_months' ? 'text-amber-400' : 'text-neutral-500'}`} />
                  Alterar Valor Mensal & Recalcular Prazo
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Digita o valor mensal desejado e o sistema recalcula automaticamente a quantidade final de meses.
                </p>
              </button>
            </div>

            {finalAdjustment === 'recalculate_months' && (
              <div className="p-3 rounded-lg bg-[#181B20] border border-[#2A2E35] flex items-center justify-between gap-3 animate-in fade-in">
                <span className="text-xs text-neutral-300 font-medium">
                  Valor Mensal Desejado (R$):
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">R$</span>
                  <input
                    type="number"
                    min={1}
                    step={50}
                    value={customMonthlyAmount}
                    onChange={(e) => setCustomMonthlyAmount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 rounded-lg bg-[#0F1115] border border-[#2A2E35] px-2 py-1 text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-amber-400 font-mono font-semibold">
                    ➔ {calcResult.totalInstallments} meses
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. CALCULADORA E CONFIGURAÇÃO DE JUROS (OPCIONAL)        */}
          {/* ======================================================== */}
          <div className="space-y-3 pt-3 border-t border-[#2A2E35]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Calculadora e Configuração de Juros
                </span>
              </div>

              {/* Seletor Sem Juros (0%) vs Com Juros */}
              <div className="flex items-center gap-1 bg-[#181B20] p-0.5 rounded-lg border border-[#2A2E35]">
                <button
                  type="button"
                  onClick={() => setInterestEnabled(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    !interestEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  1. Sem Juros (0%)
                </button>
                <button
                  type="button"
                  onClick={() => setInterestEnabled(true)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    interestEnabled
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  2. Com Juros
                </button>
              </div>
            </div>

            {/* Painel expandido de juros quando ativado */}
            {interestEnabled && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#14161B] border border-sky-500/25 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Tipo de Taxa */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Tipo de Taxa:
                    </label>
                    <select
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value as InterestRateType)}
                      className="w-full rounded-lg bg-[#0F1115] border border-[#2A2E35] px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-400 cursor-pointer"
                    >
                      <option value="monthly_percent">% Mensal (a.m.)</option>
                      <option value="yearly_percent">% Anual (a.a.)</option>
                      <option value="fixed_value">Valor Fixo em Reais (R$)</option>
                    </select>
                  </div>

                  {/* Valor da Taxa */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {rateType === 'fixed_value' ? 'Total Fixo em Reais (R$):' : 'Taxa de Juros (%):'}
                    </label>
                    <input
                      type="number"
                      step={rateType === 'fixed_value' ? 50 : 0.1}
                      min={0}
                      value={rateValue}
                      onChange={(e) => setRateValue(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-lg bg-[#0F1115] border border-[#2A2E35] px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  {/* Forma de Aplicação */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Forma de Aplicação:
                    </label>
                    <select
                      value={applicationMethod}
                      disabled={rateType === 'fixed_value'}
                      onChange={(e) => setApplicationMethod(e.target.value as InterestApplicationMethod)}
                      className="w-full rounded-lg bg-[#0F1115] border border-[#2A2E35] px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-400 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="simple">Juros Simples</option>
                      <option value="compound">Juros Compostos (Price)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CÁLCULO AUTOMÁTICO EM TEMPO REAL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#181B20] border border-[#2A2E35]">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">
                  Valor Total com Juros:
                </span>
                <span className="text-base font-black font-mono text-white tracking-tight">
                  {formatBRL(calcResult.totalWithInterest)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">
                  Custo Total dos Juros:
                </span>
                <span
                  className={`text-base font-black font-mono tracking-tight ${
                    calcResult.totalInterestCost > 0 ? 'text-rose-400' : 'text-neutral-400'
                  }`}
                >
                  {calcResult.totalInterestCost > 0
                    ? `+${formatBRL(calcResult.totalInterestCost)}`
                    : 'R$ 0,00 (0%)'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-sky-400 font-semibold block mb-0.5">
                  Novo Valor da Parcela Mensal:
                </span>
                <span className="text-base font-black font-mono text-sky-300 tracking-tight">
                  {formatBRL(calcResult.monthlyAmount)}
                  <span className="text-[10px] font-normal text-neutral-400">/mês</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. HISTÓRICO DE PAGAMENTOS E OBSERVAÇÕES POR MÊS         */}
      {/* ======================================================== */}
      {paymentType === 'installment' && showMonthlyHistory && (
        <div className="space-y-3.5 p-4 rounded-xl bg-[#0F1115] border border-[#2A2E35]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Histórico de Pagamentos e Observações por Mês
              </h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Registre pagamentos parciais no mês e acompanhe o débito acumulado atual em tempo real.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRegenerateSchedule}
              className="text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors border border-[#2A2E35] cursor-pointer"
              title="Recalcular e sincronizar todas as parcelas com os parâmetros do topo"
            >
              <RotateCcw className="w-3 h-3 text-sky-400" />
              Sincronizar Cronograma
            </button>
          </div>

          {/* DÉBITO ACUMULADO ATUAL & RESUMO DE SALDOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Débito Acumulado Atual (Data Presente) */}
            <div className="p-3 rounded-lg bg-[#181B20] border border-amber-500/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1 block mb-0.5">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Débito Acumulado Atual
              </span>
              <span className="text-lg font-black font-mono text-amber-300 block">
                {formatBRL(currentAccumulatedDebt)}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Parcelas vencidas + mês corrente
              </span>
            </div>

            {/* Saldo Devedor Total Restante (Todas as parcelas) */}
            <div className="p-3 rounded-lg bg-[#181B20] border border-sky-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1 block mb-0.5">
                <Split className="w-3 h-3 text-sky-400" />
                Saldo Devedor Total
              </span>
              <span className="text-lg font-black font-mono text-sky-200 block">
                {formatBRL(totalRemainingDebt)}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Todas as parcelas até a quitação
              </span>
            </div>

            {/* Total Já Liquidado */}
            <div className="p-3 rounded-lg bg-[#181B20] border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1 block mb-0.5">
                <BadgeCheck className="w-3 h-3 text-emerald-400" />
                Total Já Liquidado
              </span>
              <span className="text-lg font-black font-mono text-emerald-300 block">
                {formatBRL(totalPaidSoFar)}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Amortizações já registradas
              </span>
            </div>
          </div>

          {/* Lista de Parcelas Mês a Mês com Suporte a Pagamento Parcial */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(installmentHistory.length > 0 ? installmentHistory : calcResult.schedule).map((rec) => {
              const isPaid = rec.status === 'paid';
              const isPartial = rec.status === 'partial';
              const isCurrent = rec.installmentNumber === currentInstallment;

              return (
                <div
                  key={rec.id}
                  className={`rounded-xl border p-3 transition-all space-y-2 ${
                    isCurrent
                      ? 'bg-[#181B20] border-amber-500/50 ring-1 ring-amber-500/20'
                      : isPartial
                      ? 'bg-[#16181D] border-amber-500/30'
                      : isPaid
                      ? 'bg-[#121418] border-[#2A2E35] opacity-90'
                      : 'bg-[#14161B] border-[#2A2E35]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-white">
                        Parcela {String(rec.installmentNumber).padStart(2, '0')}/{String(calcResult.totalInstallments).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        · Vencimento: {rec.dueDate}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          Mês Atual
                        </span>
                      )}
                    </div>

                    {/* Status Badge + Quick Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isPartial
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30'
                        }`}
                      >
                        {isPaid ? 'Quitado' : isPartial ? 'Parcial' : 'Pendente'}
                      </span>

                      {!isPaid && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQuickPartialPayMonth(rec.id)}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                            title="Registrar pagamento parcial de 50% (ex: R$ 250 de R$ 500)"
                          >
                            Pagar 50%
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickPayMonth(rec.id)}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                            title="Quitar integralmente esta parcela"
                          >
                            Quitar
                          </button>
                        </>
                      )}

                      {isPaid && (
                        <button
                          type="button"
                          onClick={() => handleResetMonth(rec.id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-400 font-semibold border border-[#2A2E35] transition-colors cursor-pointer"
                          title="Estornar quitação para pendente"
                        >
                          Zerar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Valores: Original, Pago, Saldo Devedor do Mês */}
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-white/[0.05]">
                    <div className="bg-[#0F1115] p-2 rounded-lg border border-[#2A2E35]">
                      <span className="text-[10px] text-neutral-400 block mb-0.5">
                        Valor Original:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-neutral-500">R$</span>
                        <input
                          type="number"
                          value={rec.originalAmount}
                          onChange={(e) =>
                            handleUpdateRecord(rec.id, {
                              originalAmount: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-transparent font-mono font-bold text-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-[#0F1115] p-2 rounded-lg border border-[#2A2E35]">
                      <span className="text-[10px] text-neutral-400 block mb-0.5">
                        Valor Pago:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-neutral-500">R$</span>
                        <input
                          type="number"
                          value={rec.paidAmount}
                          onChange={(e) =>
                            handleUpdateRecord(rec.id, {
                              paidAmount: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className={`w-full bg-transparent font-mono font-bold text-xs focus:outline-none ${
                            isPaid ? 'text-emerald-400' : 'text-neutral-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="bg-[#0F1115] p-2 rounded-lg border border-[#2A2E35]">
                      <span className="text-[10px] text-neutral-400 block mb-0.5">
                        Saldo Devedor Mês:
                      </span>
                      <span
                        className={`font-mono font-bold text-xs block ${
                          rec.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatBRL(rec.balanceDue)}
                      </span>
                    </div>
                  </div>

                  {/* Campo de Observação/Nota */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                      Nota/Obs:
                    </span>
                    <input
                      type="text"
                      value={rec.note || ''}
                      placeholder="Ex: Pago R$ 250 parciais, restando R$ 250"
                      onChange={(e) => handleUpdateRecord(rec.id, { note: e.target.value })}
                      className="w-full bg-[#0F1115] border border-[#2A2E35] rounded px-2 py-1 text-xs text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
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
