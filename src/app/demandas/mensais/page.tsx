'use client';

import { useState } from 'react';
import { Target, FolderOpen, FileText, Filter, Plus, X, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MetaMensal } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDate } from '@/lib/utils';

const categoriaConfig: Record<string, { icon: React.ElementType; label: string; gradient: string; variant: 'green' | 'blue' | 'purple' }> = {
  meta: { icon: Target, label: 'Meta', gradient: 'from-emerald-500 to-teal-400', variant: 'green' },
  projeto: { icon: FolderOpen, label: 'Projeto', gradient: 'from-blue-500 to-indigo-400', variant: 'blue' },
  relatorio: { icon: FileText, label: 'Relatório', gradient: 'from-violet-500 to-purple-400', variant: 'purple' },
};

export default function DemandasMensaisPage() {
  const { metasMensais, addMetaMensal, updateMetaProgresso, deleteMetaMensal, setores } = useApp();

  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | MetaMensal['categoria']>('todas');
  const [now] = useState(() => Date.now());
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [setorId, setSetorId] = useState(setores[0]?.id || '');
  const [categoria, setCategoria] = useState<MetaMensal['categoria']>('meta');
  const [prazo, setPrazo] = useState(new Date().toISOString().split('T')[0]);
  const [progresso, setProgresso] = useState(0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !responsavel.trim()) return;

    addMetaMensal({
      nome,
      descricao,
      responsavel,
      setorId: setorId || (setores[0]?.id || 'geral'),
      categoria,
      prazo,
      progresso: Number(progresso) || 0,
    });

    setNome('');
    setDescricao('');
    setResponsavel('');
    setProgresso(0);
    setShowModal(false);
  };

  const filtered = metasMensais.filter((m) => {
    const matchSetor = filtroSetor === 'todos' || m.setorId === filtroSetor;
    const matchCat = filtroCategoria === 'todas' || m.categoria === filtroCategoria;
    return matchSetor && matchCat;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Demandas Mensais</h2>
          <p className="text-text-muted text-sm mt-1">{filtered.length} metas e projetos corporativos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 animate-stagger">
        {(['meta', 'projeto', 'relatorio'] as MetaMensal['categoria'][]).map((cat) => {
          const cfg = categoriaConfig[cat];
          const Icon = cfg.icon;
          const count = metasMensais.filter((m) => m.categoria === cat).length;
          const avgProg = Math.round(
            metasMensais.filter((m) => m.categoria === cat).reduce((a, m) => a + m.progresso, 0) /
            Math.max(1, count)
          );
          return (
            <div key={cat} className="card p-5 md:p-6 text-center space-y-3">
              <div className="w-9 h-9 border border-surface-border bg-surface-2/40 mx-auto flex items-center justify-center">
                <Icon className="w-4 h-4 text-text-secondary" />
              </div>
              <p className="text-text-primary font-extrabold text-3xl">{count}</p>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{cfg.label}s</p>
              <ProgressBar value={avgProg} showLabel size="sm" />
            </div>
          );
        })}
      </div>

      {/* Filters (Compact) */}
      <div className="card p-3 inline-block max-w-full">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="input input-select w-auto min-w-[150px] text-xs py-1.5 px-2.5">
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <div className="flex gap-1.5 flex-wrap">
            {(['todas', 'meta', 'projeto', 'relatorio'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`chip text-xs py-1 px-2.5 ${filtroCategoria === cat ? 'active' : ''}`}
              >
                {cat === 'todas' ? 'Todas' : categoriaConfig[cat].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-text-primary font-bold text-lg mb-1">Nenhuma meta cadastrada</h3>
          <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">
            Cadastre metas, projetos estratégicos ou relatórios mensais para sua empresa.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 animate-stagger">
          {filtered.map((meta) => {
            const setor = setores.find((s) => s.id === meta.setorId);
            const cfg = categoriaConfig[meta.categoria];
            const Icon = cfg.icon;
            const daysLeft = Math.ceil((new Date(meta.prazo).getTime() - now) / 86400000);

            return (
              <div key={meta.id} className="card card-hover p-5 md:p-6 flex flex-col gap-4 relative group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text-primary font-semibold text-base leading-snug">{meta.nome}</h3>
                    <p className="text-text-muted text-xs mt-1 leading-relaxed line-clamp-2">{meta.descricao}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <button
                      onClick={() => setDeletingId(meta.id)}
                      title="Excluir meta"
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 p-1 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-text-muted font-medium">Progresso</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMetaProgresso(meta.id, Math.max(0, meta.progresso - 10))}
                        className="text-text-muted hover:text-text-primary text-xs px-1 border border-surface-border hover:bg-surface-hover"
                      >
                        -10%
                      </button>
                      <span className="text-xs font-bold text-text-primary">{meta.progresso}%</span>
                      <button
                        onClick={() => updateMetaProgresso(meta.id, Math.min(100, meta.progresso + 10))}
                        className="text-text-muted hover:text-text-primary text-xs px-1 border border-surface-border hover:bg-surface-hover"
                      >
                        +10%
                      </button>
                    </div>
                  </div>
                  <ProgressBar value={meta.progresso} size="md" />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-border">
                  <div className="flex items-center gap-2">
                    {setor && (
                      <span className="px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: setor.cor + '15', color: setor.cor }}>
                        {setor.nome}
                      </span>
                    )}
                    <span className="text-text-muted">{meta.responsavel}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted">Prazo: {formatDate(meta.prazo)}</p>
                    <p className={`font-semibold mt-0.5 ${daysLeft <= 7 ? 'text-red-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-text-muted'}`}>
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Vencido!'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Meta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="card p-6 md:p-7 w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-text-primary font-bold text-lg">Nova Demanda Mensal</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Título da Meta ou Projeto *</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                  placeholder="Ex: Conquistar certificação ISO 9001..."
                />
              </div>

              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Descrição</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="input resize-none"
                  placeholder="Objetivos e escopo da demanda mensal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Tipo</label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value as any)} className="input input-select">
                    <option value="meta">Meta Estratégica</option>
                    <option value="projeto">Projeto Especial</option>
                    <option value="relatorio">Relatório Mensal</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Setor</label>
                  <select value={setorId} onChange={(e) => setSetorId(e.target.value)} className="input input-select">
                    {setores.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Responsável *</label>
                  <input
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="input"
                    placeholder="Nome do líder/responsável"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Prazo Limite *</label>
                  <input
                    type="date"
                    required
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted font-medium">Progresso Inicial</span>
                  <span className="font-bold text-text-primary">{progresso}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progresso}
                  onChange={(e) => setProgresso(Number(e.target.value))}
                  className="w-full accent-brand"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Cadastrar Demanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteMetaMensal(deletingId);
            setDeletingId(null);
          }
        }}
        title="Excluir Meta Mensal"
        message="Tem certeza que deseja excluir esta meta ou projeto? Esta ação não poderá ser desfeita."
      />
    </div>
  );
}
