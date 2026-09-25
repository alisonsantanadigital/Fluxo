import React from 'react';
import {
  Download,
  Sliders,
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Zap,
  Shield,
  FileSpreadsheet,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { AppTheme } from '../types/finance';

interface HeaderProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  hideItemNames: boolean;
  onToggleHideItemNames: () => void;
  onOpenScenarios: () => void;
  onOpenExport: () => void;
  onReset: () => void;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
  onOpenCloudSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onSelectTheme,
  isPrivacyMode,
  onTogglePrivacyMode,
  hideItemNames,
  onToggleHideItemNames,
  onOpenScenarios,
  onOpenExport,
  onReset,
  isCloudConnected = true,
  isSyncing = false,
  onOpenCloudSync,
}) => {
  const isLight = currentTheme === 'light';
  const isNeon = currentTheme === 'neon';

  const headerBgClass = isLight
    ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    : isNeon
    ? 'bg-[#05050A]/95 border-pink-500/30 text-white shadow-[0_4px_24px_rgba(236,72,153,0.15)]'
    : 'bg-[#0F1115]/95 border-white/[0.08] text-white shadow-xl';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/"
            className={`text-base sm:text-xl font-black tracking-tight flex items-center gap-2 group ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform shadow-md shadow-emerald-400/60" />
            <span className="font-mono font-bold tracking-tight">FluxoFlow</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:inline-block border font-semibold ${
                isLight
                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                  : isNeon
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_10px_rgba(244,114,182,0.3)]'
                  : 'bg-white/10 border-white/10 text-neutral-300'
              }`}
            >
              Fintech Pro 3D
            </span>
          </a>
        </div>

        {/* Center Navigation Links on desktop */}
        <nav
          className={`hidden lg:flex items-center gap-5 text-xs font-semibold ${
            isLight ? 'text-slate-600' : 'text-neutral-400'
          }`}
        >
          <a
            href="#sankey"
            className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
          >
            1. Sankey 3D
          </a>
          <a
            href="#macro"
            className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
          >
            2. Ajustes Macro
          </a>
          <a
            href="#micro"
            className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
          >
            3. Micro & Parcelas
          </a>
          <button
            onClick={onOpenScenarios}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
              isLight ? 'hover:text-slate-900 text-slate-600' : 'hover:text-white text-neutral-300'
            }`}
          >
            <Play className="w-3 h-3 text-sky-400" />
            Cenários Rápidos
          </button>
        </nav>

        {/* Controls: Privacy Mode + Theme Selector + Export Action */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* MODO PRIVACIDADE (EYE / EYE-OFF TOGGLE) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePrivacyMode}
              className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isPrivacyMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-2 ring-amber-500/40 shadow-amber-500/30'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title={
                isPrivacyMode
                  ? 'Modo Furtivo Ativo: Valores em R$ e números borrados. Clique para revelar.'
                  : 'Ativar Modo Furtivo (Ocultar e borrar valores numéricos em R$)'
              }
            >
              {isPrivacyMode ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline font-mono">Furtivo</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-neutral-400" />
                  <span className="hidden sm:inline font-mono">Visível</span>
                </>
              )}
            </button>

            {/* Sub-toggle: Ocultar Nomes quando modo furtivo ativo */}
            {isPrivacyMode && (
              <button
                type="button"
                onClick={onToggleHideItemNames}
                className={`text-[10px] px-2 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                  hideItemNames
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900'
                    : 'bg-white/5 text-neutral-400 border-white/10 hover:text-neutral-200'
                }`}
                title="Ocultar também nomes de credores e fontes de receita"
              >
                {hideItemNames ? 'Nomes: 🙈' : 'Nomes: 👁️'}
              </button>
            )}
          </div>

          {/* ALTERNADOR DE TEMA (3 TEMAS: DARK / LIGHT / NEON) */}
          <div
            className={`flex items-center p-1 rounded-xl border shadow-inner ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-black/50 border-white/10'
            }`}
          >
            {/* 1. Dark Mode (Padrão) */}
            <button
              type="button"
              onClick={() => onSelectTheme('dark')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Tema 1: Escuro Profundo (Dark Mode)"
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline text-[11px]">Escuro</span>
            </button>

            {/* 2. Light Mode */}
            <button
              type="button"
              onClick={() => onSelectTheme('light')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Tema 2: Claro / Minimalista (Light Mode)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline text-[11px]">Claro</span>
            </button>

            {/* 3. Cyberpunk / Neon Glass */}
            <button
              type="button"
              onClick={() => onSelectTheme('neon')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTheme === 'neon'
                  ? 'bg-pink-500/30 text-pink-200 border border-pink-500/50 font-bold shadow-[0_0_14px_rgba(244,114,182,0.5)]'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Tema 3: Cyberpunk / Neon Glass"
            >
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden md:inline text-[11px]">Neon</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            {onOpenCloudSync && (
              <button
                type="button"
                onClick={onOpenCloudSync}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-sm ${
                  isSyncing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isCloudConnected
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:text-white'
                }`}
                title="Sincronização na Nuvem: Acesse você e sua esposa em qualquer celular ou PC"
              >
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
                <span className="hidden sm:inline font-mono">
                  {isSyncing ? 'Salvando...' : 'Nuvem'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>
            )}

            <button
              onClick={onReset}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
              }`}
              title="Restaurar valores iniciais padrão"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden lg:inline">Restaurar</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer whitespace-nowrap hover:scale-[1.02]"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
