import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ContentBlock, FieldConfig } from '../../types';
import { RatingDisplay } from './Rating';
import { formatDate } from '../../lib/utils';

interface DetailViewProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: any;
  category?: string;
  fields?: FieldConfig[]; // optional: when present, render all non-empty fields automatically
  accentColor?: string;
  /** Render content blocks (rich content). Only used for travel-style modules. */
  richBlocks?: ContentBlock[];
  /** Override the header meta row (for modules with custom fields) */
  headerMeta?: { icon: any; text: string }[];
}

/**
 * 通用详情弹窗
 * - 不传 fields 时:使用旧版 Travel 专用渲染(高光时刻富文本+地址+心情等)
 * - 传 fields 时:按 fields 顺序遍历,只展示有值的字段(自动适配任意模块)
 */
export function DetailView({
  open,
  onClose,
  title,
  data,
  category,
  fields,
  accentColor = '#6366F1',
  richBlocks,
  headerMeta,
}: DetailViewProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  // Legacy: parse highlights for travel backward-compat
  const blocks: ContentBlock[] = richBlocks || (() => {
    if (data.highlights_blocks && Array.isArray(data.highlights_blocks) && data.highlights_blocks.length > 0) {
      return data.highlights_blocks;
    }
    if (data.highlights && typeof data.highlights === 'string' && data.highlights.trim()) {
      return [{ type: 'text', value: data.highlights }];
    }
    return [];
  })();

  // Legacy: location for travel
  const location = [data.country, data.province, data.city].filter(Boolean).join(' / ') || data.destination || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex w-full max-w-3xl flex-col bg-card shadow-2xl animate-slideUp sm:my-6 sm:rounded-lg sm:max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-6 py-4 sm:rounded-t-lg">
          <div className="flex-1 pr-4">
            {category && (
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-1.5"
                style={{ backgroundColor: accentColor + '20', color: accentColor }}
              >
                {category}
              </span>
            )}
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="关闭 (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {fields ? (
            <GenericFields data={data} fields={fields} accentColor={accentColor} />
          ) : (
            <>
              {/* Meta info row (legacy travel) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {location && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">📍 {location}</span>
                  </div>
                )}
                {data.start_date && (
                  <div className="flex items-center gap-1.5">
                    <span>📅 {formatDate(data.start_date)}{data.end_date && data.end_date !== data.start_date && ` → ${formatDate(data.end_date)}`}</span>
                  </div>
                )}
                {data.weather && <span>🌤️ {data.weather}</span>}
                {data.mood > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span>心情</span>
                    <RatingDisplay value={data.mood} />
                  </div>
                )}
              </div>
              {/* Custom header meta (for non-travel modules) */}
              {headerMeta && headerMeta.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {headerMeta.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-foreground">{m.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Rich content blocks (travel-style) */}
          {blocks.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-background/50 p-5">
              <h3 className="mb-3 text-sm font-bold text-foreground/80">✨ 高光时刻</h3>
              <div className="space-y-4">
                {blocks.map((block, idx) => (
                  <div key={idx}>
                    {block.type === 'text' ? (
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                        {block.value}
                      </p>
                    ) : (
                      <img
                        src={block.value}
                        alt={`高光 ${idx + 1}`}
                        className="w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflections (legacy travel) */}
          {data.reflections && (
            <div className="rounded-lg border border-border/50 bg-background/50 p-5">
              <h3 className="mb-2 text-sm font-bold text-foreground/80">💭 感悟 / 心态</h3>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/85">
                {data.reflections}
              </p>
            </div>
          )}

          {/* Footer time */}
          {data.created_at && (
            <div className="text-center text-[11px] text-muted-foreground">
              记录于 {formatDate(data.created_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== Generic field renderer ==========
function GenericFields({ data, fields, accentColor }: { data: any; fields: FieldConfig[]; accentColor: string }) {
  return (
    <div className="space-y-3">
      {fields.map(field => {
        const value = data[field.key];
        const isEmpty = isFieldEmpty(field.type, value);
        if (isEmpty) return null;
        return (
          <div key={field.key} className="rounded-lg border border-border/40 bg-background/30 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80 mb-1.5">
              {field.label}
            </div>
            <FieldValueRenderer type={field.type} value={value} field={field} accentColor={accentColor} />
          </div>
        );
      })}
    </div>
  );
}

function isFieldEmpty(type: string, value: any): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (type === 'tags' && Array.isArray(value) && value.length === 0) return true;
  if (type === 'keyresults' && Array.isArray(value) && value.length === 0) return true;
  if (type === 'rating' && (value === 0 || value === '0')) return true;
  if (type === 'number' && value === 0) return true;
  if (type === 'progress' && (value === 0 || value === '0')) return true;
  return false;
}

function FieldValueRenderer({ type, value, field, accentColor }: { type: string; value: any; field: FieldConfig; accentColor: string }) {
  switch (type) {
    case 'rating':
      return <RatingDisplay value={Number(value)} />;
    case 'progress':
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: accentColor }} />
          </div>
          <span className="text-sm font-bold" style={{ color: accentColor }}>{value}%</span>
        </div>
      );
    case 'number':
      return <span className="text-[15px] font-semibold text-foreground">{String(value)}</span>;
    case 'date':
      return <span className="text-[15px] text-foreground/90">{formatDate(value)}</span>;
    case 'tags':
      return (
        <div className="flex flex-wrap gap-1.5">
          {(value as string[]).map((t, i) => (
            <span key={i} className="inline-flex items-center rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2.5 py-0.5 text-[12px] font-medium">
              {t}
            </span>
          ))}
        </div>
      );
    case 'keyresults':
      return (
        <div className="space-y-1.5">
          {(value as { title: string; done: boolean }[]).map((kr, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px]">
              <span className={`flex h-4 w-4 items-center justify-center rounded border-2 ${kr.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30'}`}>
                {kr.done && '✓'}
              </span>
              <span className={kr.done ? 'line-through text-muted-foreground' : 'text-foreground/80'}>{kr.title}</span>
            </div>
          ))}
        </div>
      );
    case 'textarea':
    case 'rich-content':
      return <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">{String(value)}</p>;
    case 'cascader':
      // cascader values are like "中国 / 云南 / 大理"
      return <span className="text-[15px] text-foreground/90">{String(value)}</span>;
    case 'module-category':
    case 'select':
      return <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-medium text-foreground/85">{String(value)}</span>;
    case 'text':
    default:
      return <span className="text-[15px] text-foreground/90">{String(value)}</span>;
  }
}
