'use client';

import { useState } from 'react';
import { LayoutList, Columns, Filter, ChevronRight } from 'lucide-react';
import { tarefasSemanais as allTarefas } from '@/data/demandas';
import { setores } from '@/data/setores';
import { Tarefa, Status, Prioridade } from '@/types';
import Badge, { prioridadeVariant, statusVariant } from '@/components/ui/Badge';
import { formatDate, getDaysUntil, prioridadeLabel, statusLabel } from '@/lib/utils';

const kanbanColunas: { status: Status; label: string; color: string }[] = [
  { status: 'nao_iniciada', label: 'Não Iniciada', color: 'border-slate-500' },
  { status: 'em_andamento', label: 'Em Andamento', color: 'border-blue-500' },
  { status: 'concluida', label: 'Concluída', color: 'border-green-500' },
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
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-white font-extrabold text-2xl md:text-3xl tracking-tight">Demandas Semanais</h2>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} tarefas encontradas</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-navy-light border border-brand-navy-border rounded-xl p-1.5">
          <button
            onClick={() => setVisualizacao('lista')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              visualizacao === 'lista' ? 'bg-brand-green text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutList className="w-4 h-4" /> Lista
          </button>
          <button
            onClick={() => setVisualizacao('kanban')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              visualizacao === 'kanban' ? 'bg-brand-green text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-4 h-4" /> Kanban
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 md:p-7 border border-brand-navy-border">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value as 'todas' | Prioridade)}
            className="bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="todas">Toda Prioridade</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as 'todos' | Status)}
            className="bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="todos">Todo Status</option>
            <option value="nao_iniciada">Não Iniciada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as 'prazo' | 'prioridade')}
            className="bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ml-auto"
          >
            <option value="prazo">Ordenar por Prazo</option>
            <option value="prioridade">Ordenar por Prioridade</option>
          </select>
        </div>
      </div>

      {/* Visualização */}
      {visualizacao === 'lista' ? (
        <div className="glass-card rounded-2xl border border-brand-navy-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-8 py-4.5 border-b border-brand-navy-border bg-brand-navy/50">
            <p className="col-span-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Tarefa</p>
            <p className="col-span-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">Prazo</p>
            <p className="col-span-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">Prioridade</p>
            <p className="col-span-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</p>
          </div>
          <div className="divide-y divide-brand-navy-border">
            {filtered.map((t) => {
              const days = getDaysUntil(t.prazo);
              const setor = setores.find((s) => s.id === t.setorId);
              return (
                <div key={t.id} className="grid grid-cols-12 gap-4 px-8 py-5 hover:bg-white/5 transition-colors items-center">
                  <div className="col-span-5">
                    <p className="text-white text-sm font-semibold truncate">{t.nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-xs">{t.responsavel}</span>
                      {setor && (
                        <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold" style={{ backgroundColor: setor.cor + '22', color: setor.cor }}>
                          {setor.nome.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className={`text-sm font-semibold ${days <= 1 ? 'text-red-400' : days <= 3 ? 'text-orange-400' : 'text-slate-300'}`}>
                      {formatDate(t.prazo)}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{days <= 0 ? 'Vencido!' : `${days}d restantes`}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={prioridadeVariant(t.prioridade)} dot>
                      {prioridadeLabel(t.prioridade)}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <Badge variant={statusVariant(t.status)}>
                      {statusLabel(t.status)}
                    </Badge>
                    <select
                      value={t.status}
                      onChange={(e) => moverStatus(t.id, e.target.value as Status)}
                      className="bg-brand-navy-light border border-brand-navy-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none ml-auto"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {kanbanColunas.map((col) => {
            const colTarefas = filtered.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className={`glass-card rounded-2xl border border-brand-navy-border border-t-4 ${col.color} kanban-column p-6 md:p-7`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-base">{col.label}</h3>
                  <span className="bg-brand-navy-border text-slate-300 text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                    {colTarefas.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {colTarefas.map((t) => {
                    const days = getDaysUntil(t.prazo);
                    const statusOrdem: Status[] = ['nao_iniciada', 'em_andamento', 'concluida'];
                    const currentIdx = statusOrdem.indexOf(t.status);
                    return (
                      <div key={t.id} className="bg-brand-navy/80 rounded-xl p-4 border border-brand-navy-border hover:border-brand-green/30 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-white text-sm font-medium leading-snug">{t.nome}</p>
                          <Badge variant={prioridadeVariant(t.prioridade)} dot />
                        </div>
                        <p className="text-slate-400 text-xs line-clamp-2 mb-3">{t.descricao}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-md bg-brand-green/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-green-light text-xs font-bold">{t.avatarResponsavel}</span>
                          </div>
                          <p className="text-slate-400 text-xs truncate">{t.responsavel}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-medium ${days <= 1 ? 'text-red-400' : days <= 3 ? 'text-orange-400' : 'text-slate-400'}`}>
                            📅 {formatDate(t.prazo)}
                          </p>
                          <div className="flex gap-1">
                            {currentIdx > 0 && (
                              <button
                                onClick={() => moverStatus(t.id, statusOrdem[currentIdx - 1])}
                                className="text-slate-500 hover:text-white text-xs px-2 py-0.5 rounded-lg border border-brand-navy-border hover:border-slate-500 transition-all rotate-180"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            {currentIdx < statusOrdem.length - 1 && (
                              <button
                                onClick={() => moverStatus(t.id, statusOrdem[currentIdx + 1])}
                                className="text-brand-green-light hover:text-white text-xs px-2 py-0.5 rounded-lg border border-brand-green/30 hover:bg-brand-green hover:border-brand-green transition-all"
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
                      <p className="text-slate-600 text-sm">Nenhuma tarefa</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
