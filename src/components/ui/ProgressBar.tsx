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
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-text-muted font-medium">Progresso</span>
          <span className="text-xs font-bold text-text-primary">{clamped}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-2 overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-out progress-shine',
            !color && 'bg-gradient-to-r from-brand to-emerald-400'
          )}
          style={{
            width: `${clamped}%`,
            ...(color ? { background: color } : {}),
          }}
        />
      </div>
    </div>
  );
}
