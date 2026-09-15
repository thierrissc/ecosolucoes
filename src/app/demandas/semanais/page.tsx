'use client';

import { useState } from 'react';
import { LayoutList, Columns, Filter, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Status, Prioridade } from '@/types';
import Badge, { prioridadeVariant, statusVariant } from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDate, getDaysUntil, prioridadeLabel, statusLabel } from '@/lib/utils';

const kanbanColunas: { status: Status; label: string; color: string }[] = [
  { status: 'nao_iniciada', label: 'Não Iniciada', color: '#64748b' },
  { status: 'em_andamento', label: 'Em Andamento', color: '#3b82f6' },
  { status: 'concluida', label: 'Concluída', color: '#16a34a' },
];

export default function DemandasSemanaisPage() {
  const { tarefasSemanais, addTarefaSemanal, updateTarefaStatus, deleteTarefaSemanal, setores } = useApp();

  const [visualizacao, setVisualizacao] = useState<'lista' | 'kanban'>('lista');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todas' | Prioridade>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | Status>('todos');
  const [ordenacao, setOrdenacao] = useState<'prazo' | 'prioridade'>('prazo');
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [setorId, setSetorId] = useState(setores[0]?.id || '');
  const [prazo, setPrazo] = useState(new Date().toISOString().split('T')[0]);
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [status, setStatus] = useState<Status>('nao_iniciada');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !responsavel.trim()) return;

    const avatar = responsavel
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    addTarefaSemanal({
      nome,
      descricao,
      responsavel,
      avatarResponsavel: avatar || 'US',
      setorId: setorId || (setores[0]?.id || 'geral'),
      prazo,
      prioridade,
      status,
    });

    setNome('');
    setDescricao('');
    setResponsavel('');
    setShowModal(false);
  };

  const filtered = tarefasSemanais
    .filter((t) => {
      const matchSetor = filtroSetor === 'todos' || t.setorId === filtroSetor;
      const matchPrioridade = filtroPrioridade === 'todas' || t.prioridade === filtroPrioridade;
      const matchStatus = filtroStatus === 'todos' || t.status === filtroStatus;
      return matchSetor && matchPrioridade && matchStatus;
    })
    .sort((a, b) => {
      if (ordenacao === 'prazo') return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
      const order = { alta: 0, media: 1, baixa: 2 };
      return order[a.prioridade] - order[b.prioridade];
    });

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Demandas Semanais</h2>
          <p className="text-text-muted text-sm mt-1">{filtered.length} tarefas encontradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
          <div className="segmented-control">
            <button
              onClick={() => setVisualizacao('lista')}
              className={`segmented-btn flex items-center gap-1.5 ${visualizacao === 'lista' ? 'active' : ''}`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Lista
            </button>
            <button
              onClick={() => setVisualizacao('kanban')}
              className={`segmented-btn flex items-center gap-1.5 ${visualizacao === 'kanban' ? 'active' : ''}`}
            >
              <Columns className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Filters (Compact) */}
      <div className="card p-3 inline-block max-w-full">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="input input-select w-auto min-w-[140px] text-xs py-1.5 px-2.5">
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
          <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value as any)} className="input input-select w-auto text-xs py-1.5 px-2.5">
            <option value="todas">Todas Prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as any)} className="input input-select w-auto text-xs py-1.5 px-2.5">
            <option value="todos">Todos os Status</option>
            <option value="nao_iniciada">Não Iniciada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
          <div className="flex items-center gap-2 pl-1">
            <span className="text-text-muted text-xs font-medium">Ordenar:</span>
            <button
              onClick={() => setOrdenacao(ordenacao === 'prazo' ? 'prioridade' : 'prazo')}
              className="text-brand text-xs font-semibold hover:underline"
            >
              {ordenacao === 'prazo' ? 'Por Prazo' : 'Por Prioridade'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <LayoutList className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-text-primary font-bold text-lg mb-1">Nenhuma tarefa encontrada</h3>
          <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">
            Crie sua primeira demanda semanal para acompanhar o progresso de entregas da sua equipe.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Criar Primeira Tarefa
          </button>
        </div>
      ) : visualizacao === 'lista' ? (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 md:px-8 py-3 bg-surface-2 text-text-muted text-xs font-bold uppercase tracking-wider border-b border-surface-border">
            <div className="col-span-5">Tarefa / Setor</div>
            <div className="col-span-2">Prazo</div>
            <div className="col-span-2">Prioridade</div>
            <div className="col-span-3">Status / Ações</div>
          </div>
          <div className="divide-y divide-surface-border">
            {filtered.map((t) => {
              const days = getDaysUntil(t.prazo);
              const setor = setores.find((s) => s.id === t.setorId);
              return (
                <div key={t.id} className="grid grid-cols-12 gap-4 px-6 md:px-8 py-4 hover:bg-surface-hover transition-colors items-center group">
                  <div className="col-span-5">
                    <p className="text-text-primary text-sm font-semibold truncate group-hover:text-brand transition-colors">{t.nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-text-muted text-xs">{t.responsavel}</span>
                      {setor && (
                        <span className="text-[11px] px-2 py-0.5 font-semibold" style={{ backgroundColor: setor.cor + '15', color: setor.cor }}>
                          {setor.nome.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className={`text-sm font-semibold ${days <= 1 ? 'text-red-500' : days <= 3 ? 'text-amber-500' : 'text-text-secondary'}`}>
                      {formatDate(t.prazo)}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">{days <= 0 ? 'Vencido!' : `${days}d restantes`}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={prioridadeVariant(t.prioridade)} dot>
                      {prioridadeLabel(t.prioridade)}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[100px] flex-shrink-0">
                        <Badge variant={statusVariant(t.status)}>
                          {statusLabel(t.status)}
                        </Badge>
                      </div>
                      <select
                        value={t.status}
                        onChange={(e) => updateTarefaStatus(t.id, e.target.value as Status)}
                        className="input input-select w-[140px] text-xs py-1.5 px-2 flex-shrink-0"
                      >
                        <option value="nao_iniciada">Não Iniciada</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setDeletingId(t.id)}
                      title="Excluir tarefa"
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 p-1.5 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {kanbanColunas.map((col) => {
            const colTarefas = filtered.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="card overflow-hidden flex flex-col">
                <div className="h-1 w-full" style={{ backgroundColor: col.color }} />
                <div className="p-5 md:p-6 flex-1">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-text-primary font-bold text-sm">{col.label}</h3>
                    <span className="bg-surface-2 text-text-secondary text-xs font-bold px-2.5 py-1">
                      {colTarefas.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colTarefas.map((t) => {
                      const days = getDaysUntil(t.prazo);
                      const statusOrdem: Status[] = ['nao_iniciada', 'em_andamento', 'concluida'];
                      const currentIdx = statusOrdem.indexOf(t.status);
                      return (
                        <div key={t.id} className="bg-surface-2 p-4 hover:shadow-sm transition-all group">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-text-primary text-sm font-medium leading-snug group-hover:text-brand transition-colors">{t.nome}</p>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={prioridadeVariant(t.prioridade)} dot />
                              <button
                                onClick={() => setDeletingId(t.id)}
                                title="Excluir tarefa"
                                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-text-muted text-xs line-clamp-2 mb-3">{t.descricao}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-brand/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-brand text-[10px] font-bold">{t.avatarResponsavel}</span>
                            </div>
                            <p className="text-text-muted text-xs truncate">{t.responsavel}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${days <= 1 ? 'text-red-500' : days <= 3 ? 'text-amber-500' : 'text-text-muted'}`}>
                              Prazo: {formatDate(t.prazo)}
                            </p>
                            <div className="flex gap-1">
                              {currentIdx > 0 && (
                                <button
                                  onClick={() => updateTarefaStatus(t.id, statusOrdem[currentIdx - 1])}
                                  className="text-text-muted hover:text-text-primary text-xs p-1 border border-surface-border hover:border-text-muted transition-all rotate-180"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              {currentIdx < statusOrdem.length - 1 && (
                                <button
                                  onClick={() => updateTarefaStatus(t.id, statusOrdem[currentIdx + 1])}
                                  className="text-brand hover:text-white text-xs p-1 border border-brand/30 hover:bg-brand hover:border-brand transition-all"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {colTarefas.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-text-muted text-sm">Nenhuma tarefa</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Tarefa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="card p-6 md:p-7 w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-text-primary font-bold text-lg">Nova Demanda Semanal</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Nome da Demanda *</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                  placeholder="Ex: Desenvolver relatório de vendas..."
                />
              </div>

              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Descrição</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="input resize-none"
                  placeholder="Detalhes sobre a entrega esperada..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Responsável *</label>
                  <input
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="input"
                    placeholder="Nome do colaborador"
                  />
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Prazo *</label>
                  <input
                    type="date"
                    required
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Prioridade</label>
                  <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)} className="input input-select">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Status Inicial</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="input input-select">
                    <option value="nao_iniciada">Não Iniciada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Excluir Demanda Semanal"
        message="Tem certeza que deseja excluir esta tarefa semanal? Esta ação não pode ser desfeita."
        confirmLabel="Excluir Tarefa"
        onConfirm={() => {
          if (deletingId) {
            deleteTarefaSemanal(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
