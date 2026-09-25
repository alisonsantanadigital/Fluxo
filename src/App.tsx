import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { SankeyDiagram } from './components/SankeyDiagram';
import { MacroOverview } from './components/MacroOverview';
import { MicroExpenses } from './components/MicroExpenses';
import { ItemDetailModal } from './components/ItemDetailModal';
import { QuickScenariosModal } from './components/QuickScenariosModal';
import { ExportModal } from './components/ExportModal';
import { SecurityConfirmModal } from './components/SecurityConfirmModal';
import {
  IncomeItem,
  ExpenseItem,
  Scenario,
  SelectedNodeDetail,
  SecurityConfirmationAction
} from './types/finance';
import { INITIAL_INCOMES, INITIAL_EXPENSES } from './utils/constants';

export default function App() {
  // Local storage state with versioned fallback
  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    try {
      const saved = localStorage.getItem('fluxoflow_incomes_v6');
      return saved ? JSON.parse(saved) : INITIAL_INCOMES;
    } catch {
      return INITIAL_INCOMES;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('fluxoflow_expenses_v6');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [selectedNodeDetail, setSelectedNodeDetail] = useState<SelectedNodeDetail | null>(null);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [securityAction, setSecurityAction] = useState<SecurityConfirmationAction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_incomes_v6', JSON.stringify(incomes));
    } catch {}
  }, [incomes]);

  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_expenses_v6', JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  // Calculations
  const totalIncome = useMemo(
    () => incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [incomes]
  );
  const totalExpense = useMemo(
    () => expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [expenses]
  );
  const balance = totalIncome - totalExpense;

  // Celebration when balance turns positive
  const prevBalanceRef = useRef(balance);
  useEffect(() => {
    if (prevBalanceRef.current < 0 && balance >= 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#38BDF8', '#FACC15'],
      });
      showToast('🎉 Parabéns! Seu orçamento atingiu superávit positivo!');
    }
    prevBalanceRef.current = balance;
  }, [balance]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Income Handlers
  const handleUpdateIncome = (id: string, updates: Partial<IncomeItem>) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setSelectedNodeDetail((prev) =>
      prev && prev.itemId === id ? { ...prev, ...updates } : prev
    );
  };

  const handleAddIncome = (newItem: Omit<IncomeItem, 'id'>) => {
    const id = `inc-${Date.now()}`;
    setIncomes((prev) => [...prev, { ...newItem, id }]);
    showToast(`Fonte de receita "${newItem.name}" adicionada.`);
  };

  const handleRemoveIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
    showToast('Fonte de receita removida.');
  };

  // Expense Handlers
  const handleUpdateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setSelectedNodeDetail((prev) =>
      prev && prev.itemId === id ? { ...prev, ...updates } : prev
    );
  };

  const handleAddExpense = (newItem: Omit<ExpenseItem, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setExpenses((prev) => [...prev, { ...newItem, id }]);
    showToast(`Despesa "${newItem.name}" adicionada.`);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    showToast('Despesa removida com sucesso.');
  };

  // Security confirmation execution
  const handleConfirmSecurityAction = () => {
    if (!securityAction) return;

    if (securityAction.type === 'delete_expense') {
      handleRemoveExpense(securityAction.itemId);
    } else if (securityAction.type === 'postpone_expense') {
      const orig = securityAction.payload?.originalAmount || 0;
      handleUpdateExpense(securityAction.itemId, {
        amount: 0,
        isPostponed: true,
        postponedAmount: orig,
      });
      showToast('Parcela adiada para o próximo mês. Saldo recalculado.');
    } else if (securityAction.type === 'settle_debt_fully') {
      handleUpdateExpense(securityAction.itemId, {
        debtStatus: 'settled',
        monthlyStatus: 'paid',
      });
      showToast('Compromisso marcado como totalmente quitado!');
    } else if (securityAction.type === 'delete_income') {
      handleRemoveIncome(securityAction.itemId);
    }

    setSecurityAction(null);
  };

  // Reset to original factory defaults
  const handleResetDefaults = () => {
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    showToast('Valores restaurados para os padrões iniciais.');
  };

  const handleApplyScenario = (scenario: Scenario) => {
    setIncomes(scenario.incomes);
    setExpenses(scenario.expenses);
    showToast(`Cenário "${scenario.name}" aplicado com sucesso.`);
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#EEEEEE] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* Top Header Bar */}
      <Header
        onOpenScenarios={() => setIsScenariosOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onReset={handleResetDefaults}
        onOpenAddExpense={() => {
          const el = document.getElementById('micro');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Container - Strict Vertical Layout Order as required */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 overflow-x-hidden">
        
        {/* ======================================================== */}
        {/* 1. TOPO — DIAGRAMA DE FLUXO DE CAIXA (SANKEY 3D / GLOW)  */}
        {/* ======================================================== */}
        <section id="sankey" className="scroll-mt-20">
          <SankeyDiagram
            incomes={incomes}
            expenses={expenses}
            onSelectNode={(detail) => setSelectedNodeDetail(detail)}
          />
        </section>

        {/* ======================================================== */}
        {/* 2. SEGUNDO BLOCO — RESUMO FINANCEIRO & AJUSTES MACRO     */}
        {/* ======================================================== */}
        <section id="macro" className="scroll-mt-20">
          <MacroOverview
            incomes={incomes}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            onUpdateIncome={handleUpdateIncome}
            onAddIncome={handleAddIncome}
            onRemoveIncome={handleRemoveIncome}
          />
        </section>

        {/* ======================================================== */}
        {/* 3. TERCEIRO BLOCO — CONTROLES MICRO E GERENCIADOR        */}
        {/* ======================================================== */}
        <section id="micro" className="scroll-mt-20">
          <MicroExpenses
            expenses={expenses}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            onUpdateExpense={handleUpdateExpense}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
            onSelectExpenseForDetail={(detail) => setSelectedNodeDetail(detail)}
            onOpenAddIncomeModal={() => {
              const el = document.getElementById('macro');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onRequestSecurityConfirm={(action) => setSecurityAction(action)}
            onResetDefaults={handleResetDefaults}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-neutral-400 bg-[#0B0D11]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <p className="font-mono text-neutral-300 font-semibold">
              FluxoFlow Fintech Pro · Painel Financeiro 3D & Motion
            </p>
          </div>
          <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
            <span>Sankey Vetorial 3D</span>
            <span>·</span>
            <span>Sinalização por Datas 🔴🔵🟢</span>
            <span>·</span>
            <span>Adiar para Próximo Mês</span>
          </div>
        </div>
      </footer>

      {/* Micro-Detalhamento Modal */}
      <ItemDetailModal
        detail={selectedNodeDetail}
        allExpenses={expenses}
        totalExpense={totalExpense}
        onClose={() => setSelectedNodeDetail(null)}
        onUpdateIncome={handleUpdateIncome}
        onUpdateExpense={handleUpdateExpense}
        onRemoveIncome={handleRemoveIncome}
        onRemoveExpense={handleRemoveExpense}
      />

      {/* Scenarios Modal */}
      <QuickScenariosModal
        isOpen={isScenariosOpen}
        onClose={() => setIsScenariosOpen(false)}
        onSelectScenario={handleApplyScenario}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        incomes={incomes}
        expenses={expenses}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />

      {/* Trava de Segurança em 2 Etapas (Double Confirmation) */}
      <SecurityConfirmModal
        action={securityAction}
        onConfirm={handleConfirmSecurityAction}
        onCancel={() => setSecurityAction(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#13161C] border border-white/15 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
