import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'orange' | 'slate';

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-500/15 text-green-400 border-green-500/25',
  red: 'bg-red-500/15 text-red-400 border-red-500/25',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  slate: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
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
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border whitespace-nowrap flex-shrink-0 tracking-wide',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-sm bg-current flex-shrink-0" />
      )}
      {children}
    </span>
  );
}
