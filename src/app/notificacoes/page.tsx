'use client';

import { useState } from 'react';
import { Bell, CheckCheck, AlertCircle, ListTodo, Clock, Target, Info } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TipoNotificacao } from '@/types';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

const tipoConfig: Record<TipoNotificacao, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  aviso: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/25', label: 'Aviso' },
  tarefa: { icon: ListTodo, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25', label: 'Tarefa' },
  prazo: { icon: Clock, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/25', label: 'Prazo' },
  meta: { icon: Target, color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/25', label: 'Meta' },
};

export default function NotificacoesPage() {
  const { notificacoes, marcarLida, marcarTodasLidas, naoLidasCount } = useApp();
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | TipoNotificacao>('todas');

  const filtered = notificacoes.filter((n) => {
    if (filtro === 'todas') return true;
    if (filtro === 'nao_lidas') return !n.lida;
    return n.tipo === filtro;
  });

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-white font-extrabold text-2xl md:text-3xl flex items-center gap-3 tracking-tight">
            <Bell className="w-6 h-6 text-brand-green-light" />
            Notificações
            {naoLidasCount > 0 && (
              <span className="bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                {naoLidasCount} novas
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} notificações encontradas</p>
        </div>
        {naoLidasCount > 0 && (
          <button
            onClick={marcarTodasLidas}
            className="flex items-center gap-2 text-brand-green-light hover:text-white text-sm border border-brand-green/30 hover:border-brand-green px-5 py-2.5 rounded-xl transition-all font-semibold"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 flex-wrap">
        {(['todas', 'nao_lidas', 'aviso', 'tarefa', 'prazo', 'meta'] as const).map((f) => {
          const labels: Record<string, string> = {
            todas: 'Todas',
            nao_lidas: 'Não lidas',
            aviso: 'Avisos',
            tarefa: 'Tarefas',
            prazo: 'Prazos',
            meta: 'Metas',
          };
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                filtro === f
                  ? 'bg-brand-green text-white shadow-md shadow-brand-green/20'
                  : 'bg-brand-navy-light text-slate-400 hover:text-white border border-brand-navy-border'
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {filtered.map((notif) => {
          const cfg = tipoConfig[notif.tipo];
          const Icon = cfg.icon;
          return (
            <div
              key={notif.id}
              onClick={() => marcarLida(notif.id)}
              className={`glass-card rounded-2xl p-5 md:p-6 border transition-all cursor-pointer hover-lift ${
                !notif.lida
                  ? 'border-brand-green/40 bg-brand-green/5'
                  : 'border-brand-navy-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold ${notif.lida ? 'text-slate-300' : 'text-white'}`}>
                        {notif.titulo}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{notif.descricao}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {!notif.lida && (
                        <span className="w-2 h-2 rounded-sm bg-brand-green pulse-dot" />
                      )}
                      <span className="text-slate-500 text-xs whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                    </div>
                  </div>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 mt-2 text-brand-green-light text-xs hover:underline"
                    >
                      <Info className="w-3 h-3" /> Ver detalhes →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-12 border border-brand-navy-border text-center">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma notificação encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
