import { useRef, useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, MoveUp, MoveDown, X } from 'lucide-react';
import { Button } from './Button';
import { compressImage, estimateBase64Size } from '../../lib/images';
import { cn } from '../../lib/utils';
import type { ContentBlock } from '../../types';

interface RichEditorProps {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const blocks = value || [];

  const updateBlock = (idx: number, block: ContentBlock) => {
    const next = [...blocks];
    next[idx] = block;
    onChange(next);
  };

  const addTextBlock = () => {
    onChange([...blocks, { type: 'text', value: '' }]);
  };

  const removeBlock = (idx: number) => {
    onChange(blocks.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newBlocks: ContentBlock[] = [];
      for (const file of Array.from(files)) {
        const base64 = await compressImage(file);
        const sizeKB = estimateBase64Size(base64);
        if (sizeKB > 800) {
          alert(`图片 "${file.name}" 较大 (${sizeKB}KB)，已自动压缩`);
        }
        newBlocks.push({ type: 'image', value: base64 });
      }
      onChange([...blocks, ...newBlocks]);
    } catch (err: any) {
      alert('图片处理失败: ' + (err?.message || '未知错误'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Block list */}
      <div className="max-h-[400px] overflow-y-auto p-3 space-y-3">
        {blocks.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            还没有内容,点击下方按钮添加段落或图片 ✍️
          </div>
        )}
        {blocks.map((block, idx) => (
          <div key={idx} className="group relative rounded-md border border-border/50 bg-background p-2 hover:border-primary/30 transition-colors">
            {/* Block type label */}
            <div className="mb-1.5 flex items-center justify-between">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                block.type === 'text' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
              )}>
                {block.type === 'text' ? '📝 段落' : '🖼 图片'}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} type="button" className="rounded p-1 hover:bg-accent disabled:opacity-30 cursor-pointer">
                  <MoveUp className="h-3 w-3" />
                </button>
                <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1} type="button" className="rounded p-1 hover:bg-accent disabled:opacity-30 cursor-pointer">
                  <MoveDown className="h-3 w-3" />
                </button>
                <button onClick={() => removeBlock(idx)} type="button" className="rounded p-1 hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Block content */}
            {block.type === 'text' ? (
              <textarea
                value={block.value}
                onChange={e => updateBlock(idx, { type: 'text', value: e.target.value })}
                placeholder="写下这段旅程的精彩瞬间..."
                className="w-full min-h-[80px] resize-y rounded border border-border/40 bg-background px-2.5 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            ) : (
              <div className="relative">
                <img
                  src={block.value}
                  alt="旅行图片"
                  className="max-h-[300px] w-full rounded object-contain bg-muted"
                />
                <button
                  onClick={() => removeBlock(idx)}
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="mt-1 text-[10px] text-muted-foreground text-right">
                  {estimateBase64Size(block.value)} KB
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <Button type="button" variant="outline" size="sm" onClick={addTextBlock}>
          <Plus className="h-3 w-3" /> 添加段落
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <ImageIcon className="h-3 w-3" /> {uploading ? '处理中...' : '插入图片'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <div className="ml-auto text-[11px] text-muted-foreground">
          {blocks.length} 个内容块
        </div>
      </div>
    </div>
  );
}
