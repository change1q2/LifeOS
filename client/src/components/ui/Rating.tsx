import { cn } from '../../lib/utils';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export function RatingInput({ value, onChange, size = 24 }: RatingInputProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(
            'cursor-pointer transition-colors',
            n <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground hover:text-amber-300'
          )}
          onClick={() => onChange(n)}
        />
      ))}
    </div>
  );
}

export function RatingDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(
            n <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}
