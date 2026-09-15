import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffH < 24) return `${diffH}h atrás`;
  if (diffD === 1) return 'Ontem';
  if (diffD < 7) return `${diffD} dias atrás`;
  return formatDate(dateStr);
}

export function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / 86400000);
}

export function prioridadeLabel(p: string): string {
  const labels: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
  };
  return labels[p] || p;
}

export function statusLabel(s: string): string {
  const labels: Record<string, string> = {
    nao_iniciada: 'Não Iniciada',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
  };
  return labels[s] || s;
}

export function tipoMuralLabel(t: string): string {
  const labels: Record<string, string> = {
    comunicado: 'Comunicado',
    evento: 'Evento',
    aviso_urgente: 'Aviso Urgente',
    meta: 'Meta',
    mudanca: 'Mudança',
    treinamento: 'Treinamento',
  };
  return labels[t] || t;
}
