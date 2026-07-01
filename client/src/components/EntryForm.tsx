import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input, Textarea, Select, Label } from './ui/Input';
import { RatingInput } from './ui/Rating';
import { cn } from '../lib/utils';
import { Plus, X } from 'lucide-react';
import type { FieldConfig } from '../types';

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: any;
  accentColor?: string;
}

export function EntryForm({ open, onClose, onSave, title, fields, initialData, accentColor = '#6366F1' }: EntryFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [keyResults, setKeyResults] = useState<{ title: string; done: boolean }[]>([]);

  useEffect(() => {
    if (open) {
      const data: any = {};
      fields.forEach(f => {
        if (f.type === 'tags') {
          setTags(initialData?.[f.key] || []);
        } else if (f.type === 'keyresults') {
          setKeyResults(initialData?.[f.key] || []);
        } else {
          data[f.key] = initialData?.[f.key] ?? (f.type === 'date' ? new Date().toISOString().split('T')[0] : '');
        }
      });
      setFormData(data);
      setTagInput('');
    }
  }, [open, initialData, fields]);

  const setField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const addTag = (key: string) => {
    const val = tagInput.trim();
    if (val) {
      setTags(prev => [...prev, val]);
      setTagInput('');
    }
  };

  const removeTag = (idx: number) => {
    setTags(prev => prev.filter((_, i) => i !== idx));
  };

  const addKR = () => {
    setKeyResults(prev => [...prev, { title: '', done: false }]);
  };

  const updateKR = (idx: number, field: 'title' | 'done', value: any) => {
    setKeyResults(prev => prev.map((kr, i) => i === idx ? { ...kr, [field]: value } : kr));
  };

  const removeKR = (idx: number) => {
    setKeyResults(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    // Validate required fields
    for (const f of fields) {
      if (f.required) {
        if (f.type === 'tags' && tags.length === 0) return;
        if (f.type === 'keyresults' && keyResults.length === 0) return;
        if (f.type !== 'tags' && f.type !== 'keyresults' && !formData[f.key]) return;
      }
    }
    const data = { ...formData };
    fields.forEach(f => {
      if (f.type === 'tags') data[f.key] = tags;
      if (f.type === 'keyresults') data[f.key] = keyResults.filter(kr => kr.title.trim());
    });
    onSave(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={<span style={{ color: accentColor }}>{title}</span>}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSave} style={{ backgroundColor: accentColor }}>保存</Button>
        </>
      }
    >
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <Label>
              {f.label}
              {f.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {f.type === 'text' && (
              <Input
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}

            {f.type === 'number' && (
              <Input
                type="number"
                step="0.01"
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}

            {f.type === 'textarea' && (
              <Textarea
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}

            {f.type === 'select' && (
              <Select
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
              >
                <option value="">请选择...</option>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            )}

            {f.type === 'date' && (
              <Input
                type="date"
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
              />
            )}

            {f.type === 'rating' && (
              <RatingInput
                value={formData[f.key] || 0}
                onChange={v => setField(f.key, v)}
              />
            )}

            {f.type === 'tags' && (
              <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2 min-h-[40px]">
                {tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs text-primary-foreground">
                    {t}
                    <button onClick={() => removeTag(i)} className="opacity-70 hover:opacity-100 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(f.key); } }}
                  placeholder={tags.length === 0 ? f.placeholder : ''}
                  className="flex-1 min-w-[80px] border-none bg-transparent text-sm outline-none"
                />
              </div>
            )}

            {f.type === 'keyresults' && (
              <div className="space-y-2">
                {keyResults.map((kr, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={kr.done}
                      onChange={e => updateKR(i, 'done', e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-emerald-500"
                    />
                    <Input
                      value={kr.title}
                      onChange={e => updateKR(i, 'title', e.target.value)}
                      placeholder="关键结果"
                      className="flex-1"
                    />
                    <button onClick={() => removeKR(i)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addKR}>
                  <Plus className="h-3 w-3" /> 添加关键结果
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
