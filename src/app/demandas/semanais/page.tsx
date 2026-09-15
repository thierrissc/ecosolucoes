'use client';

import { useState } from 'react';
import { LayoutList, Columns, Filter, ChevronRight } from 'lucide-react';
import { tarefasSemanais as allTarefas } from '@/data/demandas';
import { setores } from '@/data/setores';
import { Tarefa, Status, Prioridade } from '@/types';
import Badge, { prioridadeVariant, statusVariant } from '@/components/ui/Badge';
import { formatDate, getDaysUntil, prioridadeLabel, statusLabel } from '@/lib/utils';

const kanbanColunas: { status: Status; label: string; color: string }[] = [
  { status: 'nao_iniciada', label: 'Não Iniciada', color: '#64748b' },
  { status: 'em_andamento', label: 'Em Andamento', color: '#3b82f6' },
  { status: 'concluida', label: 'Concluída', color: '#16a34a' },
];

export default function DemandasSemanaisPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(allTarefas.filter((t) => t.tipo === 'semanal'));
  const [visualizacao, setVisualizacao] = useState<'lista' | 'kanban'>('lista');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todas' | Prioridade>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | Status>('todos');
  const [ordenacao, setOrdenacao] = useState<'prazo' | 'prioridade'>('prazo');

  const filtered = tarefas
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

  const moverStatus = (id: string, novoStatus: Status) => {
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, status: novoStatus } : t)));
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Demandas Semanais</h2>
          <p className="text-text-muted text-sm mt-1">{filtered.length} tarefas encontradas</p>
        </div>
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

      {/* Filters */}
      <div className="card p-4 md:p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="input input-select w-auto min-w-[160px]">
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value as 'todas' | Prioridade)} className="input input-select w-auto min-w-[140px]">
            <option value="todas">Toda Prioridade</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as 'todos' | Status)} className="input input-select w-auto min-w-[140px]">
            <option value="todos">Todo Status</option>
            <option value="nao_iniciada">Não Iniciada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as 'prazo' | 'prioridade')} className="input input-select w-auto min-w-[160px] ml-auto">
            <option value="prazo">Ordenar por Prazo</option>
            <option value="prioridade">Ordenar por Prioridade</option>
          </select>
        </div>
      </div>

      {/* View */}
      {visualizacao === 'lista' ? (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 md:px-8 py-3.5 border-b border-surface-border bg-surface-2/50">
            <p className="col-span-5 text-text-muted text-xs font-semibold uppercase tracking-wider">Tarefa</p>
            <p className="col-span-2 text-text-muted text-xs font-semibold uppercase tracking-wider">Prazo</p>
            <p className="col-span-2 text-text-muted text-xs font-semibold uppercase tracking-wider">Prioridade</p>
            <p className="col-span-3 text-text-muted text-xs font-semibold uppercase tracking-wider">Status</p>
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
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: setor.cor + '15', color: setor.cor }}>
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
                  <div className="col-span-3 flex items-center gap-2">
                    <Badge variant={statusVariant(t.status)}>
                      {statusLabel(t.status)}
                    </Badge>
                    <select
                      value={t.status}
                      onChange={(e) => moverStatus(t.id, e.target.value as Status)}
                      className="input input-select w-auto text-xs py-1 px-2 ml-auto"
                    >
                      <option value="nao_iniciada">Não Iniciada</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                    </select>
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
                    <span className="bg-surface-2 text-text-secondary text-xs font-bold px-2.5 py-1 rounded-full">
                      {colTarefas.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colTarefas.map((t) => {
                      const days = getDaysUntil(t.prazo);
                      const statusOrdem: Status[] = ['nao_iniciada', 'em_andamento', 'concluida'];
                      const currentIdx = statusOrdem.indexOf(t.status);
                      return (
                        <div key={t.id} className="bg-surface-2 rounded-2xl p-4 hover:shadow-sm transition-all group">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-text-primary text-sm font-medium leading-snug group-hover:text-brand transition-colors">{t.nome}</p>
                            <Badge variant={prioridadeVariant(t.prioridade)} dot />
                          </div>
                          <p className="text-text-muted text-xs line-clamp-2 mb-3">{t.descricao}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-brand text-[10px] font-bold">{t.avatarResponsavel}</span>
                            </div>
                            <p className="text-text-muted text-xs truncate">{t.responsavel}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${days <= 1 ? 'text-red-500' : days <= 3 ? 'text-amber-500' : 'text-text-muted'}`}>
                              📅 {formatDate(t.prazo)}
                            </p>
                            <div className="flex gap-1">
                              {currentIdx > 0 && (
                                <button
                                  onClick={() => moverStatus(t.id, statusOrdem[currentIdx - 1])}
                                  className="text-text-muted hover:text-text-primary text-xs p-1 rounded-lg border border-surface-border hover:border-text-muted transition-all rotate-180"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              {currentIdx < statusOrdem.length - 1 && (
                                <button
                                  onClick={() => moverStatus(t.id, statusOrdem[currentIdx + 1])}
                                  className="text-brand hover:text-white text-xs p-1 rounded-lg border border-brand/30 hover:bg-brand hover:border-brand transition-all"
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
    </div>
  );
}
