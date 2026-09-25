import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Header } from './components/Header';
import { SankeyDiagram } from './components/SankeyDiagram';
import { MacroOverview } from './components/MacroOverview';
import { MicroExpenses } from './components/MicroExpenses';
import { ItemDetailModal } from './components/ItemDetailModal';
import { QuickScenariosModal } from './components/QuickScenariosModal';
import { ExportModal } from './components/ExportModal';
import { SecurityConfirmModal } from './components/SecurityConfirmModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import {
  IncomeItem,
  ExpenseItem,
  FutureIncomeItem,
  Scenario,
  SelectedNodeDetail,
  SecurityConfirmationAction,
  AppTheme
} from './types/finance';
import { INITIAL_INCOMES, INITIAL_EXPENSES } from './utils/constants';
import {
  subscribeFamilyVault,
  saveFamilyVault,
  fetchFamilyVault,
  signInGoogle,
  signOutUser,
  DEFAULT_VAULT_ID
} from './firebase/familyFinanceService';
import { auth, testConnection } from './firebase/config';

const INITIAL_FUTURE_INCOMES: FutureIncomeItem[] = [
  {
    id: 'finc-1',
    name: 'Comissão de Vendas - Alison',
    amount: 1850,
    expectedDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d.toISOString().split('T')[0];
    })(),
    category: 'Comissão',
    payerOrSource: 'Empresa Principal',
    status: 'pending',
    notes: 'Previsão de fechamento da meta mensal',
  },
  {
    id: 'finc-2',
    name: 'Recebimento Freelance Web',
    amount: 1200,
    expectedDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 12);
      return d.toISOString().split('T')[0];
    })(),
    category: 'Freelance',
    payerOrSource: 'Cliente Particular',
    status: 'pending',
    notes: 'Segunda parcela do projeto',
  }
];

export default function App() {
  // Theme state: 'dark' | 'light' | 'neon'
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('fluxoflow_theme_v2');
      return (saved as AppTheme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Privacy Mode state
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fluxoflow_privacy_v2') === 'true';
    } catch {
      return false;
    }
  });

  // Hide Names state (sub-setting of privacy mode)
  const [hideItemNames, setHideItemNames] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fluxoflow_hide_names_v2') === 'true';
    } catch {
      return false;
    }
  });

  // Vault ID (sync code for husband & wife across devices)
  const [vaultId, setVaultId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const queryVault = urlParams.get('vault');
        if (queryVault) return queryVault.toLowerCase();
      }
      return localStorage.getItem('fluxoflow_vault_id') || DEFAULT_VAULT_ID;
    } catch {
      return DEFAULT_VAULT_ID;
    }
  });

  const [vaultName, setVaultName] = useState<string>(() => {
    try {
      return localStorage.getItem('fluxoflow_vault_name') || 'Finanças Alison & Esposa';
    } catch {
      return 'Finanças Alison & Esposa';
    }
  });

  // Cloud status states
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Financial collections
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

  const [futureIncomes, setFutureIncomes] = useState<FutureIncomeItem[]>(() => {
    try {
      const saved = localStorage.getItem('fluxoflow_future_incomes_v1');
      return saved ? JSON.parse(saved) : INITIAL_FUTURE_INCOMES;
    } catch {
      return INITIAL_FUTURE_INCOMES;
    }
  });

  const [selectedNodeDetail, setSelectedNodeDetail] = useState<SelectedNodeDetail | null>(null);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [securityAction, setSecurityAction] = useState<SecurityConfirmationAction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme to body and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_theme_v2', currentTheme);
      document.body.className = `theme-${currentTheme}`;
    } catch {}
  }, [currentTheme]);

  // Sync privacy mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_privacy_v2', String(isPrivacyMode));
    } catch {}
  }, [isPrivacyMode]);

  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_hide_names_v2', String(hideItemNames));
    } catch {}
  }, [hideItemNames]);

  // Local storage caching for offline resilience
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

  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_future_incomes_v1', JSON.stringify(futureIncomes));
    } catch {}
  }, [futureIncomes]);

  useEffect(() => {
    try {
      localStorage.setItem('fluxoflow_vault_id', vaultId);
      localStorage.setItem('fluxoflow_vault_name', vaultName);
    } catch {}
  }, [vaultId, vaultName]);

  // Test live connection on start and track Auth
  useEffect(() => {
    testConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubAuth();
  }, []);

  // Real-time Firestore subscription on shared family vault
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => {
    const unsub = subscribeFamilyVault(
      vaultId,
      (remoteData) => {
        if (!remoteData) return;
        isRemoteUpdateRef.current = true;

        if (Array.isArray(remoteData.incomes) && remoteData.incomes.length > 0) {
          setIncomes(remoteData.incomes);
        }
        if (Array.isArray(remoteData.expenses) && remoteData.expenses.length > 0) {
          setExpenses(remoteData.expenses);
        }
        if (Array.isArray(remoteData.futureIncomes)) {
          setFutureIncomes(remoteData.futureIncomes);
        }
        if (remoteData.householdName) {
          setVaultName(remoteData.householdName);
        }

        setIsCloudConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));

        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 400);
      },
      (err) => {
        console.warn('Sync listener notice:', err);
      }
    );

    return () => unsub();
  }, [vaultId]);

  // Auto-save changes to Firestore (debounced 900ms)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (isRemoteUpdateRef.current) {
      return; // Skip auto-save if change came from cloud snapshot
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSyncing(true);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveFamilyVault(vaultId, {
          householdName: vaultName,
          incomes,
          expenses,
          futureIncomes,
          updatedBy: currentUser?.displayName || currentUser?.email || 'Alison & Esposa',
        });
        setIsCloudConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      } catch (err) {
        console.error('Error auto-saving family vault to Firestore:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 900);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [incomes, expenses, futureIncomes, vaultId, vaultName, currentUser]);

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

  // Manual force save
  const handleForceSave = async () => {
    try {
      setIsSyncing(true);
      await saveFamilyVault(vaultId, {
        householdName: vaultName,
        incomes,
        expenses,
        futureIncomes,
        updatedBy: currentUser?.displayName || currentUser?.email || 'Alison & Esposa',
      });
      setIsCloudConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      showToast('☁️ Dados salvos e sincronizados na nuvem com sucesso!');
    } catch (err) {
      showToast('⚠️ Erro ao salvar na nuvem.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Auth Handlers
  const handleLoginGoogle = async () => {
    try {
      const user = await signInGoogle();
      if (user) {
        showToast(`Bem-vindo, ${user.displayName || user.email}!`);
      }
    } catch (err) {
      showToast('Não foi possível autenticar com o Google.');
    }
  };

  const handleLogoutGoogle = async () => {
    try {
      await signOutUser();
      showToast('Sessão encerrada com sucesso.');
    } catch {
      showToast('Erro ao sair.');
    }
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

  // Future Incomes Handlers
  const handleAddFutureIncome = (newItem: Omit<FutureIncomeItem, 'id'>) => {
    const id = `finc-${Date.now()}`;
    setFutureIncomes((prev) => [...prev, { ...newItem, id }]);
    showToast(`Previsão "${newItem.name}" agendada.`);
  };

  const handleUpdateFutureIncome = (id: string, updates: Partial<FutureIncomeItem>) => {
    setFutureIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveFutureIncome = (id: string) => {
    setFutureIncomes((prev) => prev.filter((item) => item.id !== id));
    showToast('Entrada futura removida.');
  };

  const handleMarkAsReceivedAndCredit = (item: FutureIncomeItem) => {
    // 1. Mark status as received
    setFutureIncomes((prev) =>
      prev.map((f) =>
        f.id === item.id ? { ...f, status: 'received', receivedDate: new Date().toISOString() } : f
      )
    );

    // 2. Add to active realized incomes (so it directly increases Caixa no Momento!)
    const creditedIncome: IncomeItem = {
      id: `inc-credited-${item.id}`,
      name: `Recebido: ${item.name}`,
      amount: item.amount,
      maxAmount: Math.max(item.amount * 1.5, 12000),
      color: '#10B981',
      category: item.category || 'Recebido',
      notes: `Creditado das entradas futuras em ${new Date().toLocaleDateString('pt-BR')}`,
    };

    setIncomes((prev) => [...prev, creditedIncome]);

    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#38BDF8', '#FBBF24'],
    });

    showToast(`🎉 Entrada de R$ ${item.amount.toLocaleString('pt-BR')} creditada no Caixa com sucesso!`);
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
    setFutureIncomes(INITIAL_FUTURE_INCOMES);
    showToast('Valores restaurados para os padrões iniciais.');
  };

  const handleApplyScenario = (scenario: Scenario) => {
    setIncomes(scenario.incomes);
    setExpenses(scenario.expenses);
    showToast(`Cenário "${scenario.name}" aplicado com sucesso.`);
  };

  const isLight = currentTheme === 'light';
  const isNeon = currentTheme === 'neon';

  const containerThemeClass = isLight
    ? 'bg-[#F8FAFC] text-slate-900'
    : isNeon
    ? 'bg-[#05050A] text-[#F1F5F9]'
    : 'bg-[#0B0D11] text-[#EEEEEE]';

  const footerThemeClass = isLight
    ? 'bg-slate-100 border-slate-200 text-slate-600'
    : isNeon
    ? 'bg-[#05050A] border-pink-500/20 text-neutral-400'
    : 'bg-[#0B0D11] border-white/[0.08] text-neutral-400';

  return (
    <div className={`min-h-screen ${containerThemeClass} flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden transition-colors duration-300`}>
      {/* Top Header Bar */}
      <Header
        currentTheme={currentTheme}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={() => setIsPrivacyMode((prev) => !prev)}
        hideItemNames={hideItemNames}
        onToggleHideItemNames={() => setHideItemNames((prev) => !prev)}
        onOpenScenarios={() => setIsScenariosOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onReset={handleResetDefaults}
        isCloudConnected={isCloudConnected}
        isSyncing={isSyncing}
        onOpenCloudSync={() => setIsCloudModalOpen(true)}
      />

      {/* Main Container - Strict Vertical Layout Order */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 overflow-x-hidden">
        
        {/* ======================================================== */}
        {/* 1. TOPO — DIAGRAMA DE FLUXO DE CAIXA (SANKEY 3D / GLOW)  */}
        {/* ======================================================== */}
        <section id="sankey" className="scroll-mt-20">
          <SankeyDiagram
            incomes={incomes}
            expenses={expenses}
            isPrivacyMode={isPrivacyMode}
            hideItemNames={hideItemNames}
            onSelectNode={(detail) => setSelectedNodeDetail(detail)}
          />
        </section>

        {/* ======================================================== */}
        {/* 2. SEGUNDO BLOCO — RESUMO FINANCEIRO, CAIXA & FUTURAS    */}
        {/* ======================================================== */}
        <section id="macro" className="scroll-mt-20">
          <MacroOverview
            incomes={incomes}
            expenses={expenses}
            futureIncomes={futureIncomes}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            isPrivacyMode={isPrivacyMode}
            hideItemNames={hideItemNames}
            onUpdateIncome={handleUpdateIncome}
            onAddIncome={handleAddIncome}
            onRemoveIncome={handleRemoveIncome}
            onAddFutureIncome={handleAddFutureIncome}
            onUpdateFutureIncome={handleUpdateFutureIncome}
            onRemoveFutureIncome={handleRemoveFutureIncome}
            onMarkAsReceivedAndCredit={handleMarkAsReceivedAndCredit}
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
            isPrivacyMode={isPrivacyMode}
            hideItemNames={hideItemNames}
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
      <footer className={`border-t py-8 text-center text-xs transition-colors duration-300 ${footerThemeClass}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <p className={`font-mono font-semibold ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
              FluxoFlow Fintech Pro · Painel Financeiro 3D & Nuvem Familiar
            </p>
          </div>
          <div className={`flex items-center gap-3 font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            <span>Caixa no Momento</span>
            <span>·</span>
            <span>Entradas Futuras</span>
            <span>·</span>
            <span>Ícones no PC</span>
            <span>·</span>
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Nuvem Ativa ({vaultName})</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Cloud Sync Modal (Alison & Esposa / Multi-device) */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        vaultId={vaultId}
        vaultName={vaultName}
        onUpdateVaultId={(newId) => setVaultId(newId)}
        onUpdateVaultName={(newName) => setVaultName(newName)}
        isCloudConnected={isCloudConnected}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        currentUser={currentUser}
        onLoginGoogle={handleLoginGoogle}
        onLogoutGoogle={handleLogoutGoogle}
        onForceSave={handleForceSave}
      />

      {/* Micro-Detalhamento Modal */}
      <ItemDetailModal
        detail={selectedNodeDetail}
        allExpenses={expenses}
        totalExpense={totalExpense}
        isPrivacyMode={isPrivacyMode}
        hideItemNames={hideItemNames}
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
