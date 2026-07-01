import { cn } from '../../lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  color?: string;
}

export function Badge({ className, color, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        color || 'bg-secondary text-secondary-foreground',
        className
      )}
      {...props}
    />
  );
}
