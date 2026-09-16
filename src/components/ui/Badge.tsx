import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'orange' | 'slate';

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-emerald-500/12 text-emerald-500 dark:text-emerald-400',
  red: 'bg-red-500/12 text-red-500 dark:text-red-400',
  yellow: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-500/12 text-blue-500 dark:text-blue-400',
  purple: 'bg-violet-500/12 text-violet-500 dark:text-violet-400',
  pink: 'bg-pink-500/12 text-pink-500 dark:text-pink-400',
  orange: 'bg-orange-500/12 text-orange-500 dark:text-orange-400',
  slate: 'bg-slate-500/12 text-slate-500 dark:text-slate-400',
};

export function prioridadeVariant(p: string): BadgeVariant {
  return p === 'alta' ? 'red' : p === 'media' ? 'yellow' : 'green';
}

export function statusVariant(s: string): BadgeVariant {
  return s === 'concluida' ? 'green' : s === 'em_andamento' ? 'blue' : 'slate';
}

export function tipoMuralVariant(t: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    aviso_urgente: 'red',
    meta: 'green',
    evento: 'purple',
    comunicado: 'blue',
    mudanca: 'orange',
    treinamento: 'yellow',
    sugestao: 'yellow',
  };
  return map[t] || 'slate';
}

export function tipoEventoVariant(t: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    reuniao: 'blue',
    treinamento: 'yellow',
    entrega: 'orange',
    evento: 'purple',
  };
  return map[t] || 'slate';
}

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
  dot?: boolean;
}

export default function Badge({ variant = 'slate', className, children, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 tracking-wide',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full dot bg-current flex-shrink-0"
          style={{ borderRadius: '9999px' }}
        />
      )}
      {children}
    </span>
  );
}
