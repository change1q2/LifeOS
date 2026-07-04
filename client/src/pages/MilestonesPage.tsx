import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimelineData, type TimelineEntry } from '../lib/hooks/useTimelineData';
import { useModuleData, useToast } from '../lib/hooks';
import { MODULES, SIDEBAR_ITEMS } from '../config/modules';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { formatDate } from '../lib/utils';
import type { Milestone } from '../types';

const config = MODULES.milestones;

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

interface YearMonthGroups {
  years: number[];
  data: Map<number, Map<number, TimelineEntry[]>>;
}

function groupByYearMonth(entries: TimelineEntry[]): YearMonthGroups {
  const data = new Map<number, Map<number, TimelineEntry[]>>();
  let minYear = Infinity;
  let maxYear = -Infinity;

  entries.forEach(entry => {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    if (!data.has(year)) {
      data.set(year, new Map());
    }
    const yearData = data.get(year)!;
    if (!yearData.has(month)) {
      yearData.set(month, []);
    }
    yearData.get(month)!.push(entry);

    minYear = Math.min(minYear, year);
    maxYear = Math.max(maxYear, year);
  });

  if (entries.length === 0) {
    const currentYear = new Date().getFullYear();
    minYear = currentYear;
    maxYear = currentYear;
  }

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  return { years, data };
}

export function MilestonesPage() {
  const navigate = useNavigate();
  const { entries, loading, error } = useTimelineData();
  const { data, create, update, delete: deleteItem } = useModuleData<Milestone>('milestones');
  const { show, ToastEl } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const toggleYear = (year: number) => {
    const newSet = new Set(collapsedYears);
    if (newSet.has(year)) {
      newSet.delete(year);
    } else {
      newSet.add(year);
    }
    setCollapsedYears(newSet);
  };

  const toggleMonth = (year: number, month: number) => {
    const key = `${year}-${month}`;
    const newSet = new Set(collapsedMonths);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setCollapsedMonths(newSet);
  };

  const filteredEntries = useMemo(() => {
    if (!selectedModule) return entries;
    return entries.filter(e => e.moduleKey === selectedModule);
  }, [entries, selectedModule]);

  const groupedEntries = useMemo(() => {
    return groupByYearMonth(filteredEntries);
  }, [filteredEntries]);

  const totalCount = filteredEntries.length;
  const completedCount = filteredEntries.filter(e => e.status === '已完成').length;
  const inProgressCount = filteredEntries.filter(e => e.status === '进行中').length;

  const moduleOptions = useMemo(() => {
    const moduleKeys = new Set(entries.map(e => e.moduleKey));
    return SIDEBAR_ITEMS.filter(item => moduleKeys.has(item.key) && item.key !== 'dashboard');
  }, [entries]);

  const handleSave = async (formData: any) => {
    try {
      formData.completed = formData.completed || false;
      formData.progress = formData.progress || 0;
      if (editing && editing.id) {
        await update(editing.id, formData);
        show('里程碑已更新！');
      } else {
        await create(formData);
        show('里程碑已创建！🚩');
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      show('保存失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个里程碑吗？')) return;
    await deleteItem(id);
    show('已删除');
  };

  const handleToggleComplete = async (item: Milestone) => {
    const newCompleted = !item.completed;
    const nowStr = new Date().toISOString().split('T')[0];
    await update(item.id ?? 0, {
      ...item,
      completed: newCompleted,
      completion_date: newCompleted ? nowStr : undefined,
      progress: newCompleted ? 100 : item.progress,
    });
    show(newCompleted ? '🎉 恭喜达成里程碑！' : '已取消完成状态');
  };

  const handleEdit = (item: Milestone) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleEntryClick = (entry: TimelineEntry) => {
    navigate(`/${entry.moduleKey}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{config.desc}</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          添加里程碑
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4" style={{ borderLeftColor: config.color }}>
          <div className="text-[11px] text-muted-foreground font-bold uppercase">总事件</div>
          <div className="text-3xl font-bold mt-1">{totalCount}</div>
        </Card>
        <Card className="p-4 border-l-4" style={{ borderLeftColor: '#10B981' }}>
          <div className="text-[11px] text-muted-foreground font-bold uppercase">已完成</div>
          <div className="text-3xl font-bold mt-1 text-emerald-500">{completedCount}</div>
        </Card>
        <Card className="p-4 border-l-4" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="text-[11px] text-muted-foreground font-bold uppercase">进行中</div>
          <div className="text-3xl font-bold mt-1 text-amber-500">{inProgressCount}</div>
        </Card>
        <Card className="p-4 border-l-4" style={{ borderLeftColor: '#8B5CF6' }}>
          <div className="text-[11px] text-muted-foreground font-bold uppercase">完成率</div>
          <div className="text-3xl font-bold mt-1 text-purple-500">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedModule === null ? 'default' : 'outline'}
          onClick={() => setSelectedModule(null)}
          size="sm"
          className="text-xs"
        >
          全部 ({entries.length})
        </Button>
        {moduleOptions.map(item => {
          const count = entries.filter(e => e.moduleKey === item.key).length;
          return (
            <Button
              key={item.key}
              variant={selectedModule === item.key ? 'default' : 'outline'}
              onClick={() => setSelectedModule(item.key)}
              size="sm"
              className="text-xs"
              style={{
                backgroundColor: selectedModule === item.key ? `${item.color}20` : undefined,
                color: selectedModule === item.key ? item.color : undefined,
              }}
            >
              {item.icon} {item.name} ({count})
            </Button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-indigo-200" />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">加载失败，请重试</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedEntries.years.map(year => {
              const yearData = groupedEntries.data.get(year);
              const isYearCollapsed = collapsedYears.has(year);
              const yearEntryCount = Array.from({ length: 12 }, (_, m) => yearData?.get(m)?.length || 0).reduce((a, b) => a + b, 0);

              return (
                <div key={year} className="space-y-2">
                  <button
                    onClick={() => toggleYear(year)}
                    className="relative flex items-center w-full text-left cursor-pointer group"
                  >
                    <div className="absolute left-10 -translate-x-1/2 w-5 h-5 rounded-full bg-indigo-500 border-4 border-white shadow-md transition-transform group-hover:scale-110" />
                    <div className="absolute left-14 transition-transform duration-200"
                      style={{ transform: isYearCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                    >
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <h2 className="ml-20 text-2xl font-bold text-slate-800 flex items-center gap-2">
                      {year}年
                      <span className="text-sm font-normal text-muted-foreground">({yearEntryCount} 件事)</span>
                    </h2>
                  </button>

                  {!isYearCollapsed && (
                    <div className="ml-20 space-y-4">
                      {Array.from({ length: 12 }, (_, monthIndex) => {
                        const monthEntries = yearData?.get(monthIndex) || [];
                        const isMonthCollapsed = collapsedMonths.has(`${year}-${monthIndex}`);

                        return (
                          <div key={monthIndex} className="space-y-3">
                            <button
                              onClick={() => monthEntries.length > 0 && toggleMonth(year, monthIndex)}
                              className={`relative flex items-center w-full text-left cursor-pointer transition-colors ${monthEntries.length > 0 ? 'hover:text-indigo-600' : ''}`}
                            >
                              <div className="absolute left-[-32px] -translate-x-1/2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: monthEntries.length > 0 ? '#6366F1' : '#D1D5DB' }}
                              />
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  {monthEntries.length > 0 && (
                                    <svg
                                      className="w-3 h-3 text-muted-foreground transition-transform duration-200"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      style={{ transform: isMonthCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                  <h3 className={`text-sm font-semibold ${monthEntries.length > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {MONTH_LABELS[monthIndex]}
                                  </h3>
                                </div>
                                {monthEntries.length > 0 && (
                                  <Badge className="text-[10px] bg-slate-100 text-slate-600">
                                    {monthEntries.length} 件事
                                  </Badge>
                                )}
                              </div>
                            </button>

                            {!isMonthCollapsed && (
                              monthEntries.length > 0 ? (
                                <div className="space-y-2 ml-4">
                                  {monthEntries.map(entry => (
                                    <Card
                                      key={`${entry.moduleKey}-${entry.itemId}`}
                                      className="cursor-pointer hover:shadow-md transition-all group border-l-2"
                                      style={{ borderLeftColor: entry.color }}
                                      onClick={() => handleEntryClick(entry)}
                                    >
                                      <div className="p-3 flex items-start gap-3">
                                        <div
                                          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
                                          style={{ backgroundColor: `${entry.color}15` }}
                                        >
                                          {entry.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                              className="text-[10px] font-medium"
                                              style={{ backgroundColor: `${entry.color}20`, color: entry.color }}
                                            >
                                              {entry.module}
                                            </Badge>
                                            {entry.status && (
                                              <Badge
                                                className="text-[10px] font-medium"
                                                style={{ backgroundColor: `${entry.statusColor}20`, color: entry.statusColor }}
                                              >
                                                {entry.status}
                                              </Badge>
                                            )}
                                            <span className="text-[10px] text-muted-foreground">
                                              {formatDate(entry.date)}
                                            </span>
                                          </div>
                                          <h4 className="font-semibold text-sm line-clamp-1">
                                            {entry.title}
                                          </h4>
                                          <p className="text-xs text-muted-foreground line-clamp-2">
                                            {entry.summary}
                                          </p>
                                        </div>

                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="ml-4 py-2 text-[11px] text-slate-300 italic">
                                  暂无记录
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? '编辑里程碑' : '添加新里程碑'}
      >
        <EntryForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSave}
          title={editing ? '编辑里程碑' : '添加新里程碑'}
          fields={config.fields}
          initialData={editing || {}}
          accentColor={config.color}
        />
      </Dialog>

      {ToastEl}
    </div>
  );
}