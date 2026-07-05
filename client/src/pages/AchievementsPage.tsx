import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Link2, Unlink, ChevronDown, ChevronRight, Lock, Unlock, BookOpen, Trophy, ExternalLink, Plane, Moon, Target, Dumbbell, Wallet, Users, Lightbulb, Star, Smile, Meh, Frown, Heart, LayoutDashboard, Download } from 'lucide-react';
import { useModuleData, useToast } from '../lib/hooks';
import { api } from '../lib/api';
import { MODULES, getModuleCategories } from '../config/modules';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { formatDate } from '../lib/utils';
import type { Achievement, Learning, Travel, Mood, Goal, HealthLog, Finance, Social, Insight } from '../types';

const config = MODULES.achievements;

// SIDEBAR_ITEMS minus dashboard(总览仪表盘) and achievements(成就墙) = default module parents
const MODULE_ORDER = ['学习成长', '旅行日记', '心情心态', '目标管理', '健康习惯', '财务管理', '社交人脉', '收获感悟', '手动成就'];

const MODULE_ICONS: Record<string, string> = {
  '学习成长': '📚', '旅行日记': '✈️', '心情心态': '🌙', '目标管理': '🎯',
  '健康习惯': '💪', '财务管理': '💰', '社交人脉': '🤝',
  '收获感悟': '💡', '手动成就': '🏆',
};

const MODULE_COLORS: Record<string, string> = {
  '学习成长': '#0EA5E9', '旅行日记': '#F97316', '心情心态': '#EC4899', '目标管理': '#10B981',
  '健康习惯': '#14B8A6', '财务管理': '#8B5CF6', '社交人脉': '#06B6D4',
  '收获感悟': '#F43F5E', '手动成就': '#F59E0B',
};

// Module key -> route path
const MODULE_ROUTES: Record<string, string> = {
  learning: '/learning',
  travel: '/travel',
  mood: '/mood',
  goals: '/goals',
  health: '/health',
  finance: '/finance',
  social: '/social',
  insights: '/insights',
};

// Module key -> Chinese name
const MODULE_KEY_NAME: Record<string, string> = {
  learning: '学习成长',
  travel: '旅行日记',
  mood: '心情心态',
  goals: '目标管理',
  health: '健康习惯',
  finance: '财务管理',
  social: '社交人脉',
  insights: '收获感悟',
};

// ID offset for each module (negative IDs to avoid collision with manual achievements)
const MODULE_ID_OFFSET: Record<string, number> = {
  learning: 1000000,
  travel: 2000000,
  mood: 3000000,
  goals: 4000000,
  health: 5000000,
  finance: 6000000,
  social: 7000000,
  insights: 8000000,
};

interface TreeAchievement {
  id: number;
  title: string;
  module: string;
  category: string;
  subcategory: string;
  source_id: number | null | undefined;
  source_module?: string;
  source_title?: string;
  parent_id: number | null;
  locked: boolean;
  date?: string;
  description: string;
  feeling?: string;
  created_at?: string;
  children: TreeAchievement[];
  depth: number;
  isFromModule: boolean;
  progress?: number;
}

const MOOD_ICONS = [null, Frown, Meh, Meh, Smile, Heart];

// ========== Module data -> Achievement converters ==========

function convertLearning(items: Learning[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.learning + id),
      title: item.title || '未命名学习',
      module: '学习成长',
      category: item.category || '未分类',
      subcategory: item.source || '',
      source_id: id,
      source_module: 'learning',
      source_title: item.title,
      parent_id: null,
      locked: false,
      date: item.end_date || item.start_date || item.created_at,
      description: item.notes || '',
      feeling: item.self_rating ? `${item.self_rating}分` : '',
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
      progress: item.progress,
    };
  });
}

function convertTravel(items: Travel[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.travel + id),
      title: `${item.destination}旅行`,
      module: '旅行日记',
      category: item.category || '未分类',
      subcategory: [item.country, item.city].filter(Boolean).join(' · ') || '',
      source_id: id,
      source_module: 'travel',
      source_title: item.destination,
      parent_id: null,
      locked: false,
      date: item.start_date || item.created_at,
      description: item.highlights || (item.highlights_blocks?.map((b: any) => b.type === 'text' ? b.value : '').join(' ') || ''),
      feeling: '',
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
    };
  });
}

function convertMood(items: Mood[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.mood + id),
      title: `${formatDate(item.date)} 心情记录`,
      module: '心情心态',
      category: item.emotions?.[0] || '日常心情',
      subcategory: item.emotions?.join(', ') || '',
      source_id: id,
      source_module: 'mood',
      source_title: '心情记录',
      parent_id: null,
      locked: false,
      date: item.date,
      description: item.journal || '',
      feeling: '',
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
    };
  });
}

function convertGoals(items: Goal[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    const krs = item.key_results || [];
    const doneCount = krs.filter((kr: any) => kr.done).length;
    const progress = krs.length > 0 ? Math.round((doneCount / krs.length) * 100) : 0;
    return {
      id: -(MODULE_ID_OFFSET.goals + id),
      title: item.title,
      module: '目标管理',
      category: item.category || '未分类',
      subcategory: krs.length > 0 ? `${doneCount}/${krs.length} 关键结果` : '',
      source_id: id,
      source_module: 'goals',
      source_title: item.title,
      parent_id: null,
      locked: false,
      date: item.deadline || item.created_at,
      description: item.note || '',
      feeling: progress === 100 ? '已达成' : (progress > 0 ? `进度 ${progress}%` : ''),
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
      progress,
    };
  });
}

function convertHealth(items: HealthLog[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.health + id),
      title: item.exercise || `${item.category}记录`,
      module: '健康习惯',
      category: item.category || '未分类',
      subcategory: '',
      source_id: id,
      source_module: 'health',
      source_title: item.exercise || item.category,
      parent_id: null,
      locked: false,
      date: item.date,
      description: item.note || '',
      feeling: [item.sleep ? `睡眠${item.sleep}h` : '', item.water ? `饮水${item.water}杯` : ''].filter(Boolean).join(' · '),
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
    };
  });
}

function convertFinance(items: Finance[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.finance + id),
      title: item.title,
      module: '财务管理',
      category: item.category || '未分类',
      subcategory: `\u00A5${item.current_amount} / \u00A5${item.target_amount}`,
      source_id: id,
      source_module: 'finance',
      source_title: item.title,
      parent_id: null,
      locked: false,
      date: item.date || item.created_at,
      description: item.note || '',
      feeling: '',
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
      progress: item.completion,
    };
  });
}

function convertSocial(items: Social[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.social + id),
      title: item.name,
      module: '社交人脉',
      category: item.category || '未分类',
      subcategory: item.relationship || '',
      source_id: id,
      source_module: 'social',
      source_title: item.name,
      parent_id: null,
      locked: false,
      date: item.last_contact || item.created_at,
      description: item.notes || '',
      feeling: '',
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
    };
  });
}

function convertInsights(items: Insight[]): TreeAchievement[] {
  return items.map((item, index) => {
    const id = item.id ?? index;
    return {
      id: -(MODULE_ID_OFFSET.insights + id),
      title: item.title,
      module: '收获感悟',
      category: item.category || '未分类',
      subcategory: item.source || '',
      source_id: id,
      source_module: 'insights',
      source_title: item.title,
      parent_id: null,
      locked: false,
      date: item.date || item.created_at,
      description: item.content || '',
      feeling: '',
      created_at: item.created_at,
      children: [], depth: 0, isFromModule: true,
    };
  });
}

export function AchievementsPage() {
  const navigate = useNavigate();

  // Fetch all module data
  const learningData = useModuleData<Learning>('learning');
  const travelData = useModuleData<Travel>('travel');
  const moodData = useModuleData<Mood>('mood');
  const goalsData = useModuleData<Goal>('goals');
  const healthData = useModuleData<HealthLog>('health');
  const financeData = useModuleData<Finance>('finance');
  const socialData = useModuleData<Social>('social');
  const insightsData = useModuleData<Insight>('insights');
  const manualData = useModuleData<Achievement>('achievements');

  const { show, ToastEl } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TreeAchievement | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(MODULE_ORDER));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkingTarget, setLinkingTarget] = useState<TreeAchievement | null>(null);

  const manualFields = MODULES.achievements.fields;
  const todayStr = () => new Date().toISOString().split('T')[0];

  const loading = learningData.loading || travelData.loading || moodData.loading ||
    goalsData.loading || healthData.loading || financeData.loading ||
    socialData.loading || insightsData.loading || manualData.loading;

  // Combine all module data + manual achievements
  const combinedData = useMemo<TreeAchievement[]>(() => {
    const manual: TreeAchievement[] = manualData.data.map(a => ({
      ...a,
      id: a.id ?? Date.now(),
      children: [],
      depth: 0,
      isFromModule: false,
    }));

    return [
      ...manual,
      ...convertLearning(learningData.data),
      ...convertTravel(travelData.data),
      ...convertMood(moodData.data),
      ...convertGoals(goalsData.data),
      ...convertHealth(healthData.data),
      ...convertFinance(financeData.data),
      ...convertSocial(socialData.data),
      ...convertInsights(insightsData.data),
    ];
  }, [manualData.data, learningData.data, travelData.data, moodData.data, goalsData.data, healthData.data, financeData.data, socialData.data, insightsData.data]);

  // refresh only manual achievements (module data doesn't change from this page)
  const refresh = manualData.refresh;

  const handleAdd = () => {
    setEditing({
      id: 0, title: '', module: '手动成就', category: '', subcategory: '',
      source_id: null, source_module: '', source_title: '',
      parent_id: null, locked: false,
      date: todayStr(), description: '', feeling: '',
      created_at: todayStr(),
      children: [], depth: 0, isFromModule: false,
    });
    setFormOpen(true);
  };

  const handleEdit = (item: TreeAchievement) => {
    setEditing(item);
    setFormOpen(true);
  };

  // Click handler: module items navigate to source, manual items open edit
  const handleNodeClick = (node: TreeAchievement) => {
    if (node.isFromModule && node.source_module && MODULE_ROUTES[node.source_module]) {
      navigate(MODULE_ROUTES[node.source_module]);
    } else {
      handleEdit(node);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editing!.id) {
        await api.update('achievements', editing!.id, formData);
        show('更新成功！');
      } else {
        await api.create('achievements', formData);
        show('记录成功！');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch {
      show('保存失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条成就记录吗？')) return;
    const children = manualData.data.filter(a => a.parent_id === id);
    for (const child of children) {
      const childId = child.id ?? 0;
      if (childId) await api.update('achievements', childId, { ...child, parent_id: null });
    }
    await api.delete('achievements', id);
    show('已删除');
    refresh();
  };

  const toggleLocked = async (item: TreeAchievement) => {
    const itemId = item.id ?? 0;
    if (itemId) await api.update('achievements', itemId, { ...item, locked: !item.locked });
    refresh();
  };

  const toggleModule = (module: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Build tree structure (only manual achievements have parent-child)
  const buildTree = (): TreeAchievement[] => {
    const roots: TreeAchievement[] = [];
    const itemMap = new Map<number, TreeAchievement>();

    combinedData.forEach(a => {
      itemMap.set(a.id, { ...a, children: [], depth: 0 });
    });

    combinedData.forEach(a => {
      const node = itemMap.get(a.id)!;
      if (a.parent_id && itemMap.has(a.parent_id)) {
        const parent = itemMap.get(a.parent_id)!;
        parent.children.push(node);
        node.depth = parent.depth + 1;
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Group roots by module -> by category
  const groupByModuleAndCategory = (roots: TreeAchievement[]) => {
    const grouped: Record<string, TreeAchievement[]> = {};
    roots.forEach(r => {
      const mod = r.module || '手动成就';
      if (!grouped[mod]) grouped[mod] = [];
      grouped[mod].push(r);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const ia = MODULE_ORDER.indexOf(a);
        const ib = MODULE_ORDER.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
      .map(([module, items]) => {
        const color = MODULE_COLORS[module] || '#6B7280';
        const icon = MODULE_ICONS[module] || '🏆';

        // Get category list for this module
        let categoryList: string[] = [];
        if (module === '学习成长') {
          try {
            const raw = localStorage.getItem('lifeos_skill_categories');
            if (raw) categoryList = JSON.parse(raw);
          } catch {}
        } else {
          categoryList = getModuleCategories(module);
        }

        // Group items by category
        const categoryGroups: Record<string, TreeAchievement[]> = {};
        items.forEach(item => {
          const cat = item.category || '未分类';
          if (!categoryGroups[cat]) categoryGroups[cat] = [];
          categoryGroups[cat].push(item);
        });

        // Sort categories
        const sortedCategories = Object.entries(categoryGroups).sort(([a], [b]) => {
          const ia = categoryList.indexOf(a);
          const ib = categoryList.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        return {
          module,
          color,
          icon,
          totalCount: items.length,
          categories: sortedCategories.map(([cat, catItems]) => ({
            name: cat,
            count: catItems.length,
            items: catItems,
          })),
        };
      });
  };

  const moduleGroups = useMemo(() => {
    const tree = buildTree();
    return groupByModuleAndCategory(tree);
  }, [combinedData]);

  // Open parent-link dialog (only for manual achievements)
  const openLink = (item: TreeAchievement) => {
    if (item.locked) {
      show('已锁定，不允许移动到其他父成就');
      return;
    }
    setLinkingTarget(item);
    setLinkDialogOpen(true);
  };

  const handleLinkParent = async (parentId: number | null) => {
    if (!linkingTarget) return;
    const targetId = linkingTarget.id ?? 0;
    if (targetId) await api.update('achievements', targetId, { ...linkingTarget, parent_id: parentId });
    show(parentId ? '已链接到父成就' : '已解除父级链接');
    setLinkDialogOpen(false);
    setLinkingTarget(null);
    refresh();
  };

  // Lock background color helper
  const lockBg = (node: TreeAchievement) => {
    const baseColor = MODULE_COLORS[node.module] || '#F59E0B';
    if (node.locked) return baseColor + '70';
    if (node.parent_id) return baseColor + '20';
    if (node.isFromModule) return baseColor + '15';
    return baseColor + '40';
  };

  // Mind map node - recursive
  const renderMindNode = (node: TreeAchievement, isLast: boolean) => {
    const hasChildren = node.children.length > 0;
    const isRoot = node.depth === 0;
    const depth = node.depth;
    const indent = depth * 48;
    const color = MODULE_COLORS[node.module] || '#F59E0B';

    return (
      <div key={node.id} className="relative">
        <div
          className="group flex items-start gap-3 py-2 relative"
          style={{ marginLeft: indent }}
        >
          {/* Connection lines */}
          {depth > 0 && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: -36, top: 22, width: 36, height: 2,
                background: `linear-gradient(to right, transparent, ${color}80)`,
              }}
            />
          )}
          {depth > 0 && (
            <div
              className="absolute pointer-events-none"
              style={{ left: -36, top: 0, width: 2, height: 22, backgroundColor: color + '60' }}
            />
          )}

          {/* Node dot */}
          <div className="shrink-0 mt-1 relative z-10">
            <div
              className="h-6 w-6 rounded-full border-[3px] flex items-center justify-center cursor-pointer transition-all hover:scale-125 shadow-sm"
              style={{ borderColor: color, backgroundColor: lockBg(node) }}
              onClick={() => handleNodeClick(node)}
              title={node.title}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>

          {/* Card */}
          <Card
            className="flex-1 cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden"
            style={{
              borderLeft: `4px solid ${color}`,
              boxShadow: node.locked ? `0 0 0 1px ${color}30` : undefined,
            }}
            onClick={() => handleNodeClick(node)}
          >
            <div className="p-3 pr-10">
              <div className="flex items-center gap-2 flex-wrap">
                {node.locked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                {node.isFromModule && <ExternalLink className="h-3 w-3 shrink-0" style={{ color }} />}
                <span className="text-sm font-bold leading-snug">{node.title}</span>
                {node.isFromModule && (
                  <Badge className="text-[10px]" style={{ backgroundColor: color + '15', color, border: 'none' }}>
                    {MODULE_ICONS[node.module] || '🏆'} {node.module}
                  </Badge>
                )}
                {isRoot && node.locked && (
                  <Badge className="bg-amber-100 text-amber-700 text-[10px]">已锁定</Badge>
                )}
                {hasChildren && (
                  <Badge className="bg-slate-100 text-slate-600 text-[10px]">
                    {node.children.length} 个分支
                  </Badge>
                )}
                {/* Progress badge for module items */}
                {node.isFromModule && node.progress !== undefined && node.progress > 0 && (
                  <Badge
                    className="text-[10px]"
                    style={{
                      backgroundColor: node.progress === 100 ? '#22C55E15' : color + '15',
                      color: node.progress === 100 ? '#22C55E' : color,
                      border: 'none',
                    }}
                  >
                    {node.progress === 100 ? '✅ 已完成' : `${node.progress}%`}
                  </Badge>
                )}
              </div>
              {node.description && (
                <div className="mt-1 text-[12px] text-foreground/70 line-clamp-2 leading-relaxed">
                  {node.description}
                </div>
              )}
              {/* Progress bar for module items */}
              {node.isFromModule && node.progress !== undefined && node.progress > 0 && (
                <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${node.progress}%`, backgroundColor: node.progress === 100 ? '#22C55E' : color }}
                  />
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                {node.subcategory && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                    {node.subcategory}
                  </span>
                )}
                {node.date && <span>{formatDate(node.date)}</span>}
                {node.feeling && (
                  <span className="line-clamp-1 italic">"{node.feeling}"</span>
                )}
              </div>
            </div>

            {/* Action buttons - only for manual achievements */}
            {!node.isFromModule && (
              <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {isRoot && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLocked(node); }}
                    className={`p-1.5 rounded cursor-pointer ${node.locked ? 'text-amber-500 hover:bg-amber-50' : 'text-muted-foreground/60 hover:text-amber-500 hover:bg-amber-50'}`}
                    title={node.locked ? '已锁定（取消锁定后可移动）' : '锁定此父级（锁定后不能移动）'}
                  >
                    {node.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); openLink(node); }}
                  className={`p-1.5 rounded cursor-pointer ${node.locked ? 'text-gray-200 cursor-not-allowed' : 'text-muted-foreground/60 hover:text-amber-500 hover:bg-amber-50'}`}
                  title={node.locked ? '已锁定，不能链接到父成就' : (node.parent_id ? '已链接到父成就' : '链接到父成就')}
                  disabled={node.locked}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                  className="p-1.5 rounded text-muted-foreground/60 hover:text-destructive hover:bg-red-50 cursor-pointer"
                  title="删除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Navigate hint for module items */}
            {node.isFromModule && (
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  点击查看 <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </div>
            )}

            {/* Parent chain hint */}
            {node.parent_id && (() => {
              const parent = combinedData.find(a => a.id === node.parent_id);
              return parent ? (
                <div className="px-3 pb-2 text-[10px] text-amber-600 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  <span>父级：{parent.title}</span>
                  {parent.locked && <Lock className="h-2.5 w-2.5" />}
                </div>
              ) : null;
            })()}
          </Card>
        </div>

        {/* Recursively render children */}
        {hasChildren && (
          <div className="relative">
            {node.children.map((child, idx) => (
              <div key={child.id} className="relative">
                {renderMindNode(child, idx === node.children.length - 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: config.color + '20' }}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">成就墙</h2>
            <p className="text-xs text-muted-foreground">聚合各模块数据，记录每一个里程碑</p>
          </div>
        </div>
        <Button onClick={handleAdd} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 添加成就
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : combinedData.length === 0 ? (
        <Card className="py-20 text-center">
          <Trophy className="w-16 h-16 mb-3 opacity-50" style={{ color: config.color }} />
          <h3 className="text-base font-semibold text-foreground/80">还没有成就</h3>
          <p className="text-sm text-muted-foreground mt-1">在各模块记录数据，或手动添加成就！</p>
          <Button className="mt-3" onClick={handleAdd} style={{ backgroundColor: config.color }}>
            <Plus className="h-4 w-4" /> 添加第一个成就
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Summary bar */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-amber-100 text-amber-700">总计 {combinedData.length} 项</Badge>
            {combinedData.filter(a => a.locked).length > 0 && (
              <Badge className="bg-amber-100 text-amber-700">
                <Lock className="w-3 h-3 inline mr-1" /> {combinedData.filter(a => a.locked).length} 项已锁定
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-700">
              <LayoutDashboard className="w-3 h-3 inline mr-1" /> {moduleGroups.length} 个模块
            </Badge>
            {combinedData.filter(a => a.isFromModule).length > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700">
                <Download className="w-3 h-3 inline mr-1" /> {combinedData.filter(a => a.isFromModule).length} 项来自各模块
              </Badge>
            )}
          </div>

          {/* Tree by module -> by category */}
          {moduleGroups.map(group => {
            const isModuleExpanded = expandedModules.has(group.module);
            return (
              <div key={group.module} className="rounded-xl border border-border/60 overflow-hidden shadow-sm">
                {/* Module header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:opacity-90 transition-opacity"
                  style={{
                    background: `linear-gradient(to right, ${group.color}15, ${group.color}05)`,
                    borderBottom: isModuleExpanded ? `1px solid ${group.color}30` : 'none'
                  }}
                  onClick={() => toggleModule(group.module)}
                >
                  {isModuleExpanded
                    ? <ChevronDown className="h-4 w-4 shrink-0" style={{ color: group.color }} />
                    : <ChevronRight className="h-4 w-4 shrink-0" style={{ color: group.color }} />
                  }
                  <span className="text-lg">{group.icon}</span>
                  <span className="text-sm font-bold" style={{ color: group.color }}>{group.module}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {group.categories.length > 0 && `\u00B7 ${group.categories.length} 个分类`}
                  </span>
                  <Badge
                    className="ml-auto text-[10px]"
                    style={{ backgroundColor: group.color + '20', color: group.color, border: 'none' }}
                  >
                    {group.totalCount}
                  </Badge>
                </div>

                {/* Module body: 2-level category groups */}
                {isModuleExpanded && (
                  <div className="px-4 py-4 bg-white dark:bg-slate-950/30">
                    {group.categories.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        还没有数据，去对应模块记录吧！
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {group.categories.map((catGroup, catIdx) => {
                          const catKey = `${group.module}::${catGroup.name}`;
                          const isCatExpanded = expandedCategories.has(catKey) || (expandedCategories.size === 0 && catIdx === 0);
                          return (
                            <div key={catGroup.name} className="relative">
                              {/* Category subtitle (mind map level 2) */}
                              <div
                                className="flex items-center gap-2 mb-3 cursor-pointer select-none group/cat"
                                onClick={() => toggleCategory(catKey)}
                              >
                                {isCatExpanded
                                  ? <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: group.color }} />
                                  : <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: group.color }} />
                                }
                                <div
                                  className="h-7 w-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                                  style={{ backgroundColor: group.color + '20' }}
                                >
                                  {catGroup.name === '未分类' ? '📦' : (group.module === '学习成长' ? <BookOpen className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />)}
                                </div>
                                <span className="text-[13px] font-semibold" style={{ color: group.color }}>
                                  {catGroup.name}
                                </span>
                                <Badge
                                  className="text-[10px] px-1.5 py-0"
                                  style={{ backgroundColor: group.color + '15', color: group.color, border: 'none' }}
                                >
                                  {catGroup.count} 项
                                </Badge>
                                <div
                                  className="flex-1 h-px ml-2"
                                  style={{ background: `linear-gradient(to right, ${group.color}30, transparent)` }}
                                />
                              </div>

                              {/* Achievement tree under this category */}
                              {isCatExpanded && (
                                <div className="relative pl-2">
                                  {catGroup.items.map((item) => renderMindNode(item, false))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Entry Form */}
      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing?.id ? '编辑' : '添加'}成就`}
        fields={manualFields}
        initialData={editing}
        accentColor={config.color}
      />

      {/* Parent Link Dialog (only shows manual achievements) */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => { setLinkDialogOpen(false); setLinkingTarget(null); }}
        title={`链接父成就 — ${linkingTarget?.title || ''}`}
        footer={
          <div className="flex gap-2">
            {linkingTarget?.parent_id && (
              <Button variant="outline" onClick={() => handleLinkParent(null)}>
                <Unlink className="h-3 w-3" /> 解除链接
              </Button>
            )}
            <Button onClick={() => setLinkDialogOpen(false)}>完成</Button>
          </div>
        }
      >
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {linkingTarget && (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                选择一个成就作为「{linkingTarget.title}」的父级，形成技能树链条。
                {linkingTarget.parent_id && (
                  <span className="block mt-1 text-amber-500">
                    当前父级：{manualData.data.find(a => a.id === linkingTarget.parent_id)?.title || '未知'}
                  </span>
                )}
              </p>
              {manualData.data
                .filter(a => a.id !== linkingTarget.id && !a.locked)
                .map(a => {
                  const aid = a.id ?? 0;
                  return (
                  <div
                    key={aid}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${linkingTarget.parent_id === aid ? 'border-amber-400 bg-amber-50' : 'border-border/60'}`}
                    onClick={() => handleLinkParent(aid || null)}
                  >
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: MODULE_COLORS[a.module] || '#F59E0B' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{a.title}</span>
                        {a.locked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                    {MODULE_ICONS[a.module] || '🏆'} {a.module} · {a.category || '未分类'}
                  </div>
                    </div>
                    {linkingTarget.parent_id === aid && (
                      <Badge className="bg-amber-100 text-amber-700 shrink-0">当前父级</Badge>
                    )}
                  </div>
                  );
                })}
              {manualData.data.filter(a => a.id !== linkingTarget.id && a.locked).length > 0 && (
                <div className="pt-2 mt-2 border-t border-border/50">
                  <p className="text-[11px] text-muted-foreground mb-1.5"><Lock className="w-3 h-3 inline mr-1" /> 以下成就已锁定，不可选为父级：</p>
                  {manualData.data.filter(a => a.id !== linkingTarget.id && a.locked).map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg opacity-50">
                      <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                      <span className="text-sm truncate">{a.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Dialog>

      {ToastEl}
    </div>
  );
}
