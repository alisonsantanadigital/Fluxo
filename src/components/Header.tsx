import React from 'react';
import { Download, Sliders, Play, RotateCcw, Share2, PlusCircle } from 'lucide-react';

interface HeaderProps {
  onOpenScenarios: () => void;
  onOpenExport: () => void;
  onReset: () => void;
  onOpenAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScenarios,
  onOpenExport,
  onReset,
  onOpenAddExpense,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F1115]/90 backdrop-blur-md border-b border-[#2A2E35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Wordmark Logo */}
        <a
          href="/"
          className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2.5 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform shadow-sm shadow-emerald-400/50" />
          <span className="font-mono">FluxoFlow</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-[#2A2E35] text-neutral-400 uppercase tracking-widest hidden sm:inline-block">
            Fintech Pro
          </span>
        </a>

        {/* Clean Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-400">
          <a href="#sankey" className="hover:text-white transition-colors">
            1. Sankey Diagram
          </a>
          <a href="#macro" className="hover:text-white transition-colors">
            2. Ajustes Macro
          </a>
          <a href="#micro" className="hover:text-white transition-colors">
            3. Micro & Parcelas
          </a>
          <button
            onClick={onOpenScenarios}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Play className="w-3 h-3 text-sky-400" />
            Cenários Rápidos
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onReset}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-white/5 hover:bg-white/10 rounded-lg border border-[#2A2E35] transition-colors cursor-pointer"
            title="Restaurar valores iniciais padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Relatório
          </button>
        </div>
      </div>
    </header>
  );
};
