import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Smartphone,
  Laptop,
  Users,
  RefreshCw,
  LogIn,
  LogOut,
  X,
  ShieldCheck,
  Sparkles,
  Link
} from 'lucide-react';
import { User } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultName: string;
  onUpdateVaultId: (newId: string) => void;
  onUpdateVaultName: (newName: string) => void;
  isCloudConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  currentUser: User | null;
  onLoginGoogle: () => void;
  onLogoutGoogle: () => void;
  onForceSave: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  vaultId,
  vaultName,
  onUpdateVaultId,
  onUpdateVaultName,
  isCloudConnected,
  isSyncing,
  lastSyncTime,
  currentUser,
  onLoginGoogle,
  onLogoutGoogle,
  onForceSave,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [editId, setEditId] = useState(vaultId);
  const [editName, setEditName] = useState(vaultName);

  if (!isOpen) return null;

  // Generate direct share link with current URL and vault query param
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?vault=${encodeURIComponent(vaultId)}`
    : '';

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(vaultId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId.trim()) {
      onUpdateVaultId(editId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''));
    }
    if (editName.trim()) {
      onUpdateVaultName(editName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F1218] border border-white/15 p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Sincronização na Nuvem (Casal & Família)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  Multi-Aparelho
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Acesse você e sua esposa de qualquer celular, tablet ou computador.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#13161C] to-sky-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
              <span className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">
                {isSyncing ? 'Sincronizando com a Nuvem...' : 'Nuvem Conectada e Ativa'}
              </p>
              <p className="text-[11px] text-neutral-400 font-mono">
                {lastSyncTime ? `Última sincronização: ${lastSyncTime}` : 'Tempo Real Automático'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onForceSave}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Salvando...' : 'Salvar Agora'}</span>
          </button>
        </div>

        {/* Compartilhar com a Esposa */}
        <div className="space-y-3 rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-mono">
              <Share2 className="w-3.5 h-3.5" />
              Compartilhar com sua Esposa
            </h4>
            <span className="text-[11px] text-neutral-400 font-mono">1 Clique para sincronizar</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Envie o link abaixo para sua esposa (WhatsApp, e-mail ou Telegram). Quando ela abrir no celular ou PC dela, ambos verão e atualizarão as mesmas informações em tempo real!
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-sky-200 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-black font-extrabold'
                  : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          {/* Sync Code */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span>Código do Cofre:</span>
              <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                {vaultId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[11px] font-mono text-sky-400 hover:underline cursor-pointer"
            >
              {copiedCode ? 'Código copiado!' : 'Copiar Código'}
            </button>
          </div>
        </div>

        {/* Multi-Device Info Cards */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <Smartphone className="w-5 h-5 mx-auto text-emerald-400" />
            <p className="text-xs font-bold text-white">No Celular</p>
            <p className="text-[10px] text-neutral-400">
              Acesse de qualquer smartphone iOS ou Android sem instalar nada.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <Laptop className="w-5 h-5 mx-auto text-sky-400" />
            <p className="text-xs font-bold text-white">No Computador</p>
            <p className="text-[10px] text-neutral-400">
              Tela ampla no PC com gráficos e visualização estilo ícones.
            </p>
          </div>
        </div>

        {/* Google Authentication (Optional) */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <img
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop'}
                alt={currentUser.displayName || 'Usuário'}
                className="w-8 h-8 rounded-full border border-emerald-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-white">
                {currentUser ? currentUser.displayName || currentUser.email : 'Conta Google (Opcional)'}
              </p>
              <p className="text-[11px] text-neutral-400">
                {currentUser ? 'Login ativo no dispositivo' : 'Identifique quem fez cada alteração'}
              </p>
            </div>
          </div>

          {currentUser ? (
            <button
              type="button"
              onClick={onLogoutGoogle}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoginGoogle}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-neutral-100 text-black cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>

        {/* Custom Vault Settings Form */}
        <form onSubmit={handleSaveSettings} className="space-y-3 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold text-neutral-300">Configurar Identificador do Casal</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Nome do Orçamento</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ex: Alison & Esposa"
                className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Código do Cofre (Sync)</label>
              <input
                type="text"
                value={editId}
                onChange={(e) => setEditId(e.target.value)}
                placeholder="Ex: familia_santana"
                className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/40 transition-colors cursor-pointer"
          >
            Salvar e Conectar a Este Cofre
          </button>
        </form>
      </div>
    </div>
  );
};
