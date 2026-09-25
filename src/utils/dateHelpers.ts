import { DueDateStatus, MonthlyPaymentStatus } from '../types/finance';

// Data de referência do sistema: 2026-09-25
export const CURRENT_SYSTEM_DATE = new Date(2026, 8, 25); // Mês 8 = Setembro

export interface DueDateEvaluation {
  status: DueDateStatus;
  label: string;
  daysDifference: number; // Negativo se já passou, 0 se hoje, positivo se no futuro
  dueDateFormatted: string;
  colorClass: {
    badge: string;
    border: string;
    text: string;
    dot: string;
    glow: string;
  };
}

export function evaluateDueDate(
  dueDay: number,
  monthlyStatus: MonthlyPaymentStatus = 'unpaid',
  customCurrentDate: Date = CURRENT_SYSTEM_DATE
): DueDateEvaluation {
  const currentYear = customCurrentDate.getFullYear();
  const currentMonth = customCurrentDate.getMonth();
  const currentDay = customCurrentDate.getDate();

  // Se já está pago no mês atual
  if (monthlyStatus === 'paid') {
    return {
      status: 'paid_in_order',
      label: 'Pago no Mês (Em Dia)',
      daysDifference: 0,
      dueDateFormatted: `${String(dueDay).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`,
      colorClass: {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm shadow-emerald-500/20',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
      },
    };
  }

  // Criar data de vencimento no mês corrente
  const dueDateTime = new Date(currentYear, currentMonth, dueDay).setHours(0, 0, 0, 0);
  const nowTime = new Date(currentYear, currentMonth, currentDay).setHours(0, 0, 0, 0);

  const diffMs = dueDateTime - nowTime;
  const daysDifference = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const dueDateFormatted = `${String(dueDay).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`;

  // 1. NA DATA EXATA (Hoje)
  if (daysDifference === 0) {
    return {
      status: 'on_time_today',
      label: 'Vence Hoje! (Na Data Exata)',
      daysDifference: 0,
      dueDateFormatted,
      colorClass: {
        badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-400 font-extrabold ring-2 ring-emerald-500/40 animate-pulse',
        border: 'border-emerald-500 ring-1 ring-emerald-500/50',
        text: 'text-emerald-300 font-bold',
        dot: 'bg-emerald-400',
        glow: 'shadow-[0_0_16px_rgba(16,185,129,0.5)]',
      },
    };
  }

  // 2. DATA PASSADA / VENCIDO (Anterior a hoje e não pago)
  if (daysDifference < 0) {
    const daysAgo = Math.abs(daysDifference);
    return {
      status: 'overdue',
      label: `Vencido há ${daysAgo} ${daysAgo === 1 ? 'dia' : 'dias'}`,
      daysDifference,
      dueDateFormatted,
      colorClass: {
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold',
        border: 'border-rose-500/50 ring-1 ring-rose-500/30',
        text: 'text-rose-400 font-bold',
        dot: 'bg-rose-500',
        glow: 'shadow-[0_0_14px_rgba(244,63,94,0.4)]',
      },
    };
  }

  // 3. PRESTES A VENCER (Próximos 7 dias)
  if (daysDifference <= 7) {
    return {
      status: 'due_soon',
      label: `Vence em ${daysDifference} ${daysDifference === 1 ? 'dia' : 'dias'}`,
      daysDifference,
      dueDateFormatted,
      colorClass: {
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold',
        border: 'border-sky-500/40 ring-1 ring-sky-500/20',
        text: 'text-sky-400 font-semibold',
        dot: 'bg-sky-400',
        glow: 'shadow-[0_0_12px_rgba(56,189,248,0.35)]',
      },
    };
  }

  // 4. FUTURO (Mais de 7 dias)
  return {
    status: 'future',
    label: `Vence dia ${String(dueDay).padStart(2, '0')}`,
    daysDifference,
    dueDateFormatted,
    colorClass: {
      badge: 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30 font-medium',
      border: 'border-[#2A2E35]',
      text: 'text-neutral-400',
      dot: 'bg-neutral-500',
      glow: '',
    },
  };
}
