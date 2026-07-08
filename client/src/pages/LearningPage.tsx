import { useState } from 'react';
import { Plus, Trash2, Edit3, GripVertical, Eye, BookOpen, Calendar, Clock } from 'lucide-react';
import { useModuleData, useToast } from '../lib/hooks';
import { api } from '../lib/api';
import { MODULES } from '../config/modules';
import { useQueryClient } from '@tanstack/react-query';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RatingDisplay } from '../components/ui/Rating';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DetailView } from '../components/ui/DetailView';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatDate, badgeColor } from '../lib/utils';
import { useCategoryManager } from '../lib/useCategoryManager';
import type { LucideIcon } from 'lucide-react';

// Check if learning completed achievements exist (to avoid duplicates)
async function ensureAchievement(item: any, existingAchievements: any[]) {
  if (item.progress !== 100) return;

  const exists = existingAchievements.some(
    (a: any) => a.source_module === 'learning' && a.source_id === item.id
  );
  if (exists) return;

  await api.create('achievements', {
    title: item.title,
    module: '学习成长',
    category: item.category || '',
    subcategory: '',
    source_id: item.id,
    source_module: 'learning',
    source_title: item.title,
    parent_id: null,
    date: new Date().toISOString().split('T')[0],
    description: item.notes || '',
    feeling: item.self_rating ? `自我评分：${item.self_rating}分` : '',
  });
}

const config = MODULES.learning;

export function LearningPage() {
  const { data, loading, create, update, delete: deleteItem } = useModuleData<any>('learning');
  const { data: achievements } = useModuleData<any>('achievements');
  const { show, ToastEl } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailItem, setDetailItem] = useState<any>(null);

  const catMgr = useCategoryManager({
    storageKey: 'lifeos_skill_categories',
    defaults: ['学历提升', '职业能力提升', '投资理财学习', '副业应用学习', '爱好兴趣学习', '其他技能学习'],
    fallbackCategory: '其他技能学习',
    icons: ['🎓', '💼', '📈', '🚀', '🎨', '🔧', '📖', '🧠', '🗣️', '💻', '🎵', '✍️'],
    allIcon: '📚',
    moduleName: 'learning',
    dialogTitle: '管理技能树分类',
    sectionTitle: '技能树分类',
  });

  const filtered = catMgr.getFilteredData(data);
  const catCounts = catMgr.getCategoryCounts(data);

  const handleAdd = (cat?: string) => {
    setEditing(null);
    if (cat) catMgr.selectCategory(cat);
    setFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editing) {
        update(editing.id, formData);
        show('更新成功！');
        await ensureAchievement({ ...editing, ...formData }, achievements);
      } else {
        const createdItem = await api.create<{ id: number }>('learning', formData);
        show('记录成功！');
        await ensureAchievement({ ...formData, id: createdItem.id }, achievements);
        queryClient.invalidateQueries({ queryKey: ['learning'] });
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      show('保存失败，请重试');
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('确定删除这条学习记录吗？')) return;
    deleteItem(id);
    show('已删除');
  };

  // Progress bar color
  const progressColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-sky-500';
    if (pct >= 20) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: config.color + '20' }}>
            <BookOpen className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">学习成长</h2>
            <p className="text-xs text-muted-foreground">按技能树分类，记录每一份知识的积累</p>
          </div>
        </div>
        <Button onClick={() => handleAdd()} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 添加记录
        </Button>
      </div>

      {/* Skill Tree: Category Cards */}
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
            style={{ '--tw-ring-color': config.color } as React.CSSProperties}
            onClick={() => catMgr.selectCategory(null)}
          >
            <div className="p-3 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-1" style={{ color: config.color }} />
              <div className="text-xs font-bold">全部</div>
              <div className="text-[11px] text-muted-foreground">{data.length} 条</div>
            </div>
          </Card>
          {catMgr.categories.map((cat, idx) => {
            const icon = catMgr.getCategoryIcon(idx);
            const count = catCounts[cat] || 0;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === cat ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                style={{ '--tw-ring-color': config.color } as React.CSSProperties}
                onClick={() => catMgr.toggleCategory(cat)}
              >
                <div className="p-3 text-center">
                  <CategoryIcon emoji={icon} className="w-8 h-8 mx-auto mb-1" style={{ color: config.color }} />
                  <div className="text-xs font-bold leading-tight">{cat}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{count} 条</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <BookOpen className="w-16 h-16 mb-3 opacity-50" style={{ color: config.color }} />
          <h3 className="text-base font-semibold text-foreground/80">
            {catMgr.selectedCategory ? `"${catMgr.selectedCategory}" 还没有学习记录` : '还没有学习记录'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">点击右上角按钮开始记录吧！</p>
          {catMgr.selectedCategory && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => handleAdd(catMgr.selectedCategory!)}>
              <Plus className="h-3 w-3" /> 在"{catMgr.selectedCategory}"添加
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {filtered.map((item: any) => {
            const pct = item.progress || 0;
            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden border-l-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{ borderLeftColor: config.color }}
              >
                <div className="p-4" onClick={() => setDetailItem(item)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2 min-w-0">
                      {item.category && <Badge className={badgeColor(item.category)}>{item.category}</Badge>}
                      <div className="mt-1.5 text-sm font-bold leading-snug">{item.title}</div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        title="编辑"
                        className="text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all rounded p-1.5 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        title="删除"
                        className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1.5 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {item.source && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {item.source}
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {item.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(item.start_date)}</span>}
                    {item.end_date && <span>→ {formatDate(item.end_date)}</span>}
                    {item.duration_hours > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration_hours}h</span>}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">进度</span>
                      <span className="font-bold" style={{ color: config.color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-2.5 text-[13px] text-foreground/70 line-clamp-2 leading-relaxed">
                      {item.notes}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                    <div>
                      {item.self_rating > 0 && <RatingDisplay value={item.self_rating} />}
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary">
                      <Eye className="h-3 w-3" /> 查看详情
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Entry Form */}
      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '添加'}学习记录`}
        fields={config.fields}
        initialData={editing}
        accentColor={config.color}
      />

      {/* Category Management Dialog */}
      <Dialog
        open={catMgr.manageOpen}
        onClose={() => catMgr.setManageOpen(false)}
        title={catMgr.config.dialogTitle}
        footer={
          <Button onClick={() => catMgr.setManageOpen(false)}>完成</Button>
        }
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
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      catMgr.confirmEdit(catMgr.editingIndex!.value);
                    }
                    if (e.key === 'Escape') catMgr.cancelEdit();
                  }}
                  className="flex-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm">{cat}</span>
              )}
              <button
                onClick={() => catMgr.startEdit(idx)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => catMgr.deleteCategory(idx)}
                className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={catMgr.addCategory}>
            <Plus className="h-3 w-3" /> 添加新分类
          </Button>
        </div>
      </Dialog>

      {/* Detail View */}
      <DetailView
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.title || '学习详情'}
        data={detailItem || {}}
        category={detailItem?.category}
        fields={config.fields}
        accentColor={config.color}
      />

      {ToastEl}
    </div>
  );
}

export default LearningPage;
