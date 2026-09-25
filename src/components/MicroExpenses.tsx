import React, { useState, useMemo, useRef } from 'react';
import {
  ExpenseItem,
  SelectedNodeDetail,
  PriorityLevel,
  PaymentType,
  SecurityConfirmationAction,
  ExpenseViewMode
} from '../types/finance';
import { formatBRL, formatPrivacyBRL, formatPercent, maskName } from '../utils/formatters';
import { PALETTE_OPTIONS } from '../utils/constants';
import { evaluateDueDate } from '../utils/dateHelpers';
import { SmartInstallmentForm, SmartInstallmentFormData } from './SmartInstallmentForm';
import {
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Search,
  ArrowUpDown,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  Tag,
  Calculator,
  Percent,
  Sliders,
  Zap,
  Info,
  AlertCircle,
  CalendarClock,
  Undo2,
  AlertTriangle,
  Pencil,
  Check,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  List,
  Monitor,
  AppWindow,
  Upload,
  Paperclip,
  Maximize2,
  FileText,
  X
} from 'lucide-react';

interface MicroExpensesProps {
  expenses: ExpenseItem[];
  totalIncome: number;
  totalExpense: number;
  isPrivacyMode?: boolean;
  hideItemNames?: boolean;
  onUpdateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  onAddExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  onRemoveExpense: (id: string) => void;
  onSelectExpenseForDetail: (detail: SelectedNodeDetail) => void;
  onOpenAddIncomeModal: () => void;
  onRequestSecurityConfirm?: (action: SecurityConfirmationAction) => void;
  onResetDefaults?: () => void;
}

export const MicroExpenses: React.FC<MicroExpensesProps> = ({
  expenses,
  totalIncome,
  totalExpense,
  isPrivacyMode = false,
  hideItemNames = false,
  onUpdateExpense,
  onAddExpense,
  onRemoveExpense,
  onSelectExpenseForDetail,
  onOpenAddIncomeModal,
  onRequestSecurityConfirm,
  onResetDefaults,
}) => {
  const [viewMode, setViewMode] = useState<ExpenseViewMode>('grid');
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadExpenseId, setActiveUploadExpenseId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'installment'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [dateStatusFilter, setDateStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'on_time'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'amount-desc' | 'amount-asc' | 'due-date' | 'priority' | 'name'>('default');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);

  // File upload trigger
  const handleTriggerUpload = (expenseId: string) => {
    setActiveUploadExpenseId(expenseId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadExpenseId) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        onUpdateExpense(activeUploadExpenseId, {
          attachmentUrl: dataUrl,
          attachmentName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
    setActiveUploadExpenseId(null);
  };

  const handleRemoveAttachment = (expenseId: string) => {
    onUpdateExpense(expenseId, {
      attachmentUrl: undefined,
      attachmentName: undefined,
    });
  };

  // New expense form state
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE_OPTIONS[2]);
  const [newCategory, setNewCategory] = useState('Compromissos');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newDueDateDay, setNewDueDateDay] = useState(10);
  const [newNotes, setNewNotes] = useState('');

  // Smart form state for creation
  const [newSmartData, setNewSmartData] = useState<SmartInstallmentFormData | null>(null);

  // Filter and Sort Logic
  const filteredAndSortedExpenses = useMemo(() => {
    let result = expenses.filter((e) => {
      // 1. Search text
      const matchSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Type filter
      const matchType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'fixed'
          ? e.paymentType === 'fixed'
          : e.paymentType === 'installment';

      // 3. Priority filter
      const matchPriority =
        priorityFilter === 'all' ? true : e.priority === priorityFilter;

      // 4. Date status filter
      const evalDate = evaluateDueDate(e.dueDateDay || 10, e.monthlyStatus);
      const matchDateStatus =
        dateStatusFilter === 'all'
          ? true
          : dateStatusFilter === 'overdue'
          ? evalDate.status === 'overdue'
          : dateStatusFilter === 'due_soon'
          ? evalDate.status === 'due_soon'
          : evalDate.status === 'on_time_today' || evalDate.status === 'paid_in_order';

      return matchSearch && matchType && matchPriority && matchDateStatus;
    });

    // Sorting
    if (sortBy === 'amount-desc') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'due-date') {
      result.sort((a, b) => (a.dueDateDay || 0) - (b.dueDateDay || 0));
    } else if (sortBy === 'priority') {
      const pMap: Record<PriorityLevel, number> = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => (pMap[b.priority] || 1) - (pMap[a.priority] || 1));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [expenses, searchTerm, typeFilter, priorityFilter, dateStatusFilter, sortBy]);

  // Handlers for Postponement (Adiar para o Próximo Mês)
  const handleTogglePostpone = (expense: ExpenseItem) => {
    if (expense.isPostponed) {
      // Restore
      const restored = expense.postponedAmount || 1000;
      onUpdateExpense(expense.id, {
        amount: restored,
        isPostponed: false,
        postponedAmount: undefined,
      });
    } else {
      // Trigger postponement with 2-step security modal if available
      if (onRequestSecurityConfirm) {
        onRequestSecurityConfirm({
          type: 'postpone_expense',
          title: `Adiar Parcela: ${expense.name}`,
          message: `Deseja transferir o valor de ${formatBRL(expense.amount)} de "${expense.name}" para o próximo mês? No mês atual ela ficará zerada, rebalanceando o fluxo de caixa.`,
          confirmLabel: 'Adiar para o Próximo Mês',
          isCritical: true,
          itemId: expense.id,
          itemType: 'expense',
          payload: { originalAmount: expense.amount },
        });
      } else {
        // Direct fallback
        onUpdateExpense(expense.id, {
          amount: 0,
          isPostponed: true,
          postponedAmount: expense.amount,
        });
      }
    }
  };

  // Toggle monthly status (Pago / Não Pago)
  const handleToggleMonthlyStatus = (expense: ExpenseItem) => {
    const nextStatus = expense.monthlyStatus === 'paid' ? 'unpaid' : 'paid';
    onUpdateExpense(expense.id, { monthlyStatus: nextStatus });
  };

  // Toggle debt status (Quitado / Pendente)
  const handleToggleDebtStatus = (expense: ExpenseItem) => {
    const nextStatus = expense.debtStatus === 'settled' ? 'pending' : 'settled';
    if (nextStatus === 'settled' && onRequestSecurityConfirm) {
      onRequestSecurityConfirm({
        type: 'settle_debt_fully',
        title: `Liquidação Total: ${expense.name}`,
        message: `Deseja marcar o compromisso "${expense.name}" como totalmente quitado?`,
        confirmLabel: 'Confirmar Quitação Total',
        isCritical: true,
        itemId: expense.id,
        itemType: 'expense',
      });
    } else {
      onUpdateExpense(expense.id, { debtStatus: nextStatus });
    }
  };

  // Delete expense with security modal
  const handleDeleteExpense = (expense: ExpenseItem) => {
    if (onRequestSecurityConfirm) {
      onRequestSecurityConfirm({
        type: 'delete_expense',
        title: `Excluir Despesa: ${expense.name}`,
        message: `Tem certeza que deseja excluir "${expense.name}" de ${formatBRL(expense.amount)}? Esta operação removerá o item do fluxo e do Diagrama de Sankey.`,
        confirmLabel: 'Excluir Definitivamente',
        isCritical: true,
        itemId: expense.id,
        itemType: 'expense',
      });
    } else {
      onRemoveExpense(expense.id);
    }
  };

  // Cycle Priority Level on click (Alta -> Média -> Baixa -> Alta)
  const handleCyclePriority = (expense: ExpenseItem) => {
    const order: PriorityLevel[] = ['high', 'medium', 'low'];
    const currentIdx = order.indexOf(expense.priority || 'medium');
    const nextPriority = order[(currentIdx + 1) % order.length];
    onUpdateExpense(expense.id, { priority: nextPriority });
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSmartData) return;

    const monthlyAmount = newSmartData.amount || 1000;
    const maxLim = Math.max(5000, monthlyAmount * 2);

    onAddExpense({
      name: newName.trim(),
      amount: monthlyAmount,
      maxAmount: maxLim,
      color: newColor,
      category: newCategory.trim() || 'Geral',
      paymentType: newSmartData.paymentType,
      principalDebt: newSmartData.principalDebt,
      totalWithInterest: newSmartData.totalWithInterest,
      totalInterestCost: newSmartData.totalInterestCost,
      totalInstallments: newSmartData.totalInstallments,
      currentInstallment: newSmartData.currentInstallment,
      totalDebt:
        newSmartData.paymentType === 'installment'
          ? newSmartData.installmentHistory.reduce((s, r) => s + r.balanceDue, 0)
          : undefined,
      installmentNote: newSmartData.installmentNote,
      interestConfig: newSmartData.interestConfig,
      finalAdjustment: newSmartData.finalAdjustment,
      installmentHistory: newSmartData.installmentHistory,
      dueDateDay: newDueDateDay,
      notes: newNotes,
      priority: newPriority,
      monthlyStatus: 'unpaid',
      debtStatus: 'pending',
    });

    setNewName('');
    setNewCategory('Compromissos');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleOpenDetail = (expense: ExpenseItem) => {
    const flowTotal = Math.max(1, Math.max(totalIncome, totalExpense));
    onSelectExpenseForDetail({
      type: 'expense',
      itemId: expense.id,
      name: expense.name,
      amount: expense.amount,
      color: expense.color,
      category: expense.category,
      percentageOfFlow: (expense.amount / flowTotal) * 100,
      paymentType: expense.paymentType,
      principalDebt: expense.principalDebt,
      totalWithInterest: expense.totalWithInterest,
      totalInterestCost: expense.totalInterestCost,
      totalInstallments: expense.totalInstallments,
      currentInstallment: expense.currentInstallment,
      installmentNote: expense.installmentNote,
      totalDebt: expense.totalDebt,
      dueDateDay: expense.dueDateDay,
      priority: expense.priority,
      monthlyStatus: expense.monthlyStatus,
      debtStatus: expense.debtStatus,
      isPostponed: expense.isPostponed,
      interestConfig: expense.interestConfig,
      finalAdjustment: expense.finalAdjustment,
      notes: expense.notes,
      installmentHistory: expense.installmentHistory,
    });
  };

  const applyChefeTiagoPresetToAddModal = () => {
    setNewName('Chefe Tiago');
    setNewCategory('Compromissos');
    setNewDueDateDay(5);
    setNewPriority('high');
    setNewColor('#A78BFA');
    setNewNotes('Acordo prioritário: Valor Total R$ 7.000 em 7 parcelas de R$ 1.000/mês sem juros.');
  };

  return (
    <div className="glass-surface specular-top-light rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Top Header of Micro Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 shadow-lg shadow-pink-500/10">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Controles MICRO e Gerenciador de Despesas
            </h2>
            <p className="text-xs text-neutral-400">
              Sinalização 🔴🔵🟢 por vencimento, botão de adiar para o próximo mês, prioridades e parcelamento inteligente.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Income, Add Expense, Reset */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              title="Restaurar valores de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrões
            </button>
          )}

          <button
            onClick={onOpenAddIncomeModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            + Adicionar Entrada
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            + Adicionar Despesa
          </button>
        </div>
      </div>

      {/* Dynamic Filter and Sort Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Search Field */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0F1115] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-[#0F1115] p-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todas ({expenses.length})
            </button>
            <button
              onClick={() => setTypeFilter('fixed')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'fixed' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Fixas ({expenses.filter((e) => e.paymentType === 'fixed').length})
            </button>
            <button
              onClick={() => setTypeFilter('installment')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'installment' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Parceladas ({expenses.filter((e) => e.paymentType === 'installment').length})
            </button>
          </div>

          {/* Order Dropdown */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ordenar:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0F1115] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value="default">Ordem Padrão</option>
              <option value="amount-desc">Maior Valor</option>
              <option value="amount-asc">Menor Valor</option>
              <option value="due-date">Vencimento (Dia do Mês)</option>
              <option value="priority">Prioridade (Alta ➔ Baixa)</option>
              <option value="name">Alfabética</option>
            </select>
          </div>
        </div>

        {/* Second Row: Date Status Filter, Priority Filter & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-white/[0.05]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Status Filter (🔴🔵🟢) */}
            <div className="flex items-center gap-1 bg-[#0F1115] p-1 rounded-lg border border-white/[0.08]">
              <span className="text-[10px] text-neutral-500 px-1 font-mono uppercase font-bold">Vencimento:</span>
              <button
                onClick={() => setDateStatusFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  dateStatusFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setDateStatusFilter('overdue')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  dateStatusFilter === 'overdue' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                🔴 Vencidos
              </button>
              <button
                onClick={() => setDateStatusFilter('due_soon')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  dateStatusFilter === 'due_soon' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                🔵 Em 7 Dias
              </button>
              <button
                onClick={() => setDateStatusFilter('on_time')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  dateStatusFilter === 'on_time' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                🟢 Em Dia / Pagos
              </button>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-[#0F1115] p-1 rounded-lg border border-white/[0.08]">
              <span className="text-[10px] text-neutral-500 px-1 font-mono uppercase font-bold">Urgência:</span>
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  priorityFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setPriorityFilter('high')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  priorityFilter === 'high' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                🔴 Alta
              </button>
              <button
                onClick={() => setPriorityFilter('medium')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  priorityFilter === 'medium' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                🟡 Média
              </button>
              <button
                onClick={() => setPriorityFilter('low')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  priorityFilter === 'low' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                🟢 Baixa
              </button>
            </div>
          </div>

          {/* VIEW MODE SWITCHER: GRADE, LISTA, GALERIA */}
          <div className="flex items-center gap-1 bg-[#0F1115] p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Modo Grade (Cards 3D com sliders e controles)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Modo Lista (Tabela compacta e ágil para dezenas de despesas)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('icons')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'icons'
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Modo Ícones no PC (Visualização organizada como lista de ícones igual ao estilo do PC)"
            >
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Ícones PC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input for Receipt Attachment Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* VIEW 1: GRID MODE (Cards 3D) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedExpenses.map((expense) => {
            const pctOfIncome = totalIncome > 0 ? (expense.amount / totalIncome) * 100 : 0;
            const isInstallment = expense.paymentType === 'installment';
            const isPaid = expense.monthlyStatus === 'paid';
            const isSettled = expense.debtStatus === 'settled';
            const isPostponed = !!expense.isPostponed;

            // Date evaluation (🔴🔵🟢)
            const dateEval = evaluateDueDate(expense.dueDateDay || 10, expense.monthlyStatus);
            const isOverdue = dateEval.status === 'overdue' && !isPaid;
            const isOnTimeToday = dateEval.status === 'on_time_today' && !isPaid;

            const remainingInstallments =
              isInstallment && expense.totalInstallments && expense.currentInstallment
                ? Math.max(0, expense.totalInstallments - expense.currentInstallment + 1)
                : 0;

            const totalLifetimeDebt = expense.installmentHistory
              ? expense.installmentHistory.reduce((s, r) => s + r.balanceDue, 0)
              : expense.totalDebt;

            return (
              <div
                key={expense.id}
                className={`rounded-xl p-4 transition-all duration-300 space-y-3 relative group glass-surface-interactive ${
                  isOverdue
                    ? 'bg-[#181216] border-rose-500/60 glow-overdue'
                    : isOnTimeToday
                    ? 'bg-[#121815] border-emerald-500/60 glow-on-time-today'
                    : isPaid
                    ? 'bg-[#10141A] border-emerald-500/30 opacity-95'
                    : 'bg-[#13161C]/90 border-white/[0.08]'
                }`}
              >
                {/* Top Row: Date Status Badge 🔴🔵🟢 + Priority Badge */}
                <div className="flex items-center justify-between gap-1.5">
                  {/* Due Date Indicator (🔴🔵🟢) */}
                  <div
                    className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1.5 font-mono ${dateEval.colorClass.badge}`}
                    title={`Vencimento: dia ${expense.dueDateDay || 10} do mês`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dateEval.colorClass.dot} ${isOverdue ? 'animate-ping' : ''}`} />
                    <span>{dateEval.label}</span>
                  </div>

                  {/* Priority Badge (Clickable to cycle) */}
                  <button
                    type="button"
                    onClick={() => handleCyclePriority(expense)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                      expense.priority === 'high'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                        : expense.priority === 'medium'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                    }`}
                    title="Clique para alternar o nível de urgência"
                  >
                    <span>
                      {expense.priority === 'high' ? '🔴 Alta' : expense.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                    </span>
                  </button>
                </div>

                {/* Header: Color Dot + Free Name Editing + Delete Button */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ring-1 ring-white/10"
                      style={{
                        backgroundColor: expense.color,
                        boxShadow: `0 0 10px ${expense.color}60`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={hideItemNames ? maskName(expense.name, true) : expense.name}
                          readOnly={hideItemNames}
                          onChange={(e) => {
                            if (!hideItemNames) {
                              onUpdateExpense(expense.id, { name: e.target.value });
                            }
                          }}
                          className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b focus:border-pink-400 border-b border-transparent transition-colors px-0 py-0.5 truncate w-full"
                          placeholder="Nome da despesa..."
                        />
                        {!hideItemNames && (
                          <Pencil className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {expense.category && (
                          <span className="text-[11px] text-neutral-400 font-medium truncate">
                            {expense.category}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono">
                          · Dia {expense.dueDateDay || 10}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDeleteExpense(expense)}
                      className="text-neutral-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                      title="Excluir Despesa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Installment Info Banner */}
                {isInstallment && (
                  <div className="p-2.5 rounded-lg bg-[#0F1115] border border-amber-500/25 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-300 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Parcela {expense.currentInstallment || 1} de {expense.totalInstallments || 7}
                      </span>
                      <span className="font-mono text-neutral-300 text-[11px]">
                        Restam: <strong className="text-white">{remainingInstallments}x</strong>
                      </span>
                    </div>

                    {expense.installmentNote && (
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        {expense.installmentNote}
                      </p>
                    )}
                  </div>
                )}

                {/* Postponed Alert Notice if active */}
                {isPostponed && (
                  <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                      <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Adiado para o Próximo Mês</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePostpone(expense)}
                      className="text-[10px] text-indigo-200 hover:text-white font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" />
                      Desfazer
                    </button>
                  </div>
                )}

                {/* Direct Numeric Input Row */}
                <div className="flex items-center justify-between gap-3 bg-[#0F1115] rounded-lg px-3 py-2 border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <DollarSign className="w-3.5 h-3.5 text-pink-400" />
                    <span>Desembolso Ativo:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-neutral-400">R$</span>
                    {isPrivacyMode ? (
                      <span className="text-right font-mono font-bold text-white text-base w-32 tabular-nums select-none privacy-masked-text">
                        ••••••
                      </span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={expense.maxAmount * 2}
                        step={50}
                        value={expense.amount}
                        disabled={isPostponed}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          onUpdateExpense(expense.id, {
                            amount: val,
                            maxAmount: Math.max(expense.maxAmount, val),
                          });
                        }}
                        className={`bg-transparent text-right font-mono font-bold text-base focus:outline-none w-32 tabular-nums ${
                          isPostponed ? 'text-neutral-500 line-through' : 'text-white'
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Slider (Range Input) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>{isPrivacyMode ? 'R$ ••' : 'R$ 0'}</span>
                    <span className="text-neutral-300">
                      Máx: {isPrivacyMode ? 'R$ ••••' : formatBRL(expense.maxAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={expense.maxAmount}
                    step={50}
                    value={expense.amount}
                    disabled={isPostponed || isPrivacyMode}
                    onChange={(e) =>
                      onUpdateExpense(expense.id, { amount: Number(e.target.value) })
                    }
                    className={`w-full ${isPrivacyMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      accentColor: expense.color,
                    }}
                  />
                </div>

                {/* Animated Toggles: Pago/Não Pago & Postpone Button */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                  {/* 1. Toggle Pago / Não Pago no Mês */}
                  <button
                    type="button"
                    onClick={() => handleToggleMonthlyStatus(expense)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
                    }`}
                    title="Marcar como Pago no mês corrente"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isPaid ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span>{isPaid ? 'Pago no Mês' : 'Pendente'}</span>
                  </button>

                  {/* 2. Botão de Adiar Parcela para o Próximo Mês */}
                  <button
                    type="button"
                    onClick={() => handleTogglePostpone(expense)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPostponed
                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/50 font-bold'
                        : 'bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                    title="Zerar parcela no mês atual e empurrar o valor para o mês seguinte"
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isPostponed ? 'Adiado' : 'Adiar Parcela'}</span>
                  </button>
                </div>

                {/* Bottom Actions: Receipt Link + Configurar Parcela & Juros Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-neutral-400">
                  <div className="flex items-center gap-2">
                    {expense.attachmentUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewAttachment({
                            url: expense.attachmentUrl!,
                            title: expense.name,
                          })
                        }
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono cursor-pointer bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30"
                        title="Ver Comprovante Anexado"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>Comprovante</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload(expense.id)}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 font-mono cursor-pointer"
                        title="Anexar Comprovante ou Foto"
                      >
                        <Upload className="w-3 h-3" />
                        <span>+ Anexo</span>
                      </button>
                    )}
                    <span className="font-mono hidden sm:inline">
                      {formatPercent(pctOfIncome)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetail(expense)}
                    className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 transition-all shadow-sm"
                    title="Abrir modal para configurar parcelamento, juros e histórico detalhado"
                  >
                    <Sliders className="w-3 h-3 text-sky-400" />
                    <span>Configurar & Juros</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE MODE (Lista Compacta) */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F1115]/90">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-neutral-400 font-mono text-[11px]">
                <th className="p-3">Status / Vencimento</th>
                <th className="p-3">Despesa / Categoria</th>
                <th className="p-3">Tipo / Parcela</th>
                <th className="p-3 text-right">Desembolso (Mês)</th>
                <th className="p-3 text-center">Status Mês</th>
                <th className="p-3 text-center">Urgência</th>
                <th className="p-3 text-center">Comprovante</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredAndSortedExpenses.map((expense) => {
                const isInstallment = expense.paymentType === 'installment';
                const isPaid = expense.monthlyStatus === 'paid';
                const isPostponed = !!expense.isPostponed;
                const dateEval = evaluateDueDate(expense.dueDateDay || 10, expense.monthlyStatus);
                const isOverdue = dateEval.status === 'overdue' && !isPaid;

                return (
                  <tr
                    key={expense.id}
                    className={`hover:bg-white/5 transition-colors ${
                      isOverdue ? 'bg-rose-500/5' : isPaid ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    {/* 1. Status / Vencimento */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dateEval.colorClass.dot}`} />
                        <span className="font-mono text-[11px] text-neutral-300">
                          Dia {expense.dueDateDay || 10}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${dateEval.colorClass.badge}`}>
                          {dateEval.label}
                        </span>
                      </div>
                    </td>

                    {/* 2. Nome / Categoria */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: expense.color }}
                        />
                        <div>
                          <p className="font-bold text-white text-xs">
                            {hideItemNames ? maskName(expense.name, true) : expense.name}
                          </p>
                          <p className="text-[10px] text-neutral-400">{expense.category || 'Geral'}</p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Tipo / Parcela */}
                    <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                      {isInstallment ? (
                        <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {expense.currentInstallment || 1}/{expense.totalInstallments || 7}x
                        </span>
                      ) : (
                        <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Fixa
                        </span>
                      )}
                    </td>

                    {/* 4. Desembolso Mês */}
                    <td className="p-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isPostponed ? 'line-through text-neutral-500' : 'text-white'}>
                        {isPrivacyMode ? 'R$ ••••••' : formatBRL(expense.amount)}
                      </span>
                    </td>

                    {/* 5. Status Mês */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleMonthlyStatus(expense)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isPaid ? 'Pago' : 'Pendente'}</span>
                      </button>
                    </td>

                    {/* 6. Urgência */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCyclePriority(expense)}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer"
                      >
                        {expense.priority === 'high'
                          ? '🔴 Alta'
                          : expense.priority === 'medium'
                          ? '🟡 Média'
                          : '🟢 Baixa'}
                      </button>
                    </td>

                    {/* 7. Comprovante */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {expense.attachmentUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewAttachment({
                              url: expense.attachmentUrl!,
                              title: expense.name,
                            })
                          }
                          className="p-1 rounded text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 cursor-pointer inline-flex items-center gap-1 text-[11px]"
                          title="Ver comprovante"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(expense.id)}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-300 cursor-pointer inline-flex items-center gap-1 text-[10px]"
                          title="Anexar comprovante"
                        >
                          <Upload className="w-3 h-3" />
                          <span>+ Anexar</span>
                        </button>
                      )}
                    </td>

                    {/* 8. Ações */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePostpone(expense)}
                          className={`p-1.5 rounded text-xs font-semibold cursor-pointer border ${
                            isPostponed
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
                          }`}
                          title="Adiar para o próximo mês"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(expense)}
                          className="p-1.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 cursor-pointer"
                          title="Configurar parcelas e juros"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(expense)}
                          className="p-1.5 rounded text-neutral-500 hover:text-rose-400 cursor-pointer"
                          title="Excluir despesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: DESKTOP PC ICONS MODE (Visualização organizada como lista de ícones estilo PC) */}
      {viewMode === 'icons' && (
        <div className="rounded-2xl glass-surface specular-top-light border border-white/10 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <AppWindow className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white uppercase tracking-wider font-mono">
                Visualização em Ícones do PC (Estilo Desktop Grid)
              </span>
              <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {filteredAndSortedExpenses.length} itens organizados
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Clique no ícone para gerenciar ou no botão rápido para marcar pago.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredAndSortedExpenses.map((expense) => {
              const isPaid = expense.monthlyStatus === 'paid';
              const isInstallment = expense.paymentType === 'installment';
              const dateEval = evaluateDueDate(expense.dueDateDay || 10, expense.monthlyStatus);

              return (
                <div
                  key={expense.id}
                  onClick={() => handleOpenDetail(expense)}
                  className={`group relative rounded-xl border p-3 flex flex-col items-center text-center justify-between transition-all duration-200 cursor-pointer select-none hover:scale-[1.03] hover:shadow-xl ${
                    isPaid
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10'
                      : dateEval.status === 'overdue'
                      ? 'bg-rose-950/25 border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/15'
                      : 'bg-[#101319]/90 border-white/10 hover:border-sky-400/50 hover:bg-sky-500/10'
                  }`}
                  title={`${expense.name} • Clique para ver detalhes`}
                >
                  {/* Status Indicator Pin */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {expense.attachmentUrl && (
                      <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400" title="Comprovante anexado">
                        <Paperclip className="w-3 h-3" />
                      </span>
                    )}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPaid
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : dateEval.status === 'overdue'
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse'
                          : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                      }`}
                    />
                  </div>

                  {/* Desktop PC Icon Illustration */}
                  <div className="my-2 relative flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${expense.color}25`,
                        borderColor: `${expense.color}60`,
                        boxShadow: `0 8px 16px ${expense.color}20`,
                      }}
                    >
                      {isInstallment ? (
                        <Layers className="w-6 h-6" style={{ color: expense.color }} />
                      ) : (
                        <CreditCard className="w-6 h-6" style={{ color: expense.color }} />
                      )}
                    </div>
                  </div>

                  {/* Icon Label / Name */}
                  <div className="w-full space-y-0.5">
                    <p className="text-xs font-bold text-white truncate max-w-full group-hover:text-sky-300 transition-colors">
                      {hideItemNames ? maskName(expense.name, true) : expense.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {expense.category || 'Geral'}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="w-full mt-2 pt-2 border-t border-white/10 space-y-1">
                    <span className="text-xs font-bold font-mono text-white block">
                      {isPrivacyMode ? 'R$ ••••••' : formatBRL(expense.amount)}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      {isInstallment
                        ? `${expense.currentInstallment || 1}/${expense.totalInstallments || 7}x`
                        : `Dia ${expense.dueDateDay || 10}`}
                    </span>
                  </div>

                  {/* 1-Click Status Badge */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMonthlyStatus(expense);
                    }}
                    className={`mt-2 w-full py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      isPaid
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{isPaid ? 'Pago' : 'Pendente'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL SCREEN RECEIPT PREVIEW MODAL */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-[#13161C] border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Comprovante: {previewAttachment.title}</h4>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center items-center bg-black/60 rounded-xl p-2 max-h-[70vh] overflow-hidden border border-white/5">
              <img
                src={previewAttachment.url}
                alt={previewAttachment.title}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
              <span>Anexo do lançamento</span>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedExpenses.length === 0 && (
        <div className="py-12 text-center text-neutral-400 text-sm">
          Nenhuma despesa encontrada para os filtros selecionados.
        </div>
      )}

      {/* MODAL: CRIAR NOVA DESPESA / DÍVIDA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl glass-surface p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Adicionar Nova Despesa ou Dívida
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Defina prioridade, data de vencimento, parcelamento com limite de meses, juros e histórico.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Template Banner */}
            <div className="p-3 rounded-xl bg-[#0F1115] border border-amber-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Preenchimento Rápido com Exemplo:
              </span>
              <button
                type="button"
                onClick={applyChefeTiagoPresetToAddModal}
                className="text-[11px] font-bold px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
              >
                Exemplo Chefe Tiago (R$ 7.000 em 7x de R$ 1.000)
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nome da Despesa / Credor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Chefe Tiago, Cartão de Crédito, Aluguel"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Prioridade / Urgência
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="high">🔴 Alta (Urgência Máxima)</option>
                    <option value="medium">🟡 Média (Urgência Média)</option>
                    <option value="low">🟢 Baixa (Urgência Baixa)</option>
                  </select>
                </div>
              </div>

              {/* Formulário Inteligente de Parcelamento e Juros */}
              <div className="p-4 rounded-xl bg-[#0F1115] border border-white/[0.08]">
                <SmartInstallmentForm
                  initialPaymentType="installment"
                  initialPrincipalDebt={7000}
                  initialAmount={1000}
                  initialTotalInstallments={7}
                  initialCurrentInstallment={1}
                  dueDateDay={newDueDateDay}
                  showMonthlyHistory={true}
                  onChange={(data) => setNewSmartData(data)}
                />
              </div>

              {/* Categoria, Dia de Vencimento e Cor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Compromissos, Habitação"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Dia de Vencimento
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newDueDateDay}
                    onChange={(e) => setNewDueDateDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Cor no Sankey
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PALETTE_OPTIONS.slice(0, 7).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          newColor === c
                            ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#181B20]'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Observações Gerais */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Observações Gerais do Acordo
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais do parcelamento..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1115] border border-white/10 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 resize-none"
                />
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
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Confirmar e Adicionar ao Fluxo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
