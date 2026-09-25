import React, { useState } from 'react';
import { SecurityConfirmationAction } from '../types/finance';
import { AlertTriangle, ShieldAlert, X, Check, ArrowRight } from 'lucide-react';

interface SecurityConfirmModalProps {
  action: SecurityConfirmationAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SecurityConfirmModal: React.FC<SecurityConfirmModalProps> = ({
  action,
  onConfirm,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  if (!action) return null;

  const handleNextOrConfirm = () => {
    if (step === 1 && action.isCritical) {
      setStep(2);
    } else {
      onConfirm();
      setStep(1);
    }
  };

  const handleClose = () => {
    setStep(1);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#181B20] border border-[#2A2E35] p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step === 2 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {step === 1 ? action.title : 'Confirmação Final de Segurança (Etapa 2/2)'}
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                {step === 1 ? 'Etapa 1 de 2 · Verificação' : 'Ação irreversível de impacto no fluxo'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="p-3.5 rounded-xl bg-[#0F1115] border border-[#2A2E35] space-y-2">
          <p className="text-xs text-neutral-300 leading-relaxed">
            {step === 1
              ? action.message
              : 'Você tem certeza absoluta que deseja prosseguir com esta alteração crítica? O cálculo do fluxo e o diagrama de Sankey serão recalculados instantaneamente.'}
          </p>

          {step === 2 && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>Atenção: A confirmação recalculará o saldo disponível imediatamente.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors border border-[#2A2E35] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleNextOrConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ${
              step === 2
                ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {step === 1 && action.isCritical ? (
              <>
                <span>Continuar para Etapa 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{action.confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
