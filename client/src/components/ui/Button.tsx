import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_2px_8px_-2px_rgba(8,145,178,0.35)] hover:shadow-[0_4px_14px_-2px_rgba(8,145,178,0.45)] hover:-translate-y-0.5',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_2px_8px_-2px_rgba(220,38,38,0.35)]',
    ghost: 'hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent/50',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-8 text-base',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
