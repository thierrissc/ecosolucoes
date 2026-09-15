'use client';

import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  ListTodo,
  Clock,
  Target,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TipoNotificacao } from '@/types';
import { timeAgo } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

const tipoConfig: Record<
  TipoNotificacao,
  { icon: React.ElementType; label: string; badgeVariant: 'yellow' | 'blue' | 'red' | 'green' }
> = {
  aviso: { icon: AlertCircle, label: 'Aviso', badgeVariant: 'yellow' },
  tarefa: { icon: ListTodo, label: 'Tarefa', badgeVariant: 'blue' },
  prazo: { icon: Clock, label: 'Prazo', badgeVariant: 'red' },
  meta: { icon: Target, label: 'Meta', badgeVariant: 'green' },
};

export default function NotificacoesPage() {
  const {
    notificacoes,
    marcarTodasLidas,
    toggleLidaNotificacao,
    deleteNotificacao,
    naoLidasCount,
  } = useApp();

  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | TipoNotificacao>('todas');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
            Central de Notificações
            {naoLidasCount > 0 && (
              <span className="bg-brand text-white text-xs font-bold px-2.5 py-0.5">
                {naoLidasCount} nova{naoLidasCount > 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <p className="text-text-muted text-sm mt-1">
            {filtered.length} notificaç{filtered.length === 1 ? 'ão' : 'ões'} encontrada{filtered.length === 1 ? '' : 's'}
          </p>
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

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => {
          const cfg = tipoConfig[notif.tipo] || tipoConfig.aviso;
          const Icon = cfg.icon;
          const isExpanded = !!expandedMap[notif.id];

          return (
            <div
              key={notif.id}
              className={`card p-4 md:p-5 transition-all border-l-4 group ${
                !notif.lida
                  ? 'border-l-brand bg-brand/[0.02]'
                  : 'border-l-surface-border opacity-90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Subtle, transparent icon */}
                <div className="w-9 h-9 border border-surface-border bg-surface-2/60 text-text-muted flex items-center justify-center flex-shrink-0 group-hover:text-brand group-hover:border-brand/40 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top Bar: Title, Badge, Time & Actions */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={cfg.badgeVariant}>
                        {cfg.label}
                      </Badge>
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          notif.lida ? 'text-text-secondary' : 'text-text-primary'
                        }`}
                      >
                        {notif.titulo}
                      </h4>
                      {!notif.lida && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-brand/10 text-brand border border-brand/20 flex-shrink-0" title="Não lida">
                          <span className="w-1.5 h-1.5 status-dot bg-brand animate-pulse" />
                          Nova
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                      <span className="text-text-muted text-xs whitespace-nowrap">
                        {timeAgo(notif.timestamp)}
                      </span>

                      {/* Botão marcar como lida/não lida */}
                      <button
                        onClick={() => toggleLidaNotificacao(notif.id)}
                        className={`px-2 py-1 text-xs font-semibold flex items-center gap-1 transition-all border ${
                          notif.lida
                            ? 'text-text-muted border-surface-border hover:text-text-primary hover:bg-surface-hover'
                            : 'text-brand border-brand/30 bg-brand/10 hover:bg-brand/20'
                        }`}
                        title={notif.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                      >
                        <Check className="w-3 h-3" />
                        {notif.lida ? 'Lida' : 'Marcar lida'}
                      </button>

                      {/* Botão excluir notificação */}
                      <button
                        onClick={() => deleteNotificacao(notif.id)}
                        className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Excluir notificação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="mt-2 text-xs text-text-muted leading-relaxed">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>
                      {notif.descricao}
                    </p>

                    {/* Expand/Collapse Button */}
                    {notif.descricao.length > 70 && (
                      <button
                        onClick={() => toggleExpand(notif.id)}
                        className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-text-secondary hover:text-brand transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Recolher mensagem <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Expandir mensagem <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* External link if provided */}
                  {notif.link && (
                    <div className="mt-3 pt-2 border-t border-surface-border/60">
                      <Link
                        href={notif.link}
                        className="inline-flex items-center gap-1.5 text-brand text-xs font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ver detalhes da demanda
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Bell className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-text-muted font-medium">Nenhuma notificação no momento.</p>
            <p className="text-text-muted text-xs mt-1">Tudo em dia com a equipe!</p>
          </div>
        )}
      </div>
    </div>
  );
}
