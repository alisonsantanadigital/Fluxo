import React from 'react';
import { Scenario } from '../types/finance';
import { PRESET_SCENARIOS } from '../utils/constants';
import { formatBRL } from '../utils/formatters';
import { Check, Sparkles, X, ArrowRight } from 'lucide-react';

interface QuickScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  currentScenarioId?: string;
}

export const QuickScenariosModal: React.FC<QuickScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  currentScenarioId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#181B20] border border-[#2A2E35] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-bold text-white">Simulador de Cenários Financeiros</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          Carregue configurações prontas com um clique para simular como as curvas do Sankey e
          as parcelas se comportam em diferentes projeções:
        </p>

        <div className="space-y-3">
          {PRESET_SCENARIOS.map((scenario) => {
            const totInc = scenario.incomes.reduce((acc, i) => acc + i.amount, 0);
            const totExp = scenario.expenses.reduce((acc, e) => acc + e.amount, 0);
            const diff = totInc - totExp;
            const isSelected = currentScenarioId === scenario.id;

            return (
              <div
                key={scenario.id}
                onClick={() => {
                  onSelectScenario(scenario);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? 'bg-white/5 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-[#0F1115] border-[#2A2E35] hover:border-neutral-500/40 hover:bg-[#13151A]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {scenario.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{scenario.description}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#2A2E35] flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">
                    Entradas: <span className="text-neutral-200 font-bold">{formatBRL(totInc)}</span>
                  </span>
                  <span className="text-neutral-400">
                    Despesas: <span className="text-neutral-200 font-bold">{formatBRL(totExp)}</span>
                  </span>
                  <span className={diff >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {diff >= 0 ? `+${formatBRL(diff)}` : `-${formatBRL(Math.abs(diff))}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors border border-[#2A2E35]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
