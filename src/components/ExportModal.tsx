import React, { useState } from 'react';
import { IncomeItem, ExpenseItem } from '../types/finance';
import { formatBRL, formatPercent } from '../utils/formatters';
import { X, Copy, Check, Download, FileText, Printer } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  incomes,
  expenses,
  totalIncome,
  totalExpense,
  balance,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateReportText = () => {
    const isPositive = balance >= 0;
    const lines = [
      '================================================================',
      'FLUXOFLOW FINTECH PRO - EXTRATO DE FLUXO DE CAIXA & SANKEY',
      `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      '================================================================',
      '',
      '--- 1. INDICADORES GERAIS ---',
      `Receita Total (Macro): ${formatBRL(totalIncome)}`,
      `Total a Pagar (Despesas): ${formatBRL(totalExpense)}`,
      `Saldo Restante Líquido: ${isPositive ? '+' : '-'}${formatBRL(Math.abs(balance))} [${isPositive ? 'SUPERÁVIT' : 'DÉFICIT'}]`,
      `Taxa de Comprometimento: ${formatPercent(totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100)}`,
      '',
      '--- 2. ENTRADAS REGISTRADAS (MACRO) ---',
      ...incomes.map(
        (i) =>
          `• ${i.name} [${i.category || 'Receita'}]: ${formatBRL(i.amount)} (${formatPercent(totalIncome > 0 ? (i.amount / totalIncome) * 100 : 0)} do fluxo)`
      ),
      '',
      '--- 3. DESPESAS E REGRAS DE PARCELAMENTO (MICRO) ---',
      ...expenses.map((e) => {
        const typeInfo =
          e.paymentType === 'installment'
            ? `Parcelado (${e.currentInstallment || 1}/${e.totalInstallments || 12}x | Faltam ${Math.max(0, (e.totalInstallments || 12) - (e.currentInstallment || 1) + 1)}x)`
            : 'Parcela Fixa Mensal';
        const noteInfo = e.installmentNote ? ` | Obs: ${e.installmentNote}` : '';
        const debtInfo = e.totalDebt ? ` | Saldo Devedor Total: ${formatBRL(e.totalDebt)}` : '';
        const curAccum = e.installmentHistory?.filter(r => r.isCurrentOrPast).reduce((s, r) => s + r.balanceDue, 0);
        const curAccumStr = curAccum !== undefined ? ` | Débito Acumulado Atual: ${formatBRL(curAccum)}` : '';
        return `• ${e.name} [${e.category || 'Geral'}] - ${formatBRL(e.amount)}/mês (${formatPercent(totalIncome > 0 ? (e.amount / totalIncome) * 100 : 0)} da receita) | ${typeInfo}${curAccumStr}${debtInfo}${noteInfo}`;
      }),
      '',
      '================================================================',
    ];
    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      summary: {
        totalIncome,
        totalExpense,
        balance,
        status: balance >= 0 ? 'surplus' : 'deficit',
        commitmentRate: totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100,
      },
      incomes,
      expenses,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxoflow-relatorio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#181B20] border border-[#2A2E35] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Extrato Consolidado do Orçamento</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          Copie para a área de transferência ou exporte os dados estruturados em JSON:
        </p>

        <div className="flex-1 overflow-auto rounded-xl bg-[#0F1115] border border-[#2A2E35] p-4">
          <pre className="font-mono text-xs text-neutral-300 whitespace-pre leading-relaxed select-all">
            {generateReportText()}
          </pre>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2A2E35]">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium border border-[#2A2E35] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium border border-[#2A2E35] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar JSON
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Texto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
