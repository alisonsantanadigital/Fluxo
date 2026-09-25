import { IncomeItem, ExpenseItem, Scenario, InstallmentMonthRecord } from '../types/finance';

export const INITIAL_INCOMES: IncomeItem[] = [
  {
    id: 'inc-1',
    name: 'Receita Principal',
    amount: 15000,
    maxAmount: 30000,
    color: '#38BDF8', // Cyan neon/pastel
    category: 'Trabalho / Salário',
    notes: 'Rendimento principal fixo mensal',
    isRecurring: true,
  },
  {
    id: 'inc-2',
    name: 'Renda Extra',
    amount: 5000,
    maxAmount: 15000,
    color: '#34D399', // Emerald
    category: 'Projetos & Freelance',
    notes: 'Consultorias pontuais e rendimentos variáveis',
    isRecurring: false,
  },
];

export const ELCIO_INSTALLMENTS_HISTORY: InstallmentMonthRecord[] = [
  {
    id: 'elcio-p-1',
    installmentNumber: 1,
    dueDate: '20/04',
    originalAmount: 500,
    paidAmount: 500,
    balanceDue: 0,
    status: 'paid',
    note: 'Pago integralmente em dia',
    isCurrentOrPast: true,
  },
  {
    id: 'elcio-p-2',
    installmentNumber: 2,
    dueDate: '20/05',
    originalAmount: 500,
    paidAmount: 500,
    balanceDue: 0,
    status: 'paid',
    note: 'Pago integralmente em dia',
    isCurrentOrPast: true,
  },
  {
    id: 'elcio-p-3',
    installmentNumber: 3,
    dueDate: '20/06',
    originalAmount: 500,
    paidAmount: 500,
    balanceDue: 0,
    status: 'paid',
    note: 'Pago integralmente em dia',
    isCurrentOrPast: true,
  },
  {
    id: 'elcio-p-4',
    installmentNumber: 4,
    dueDate: '20/07',
    originalAmount: 500,
    paidAmount: 500,
    balanceDue: 0,
    status: 'paid',
    note: 'Pago integralmente em dia',
    isCurrentOrPast: true,
  },
  {
    id: 'elcio-p-5',
    installmentNumber: 5,
    dueDate: '20/08',
    originalAmount: 500,
    paidAmount: 250,
    balanceDue: 250,
    status: 'partial',
    note: 'Pago R$ 250 parciais, restando R$ 250',
    isCurrentOrPast: true,
  },
  {
    id: 'elcio-p-6',
    installmentNumber: 6,
    dueDate: '20/09',
    originalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    status: 'pending',
    note: 'Vencimento corrente do mês',
    isCurrentOrPast: true,
  },
  {
    id: 'elcio-p-7',
    installmentNumber: 7,
    dueDate: '20/10',
    originalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    status: 'pending',
    note: 'A vencer no próximo mês',
    isCurrentOrPast: false,
  },
  {
    id: 'elcio-p-8',
    installmentNumber: 8,
    dueDate: '20/11',
    originalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'elcio-p-9',
    installmentNumber: 9,
    dueDate: '20/12',
    originalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'elcio-p-10',
    installmentNumber: 10,
    dueDate: '20/01',
    originalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'elcio-p-11',
    installmentNumber: 11,
    dueDate: '20/02',
    originalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    status: 'pending',
    note: 'Última parcela de quitação final',
    isCurrentOrPast: false,
  },
];

export const CHEFE_TIAGO_INSTALLMENTS_HISTORY: InstallmentMonthRecord[] = [
  {
    id: 'tiago-p-1',
    installmentNumber: 1,
    dueDate: '05/09',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'Parcela 01/07 do mês corrente',
    isCurrentOrPast: true,
  },
  {
    id: 'tiago-p-2',
    installmentNumber: 2,
    dueDate: '05/10',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'A vencer no próximo mês',
    isCurrentOrPast: false,
  },
  {
    id: 'tiago-p-3',
    installmentNumber: 3,
    dueDate: '05/11',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'tiago-p-4',
    installmentNumber: 4,
    dueDate: '05/12',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'tiago-p-5',
    installmentNumber: 5,
    dueDate: '05/01',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'tiago-p-6',
    installmentNumber: 6,
    dueDate: '05/02',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'A vencer',
    isCurrentOrPast: false,
  },
  {
    id: 'tiago-p-7',
    installmentNumber: 7,
    dueDate: '05/03',
    originalAmount: 1000,
    paidAmount: 0,
    balanceDue: 1000,
    status: 'pending',
    note: 'Última parcela de quitação final',
    isCurrentOrPast: false,
  },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    name: 'Ademar (Casa Antiga)',
    amount: 7250,
    maxAmount: 15000,
    color: '#F472B6', // Rose
    category: 'Habitação',
    paymentType: 'fixed',
    priority: 'high', // 🔴 Alta
    dueDateDay: 10,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    notes: 'Compromisso mensal referente à moradia',
  },
  {
    id: 'exp-2',
    name: 'Chefe Tiago',
    amount: 1000,
    maxAmount: 15000,
    color: '#A78BFA', // Violet
    category: 'Compromissos',
    paymentType: 'installment',
    priority: 'high', // 🔴 Alta
    dueDateDay: 5,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    principalDebt: 7000,
    totalWithInterest: 7000,
    totalInterestCost: 0,
    totalInstallments: 7,
    currentInstallment: 1,
    installmentNote: '7x de R$ 1.000,00 sem juros (Total: R$ 7.000,00)',
    totalDebt: 7000,
    interestConfig: {
      enabled: false,
      rateType: 'monthly_percent',
      rateValue: 0,
      applicationMethod: 'simple',
    },
    finalAdjustment: 'adjust_last',
    notes: 'Acordo prioritário: Valor Total R$ 7.000 em 7 parcelas mensais de R$ 1.000/mês',
    installmentHistory: CHEFE_TIAGO_INSTALLMENTS_HISTORY,
  },
  {
    id: 'exp-3',
    name: 'Serasa / Nome Limpo',
    amount: 3500,
    maxAmount: 10000,
    color: '#FB923C', // Orange
    category: 'Dívidas & Crédito',
    paymentType: 'fixed',
    priority: 'high', // 🔴 Alta
    dueDateDay: 15,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    notes: 'Renegociação em andamento para regularização',
  },
  {
    id: 'exp-4',
    name: 'Élcio dos Móveis',
    amount: 3250,
    maxAmount: 10000,
    color: '#FACC15', // Yellow
    category: 'Bens & Mobília',
    paymentType: 'installment',
    priority: 'medium', // 🟡 Média
    dueDateDay: 20,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    principalDebt: 5500,
    totalInstallments: 11,
    currentInstallment: 5,
    installmentNote: '6 faltantes de R$ 500 + R$ 250 pendente da 5ª (vencimento dia 20)',
    totalDebt: 3250,
    interestConfig: {
      enabled: false,
      rateType: 'monthly_percent',
      rateValue: 0,
      applicationMethod: 'simple',
    },
    finalAdjustment: 'adjust_last',
    notes: 'Compra de mobília e planejados em 11x',
    installmentHistory: ELCIO_INSTALLMENTS_HISTORY,
  },
  {
    id: 'exp-5',
    name: 'Pai',
    amount: 1000,
    maxAmount: 5000,
    color: '#818CF8', // Indigo
    category: 'Família',
    paymentType: 'fixed',
    priority: 'low', // 🟢 Baixa
    dueDateDay: 1,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    notes: 'Auxílio familiar mensal',
  },
  {
    id: 'exp-6',
    name: 'Irmão',
    amount: 900,
    maxAmount: 5000,
    color: '#60A5FA', // Blue
    category: 'Família',
    paymentType: 'fixed',
    priority: 'low', // 🟢 Baixa
    dueDateDay: 10,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    notes: 'Apoio e custeio familiar',
  },
  {
    id: 'exp-7',
    name: 'Parcela Carro',
    amount: 800,
    maxAmount: 5000,
    color: '#2DD4BF', // Teal
    category: 'Transporte',
    paymentType: 'fixed',
    priority: 'medium', // 🟡 Média
    dueDateDay: 25,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    notes: 'Financiamento veicular mensal',
  },
  {
    id: 'exp-8',
    name: 'Terceiros',
    amount: 400,
    maxAmount: 5000,
    color: '#E879F9', // Fuchsia
    category: 'Outros',
    paymentType: 'fixed',
    priority: 'low', // 🟢 Baixa
    dueDateDay: 28,
    monthlyStatus: 'unpaid',
    debtStatus: 'pending',
    notes: 'Despesas diversas e pequenos acertos',
  },
];

export const PALETTE_OPTIONS = [
  '#38BDF8', // Cyan
  '#34D399', // Emerald
  '#F472B6', // Rose
  '#A78BFA', // Violet
  '#FB923C', // Orange
  '#FACC15', // Yellow
  '#818CF8', // Indigo
  '#2DD4BF', // Teal
  '#E879F9', // Fuchsia
  '#F87171', // Red
  '#A3E635', // Lime
];

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'standard',
    name: 'Cenário Inicial Padrão',
    description: 'Dados originais com parcelamento inteligente de Chefe Tiago (7x de R$ 1.000) e Élcio dos Móveis (11x).',
    incomes: INITIAL_INCOMES,
    expenses: INITIAL_EXPENSES,
  },
  {
    id: 'lump-sum-tiago',
    name: 'Chefe Tiago Desembolso Integral',
    description: 'Simulação com pagamento total dos R$ 7.000 em uma única parcela mensal.',
    incomes: INITIAL_INCOMES,
    expenses: INITIAL_EXPENSES.map((e) =>
      e.id === 'exp-2' ? { ...e, amount: 7000, paymentType: 'fixed', notes: 'Pagamento integral de R$ 7.000 no mês' } : e
    ),
  },
  {
    id: 'balanced',
    name: 'Meta de Equilíbrio & Superávit',
    description: 'Renegociação com desconto e aumento leve de renda extra.',
    incomes: [
      { id: 'inc-1', name: 'Receita Principal', amount: 18000, maxAmount: 30000, color: '#38BDF8', category: 'Trabalho / Salário', isRecurring: true },
      { id: 'inc-2', name: 'Renda Extra', amount: 6500, maxAmount: 15000, color: '#34D399', category: 'Projetos & Freelance', isRecurring: false },
    ],
    expenses: [
      { id: 'exp-1', name: 'Ademar (Casa Antiga)', amount: 6000, maxAmount: 15000, color: '#F472B6', category: 'Habitação', paymentType: 'fixed', priority: 'high', dueDateDay: 10, monthlyStatus: 'unpaid', debtStatus: 'pending' },
      { id: 'exp-2', name: 'Chefe Tiago', amount: 1000, maxAmount: 15000, color: '#A78BFA', category: 'Compromissos', paymentType: 'installment', priority: 'high', dueDateDay: 5, monthlyStatus: 'unpaid', debtStatus: 'pending', principalDebt: 7000, totalInstallments: 7, currentInstallment: 1, installmentHistory: CHEFE_TIAGO_INSTALLMENTS_HISTORY },
      { id: 'exp-3', name: 'Serasa / Nome Limpo', amount: 3500, maxAmount: 10000, color: '#FB923C', category: 'Dívidas & Crédito', paymentType: 'fixed', priority: 'high', dueDateDay: 15, monthlyStatus: 'unpaid', debtStatus: 'pending' },
      { id: 'exp-4', name: 'Élcio dos Móveis', amount: 500, maxAmount: 10000, color: '#FACC15', category: 'Bens & Mobília', paymentType: 'installment', priority: 'medium', dueDateDay: 20, monthlyStatus: 'unpaid', debtStatus: 'pending', principalDebt: 5500, totalInstallments: 11, currentInstallment: 6, totalDebt: 3000, installmentNote: 'Parcela normal de R$ 500', installmentHistory: ELCIO_INSTALLMENTS_HISTORY },
      { id: 'exp-5', name: 'Pai', amount: 1000, maxAmount: 5000, color: '#818CF8', category: 'Família', paymentType: 'fixed', priority: 'low', dueDateDay: 1, monthlyStatus: 'unpaid', debtStatus: 'pending' },
      { id: 'exp-6', name: 'Irmão', amount: 900, maxAmount: 5000, color: '#60A5FA', category: 'Família', paymentType: 'fixed', priority: 'low', dueDateDay: 10, monthlyStatus: 'unpaid', debtStatus: 'pending' },
      { id: 'exp-7', name: 'Parcela Carro', amount: 800, maxAmount: 5000, color: '#2DD4BF', category: 'Transporte', paymentType: 'fixed', priority: 'medium', dueDateDay: 25, monthlyStatus: 'unpaid', debtStatus: 'pending' },
      { id: 'exp-8', name: 'Terceiros', amount: 400, maxAmount: 5000, color: '#E879F9', category: 'Outros', paymentType: 'fixed', priority: 'low', dueDateDay: 28, monthlyStatus: 'unpaid', debtStatus: 'pending' },
    ],
  },
];
