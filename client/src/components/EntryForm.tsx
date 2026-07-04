import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input, Textarea, Select, Label } from './ui/Input';
import { RatingInput } from './ui/Rating';
import { Cascader } from './ui/Cascader';
import { RichEditor } from './ui/RichEditor';
import { cn } from '../lib/utils';
import { Plus, X } from 'lucide-react';
import { getModuleCategories } from '../config/modules';
import { getRegionsForCategory, getCategoryRangeHint } from '../data/regions';
import type { FieldConfig, ContentBlock } from '../types';

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

  // 字段级错误信息:{ [fieldKey]: '提示文案' }
  const [errors, setErrors] = useState<Record<string, string>>({});
  // 顶部 toast 提示
  const [toast, setToast] = useState<string | null>(null);
  // Cascader 弹层打开状态(用于禁用 footer 按钮,避免物理遮挡)
  const [cascaderOpen, setCascaderOpen] = useState(false);

  // 用于滚动到第一个错误字段
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Dynamic category options based on dependsOn field value
  const dynamicOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    fields.forEach(f => {
      if (f.type === 'module-category' && f.dependsOn) {
        const parentValue = formData[f.dependsOn];
        map[f.key] = parentValue ? getModuleCategories(parentValue) : [];
      }
    });
    return map;
  }, [formData, fields]);

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
      setErrors({});      // 每次打开都清空旧错误
      setToast(null);     // 同时清旧 toast
      setCascaderOpen(false); // 重置 cascader 状态
    }
  }, [open, initialData, fields]);

  // Toast 3 秒后自动消失(组件卸载或提前清空时自动清理)
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const setField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    // 用户开始输入时清掉该字段错误(性能优化:无错时直接返回原引用避免无意义重渲染)
    setErrors(prev => {
      if (!prev[key]) return prev;
      const { [key]: _omit, ...rest } = prev;
      return rest;
    });
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
    // 1. 收集必填错误
    const newErrors: Record<string, string> = {};
    for (const f of fields) {
      if (!f.required) continue;
      if (f.type === 'tags' && tags.length === 0) {
        newErrors[f.key] = `请填写${f.label}`;
      } else if (f.type === 'keyresults' && keyResults.length === 0) {
        newErrors[f.key] = `请填写${f.label}`;
      } else if (f.type !== 'tags' && f.type !== 'keyresults' && !formData[f.key]) {
        newErrors[f.key] = `请填写${f.label}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast('请补全必填项后保存');
      // 滚动到第一个错误字段
      const firstKey = Object.keys(newErrors)[0];
      const el = fieldRefs.current[firstKey];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. 校验通过,组装并提交
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
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={cascaderOpen}
            className={cascaderOpen ? 'pointer-events-none opacity-50' : ''}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={cascaderOpen}
            className={cascaderOpen ? 'pointer-events-none opacity-50' : ''}
            style={{ backgroundColor: accentColor }}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {fields.map((f) => (
          <div
            key={f.key}
            ref={el => { fieldRefs.current[f.key] = el; }}
          >
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
                onChange={e => {
                  setField(f.key, e.target.value);
                  // Clear dependent module-category fields when this field changes
                  fields.forEach(df => {
                    if (df.type === 'module-category' && df.dependsOn === f.key) {
                      setField(df.key, '');
                    }
                  });
                }}
              >
                <option value="">请选择...</option>
                {(f.dynamicCategories
                  ? (() => { try { const raw = localStorage.getItem(f.dynamicCategories); if (raw) return JSON.parse(raw); } catch {} return f.options || []; })()
                  : f.options)?.map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            )}

            {f.type === 'module-category' && (
              <Select
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
                disabled={!formData[f.dependsOn || '']}
              >
                <option value="">
                  {formData[f.dependsOn || ''] ? '请选择一级分类...' : '请先选择所属模块'}
                </option>
                {(dynamicOptions[f.key] || []).map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            )}

            {f.type === 'date' && (
              <Input
                type="date"
                value={formData[f.key] || ''}
                onChange={e => setField(f.key, e.target.value)}
              />
            )}

            {f.type === 'cascader' && (
              <Cascader
                value={{
                  country: formData.country || '',
                  province: formData.province || '',
                  city: formData.city || '',
                  district: formData.district || '',
                }}
                onChange={(v) => {
                  setField('country', v.country);
                  setField('province', v.province);
                  setField('city', v.city);
                  setField('district', v.district);
                }}
                onOpenChange={setCascaderOpen}
                placeholder={f.placeholder}
                allowedRegions={f.dependsOn ? getRegionsForCategory(formData[f.dependsOn] || '') : undefined}
                rangeHint={f.dependsOn ? getCategoryRangeHint(formData[f.dependsOn] || '') : ''}
              />
            )}

            {f.type === 'rich-content' && (
              <RichEditor
                value={formData[f.key] || []}
                onChange={(blocks) => setField(f.key, blocks)}
              />
            )}

            {f.type === 'rating' && (
              <RatingInput
                value={formData[f.key] || 0}
                onChange={v => setField(f.key, v)}
              />
            )}

            {f.type === 'progress' && (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData[f.key] ?? 0}
                  onChange={e => setField(f.key, parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-sky-500"
                  style={{
                    background: `linear-gradient(to right, #0EA5E9 ${formData[f.key] || 0}%, #e5e7eb ${formData[f.key] || 0}%)`,
                  }}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="font-bold text-sm" style={{ color: '#0EA5E9' }}>{formData[f.key] ?? 0}%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {f.type === 'tags' && (
              <div className="space-y-2">
                {/* Preset tag pills */}
                {f.presetOptions && f.presetOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {f.presetOptions.map(preset => {
                      const isSelected = tags.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setTags(tags.filter(t => t !== preset));
                            } else {
                              setTags([...tags, preset]);
                            }
                          }}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground ring-1 ring-primary'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* Selected tags + custom input */}
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
                    placeholder={tags.length === 0 ? (f.placeholder || '输入自定义标签，Enter 添加') : '自定义...'}
                    className="flex-1 min-w-[80px] border-none bg-transparent text-sm outline-none"
                  />
                </div>
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
            {errors[f.key] && (
              <p className="mt-1 text-xs text-destructive">{errors[f.key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* 顶部 Toast(校验失败提示) */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] rounded-md bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-lg animate-fadeIn"
        >
          {toast}
        </div>
      )}
    </Dialog>
  );
}
