import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Check, Edit3, GripVertical, Eye, Target, Clock, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DetailView } from '../components/ui/DetailView';
import { CategoryIcon } from '../components/CategoryIcon';
import { MODULES } from '../config/modules';
import { formatDateFull, badgeColor } from '../lib/utils';
import { useCategoryManager } from '../lib/useCategoryManager';
import type { Goal, KeyResult, Achievement } from '../types';

const config = MODULES.goals;

interface KeyResultTreeProps {
  nodes: KeyResult[];
  goalId: number;
  path?: number[];
  depth?: number;
  onToggle: (goalId: number, path: number[]) => void;
}

function KeyResultTree({ nodes, goalId, path = [], depth = 0, onToggle }: KeyResultTreeProps) {
  return (
    <div className={depth === 0 ? 'space-y-1' : 'ml-6 border-l-2 border-border/30 pl-3 mt-1 space-y-1'}>
      {nodes.map((node, index) => {
        const nodePath = [...path, index];
        const isDeep = depth >= 2;
        return (
          <div key={nodePath.join('-')}>
            <div className={`flex items-center gap-2 ${isDeep ? 'text-xs' : 'text-sm'}`}>
              <button
                onClick={() => onToggle(goalId, nodePath)}
                className={`flex items-center justify-center rounded border-2 transition-all cursor-pointer ${
                  isDeep ? 'h-3 w-3' : 'h-4 w-4'
                } ${
                  node.done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-muted-foreground/30'
                }`}
              >
                {node.done && <Check className={isDeep ? 'h-2 w-2' : 'h-2.5 w-2.5'} />}
              </button>
              <span
                className={
                  node.done
                    ? 'line-through text-muted-foreground'
                    : isDeep
                    ? 'text-foreground/60'
                    : 'text-foreground/70'
                }
              >
                {node.title}
              </span>
            </div>
            {node.children && node.children.length > 0 && (
              <KeyResultTree
                nodes={node.children}
                goalId={goalId}
                path={nodePath}
                depth={depth + 1}
                onToggle={onToggle}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function GoalsPage() {
  const { show, ToastEl } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [detailItem, setDetailItem] = useState<Goal | null>(null);

  const catMgr = useCategoryManager({
    storageKey: 'lifeos_goal_categories',
    defaults: ['事业目标', '学习目标', '健康目标', '财务目标', '人际关系', '个人成长', '生活品质', '其他目标'],
    fallbackCategory: '其他目标',
    icons: ['💼', '📚', '💪', '💰', '👥', '🌱', '🏠', '✨'],
    allIcon: '🎯',
    moduleName: 'goals',
    dialogTitle: '管理目标分类',
    sectionTitle: '目标分类',
  });

  const refresh = async () => {
    setLoading(true);
    const data = await api.list<Goal>('goals');
    setGoals(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    api.list<Achievement>('achievements').then(setAchievements).catch(() => {});
  }, []);

  const achievementsMap = useMemo(() => {
    const map: Record<number, string> = {};
    achievements.forEach(a => {
      if (a.id !== undefined) {
        map[a.id] = a.title;
      }
    });
    return map;
  }, [achievements]);

  const filtered = catMgr.getFilteredData(goals);
  const catCounts = catMgr.getCategoryCounts(goals);

  const dynamicFields = config.fields.map(f => {
    if (f.key === 'category' && f.dynamicCategories) {
      return { ...f, options: catMgr.categories };
    }
    return f;
  });

  const detailFields = useMemo(() => {
    return dynamicFields.map(f =>
      f.key === 'linked_achievement_id'
        ? { ...f, key: 'linked_achievement_title', type: 'text' as const }
        : f
    );
  }, [dynamicFields]);

  const detailData = useMemo(() => {
    if (!detailItem) return {};
    return {
      ...detailItem,
      linked_achievement_title: detailItem.linked_achievement_id
        ? achievementsMap[detailItem.linked_achievement_id] || '未知成就'
        : '',
    };
  }, [detailItem, achievementsMap]);

  const handleAdd = (cat?: string) => {
    setEditing(null);
    if (cat) catMgr.selectCategory(cat);
    setFormOpen(true);
  };

  const countKeyResults = (krs: KeyResult[]): { total: number; done: number } => {
    let total = 0;
    let done = 0;
    krs.forEach(kr => {
      if (kr.children && kr.children.length > 0) {
        const childStats = countKeyResults(kr.children);
        total += childStats.total;
        done += childStats.done;
      } else {
        total++;
        if (kr.done) done++;
      }
    });
    return { total, done };
  };

  const createLinkedTask = async (module: string, category: string, goal: Goal): Promise<any | null> => {
    const { total, done } = countKeyResults(goal.key_results || []);
    const progress = total ? Math.round(done / total * 100) : 0;

    const moduleMap: Record<string, string> = {
      '学习成长': 'learning',
      '旅行日记': 'travel',
      '心情心态': 'mood',
      '健康习惯': 'health',
      '财务管理': 'finance',
      '社交人脉': 'social',
      '收获感悟': 'insights',
    };

    const moduleKey = moduleMap[module];
    if (!moduleKey) return null;

    const today = new Date().toISOString().split('T')[0];

    const dataMap: Record<string, any> = {
      learning: {
        category,
        title: goal.title,
        source: '目标管理',
        start_date: today,
        end_date: goal.deadline || today,
        duration_hours: 0,
        progress,
        self_rating: 0,
        notes: goal.note || '',
      },
      travel: {
        category,
        destination: goal.title,
        country: '',
        province: '',
        city: '',
        district: '',
        start_date: today,
        end_date: goal.deadline || today,
        mood: 0,
        weather: '',
        highlights: '',
        reflections: goal.note || '',
      },
      mood: {
        category,
        date: today,
        score: 0,
        emotions: [],
        journal: goal.note || `目标：${goal.title}`,
      },
      health: {
        category,
        date: today,
        exercise: '',
        sleep: 0,
        water: 0,
        weight: 0,
        note: goal.note || `目标：${goal.title}`,
      },
      finance: {
        title: goal.title,
        category,
        target_amount: 0,
        current_amount: 0,
        completion: progress,
        mood: 0,
        deadline: goal.deadline || today,
        note: goal.note || '',
        date: today,
      },
      social: {
        name: goal.title,
        relationship: '目标关联',
        category,
        last_contact: today,
        notes: goal.note || '',
      },
      insights: {
        title: goal.title,
        category,
        source: '目标管理',
        date: today,
        content: goal.note || '',
      },
    };

    return api.create(moduleKey, dataMap[moduleKey]);
  };

  const syncLinkedTaskProgress = async (module: string, linkedId: number, progress: number) => {
    const moduleMap: Record<string, string> = {
      '学习成长': 'learning',
      '旅行日记': 'travel',
      '心情心态': 'mood',
      '健康习惯': 'health',
      '财务管理': 'finance',
      '社交人脉': 'social',
      '收获感悟': 'insights',
    };

    const moduleKey = moduleMap[module];
    if (!moduleKey) return;

    const updateData: Record<string, any> = {
      learning: { progress },
      finance: { completion: progress },
    };

    if (updateData[moduleKey]) {
      await api.update(moduleKey, linkedId, updateData[moduleKey]);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const { linked_module, linked_category, ...goalData } = formData;

      let createdGoal = (editing && editing.id)
        ? await api.update<Goal>('goals', editing.id, { ...goalData, linked_module, linked_category })
        : await api.create<Goal>('goals', { ...goalData, linked_module, linked_category });

      if (editing && editing.id) {
        show('更新成功！');
      } else {
        show('目标创建成功！');
      }

      if (linked_module && linked_category && !editing && createdGoal.id) {
        try {
          const linkedRecord = await createLinkedTask(linked_module, linked_category, createdGoal);
          if (linkedRecord && linkedRecord.id) {
            await api.update('goals', createdGoal.id, { linked_id: linkedRecord.id });
            show('关联任务创建成功！');
          }
        } catch (e) {
          console.error('Failed to create linked task:', e);
        }
      }

      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      show('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个目标？')) return;
    await api.delete('goals', id);
    show('已删除');
    refresh();
  };

  const toggleKR = async (goalId: number, path: number[]) => {
    await api.toggleKR(goalId, path);
    refresh();

    try {
      const goals = await api.list<Goal>('goals');
      const goal = goals.find(g => g.id === goalId);
      if (goal && goal.linked_module && goal.linked_id) {
        const { total, done } = countKeyResults(goal.key_results || []);
        const progress = total ? Math.round(done / total * 100) : 0;
        await syncLinkedTaskProgress(goal.linked_module, goal.linked_id, progress);
      }
    } catch (e) {
      console.error('Failed to sync linked task progress:', e);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: config.color + '20' }}>
            <Target className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.name}</h2>
            <p className="text-xs text-muted-foreground">{config.desc}</p>
          </div>
        </div>
        <Button onClick={() => handleAdd()} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 新增目标
        </Button>
      </div>

      {/* Goal Tree: Category Cards */}
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
              <Target className="w-8 h-8 mx-auto mb-1" style={{ color: config.color }} />
              <div className="text-xs font-bold">全部</div>
              <div className="text-[11px] text-muted-foreground">{goals.length} 条</div>
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
                  <Input value={catMgr.editingIndex.value} onChange={e => catMgr.setEditingIndex({ ...catMgr.editingIndex!, value: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); catMgr.confirmEdit(catMgr.editingIndex!.value); } if (e.key === 'Escape') catMgr.cancelEdit(); }}
                    className="flex-1 text-sm" autoFocus />
                ) : (
                  <span className="flex-1 text-sm">{cat}</span>
                )}
                <button onClick={() => catMgr.startEdit(idx)} className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => catMgr.deleteCategory(idx)} className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={catMgr.addCategory}><Plus className="h-3 w-3" /> 添加新分类</Button>
          </div>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <Target className="w-16 h-16 mb-3 opacity-50" style={{ color: config.color }} />
          <h3 className="text-base font-semibold text-foreground/80">
            {catMgr.selectedCategory ? `"${catMgr.selectedCategory}" 还没有目标` : '还没有目标'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">设定一个目标，把它拆解为可执行的关键结果吧！</p>
          {catMgr.selectedCategory && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => handleAdd(catMgr.selectedCategory!)}>
              <Plus className="h-3 w-3" /> 在"{catMgr.selectedCategory}"添加
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(g => {
            const { total, done } = countKeyResults(g.key_results || []);
            const pct = total ? Math.round(done / total * 100) : 0;
            return (
              <Card key={g.id} className="border-l-4 p-5 group relative overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer" style={{ borderLeftColor: config.color }}>
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => setDetailItem(g)}
                  >
                    <div className="text-base font-bold">{g.title}</div>
                    <Badge className={`mt-1 ${badgeColor(g.category)}`}>{g.category}</Badge>
                    {g.linked_module && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                        🔗 关联到 {g.linked_module}
                      </span>
                    )}
                    {g.linked_achievement_id && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                        🏆 关联成就：{achievementsMap[g.linked_achievement_id] || '...'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => { setEditing(g); setFormOpen(true); }}
                      title="编辑"
                      className="text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all rounded p-1.5 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      title="删除"
                      className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 截止日期：{formatDateFull(g.deadline) || '未设定'}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: config.color }} />
                </div>
                <div className="mt-1.5 text-xs font-bold text-muted-foreground">完成进度：{done}/{total}（{pct}%）</div>
                {(g.key_results as KeyResult[])?.length > 0 && (
                  <div className="mt-3">
                    <KeyResultTree
                      nodes={g.key_results as KeyResult[]}
                      goalId={g.id}
                      onToggle={toggleKR}
                    />
                  </div>
                )}
                {g.note && <div className="mt-3 text-xs italic text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {g.note}
                </div>}
                <div className="mt-3 flex items-center justify-end border-t border-border/50 pt-2.5">
                  <span
                    className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary cursor-pointer"
                    onClick={() => setDetailItem(g)}
                  >
                    <Eye className="h-3 w-3" /> 查看详情
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '新增'}目标`}
        fields={dynamicFields}
        initialData={editing}
        accentColor={config.color}
      />

      {/* Detail View */}
      <DetailView
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.title || '目标详情'}
        data={detailData}
        category={detailItem?.category}
        fields={detailFields}
        accentColor={config.color}
      />
      {ToastEl}
    </div>
  );
}

export default GoalsPage;
