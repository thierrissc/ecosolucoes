'use client';

import { useState } from 'react';
import { Target, FolderOpen, FileText, Filter } from 'lucide-react';
import { metasMensais } from '@/data/demandas';
import { setores } from '@/data/setores';
import { MetaMensal } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const categoriaConfig: Record<string, { icon: React.ElementType; label: string; color: string; variant: 'green' | 'blue' | 'purple' }> = {
  meta: { icon: Target, label: 'Meta', color: 'text-green-400', variant: 'green' },
  projeto: { icon: FolderOpen, label: 'Projeto', color: 'text-blue-400', variant: 'blue' },
  relatorio: { icon: FileText, label: 'Relatório', color: 'text-purple-400', variant: 'purple' },
};

export default function DemandasMensaisPage() {
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | MetaMensal['categoria']>('todas');

  const filtered = metasMensais.filter((m) => {
    const matchSetor = filtroSetor === 'todos' || m.setorId === filtroSetor;
    const matchCat = filtroCategoria === 'todas' || m.categoria === filtroCategoria;
    return matchSetor && matchCat;
  });

  const totalProgresso = filtered.length > 0
    ? Math.round(filtered.reduce((acc, m) => acc + m.progresso, 0) / filtered.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">Demandas Mensais</h2>
          <p className="text-slate-400 text-sm">Metas, projetos e relatórios do mês</p>
        </div>
        <div className="glass-card rounded-xl px-5 py-3 border border-brand-navy-border text-center">
          <p className="text-slate-400 text-xs mb-1">Progresso Médio</p>
          <p className="text-brand-green-light font-bold text-2xl">{totalProgresso}%</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['meta', 'projeto', 'relatorio'] as MetaMensal['categoria'][]).map((cat) => {
          const cfg = categoriaConfig[cat];
          const Icon = cfg.icon;
          const count = metasMensais.filter((m) => m.categoria === cat).length;
          const avgProg = Math.round(
            metasMensais.filter((m) => m.categoria === cat).reduce((a, m) => a + m.progresso, 0) /
            Math.max(1, count)
          );
          return (
            <div key={cat} className="glass-card rounded-2xl p-5 border border-brand-navy-border text-center">
              <Icon className={`w-6 h-6 ${cfg.color} mx-auto mb-2`} />
              <p className="text-white font-bold text-xl">{count}</p>
              <p className="text-slate-400 text-xs mb-2">{cfg.label}s</p>
              <ProgressBar value={avgProg} showLabel size="sm" />
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-brand-navy-border">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="bg-brand-navy-light border border-brand-navy-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
          >
            <option value="todos">Todos os Setores</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <div className="flex gap-2">
            {(['todas', 'meta', 'projeto', 'relatorio'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filtroCategoria === cat
                    ? 'bg-brand-green text-white'
                    : 'bg-brand-navy-light text-slate-400 hover:text-white border border-brand-navy-border'
                }`}
              >
                {cat === 'todas' ? 'Todas' : categoriaConfig[cat].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((meta) => {
          const setor = setores.find((s) => s.id === meta.setorId);
          const cfg = categoriaConfig[meta.categoria];
          const Icon = cfg.icon;
          const daysLeft = Math.ceil((new Date(meta.prazo).getTime() - Date.now()) / 86400000);

          return (
            <div key={meta.id} className="glass-card rounded-2xl p-6 border border-brand-navy-border hover-lift">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  meta.categoria === 'meta' ? 'bg-green-500/15' :
                  meta.categoria === 'projeto' ? 'bg-blue-500/15' : 'bg-purple-500/15'
                }`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-semibold text-sm leading-snug">{meta.nome}</h3>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{meta.descricao}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <ProgressBar value={meta.progresso} showLabel size="lg" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {setor && (
                    <span className="px-2 py-0.5 rounded-lg" style={{ backgroundColor: setor.cor + '22', color: setor.cor }}>
                      {setor.nome}
                    </span>
                  )}
                  <span className="text-slate-500">{meta.responsavel}</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Prazo: {formatDate(meta.prazo)}</p>
                  <p className={`font-semibold ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 30 ? 'text-orange-400' : 'text-slate-400'}`}>
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
