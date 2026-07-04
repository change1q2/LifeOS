import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, GripVertical, Flame, Eye } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DetailView } from '../components/ui/DetailView';
import { HEALTH_LOG_FIELDS } from '../config/modules';
import { formatDate, todayStr, badgeColor } from '../lib/utils';
import { useCategoryManager } from '../lib/useCategoryManager';
import type { HealthHabit, HealthLog } from '../types';

const COLOR = '#14B8A6';

export function HealthPage() {
  const { show, ToastEl } = useToast();
  const [habits, setHabits] = useState<HealthHabit[]>([]);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);
  const [editingHabit, setEditingHabit] = useState<HealthHabit | null>(null);
  const [detailLog, setDetailLog] = useState<HealthLog | null>(null);

  // Tree category management for health logs
  const catMgr = useCategoryManager({
    storageKey: 'lifeos_health_categories',
    defaults: ['运动', '饮食', '睡眠', '心理健康', '体重管理', '体检记录', '其他'],
    fallbackCategory: '其他',
    icons: ['🏃', '🥗', '😴', '🧘', '⚖️', '🏥', '✨'],
    allIcon: '💪',
    moduleName: 'health_logs',
    dialogTitle: '管理健康分类',
    sectionTitle: '健康分类',
  });

  const refresh = async () => {
    setLoading(true);
    const [habitData, logData] = await Promise.all([
      api.listHabits<HealthHabit>(),
      api.listLogs<HealthLog>(),
    ]);
    setHabits(habitData);
    setLogs(logData);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filteredLogs = catMgr.getFilteredData(logs);
  const catCounts = catMgr.getCategoryCounts(logs);

  // Dynamic fields for log form: inject category options from catMgr
  const dynamicLogFields = HEALTH_LOG_FIELDS.map(f => {
    if (f.key === 'category') {
      return { ...f, options: catMgr.categories };
    }
    return f;
  });

  // Generate last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const t = new Date();
    t.setDate(t.getDate() - i);
    days.push({
      date: t.toISOString().split('T')[0],
      label: `${t.getMonth() + 1}/${t.getDate()}`,
      weekday: '日一二三四五六'[t.getDay()],
      isToday: i === 0,
    });
  }

  const toggleHabit = async (habitId: number, date: string) => {
    const result = await api.toggleHabit(habitId, date);
    show(result.done ? '打卡成功！💪' : '已取消打卡');
    refresh();
  };

  const addHabit = async (data: any) => {
    // No updateHabit API exists; editing a habit is not supported yet.
    if (editingHabit) {
      show('暂不支持编辑习惯,请删除后重新创建');
      setHabitFormOpen(false);
      setEditingHabit(null);
      return;
    }
    await api.createHabit(data);
    show('习惯已添加！');
    setHabitFormOpen(false);
    refresh();
  };

  const deleteHabit = async (id: number) => {
    if (!confirm('确定删除这个习惯？')) return;
    await api.deleteHabit(id);
    show('已删除');
    refresh();
  };

  const calcStreak = (records: string[]) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const t = new Date();
      t.setDate(t.getDate() - i);
      const ds = t.toISOString().split('T')[0];
      if (records.includes(ds)) streak++;
      else break;
    }
    return streak;
  };

  const handleLogSave = async (formData: any) => {
    try {
      if (editingLog) {
        // Update existing log via generic update API
        await api.update('health_logs', editingLog.id, formData);
        show('更新成功！');
      } else {
        await api.createLog(formData);
        show('健康记录已保存！💪');
      }
      setLogFormOpen(false);
      setEditingLog(null);
      refresh();
    } catch (err) {
      show('保存失败');
    }
  };

  const deleteLog = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await api.deleteLog(id);
    show('已删除');
    refresh();
  };

  const habitFields = [
    { key: 'habitName', label: '习惯名称', type: 'text' as const, required: true, placeholder: '如：每日阅读30分钟' },
    { key: 'frequency', label: '频率', type: 'select' as const, options: ['每日', '每周', '自定义'] },
  ];

  const handleAddLog = (cat?: string) => {
    setEditingLog(null);
    if (cat) catMgr.selectCategory(cat);
    setLogFormOpen(true);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: COLOR + '20' }}>💪</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">健康习惯</h2>
            <p className="text-xs text-muted-foreground">身体是革命的本钱</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setHabitFormOpen(true)} style={{ backgroundColor: COLOR }}>
            <Plus className="h-4 w-4" /> 习惯
          </Button>
          <Button onClick={() => handleAddLog()} style={{ backgroundColor: COLOR }}>
            <Plus className="h-4 w-4" /> 健康记录
          </Button>
        </div>
      </div>

      {/* Category Cards */}
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
            style={{ ringColor: COLOR }}
            onClick={() => catMgr.selectCategory(null)}
          >
            <div className="p-3 text-center">
              <div className="text-2xl mb-1">{catMgr.config.allIcon}</div>
              <div className="text-xs font-bold">全部</div>
              <div className="text-[11px] text-muted-foreground">{logs.length} 条</div>
            </div>
          </Card>
          {catMgr.categories.map((cat, idx) => {
            const icon = catMgr.getCategoryIcon(idx);
            const count = catCounts[cat] || 0;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === cat ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                style={{ ringColor: COLOR }}
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

      {/* Habits — not affected by category filter */}
      <Card className="mb-4 p-5">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">✅ 习惯打卡（近7天）</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : habits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">还没有习惯，添加一个开始打卡吧！</div>
        ) : (
          <>
            <div className="mb-2 grid items-center gap-3 text-[11px] text-muted-foreground" style={{ gridTemplateColumns: '1fr auto' }}>
              <span>习惯</span>
              <div className="flex gap-1.5">
                {days.map(d => (
                  <span key={d.date} className="w-8 text-center">
                    {d.label}<br /><span className="text-muted-foreground/60">周{d.weekday}</span>
                  </span>
                ))}
              </div>
            </div>
            {habits.map(h => {
              const streak = calcStreak(h.records);
              return (
                <div key={h.id} className="group flex items-center gap-3 border-t border-border/50 py-2.5" style={{ gridTemplateColumns: '1fr auto' }}>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{h.habit_name}</span>
                    {streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                        <Flame className="h-3 w-3" /> {streak}天
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-0.5">
                      <button
                        onClick={() => deleteHabit(h.id)}
                        title="删除习惯"
                        className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {days.map(d => {
                      const done = h.records.includes(d.date);
                      return (
                        <button
                          key={d.date}
                          onClick={() => toggleHabit(h.id, d.date)}
                          className={`h-8 w-8 rounded-lg border-2 text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
                            done ? 'border-teal-500 bg-teal-500 text-white' : 'border-muted-foreground/20 text-muted-foreground hover:border-teal-400'
                          } ${d.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          title={d.date}
                        >
                          {d.weekday}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Card>

      {/* Health Logs — filtered by selected category */}
      <Card className="p-5">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">📊 健康记录{catMgr.selectedCategory ? ` · ${catMgr.selectedCategory}` : ''}</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : filteredLogs.length === 0 ? (
          <Card className="py-16 text-center border-0">
            <div className="text-5xl mb-3 opacity-50">💪</div>
            <h3 className="text-base font-semibold text-foreground/80">
              {catMgr.selectedCategory ? `"${catMgr.selectedCategory}" 还没有记录` : '还没有健康记录'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">记一笔，关注身体状态</p>
            {catMgr.selectedCategory && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => handleAddLog(catMgr.selectedCategory!)}>
                <Plus className="h-3 w-3" /> 在"{catMgr.selectedCategory}"添加
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {filteredLogs.map(l => {
              const stats = [
                l.exercise && { label: '运动', value: l.exercise, color: 'text-emerald-600' },
                l.sleep > 0 && { label: '睡眠', value: `${l.sleep}h`, color: 'text-indigo-600' },
                l.water > 0 && { label: '饮水', value: `${l.water} 杯`, color: 'text-sky-600' },
                l.weight > 0 && { label: '体重', value: `${l.weight} kg`, color: 'text-rose-600' },
              ].filter(Boolean) as { label: string; value: string; color: string }[];
              return (
                <Card
                  key={l.id}
                  className="group border-l-4 relative overflow-hidden hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: COLOR }}
                >
                  <div className="p-3.5 cursor-pointer" onClick={() => setDetailLog(l)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {l.category && <Badge className={badgeColor(l.category)}>{l.category}</Badge>}
                          <span className="text-[11px] text-muted-foreground">📅 {formatDate(l.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingLog(l); setLogFormOpen(true); }}
                          title="编辑"
                          className="text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all rounded p-1.5 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteLog(l.id); }}
                          title="删除"
                          className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {stats.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                        {stats.map(s => (
                          <span key={s.label} className="flex items-center gap-1">
                            <span className="text-muted-foreground">{s.label}</span>
                            <span className={`font-semibold ${s.color}`}>{s.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {l.note && (
                      <div className="mt-2 text-[12px] text-muted-foreground line-clamp-2">{l.note}</div>
                    )}
                    <div className="mt-2.5 flex items-center justify-end border-t border-border/40 pt-2">
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
      </Card>

      {/* Habit Form */}
      <EntryForm
        open={habitFormOpen}
        onClose={() => { setHabitFormOpen(false); setEditingHabit(null); }}
        onSave={addHabit}
        title={`${editingHabit ? '编辑' : '添加'}习惯`}
        fields={habitFields}
        initialData={editingHabit || undefined}
        accentColor={COLOR}
      />

      {/* Health Log Form — now using EntryForm */}
      <EntryForm
        open={logFormOpen}
        onClose={() => { setLogFormOpen(false); setEditingLog(null); }}
        onSave={handleLogSave}
        title={`${editingLog ? '编辑' : '新增'}健康记录`}
        fields={dynamicLogFields}
        initialData={editingLog || { date: todayStr() }}
        accentColor={COLOR}
      />

      {/* Detail View */}
      <DetailView
        open={!!detailLog}
        onClose={() => setDetailLog(null)}
        title={detailLog ? `${formatDate(detailLog.date)} 健康记录` : '健康记录详情'}
        data={detailLog || {}}
        category={detailLog?.category}
        fields={HEALTH_LOG_FIELDS}
        accentColor={COLOR}
      />

      {ToastEl}
    </div>
  );
}
