import React, { useState } from 'react';
import { FutureIncomeItem } from '../types/finance';
import { formatBRL, formatPrivacyBRL, maskName, parseBRLInput } from '../utils/formatters';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Tag,
  ArrowUpRight,
  Sparkles,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface FutureIncomesManagerProps {
  futureIncomes: FutureIncomeItem[];
  isPrivacyMode?: boolean;
  hideItemNames?: boolean;
  onAddFutureIncome: (item: Omit<FutureIncomeItem, 'id'>) => void;
  onUpdateFutureIncome: (id: string, updates: Partial<FutureIncomeItem>) => void;
  onRemoveFutureIncome: (id: string) => void;
  onMarkAsReceivedAndCredit: (item: FutureIncomeItem) => void;
}

export const FutureIncomesManager: React.FC<FutureIncomesManagerProps> = ({
  futureIncomes,
  isPrivacyMode = false,
  hideItemNames = false,
  onAddFutureIncome,
  onUpdateFutureIncome,
  onRemoveFutureIncome,
  onMarkAsReceivedAndCredit,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'received'>('all');

  // Form State
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('1500');
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState('Salário');
  const [payerOrSource, setPayerOrSource] = useState('');
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalPending = futureIncomes
    .filter((f) => f.status === 'pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalReceived = futureIncomes
    .filter((f) => f.status === 'received')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const filteredIncomes = futureIncomes.filter((item) => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'received') return item.status === 'received';
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const val = parseBRLInput(amountStr) || Number(amountStr) || 0;
    if (val <= 0) return;

    onAddFutureIncome({
      name: name.trim(),
      amount: val,
      expectedDate: expectedDate || new Date().toISOString().split('T')[0],
      category: category.trim() || 'Geral',
      payerOrSource: payerOrSource.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'pending',
    });

    setName('');
    setAmountStr('1500');
    setPayerOrSource('');
    setNotes('');
    setShowAddForm(false);
  };

  // Helper date status
  const getRelativeDateLabel = (dateStr: string) => {
    if (!dateStr) return { text: 'Data não informada', isOverdue: false, isSoon: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Venceu há ${Math.abs(diffDays)} dias`, isOverdue: true, isSoon: false };
    }
    if (diffDays === 0) {
      return { text: 'Previsto para HOJE', isOverdue: false, isSoon: true };
    }
    if (diffDays === 1) {
      return { text: 'Previsto para AMANHÃ', isOverdue: false, isSoon: true };
    }
    if (diffDays <= 7) {
      return { text: `Em ${diffDays} dias`, isOverdue: false, isSoon: true };
    }
    return { text: `Em ${diffDays} dias`, isOverdue: false, isSoon: false };
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Entradas Futuras & Previsões de Recebimento
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                {futureIncomes.filter(f => f.status === 'pending').length} a receber
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Cadastre salários futuros, comissões, vendas ou rendimentos programados. Ao receber, credite no caixa com 1 clique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Fechar Formulário' : '+ Agendar Entrada Futura'}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights for Future Incomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/30 via-[#13161C] to-emerald-950/20 border border-sky-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
              Total Previsto a Receber (Futuro)
            </span>
            <p className={`text-xl sm:text-2xl font-black text-white font-mono mt-0.5 ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}>
              {formatPrivacyBRL(totalPending, isPrivacyMode)}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30">
            ⏳ Pendente
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#13161C] to-[#161A22] border border-emerald-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Já Recebidas / Injetadas no Caixa
            </span>
            <p className={`text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5 ${isPrivacyMode ? 'privacy-masked-text select-none' : ''}`}>
              {formatPrivacyBRL(totalReceived, isPrivacyMode)}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            ✅ No Caixa
          </span>
        </div>
      </div>

      {/* Add Future Income Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-[#0A0D13] border border-emerald-500/30 space-y-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Nova Entrada Futura Programada
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-neutral-400 hover:text-white text-xs cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Descrição da Entrada *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Salário Alison dia 05, Freelance Web, Comissão de Vendas"
                className="w-full bg-[#13161C] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Valor Previsto (R$) *
              </label>
              <input
                type="text"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="Ex: 2.500,00"
                className="w-full bg-[#13161C] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Data Prevista de Recebimento *
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-[#13161C] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#13161C] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Salário">Salário</option>
                <option value="Comissão">Comissão de Vendas</option>
                <option value="Freelance">Freelance / Serviço</option>
                <option value="Venda">Venda de Item / Ativo</option>
                <option value="Aluguel">Aluguel / Imóvel</option>
                <option value="Rendimento">Rendimentos / Investimentos</option>
                <option value="Reembolso">Reembolso / Devolução</option>
                <option value="Outros">Outros Ganhos</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Fonte / Pagador (Opcional)
              </label>
              <input
                type="text"
                value={payerOrSource}
                onChange={(e) => setPayerOrSource(e.target.value)}
                placeholder="Ex: Empresa XPTO, Cliente João"
                className="w-full bg-[#13161C] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Salvar Entrada Futura
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Todas ({futureIncomes.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            filter === 'pending'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="w-3 h-3 text-sky-400" />
          <span>A Receber ({futureIncomes.filter(f => f.status === 'pending').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('received')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            filter === 'received'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Recebidas ({futureIncomes.filter(f => f.status === 'received').length})</span>
        </button>
      </div>

      {/* List of Future Incomes */}
      {filteredIncomes.length === 0 ? (
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
          <Clock className="w-8 h-8 mx-auto text-neutral-500 opacity-60" />
          <p className="text-xs text-neutral-400">
            Nenhuma entrada futura nesta categoria.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            + Cadastrar a primeira previsão de entrada
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredIncomes.map((item) => {
            const isReceived = item.status === 'received';
            const relDate = getRelativeDateLabel(item.expectedDate);

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-3.5 space-y-3 transition-all ${
                  isReceived
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-[#0E1116] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                        {item.category || 'Geral'}
                      </span>
                      {item.payerOrSource && (
                        <span className="text-[10px] text-neutral-400 truncate">
                          • {item.payerOrSource}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">
                      {hideItemNames ? maskName(item.name, true) : item.name}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-emerald-300 block">
                      {formatPrivacyBRL(item.amount, isPrivacyMode)}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        relDate.isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : relDate.isSoon
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'text-neutral-400'
                      }`}
                    >
                      {relDate.text}
                    </span>
                  </div>
                </div>

                {/* Footer and Quick Credit Action */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Previsto: {item.expectedDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReceived ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Creditado no Caixa</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onMarkAsReceivedAndCredit(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
                        title="Marcar como recebido e somar ao Caixa no Momento"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Receber no Caixa</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveFutureIncome(item.id)}
                      className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir previsão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
