export type PaymentType = 'fixed' | 'installment';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type DueDateStatus = 'overdue' | 'due_soon' | 'on_time_today' | 'paid_in_order' | 'future';

export type MonthlyPaymentStatus = 'paid' | 'unpaid';

export type DebtOverallStatus = 'settled' | 'pending';

export type InterestRateType = 'monthly_percent' | 'yearly_percent' | 'fixed_value';
export type InterestApplicationMethod = 'simple' | 'compound';
export type FinalAdjustmentOption = 'adjust_last' | 'recalculate_months';

export interface InterestConfig {
  enabled: boolean;
  rateType: InterestRateType; // % a.m., % a.a. ou R$ fixo
  rateValue: number; // Ex: 2.5 para 2,5% ou 500 para R$ 500
  applicationMethod: InterestApplicationMethod; // 'simple' | 'compound'
}

export interface InstallmentMonthRecord {
  id: string;
  installmentNumber: number; // ex: 1, 2, ... 11
  dueDate: string; // ex: "20/08" ou "20/08/2026"
  originalAmount: number; // Valor original da parcela (ex: 500)
  paidAmount: number; // Valor efetivamente pago (ex: 250)
  balanceDue: number; // Saldo devedor do mês (originalAmount - paidAmount)
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  note?: string; // Observação/Nota (ex: "Pago R$ 250 parciais, restando R$ 250")
  isCurrentOrPast?: boolean; // Se a parcela já venceu ou é a atual
}

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  maxAmount: number;
  color: string;
  category?: string;
  notes?: string;
  isRecurring?: boolean;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number; // Valor da parcela ativa / desembolso do mês
  maxAmount: number;
  color: string;
  category?: string;
  paymentType: PaymentType;
  priority: PriorityLevel; // 🔴 Alta | 🟡 Média | 🟢 Baixa
  dueDateDay: number; // Dia de vencimento do mês (ex: 20)
  monthlyStatus: MonthlyPaymentStatus; // 'paid' | 'unpaid' no mês atual
  debtStatus: DebtOverallStatus; // 'settled' | 'pending' para a dívida toda
  isPostponed?: boolean; // Se foi adiado para o mês seguinte
  postponedAmount?: number; // Valor acumulado transferido para o mês seguinte
  // Parcela Inteligente
  principalDebt?: number; // Valor total original do débito (ex: R$ 7.000)
  totalWithInterest?: number; // Valor total com juros (ex: R$ 7.500)
  totalInterestCost?: number; // Custo total dos juros (ex: R$ 500)
  totalInstallments?: number; // Total de parcelas (ex: 7)
  currentInstallment?: number; // Parcela atual (ex: 1)
  installmentNote?: string; // Ex: "7x de R$ 1.000 sem juros"
  totalDebt?: number; // Saldo devedor total restante
  interestConfig?: InterestConfig;
  finalAdjustment?: FinalAdjustmentOption;
  notes?: string;
  installmentHistory?: InstallmentMonthRecord[]; // Histórico detalhado mês a mês
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
}

export interface SelectedNodeDetail {
  type: 'income' | 'expense' | 'center' | 'surplus' | 'deficit';
  itemId?: string;
  name: string;
  amount: number;
  color: string;
  category?: string;
  percentageOfFlow: number;
  // Expense specific
  paymentType?: PaymentType;
  priority?: PriorityLevel;
  dueDateDay?: number;
  monthlyStatus?: MonthlyPaymentStatus;
  debtStatus?: DebtOverallStatus;
  isPostponed?: boolean;
  principalDebt?: number;
  totalWithInterest?: number;
  totalInterestCost?: number;
  totalInstallments?: number;
  currentInstallment?: number;
  installmentNote?: string;
  totalDebt?: number;
  interestConfig?: InterestConfig;
  finalAdjustment?: FinalAdjustmentOption;
  notes?: string;
  installmentHistory?: InstallmentMonthRecord[];
}

export interface SecurityConfirmationAction {
  type: 'delete_expense' | 'delete_income' | 'postpone_expense' | 'settle_debt_fully' | 'unsettle_debt';
  title: string;
  message: string;
  confirmLabel: string;
  isCritical?: boolean;
  itemId: string;
  itemType: 'expense' | 'income';
  payload?: any;
}
