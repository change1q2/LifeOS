export function CategoryIcon({ emoji, className, style }: { emoji: string; className?: string; style?: React.CSSProperties }) {
  return <span className={className} style={style}>{emoji}</span>;
}
