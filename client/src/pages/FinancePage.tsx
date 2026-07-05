import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, GripVertical, Target, TrendingUp, Sparkles, CheckCircle2, Eye, Wallet, Smile, Meh, Frown, Heart, BarChart3, Trophy } from 'lucide-react';
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
import { FINANCE_FIELDS } from '../config/modules';
import { formatDate, todayStr, badgeColor } from '../lib/utils';
import { useCategoryManager } from '../lib/useCategoryManager';
import type { Finance } from '../types';
import type { LucideIcon } from 'lucide-react';

const COLOR = '#8B5CF6';

const moodIcons: Record<number, string> = {
  0: '😐',
  1: '😞',
  2: '😐',
  3: '😊',
  4: '😊',
  5: '❤️',
};

const moodLabels: Record<number, string> = {
  0: '未填写',
  1: '焦虑',
  2: '平淡',
  3: '稳定',
  4: '乐观',
  5: '兴奋',
};

// Finance-specific category config (module-level so it's stable across re-renders)
const FINANCE_CATEGORY_CONFIG = {
  storageKey: 'lifeos_finance_categories',
  defaults: ['应急基金', '长期储蓄', '旅行基金', '学习投资', '退休规划', '房屋首付', '梦想基金', '其他'],
  fallbackCategory: '其他',
  icons: ['🛡️', '🏦', '✈️', '🎓', '🏆', '🏠', '✨', '📦'],
  allIcon: '💰',
  moduleName: 'finance',
  dialogTitle: '管理财务目标分类',
  sectionTitle: '财务目标分类',
} as const;

// Legacy categories from the old "income/expense" system. If user still has these in
// localStorage, auto-migrate to the new financial-goal defaults on first mount.
const LEGACY_FINANCE_CATEGORIES = ['日常消费', '餐饮', '交通', '住房', '购物', '娱乐', '投资理财', '收入', '其他'];
const MIGRATION_FLAG = 'lifeos_finance_categories_migrated_v2';

function migrateLegacyFinanceCategories() {
  try {
    if (localStorage.getItem(MIGRATION_FLAG) === '1') return; // already migrated
    const raw = localStorage.getItem(FINANCE_CATEGORY_CONFIG.storageKey);
    if (!raw) { localStorage.setItem(MIGRATION_FLAG, '1'); return; }
    const cats = JSON.parse(raw) as string[];
    const hasLegacy = cats.some(c => LEGACY_FINANCE_CATEGORIES.includes(c));
    if (hasLegacy) {
      localStorage.setItem(FINANCE_CATEGORY_CONFIG.storageKey, JSON.stringify([...FINANCE_CATEGORY_CONFIG.defaults]));
    }
    localStorage.setItem(MIGRATION_FLAG, '1');
  } catch {}
}

export function FinancePage() {
  // Run legacy migration BEFORE the hook reads from localStorage, so the hook sees the new defaults.
  migrateLegacyFinanceCategories();

  const { show, ToastEl } = useToast();
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Finance | null>(null);
  const [detailItem, setDetailItem] = useState<Finance | null>(null);

  const catMgr = useCategoryManager(FINANCE_CATEGORY_CONFIG);

  const refresh = async () => {
    setLoading(true);
    const data = await api.list<Finance>('finance');
    setFinances(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = catMgr.getFilteredData(finances);
  const catCounts = catMgr.getCategoryCounts(finances);

  // Dynamic fields: inject category options from catMgr + auto-compute completion
  const dynamicFields = FINANCE_FIELDS.map(f => {
    if (f.key === 'category') {
      return { ...f, options: catMgr.categories };
    }
    return f;
  });

  const handleAdd = (cat?: string) => {
    setEditing(null);
    if (cat) catMgr.selectCategory(cat);
    setFormOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      // Auto-compute completion if both amounts present
      if (formData.target_amount && formData.current_amount !== undefined) {
        const target = Number(formData.target_amount) || 0;
        const current = Number(formData.current_amount) || 0;
        if (target > 0) {
          const completion = Math.min(100, Math.round((current / target) * 100));
          formData.completion = completion;
        }
      }

      if (editing && editing.id) {
        await api.update('finance', editing.id, formData);
        show('目标已更新！');
        } else {
          await api.create('finance', formData);
          show('目标创建成功！');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      show('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个财务目标？')) return;
    await api.delete('finance', id);
    show('已删除');
    refresh();
  };

  // Summary stats
  const totalTarget = finances.reduce((s, f) => s + Number(f.target_amount || 0), 0);
  const totalCurrent = finances.reduce((s, f) => s + Number(f.current_amount || 0), 0);
  const totalProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const completedCount = finances.filter(f => Number(f.current_amount) >= Number(f.target_amount) && f.target_amount > 0).length;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: COLOR + '20' }}>
            <Wallet className="w-5 h-5" style={{ color: COLOR }} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">财务管理</h2>
            <p className="text-xs text-muted-foreground">追踪每一个财务目标的进度与心情</p>
          </div>
        </div>
        <Button onClick={() => handleAdd()} style={{ backgroundColor: COLOR }}>
          <Plus className="h-4 w-4" /> 新建目标
        </Button>
      </div>

      {/* Category Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground/70">{catMgr.config.sectionTitle}</h3>
          <Button variant="outline" size="sm" onClick={() => { catMgr.refreshCategories(); catMgr.setManageOpen(true); }}>
            <Edit3 className="h-3 w-3" /> 管理分类
          </Button>
        </div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === null ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
            style={{ '--tw-ring-color': COLOR } as React.CSSProperties}
            onClick={() => catMgr.selectCategory(null)}
          >
            <div className="p-3 text-center">
              <Wallet className="w-8 h-8 mx-auto mb-1" style={{ color: COLOR }} />
              <div className="text-xs font-bold">全部目标</div>
              <div className="text-[11px] text-muted-foreground">{finances.length} 个</div>
            </div>
          </Card>
          {catMgr.categories.map((cat, idx) => {
            const icon = catMgr.getCategoryIcon(idx);
            const count = catCounts[cat] || 0;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === cat ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                style={{ '--tw-ring-color': COLOR } as React.CSSProperties}
                onClick={() => catMgr.toggleCategory(cat)}
              >
                <div className="p-3 text-center">
                  <CategoryIcon emoji={icon} className="w-8 h-8 mx-auto mb-1" style={{ color: COLOR }} />
                  <div className="text-xs font-bold leading-tight">{cat}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{count} 个</div>
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
              <button
                onClick={() => catMgr.startEdit(idx)}
                title="编辑分类名"
                className="text-muted-foreground/60 hover:text-foreground hover:bg-muted p-1 rounded cursor-pointer transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => catMgr.deleteCategory(idx)}
                title="删除分类"
                className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer transition-colors"
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

      {/* Quick Stats Bar */}
      {finances.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <Card className="p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Target className="h-3.5 w-3.5" />
              <span>目标总数</span>
            </div>
            <div className="text-xl font-extrabold">{finances.length}</div>
          </Card>
          <Card className="p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>已完成</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-500">{completedCount}</div>
          </Card>
          <Card className="p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>总进度</span>
            </div>
            <div className="text-xl font-extrabold" style={{ color: COLOR }}>{totalProgress}%</div>
          </Card>
          <Card className="p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>累计金额</span>
            </div>
            <div className="text-base font-extrabold leading-tight">¥{totalCurrent.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal"> / ¥{totalTarget.toLocaleString()}</span></div>
          </Card>
        </div>
      )}

      {/* Financial Goals List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">加载中...</Card>
        ) : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <Wallet className="w-16 h-16 mb-3 opacity-50" style={{ color: COLOR }} />
            <h3 className="text-base font-semibold text-foreground/80">
              {catMgr.selectedCategory ? `"${catMgr.selectedCategory}" 还没有目标` : '还没有财务目标'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">从设定一个财务目标开始，让每一笔积累都有意义</p>
            {catMgr.selectedCategory && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => handleAdd(catMgr.selectedCategory!)}>
                <Plus className="h-3 w-3" /> 在"{catMgr.selectedCategory}"添加
              </Button>
            )}
          </Card>
        ) : (
          filtered.map(item => {
            const target = Number(item.target_amount) || 0;
            const current = Number(item.current_amount) || 0;
            const completion = item.completion ?? (target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0);
            const isDone = target > 0 && current >= target;
            const mood = Number(item.mood) || 0;
            const catIcon = catMgr.getCategoryIcon(catMgr.categories.indexOf(item.category));

            return (
              <Card key={item.id} className="group p-4 transition-all hover:shadow-md">
                {/* Top: Title + Category + Actions */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLOR + '15' }}
                  >
                    {isDone ? <Trophy className="w-5 h-5" style={{ color: COLOR }} /> : <CategoryIcon emoji={catIcon || '💰'} className="w-5 h-5" style={{ color: COLOR }} />}
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setDetailItem(item)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[15px] font-bold leading-tight truncate">{item.title}</h4>
                      <Badge className={badgeColor(item.category)}>{item.category}</Badge>
                      {isDone && <Badge className="bg-emerald-100 text-emerald-700">✓ 已达成</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      记录于 {formatDate(item.date || item.created_at)}
                      {item.deadline && ` · 目标 ${formatDate(item.deadline)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(item); setFormOpen(true); }}
                      title="编辑"
                      className="text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all rounded p-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      title="删除"
                      className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle: Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs text-muted-foreground">
                      进度
                      <span className="ml-2 text-sm font-bold" style={{ color: isDone ? '#10B981' : COLOR }}>
                        ¥{current.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> / ¥{target.toLocaleString()}</span>
                    </div>
                    <div className="text-sm font-extrabold" style={{ color: isDone ? '#10B981' : COLOR }}>
                      {completion}%
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${completion}%`,
                        background: isDone
                          ? 'linear-gradient(to right, #10B981, #34D399)'
                          : `linear-gradient(to right, ${COLOR}, #A78BFA)`,
                      }}
                    />
                  </div>
                </div>

                {/* Bottom: Mood + Completion + Note */}
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Mood */}
                  <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
                    <span className="text-lg">{moodIcons[mood] || '😐'}</span>
                    <span className="text-[11px] font-medium text-foreground/80">{moodLabels[mood]}</span>
                  </div>

                  {/* Completion rate (manual) */}
                  {item.completion !== undefined && item.completion > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                      <BarChart3 className="w-3 h-3" />
                      <span className="text-[11px] font-medium">自我完成度 {item.completion}%</span>
                    </div>
                  )}

                  {/* Note */}
                  {item.note && (
                    <div className="flex-1 min-w-[200px] text-[12px] text-muted-foreground italic border-l-2 border-border/50 pl-2.5">
                      {item.note}
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-end border-t border-border/40 pt-2">
                  <span
                    className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary cursor-pointer"
                    onClick={() => setDetailItem(item)}
                  >
                    <Eye className="h-3 w-3" /> 查看详情
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* EntryForm */}
      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '新建'}财务目标`}
        fields={dynamicFields}
        initialData={editing ? { ...editing } : { date: todayStr() }}
        accentColor={COLOR}
      />

      {/* Detail View */}
      <DetailView
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.title || '财务目标详情'}
        data={detailItem || {}}
        category={detailItem?.category}
        fields={FINANCE_FIELDS}
        accentColor={COLOR}
      />

      {ToastEl}
    </div>
  );
}
