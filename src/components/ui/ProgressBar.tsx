import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function ProgressBar({
  value,
  className,
  showLabel = false,
  size = 'md',
  color,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const barColor =
    color ||
    (clamped >= 75
      ? 'bg-green-500'
      : clamped >= 50
      ? 'bg-yellow-500'
      : clamped >= 25
      ? 'bg-orange-500'
      : 'bg-red-500');

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">Progresso</span>
          <span className="text-xs font-semibold text-white">{clamped}%</span>
        </div>
      )}
      <div className={cn('w-full bg-brand-navy-border rounded-sm overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-sm transition-all duration-700 ease-out', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
