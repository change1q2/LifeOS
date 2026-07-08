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

interface DashboardGoal {
  id: number;
  title: string;
  progress: number;
}

interface DashboardFinance {
  id: number;
  title: string;
  completion: number;
  current_amount: number;
  target_amount: number;
}

interface DashboardData {
  stats: Record<string, number>;
  recent: Array<{
    module: string;
    moduleName: string;
    color: string;
    title: string;
    date: string;
  }>;
  moods: Array<{ date: string; score: number }>;
  goals: DashboardGoal[];
  finances: DashboardFinance[];
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<any[]>([]);
  const [moods, setMoods] = useState<Array<{ date: string; score: number }>>([]);
  const [goals, setGoals] = useState<DashboardGoal[]>([]);
  const [finances, setFinances] = useState<DashboardFinance[]>([]);

  useEffect(() => {
    (async () => {
      const data: DashboardData = await api.dashboard();
      setStats(data.stats);
      setRecent(data.recent);
      setMoods(data.moods.filter(m => m.score > 0));
      setGoals(data.goals);
      setFinances(data.finances);
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
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Goals + Finance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">
          🎯 目标进度
        </h3>
          {goals.length > 0 ? goals.map(g => {
            return (
              <div key={g.id} className="mb-3.5 last:mb-0">
                <div className="mb-1 flex justify-between text-[13px] font-semibold">
                  <span>{g.title}</span>
                  <span className="text-emerald-500">{g.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${g.progress}%` }} />
                </div>
              </div>
            );
          }) : <div className="py-8 text-center text-muted-foreground">还没有目标，去设定一个吧！</div>}
        </Card>

        <Card className="p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">
          💰 财务目标
        </h3>
          {finances.length > 0 ? finances.map(f => {
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

export default Dashboard;
