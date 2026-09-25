import {
  InterestConfig,
  InstallmentMonthRecord,
  FinalAdjustmentOption,
} from '../types/finance';

export interface CalculationResult {
  principal: number;
  totalWithInterest: number;
  totalInterestCost: number;
  monthlyAmount: number;
  lastInstallmentAmount: number;
  hasResidual: boolean;
  totalInstallments: number;
  schedule: InstallmentMonthRecord[];
}

export function calculateLoanInstallments(params: {
  principal: number;
  totalInstallments: number;
  interestConfig?: InterestConfig;
  finalAdjustment?: FinalAdjustmentOption;
  dueDay?: number;
  currentInstallment?: number;
  customMonthlyAmount?: number; // Se o usuário quiser fixar o valor mensal e recalcular o prazo
}): CalculationResult {
  const {
    principal,
    interestConfig,
    finalAdjustment = 'adjust_last',
    dueDay = 20,
    currentInstallment = 1,
    customMonthlyAmount,
  } = params;

  let n = Math.max(1, Math.round(params.totalInstallments));
  const P = Math.max(0, principal);

  let totalWithInterest = P;
  let totalInterestCost = 0;
  let monthlyAmount = 0;

  const hasInterest = interestConfig?.enabled && (interestConfig?.rateValue || 0) > 0;

  if (!hasInterest) {
    totalWithInterest = P;
    totalInterestCost = 0;

    if (customMonthlyAmount && customMonthlyAmount > 0 && finalAdjustment === 'recalculate_months') {
      monthlyAmount = customMonthlyAmount;
      n = Math.max(1, Math.ceil(P / customMonthlyAmount));
    } else {
      monthlyAmount = n > 0 ? P / n : 0;
    }
  } else {
    const rateType = interestConfig!.rateType;
    const rateVal = interestConfig!.rateValue;
    const method = interestConfig!.applicationMethod;

    if (rateType === 'fixed_value') {
      totalInterestCost = Math.max(0, rateVal);
      totalWithInterest = P + totalInterestCost;
      monthlyAmount = totalWithInterest / n;
    } else {
      // Determine monthly rate 'i'
      let monthlyRate = 0;
      if (rateType === 'monthly_percent') {
        monthlyRate = rateVal / 100;
      } else {
        // yearly_percent
        monthlyRate = Math.pow(1 + rateVal / 100, 1 / 12) - 1;
      }

      if (method === 'simple') {
        // Juros Simples: J = P * i * n
        totalInterestCost = P * monthlyRate * n;
        totalWithInterest = P + totalInterestCost;
        monthlyAmount = totalWithInterest / n;
      } else {
        // Juros Compostos (Tabela Price / Amortização)
        if (monthlyRate > 0) {
          const factor = Math.pow(1 + monthlyRate, n);
          const pmt = P * ((monthlyRate * factor) / (factor - 1));
          monthlyAmount = pmt;
          totalWithInterest = pmt * n;
          totalInterestCost = totalWithInterest - P;
        } else {
          totalWithInterest = P;
          totalInterestCost = 0;
          monthlyAmount = P / n;
        }
      }
    }
  }

  // Rounding standard for monthly payment
  const roundedMonthly = Math.round(monthlyAmount * 100) / 100;
  const regularTotal = roundedMonthly * (n - 1);
  const lastInstallmentRaw = Math.max(0, totalWithInterest - regularTotal);
  const lastInstallmentAmount = Math.round(lastInstallmentRaw * 100) / 100;
  const hasResidual = Math.abs(lastInstallmentAmount - roundedMonthly) > 0.05;

  // Generate Month by Month Schedule
  const schedule: InstallmentMonthRecord[] = [];
  const now = new Date();

  for (let i = 1; i <= n; i++) {
    const isPast = i < currentInstallment;
    const isCurrent = i === currentInstallment;
    const isLast = i === n;

    const installmentValue =
      isLast && finalAdjustment === 'adjust_last' && hasResidual
        ? lastInstallmentAmount
        : roundedMonthly;

    const paid = isPast ? installmentValue : 0;
    const balance = isPast ? 0 : installmentValue;
    const status = isPast ? 'paid' : 'pending';

    const d = new Date(now.getFullYear(), now.getMonth() + (i - currentInstallment), dueDay);
    const dayStr = String(dueDay).padStart(2, '0');
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');

    schedule.push({
      id: `inst-${Date.now()}-${i}`,
      installmentNumber: i,
      dueDate: `${dayStr}/${monthStr}`,
      originalAmount: Math.round(installmentValue * 100) / 100,
      paidAmount: paid,
      balanceDue: Math.round(balance * 100) / 100,
      status: status,
      note: isPast
        ? 'Quitado integralmente'
        : isCurrent
        ? 'Parcela do mês corrente'
        : isLast && hasResidual
        ? `Última parcela com ajuste final (R$ ${lastInstallmentAmount.toFixed(2)})`
        : 'A vencer',
      isCurrentOrPast: i <= currentInstallment,
    });
  }

  return {
    principal: P,
    totalWithInterest: Math.round(totalWithInterest * 100) / 100,
    totalInterestCost: Math.round(totalInterestCost * 100) / 100,
    monthlyAmount: roundedMonthly,
    lastInstallmentAmount,
    hasResidual,
    totalInstallments: n,
    schedule,
  };
}
