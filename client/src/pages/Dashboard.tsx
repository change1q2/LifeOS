import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { SIDEBAR_ITEMS } from '../config/modules';
import { formatDate, badgeColor } from '../lib/utils';
import type { Learning, Travel, Achievement, Mood, Goal, Finance, Insight, Social } from '../types';
import { Calendar } from 'lucide-react';

const ICON_MAP: Record<string, string> = {
  '📚': '📚',
  '✈️': '✈️',
  '🏆': '🏆',
  '🎯': '🎯',
  '💡': '💡',
  '🤝': '🤝',
  '🕐': '🕐',
  '🌙': '🌙',
  '💰': '💰',
};

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<any[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [finances, setFinances] = useState<Finance[]>([]);

  useEffect(() => {
    (async () => {
      const [learning, travel, achievements, mood, goalsData, finance, insights, social] = await Promise.all([
        api.list<Learning>('learning'),
        api.list<Travel>('travel'),
        api.list<Achievement>('achievements'),
        api.list<Mood>('mood'),
        api.list<Goal>('goals'),
        api.list<Finance>('finance'),
        api.list<Insight>('insights'),
        api.list<Social>('social'),
      ]);

      setStats({
        learning: learning.length,
        travel: travel.length,
        achievements: achievements.length,
        goals: goalsData.length,
        health: 0, // placeholder
        insights: insights.length,
        social: social.length,
      });

      const moduleMap: Record<string, { name: string; color: string }> = {
        learning: { name: '学习成长', color: '#0EA5E9' },
        travel: { name: '旅行日记', color: '#F97316' },
        achievements: { name: '成就墙', color: '#F59E0B' },
        mood: { name: '心情心态', color: '#EC4899' },
        goals: { name: '目标管理', color: '#10B981' },
        finance: { name: '财务管理', color: '#8B5CF6' },
        social: { name: '社交人脉', color: '#06B6D4' },
        insights: { name: '收获感悟', color: '#F43F5E' },
      };

      const all: any[] = [];
      [
        { data: learning, key: 'title' },
        { data: travel, key: 'destination' },
        { data: achievements, key: 'title' },
        { data: mood, key: 'journal' },
        { data: goalsData, key: 'title' },
        { data: finance, key: 'note' },
        { data: social, key: 'name' },
        { data: insights, key: 'title' },
      ].forEach(({ data, key }) => {
        const mod = Object.keys(moduleMap).find(m => data === (m === 'learning' ? learning : m === 'travel' ? travel : m === 'achievements' ? achievements : m === 'mood' ? mood : m === 'goals' ? goalsData : m === 'finance' ? finance : m === 'social' ? social : insights));
        if (!mod) return;
        data.slice(0, 2).forEach(item => {
          all.push({
            module: mod,
            moduleName: moduleMap[mod].name,
            color: moduleMap[mod].color,
            title: (item as any)[key] || `${(item as any).type} ${(item as any).category}`,
            date: (item as any).date || (item as any).start_date || (item as any).last_contact || (item as any).created_at,
          });
        });
      });

      all.sort((a, b) => new Date(b.date || b.created_at || '').getTime() - new Date(a.date || a.created_at || '').getTime());
      setRecent(all.slice(0, 8));
      setMoods(mood);
      setGoals(goalsData);
      setFinances(finance);
    })();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`;

  const statCards = [
    { icon: '📚', label: '学习记录', value: stats.learning || 0, color: '#0EA5E9', module: 'learning' },
    { icon: '✈️', label: '旅行足迹', value: stats.travel || 0, color: '#F97316', module: 'travel' },
    { icon: '🏆', label: '成就解锁', value: stats.achievements || 0, color: '#F59E0B', module: 'achievements' },
    { icon: '🎯', label: '进行中目标', value: stats.goals || 0, color: '#10B981', module: 'goals' },
    { icon: '💡', label: '收获感悟', value: stats.insights || 0, color: '#F43F5E', module: 'insights' },
    { icon: '🤝', label: '社交人脉', value: stats.social || 0, color: '#06B6D4', module: 'social' },
  ];

  // Mood heatmap (last 14 days)
  const moodMap: Record<string, number> = {};
  moods.forEach(m => { moodMap[m.date] = m.score; });
  const moodCells = [];
  for (let i = 13; i >= 0; i--) {
    const t = new Date(); t.setDate(t.getDate() - i);
    const ds = t.toISOString().split('T')[0];
    const score = moodMap[ds] || 0;
    const colors = ['bg-muted', 'bg-red-200', 'bg-orange-200', 'bg-amber-200', 'bg-green-200', 'bg-green-400'];
    moodCells.push(
      <div key={i} className={`h-3.5 w-3.5 rounded-sm cursor-pointer transition-transform hover:scale-125 ${colors[score]}`} title={`${ds}: ${score ? score + '分' : '未记录'}`} />
    );
  }

  const moodIcons: Record<number, string> = {
    1: '😞',
    2: '😐',
    3: '😐',
    4: '😊',
    5: '❤️',
  };

  return (
    <div className="animate-fadeIn">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">{greeting}！</h2>
        <p className="text-[13px] text-muted-foreground mt-1">欢迎回到你的人生系统，今天是记录的好日子。</p>
        <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white">
          <Calendar className="w-3 h-3" />
          {dateStr}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        {statCards.map(s => {
          return (
            <Card
              key={s.module}
              className="cursor-pointer p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(`/${s.module}`)}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-sm" style={{ backgroundColor: s.color + '15' }}>
                {s.icon}
              </div>
              <div className="text-2xl font-extrabold tracking-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Recent + Mood */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">
          🕐 最近动态
        </h3>
          <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto">
            {recent.length > 0 ? recent.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 border-b border-border/50 pb-2.5 last:border-0">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{a.title || '(无标题)'}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDate(a.date)} · <span className="inline-block rounded-full px-1.5 py-px text-[10px] font-semibold text-white" style={{ backgroundColor: a.color }}>{a.moduleName}</span>
                  </div>
                </div>
              </div>
            )) : <div className="py-8 text-center text-muted-foreground">暂无动态</div>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">
          🌙 近14天心情趋势
        </h3>
          <div className="flex flex-wrap gap-1">{moodCells}</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>低</span>
            <div className="h-3 w-3 rounded-sm bg-red-200" />
            <div className="h-3 w-3 rounded-sm bg-orange-200" />
            <div className="h-3 w-3 rounded-sm bg-amber-200" />
            <div className="h-3 w-3 rounded-sm bg-green-200" />
            <div className="h-3 w-3 rounded-sm bg-green-400" />
            <span>高</span>
            <span className="ml-auto">点击「心情心态」记录 →</span>
          </div>
          {moods.length > 0 && (
            <div className="mt-4 border-t border-border/50 pt-3.5">
              <div className="mb-1.5 text-xs text-muted-foreground">最新心情</div>
              <div className="text-[13px] flex items-center gap-1">
                <span>{moodIcons[moods[0].score] || '😐'}</span>
                {moods[0].score}分
                {moods[0].emotions?.length > 0 && ` · ${moods[0].emotions.join(' / ')}`}
              </div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{moods[0].journal}</div>
            </div>
          )}
        </Card>
      </div>

      {/* Goals + Finance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">
          🎯 目标进度
        </h3>
          {goals.length > 0 ? goals.slice(0, 3).map(g => {
            const total = (g.key_results as any[])?.length || 1;
            const done = (g.key_results as any[])?.filter((k: any) => k.done).length || 0;
            const pct = total ? Math.round(done / total * 100) : 0;
            return (
              <div key={g.id} className="mb-3.5 last:mb-0">
                <div className="mb-1 flex justify-between text-[13px] font-semibold">
                  <span>{g.title}</span>
                  <span className="text-emerald-500">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          }) : <div className="py-8 text-center text-muted-foreground">还没有目标，去设定一个吧！</div>}
        </Card>

        <Card className="p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">
          💰 财务目标
        </h3>
          {finances.length > 0 ? finances.slice(0, 3).map(f => {
            const pct = f.completion || 0;
            return (
              <div key={f.id} className="mb-3.5 last:mb-0">
                <div className="mb-1 flex justify-between text-[13px] font-semibold">
                  <span>{f.title}</span>
                  <span className="text-violet-500">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  ¥{Number(f.current_amount).toLocaleString()} / ¥{Number(f.target_amount).toLocaleString()}
                </div>
              </div>
            );
          }) : <div className="py-8 text-center text-muted-foreground">还没有财务目标，去设定一个吧！</div>}
        </Card>
      </div>
    </div>
  );
}
