'use client';

import { useState } from 'react';
import { Bell, CheckCheck, AlertCircle, ListTodo, Clock, Target, Info, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TipoNotificacao } from '@/types';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

const tipoConfig: Record<TipoNotificacao, { icon: React.ElementType; gradient: string; label: string }> = {
  aviso: { icon: AlertCircle, gradient: 'from-amber-500 to-orange-400', label: 'Aviso' },
  tarefa: { icon: ListTodo, gradient: 'from-blue-500 to-indigo-400', label: 'Tarefa' },
  prazo: { icon: Clock, gradient: 'from-red-500 to-pink-400', label: 'Prazo' },
  meta: { icon: Target, gradient: 'from-emerald-500 to-teal-400', label: 'Meta' },
};

export default function NotificacoesPage() {
  const { notificacoes, marcarLida, marcarTodasLidas, naoLidasCount } = useApp();
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | TipoNotificacao>('todas');

  const filtered = notificacoes.filter((n) => {
    if (filtro === 'todas') return true;
    if (filtro === 'nao_lidas') return !n.lida;
    return n.tipo === filtro;
  });

  const filterOptions = [
    { key: 'todas', label: 'Todas' },
    { key: 'nao_lidas', label: 'Não lidas' },
    { key: 'aviso', label: 'Avisos' },
    { key: 'tarefa', label: 'Tarefas' },
    { key: 'prazo', label: 'Prazos' },
    { key: 'meta', label: 'Metas' },
  ] as const;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl flex items-center gap-3 tracking-tight">
            Notificações
            {naoLidasCount > 0 && (
              <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                {naoLidasCount} novas
              </span>
            )}
          </h2>
          <p className="text-text-muted text-sm mt-1">{filtered.length} notificações</p>
        </div>
        {naoLidasCount > 0 && (
          <button onClick={marcarTodasLidas} className="btn-ghost">
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Segmented Filters */}
      <div className="segmented-control flex-wrap">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`segmented-btn ${filtro === f.key ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline Notifications */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-surface-border hidden md:block" />

        <div className="space-y-3">
          {filtered.map((notif) => {
            const cfg = tipoConfig[notif.tipo];
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                onClick={() => marcarLida(notif.id)}
                className={`card p-4 md:p-5 transition-all cursor-pointer group hover:shadow-md ${
                  !notif.lida ? 'ring-1 ring-brand/20 bg-brand/[0.02]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${notif.lida ? 'text-text-secondary' : 'text-text-primary'} group-hover:text-brand`}>
                          {notif.titulo}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{notif.descricao}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {!notif.lida && (
                          <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
                        )}
                        <span className="text-text-muted text-[11px] whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                      </div>
                    </div>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-2 text-brand text-xs font-medium hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver detalhes
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="card p-12 text-center">
              <Bell className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-text-muted">Nenhuma notificação encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
