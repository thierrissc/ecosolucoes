'use client';

import { useState } from 'react';
import { Target, FolderOpen, FileText, Filter } from 'lucide-react';
import { metasMensais } from '@/data/demandas';
import { setores } from '@/data/setores';
import { MetaMensal } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const categoriaConfig: Record<string, { icon: React.ElementType; label: string; gradient: string; variant: 'green' | 'blue' | 'purple' }> = {
  meta: { icon: Target, label: 'Meta', gradient: 'from-emerald-500 to-teal-400', variant: 'green' },
  projeto: { icon: FolderOpen, label: 'Projeto', gradient: 'from-blue-500 to-indigo-400', variant: 'blue' },
  relatorio: { icon: FileText, label: 'Relatório', gradient: 'from-violet-500 to-purple-400', variant: 'purple' },
};

export default function DemandasMensaisPage() {
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | MetaMensal['categoria']>('todas');
  const [now] = useState(() => Date.now());

  const filtered = metasMensais.filter((m) => {
    const matchSetor = filtroSetor === 'todos' || m.setorId === filtroSetor;
    const matchCat = filtroCategoria === 'todas' || m.categoria === filtroCategoria;
    return matchSetor && matchCat;
  });

  const totalProgresso = filtered.length > 0
    ? Math.round(filtered.reduce((acc, m) => acc + m.progresso, 0) / filtered.length)
    : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Demandas Mensais</h2>
          <p className="text-text-muted text-sm mt-1">Metas, projetos e relatórios do mês</p>
        </div>
        <div className="card px-6 py-3.5 text-center">
          <p className="text-text-muted text-xs font-medium mb-0.5">Progresso Médio</p>
          <p className="text-brand font-extrabold text-2xl md:text-3xl">{totalProgresso}%</p>
        </div>
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
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} mx-auto flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-primary font-extrabold text-3xl">{count}</p>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{cfg.label}s</p>
              <ProgressBar value={avgProg} showLabel size="sm" />
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 md:p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="input input-select w-auto min-w-[160px]">
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <div className="flex gap-1.5 flex-wrap">
            {(['todas', 'meta', 'projeto', 'relatorio'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`chip ${filtroCategoria === cat ? 'active' : ''}`}
              >
                {cat === 'todas' ? 'Todas' : categoriaConfig[cat].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 animate-stagger">
        {filtered.map((meta) => {
          const setor = setores.find((s) => s.id === meta.setorId);
          const cfg = categoriaConfig[meta.categoria];
          const Icon = cfg.icon;
          const daysLeft = Math.ceil((new Date(meta.prazo).getTime() - now) / 86400000);

          return (
            <div key={meta.id} className="card card-hover p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-text-primary font-semibold text-sm leading-snug">{meta.nome}</h3>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-text-muted text-xs mt-1 leading-relaxed line-clamp-2">{meta.descricao}</p>
                </div>
              </div>

              <ProgressBar value={meta.progresso} showLabel size="lg" />

              <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-border">
                <div className="flex items-center gap-2">
                  {setor && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: setor.cor + '15', color: setor.cor }}>
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
    </div>
  );
}
