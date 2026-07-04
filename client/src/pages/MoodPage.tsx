import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, GripVertical, X, Eye } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RatingDisplay } from '../components/ui/Rating';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DetailView } from '../components/ui/DetailView';
import { MODULES } from '../config/modules';
import { formatDateFull, todayStr, badgeColor } from '../lib/utils';
import { useCategoryManager } from '../lib/useCategoryManager';
import type { Mood } from '../types';

const moodEmojis = ['', '😞', '😕', '😐', '😊', '🤩'];

const EMOTION_TAGS_KEY = 'lifeos_emotion_tags';
const DEFAULT_EMOTION_TAGS = ['开心', '平静', '焦虑', '感恩', '充实', '感动', '喜悦', '沮丧', '孤单', '愤怒', '期待', '释然'];

function loadEmotionTags(): string[] {
  try {
    const raw = localStorage.getItem(EMOTION_TAGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_EMOTION_TAGS];
}

function saveEmotionTags(tags: string[]) {
  localStorage.setItem(EMOTION_TAGS_KEY, JSON.stringify(tags));
}

export function MoodPage() {
  const config = MODULES.mood;
  const { show, ToastEl } = useToast();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Mood | null>(null);
  const [prefillDate, setPrefillDate] = useState('');
  const [detailItem, setDetailItem] = useState<Mood | null>(null);

  // Tree category management
  const catMgr = useCategoryManager({
    storageKey: 'lifeos_mood_categories',
    defaults: ['日常心情', '工作压力', '人际关系', '健康状态', '学习成长', '情绪管理', '其他'],
    fallbackCategory: '其他',
    icons: ['💭', '💼', '👫', '🏥', '📚', '🧘', '✨'],
    allIcon: '🌙',
    moduleName: 'mood',
    dialogTitle: '管理心情分类',
    sectionTitle: '心情分类',
  });

  // Emotion tag management
  const [emotionTags, setEmotionTags] = useState<string[]>(loadEmotionTags);
  const [tagManageOpen, setTagManageOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ index: number; value: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    const data = await api.list<Mood>('mood');
    setMoods(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = catMgr.getFilteredData(moods);
  const catCounts = catMgr.getCategoryCounts(moods);

  const handleAdd = (date?: string) => {
    setEditing(null);
    setPrefillDate(date || todayStr());
    setFormOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editing) {
        await api.update('mood', editing.id, formData);
        show('更新成功！');
      } else {
        await api.create('mood', formData);
        show('记录成功！🌙');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      show('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await api.delete('mood', id);
    show('已删除');
    refresh();
  };

  // --- Emotion tag CRUD ---
  const addTag = () => {
    const newTags = [...emotionTags, '新标签'];
    setEmotionTags(newTags);
    saveEmotionTags(newTags);
    setEditingTag({ index: newTags.length - 1, value: '新标签' });
  };

  const renameTag = (idx: number, newName: string) => {
    const newTags = [...emotionTags];
    newTags[idx] = newName;
    setEmotionTags(newTags);
    saveEmotionTags(newTags);
    setEditingTag(null);
    // Note: we do NOT update existing mood records — tags are text values, not references
  };

  const deleteTag = (idx: number) => {
    const tag = emotionTags[idx];
    if (!confirm(`确定删除标签"${tag}"？已有记录中此标签不会被修改。`)) return;
    const newTags = emotionTags.filter((_, i) => i !== idx);
    setEmotionTags(newTags);
    saveEmotionTags(newTags);
  };

  const refreshTags = () => setEmotionTags(loadEmotionTags());

  // Calendar
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = now.getDate();

  const moodMap: Record<string, number> = {};
  moods.forEach(m => { if (m.date) moodMap[m.date] = m.score; });

  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const scoreColors: Record<number, string> = {
    0: 'bg-muted text-muted-foreground',
    1: 'bg-red-200 text-red-800',
    2: 'bg-orange-200 text-orange-800',
    3: 'bg-amber-200 text-amber-800',
    4: 'bg-green-200 text-green-800',
    5: 'bg-green-400 text-green-900',
  };

  const initialData = prefillDate ? { date: prefillDate } : undefined;

  // Dynamic fields: inject presetOptions for emotions + dynamic categories
  const dynamicFields = config.fields.map(f => {
    if (f.key === 'emotions') {
      return { ...f, presetOptions: emotionTags };
    }
    if (f.key === 'category' && f.dynamicCategories) {
      return { ...f, options: catMgr.categories };
    }
    return f;
  });

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: config.color + '20' }}>{config.icon}</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.name}</h2>
            <p className="text-xs text-muted-foreground">{config.desc} · 点击日历可直接记录</p>
          </div>
        </div>
        <Button onClick={() => handleAdd()} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 记录心情
        </Button>
      </div>

      {/* Mood Tree: Category Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground/70">{catMgr.config.sectionTitle}</h3>
          <Button variant="outline" size="sm" onClick={() => { catMgr.refreshCategories(); catMgr.setManageOpen(true); }}>
            <Edit3 className="h-3 w-3" /> 管理分类
          </Button>
        </div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === null ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
            style={{ ringColor: config.color }}
            onClick={() => catMgr.selectCategory(null)}
          >
            <div className="p-3 text-center">
              <div className="text-2xl mb-1">{catMgr.config.allIcon}</div>
              <div className="text-xs font-bold">全部</div>
              <div className="text-[11px] text-muted-foreground">{moods.length} 条</div>
            </div>
          </Card>
          {catMgr.categories.map((cat, idx) => {
            const icon = catMgr.getCategoryIcon(idx);
            const count = catCounts[cat] || 0;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === cat ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                style={{ ringColor: config.color }}
                onClick={() => catMgr.toggleCategory(cat)}
              >
                <div className="p-3 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs font-bold leading-tight">{cat}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{count} 条</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Emotion Tag Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground/70">情绪标签预设</h3>
          <Button variant="outline" size="sm" onClick={() => { refreshTags(); setTagManageOpen(true); }}>
            <Edit3 className="h-3 w-3" /> 管理标签
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {emotionTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-3 py-1 text-xs font-medium cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <Card className="mb-4 p-5">
        <h3 className="mb-3.5 text-sm font-bold">{year}年{month + 1}月心情日历</h3>
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {weekDayNames.map(w => <span key={w} className="text-center text-[11px] font-semibold text-muted-foreground">{w}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startWeekday }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const score = moodMap[dateStr] || 0;
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold cursor-pointer transition-all hover:scale-105 border-2 ${scoreColors[score]} ${isToday ? 'border-primary' : 'border-transparent'}`}
                onClick={() => handleAdd(dateStr)}
                title={`${dateStr}: ${score ? score + '⭐' : '点击记录'}`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>心情指数：</span>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className={`h-3 w-3 rounded-sm ${scoreColors[n]}`} />
          ))}
          <span>1-5</span>
        </div>
      </Card>

      {/* Recent entries */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="text-5xl mb-3 opacity-50">🌙</div>
          <h3 className="text-base font-semibold text-foreground/80">
            {catMgr.selectedCategory ? `"${catMgr.selectedCategory}" 还没有心情记录` : '还没有心情记录'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">点击日历或右上角按钮开始记录</p>
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {filtered.map(m => (
            <Card key={m.id} className="group border-l-4 relative overflow-hidden" style={{ borderLeftColor: config.color }}>
              <div className="p-4 cursor-pointer" onClick={() => setDetailItem(m)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{moodEmojis[m.score] || '😐'}</span>
                    <RatingDisplay value={m.score} />
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(m); setPrefillDate(m.date); setFormOpen(true); }}
                      title="编辑"
                      className="text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all rounded p-1.5 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                      title="删除"
                      className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {m.category && <Badge className={`mt-1.5 ${badgeColor(m.category)}`}>{m.category}</Badge>}
                {m.emotions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.emotions.map((t, i) => <Badge key={i} className="bg-pink-100 text-pink-700">{t}</Badge>)}
                  </div>
                )}
                {m.journal && <p className="mt-2 text-[13px] text-foreground/70 leading-relaxed line-clamp-3">{m.journal}</p>}
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                  <span className="text-[11px] text-muted-foreground">{formatDateFull(m.date)}</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary">
                    <Eye className="h-3 w-3" /> 查看详情
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '记录'}心情`}
        fields={dynamicFields}
        initialData={editing || initialData}
        accentColor={config.color}
      />

      {/* Detail View */}
      <DetailView
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem ? `${formatDateFull(detailItem.date)} 心情` : '心情详情'}
        data={detailItem || {}}
        category={detailItem?.category}
        fields={config.fields}
        accentColor={config.color}
      />

      {/* Category Management Dialog */}
      <Dialog
        open={catMgr.manageOpen}
        onClose={() => catMgr.setManageOpen(false)}
        title={catMgr.config.dialogTitle}
        footer={<Button onClick={() => catMgr.setManageOpen(false)}>完成</Button>}
      >
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {catMgr.categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-border/50 p-2.5">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              {catMgr.editingIndex?.index === idx ? (
                <Input
                  value={catMgr.editingIndex.value}
                  onChange={e => catMgr.setEditingIndex({ ...catMgr.editingIndex!, value: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); catMgr.confirmEdit(catMgr.editingIndex!.value); }
                    if (e.key === 'Escape') catMgr.cancelEdit();
                  }}
                  className="flex-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm">{cat}</span>
              )}
              <button onClick={() => catMgr.startEdit(idx)} className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => catMgr.deleteCategory(idx)} className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={catMgr.addCategory}>
            <Plus className="h-3 w-3" /> 添加新分类
          </Button>
        </div>
      </Dialog>

      {/* Emotion Tag Management Dialog */}
      <Dialog
        open={tagManageOpen}
        onClose={() => setTagManageOpen(false)}
        title="管理情绪标签预设"
        footer={<Button onClick={() => setTagManageOpen(false)}>完成</Button>}
      >
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {emotionTags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-border/50 p-2.5">
              {editingTag?.index === idx ? (
                <Input
                  value={editingTag.value}
                  onChange={e => setEditingTag({ ...editingTag, value: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (editingTag.value.trim()) {
                        renameTag(idx, editingTag.value.trim());
                      } else {
                        setEditingTag(null);
                      }
                    }
                    if (e.key === 'Escape') setEditingTag(null);
                  }}
                  className="flex-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm">{tag}</span>
              )}
              <button onClick={() => setEditingTag({ index: idx, value: tag })} className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteTag(idx)} className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={addTag}>
            <Plus className="h-3 w-3" /> 添加新标签
          </Button>
        </div>
      </Dialog>

      {ToastEl}
    </div>
  );
}
