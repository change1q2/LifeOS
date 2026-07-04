import { useQueries, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { MODULES } from '../../config/modules';
import type { Learning, Travel, Achievement, Mood, Goal, HealthHabit, HealthLog, Finance, Social, Insight, Milestone } from '../../types';

export interface TimelineEntry {
  date: string;
  module: string;
  moduleKey: string;
  icon: string;
  color: string;
  title: string;
  summary: string;
  itemId: number;
  status?: string;
  statusColor?: string;
}

type ModuleKey = 'learning' | 'travel' | 'achievements' | 'mood' | 'goals' | 'health' | 'finance' | 'social' | 'insights' | 'milestones';

const MODULE_KEYS: ModuleKey[] = ['learning', 'travel', 'achievements', 'mood', 'goals', 'health', 'finance', 'social', 'insights', 'milestones'];

function getDateFromEntry(entry: any, moduleKey: string): string {
  switch (moduleKey) {
    case 'learning':
      return (entry as Learning).end_date || (entry as Learning).start_date || (entry as Learning).created_at || '';
    case 'travel':
      return (entry as Travel).end_date || (entry as Travel).start_date || (entry as Travel).created_at || '';
    case 'achievements':
      return (entry as Achievement).date || (entry as Achievement).created_at || '';
    case 'mood':
      return (entry as Mood).date || (entry as Mood).created_at || '';
    case 'goals':
      return (entry as Goal).deadline || (entry as Goal).created_at || '';
    case 'finance':
      return (entry as Finance).date || (entry as Finance).deadline || (entry as Finance).created_at || '';
    case 'social':
      return (entry as Social).last_contact || (entry as Social).created_at || '';
    case 'insights':
      return (entry as Insight).date || (entry as Insight).created_at || '';
    case 'milestones':
      return (entry as Milestone).completion_date || (entry as Milestone).target_date || (entry as Milestone).created_at || '';
    case 'health':
      return (entry as HealthLog).date || (entry as HealthHabit).created_at || '';
    default:
      return entry.created_at || '';
  }
}

function getTitleFromEntry(entry: any, moduleKey: string): string {
  switch (moduleKey) {
    case 'learning':
      return (entry as Learning).title;
    case 'travel':
      return (entry as Travel).destination;
    case 'achievements':
      return (entry as Achievement).title;
    case 'mood':
      return `心情记录: ${(entry as Mood).emotions.join(', ')}`;
    case 'goals':
      return (entry as Goal).title;
    case 'health':
      return (entry as HealthLog).category || (entry as HealthHabit).habit_name;
    case 'finance':
      return (entry as Finance).title;
    case 'social':
      return (entry as Social).name;
    case 'insights':
      return (entry as Insight).title;
    case 'milestones':
      return (entry as Milestone).title;
    default:
      return entry.title || '未命名';
  }
}

function getStatusFromEntry(entry: any, moduleKey: string): { status: string; statusColor: string } {
  const now = new Date();
  switch (moduleKey) {
    case 'learning':
      const learning = entry as Learning;
      if (learning.progress >= 100) return { status: '已完成', statusColor: '#10B981' };
      if (learning.progress === 0) return { status: '未开始', statusColor: '#9CA3AF' };
      return { status: '进行中', statusColor: '#F59E0B' };
    case 'travel':
      const travel = entry as Travel;
      const endDate = new Date(travel.end_date);
      const startDate = new Date(travel.start_date);
      if (endDate < now) return { status: '已完成', statusColor: '#10B981' };
      if (startDate > now) return { status: '未开始', statusColor: '#9CA3AF' };
      return { status: '进行中', statusColor: '#F59E0B' };
    case 'achievements':
      return { status: '已完成', statusColor: '#10B981' };
    case 'goals':
      const goal = entry as Goal;
      const completedKR = goal.key_results?.filter(k => k.done).length || 0;
      const totalKR = goal.key_results?.length || 0;
      if (totalKR === 0) return { status: '未开始', statusColor: '#9CA3AF' };
      if (completedKR === totalKR) return { status: '已完成', statusColor: '#10B981' };
      if (completedKR === 0) return { status: '未开始', statusColor: '#9CA3AF' };
      return { status: '进行中', statusColor: '#F59E0B' };
    case 'finance':
      const finance = entry as Finance;
      if (finance.completion >= 100) return { status: '已完成', statusColor: '#10B981' };
      if (finance.completion === 0) return { status: '未开始', statusColor: '#9CA3AF' };
      return { status: '进行中', statusColor: '#F59E0B' };
    case 'milestones':
      const milestone = entry as Milestone;
      if (milestone.completed) return { status: '已完成', statusColor: '#10B981' };
      const targetDate = new Date(milestone.target_date);
      if (targetDate < now) return { status: '已过期', statusColor: '#EF4444' };
      return { status: '进行中', statusColor: '#F59E0B' };
    case 'health':
      if ('records' in entry) {
        const habit = entry as HealthHabit;
        const recordCount = habit.records?.length || 0;
        if (recordCount === 0) return { status: '未开始', statusColor: '#9CA3AF' };
        return { status: '进行中', statusColor: '#F59E0B' };
      }
      return { status: '已记录', statusColor: '#14B8A6' };
    default:
      return { status: '', statusColor: '' };
  }
}

function getSummaryFromEntry(entry: any, moduleKey: string): string {
  switch (moduleKey) {
    case 'learning':
      const learning = entry as Learning;
      return `${learning.category} · ${learning.duration_hours}小时 · 进度${learning.progress}%`;
    case 'travel':
      const travel = entry as Travel;
      return `${travel.category} · ${travel.start_date} 至 ${travel.end_date}`;
    case 'achievements':
      const achievement = entry as Achievement;
      return `${achievement.module} · ${achievement.category}`;
    case 'mood':
      const mood = entry as Mood;
      return `心情指数: ${mood.score}分`;
    case 'goals':
      const goal = entry as Goal;
      const completedKR = goal.key_results?.filter(k => k.done).length || 0;
      const totalKR = goal.key_results?.length || 0;
      return `${goal.category} · ${completedKR}/${totalKR} 关键结果`;
    case 'health':
      if ('exercise' in entry) {
        const log = entry as HealthLog;
        return `${log.exercise || '无运动'} · 睡眠${log.sleep || 0}小时 · 饮水${log.water || 0}杯`;
      } else {
        const habit = entry as HealthHabit;
        return `${habit.frequency} · ${habit.records?.length || 0}次记录`;
      }
    case 'finance':
      const finance = entry as Finance;
      return `${finance.category} · 目标${finance.target_amount}元 · 已存${finance.current_amount}元`;
    case 'social':
      const social = entry as Social;
      return `${social.relationship || social.category || '联系人'}`;
    case 'insights':
      const insight = entry as Insight;
      return `${insight.source || insight.category}`;
    case 'milestones':
      const milestone = entry as Milestone;
      return `${milestone.category} · ${milestone.completed ? '已完成' : '进行中'}`;
    default:
      return '';
  }
}

function extractEntries(data: any[], moduleKey: string): TimelineEntry[] {
  const config = MODULES[moduleKey];
  if (!config) return [];

  return data
    .filter(entry => entry.id !== undefined)
    .map(entry => {
      const date = getDateFromEntry(entry, moduleKey);
      if (!date) return null;

      const { status, statusColor } = getStatusFromEntry(entry, moduleKey);

      const result: TimelineEntry = {
        date,
        module: config.name,
        moduleKey,
        icon: config.icon,
        color: config.color,
        title: getTitleFromEntry(entry, moduleKey),
        summary: getSummaryFromEntry(entry, moduleKey),
        itemId: entry.id as number,
      };

      if (status) {
        result.status = status;
        result.statusColor = statusColor;
      }

      return result;
    })
    .filter((entry): entry is TimelineEntry => entry !== null);
}

export function useTimelineData() {
  const queries = MODULE_KEYS.map(key => ({
    queryKey: [key],
    queryFn: async () => {
      if (key === 'health') {
        const [habits, logs] = await Promise.all([
          api.listHabits<HealthHabit>(),
          api.listLogs<HealthLog>(),
        ]);
        return [...habits, ...logs];
      }
      return api.list<any>(key);
    },
  }));

  const queryResults = useQueries({ queries });

  const isLoading = queryResults.some(res => res.isLoading);
  const isError = queryResults.some(res => res.isError);
  const error = queryResults.find(res => res.error)?.error;

  const allEntries: TimelineEntry[] = queryResults
    .flatMap((result, index) => {
      const moduleKey = MODULE_KEYS[index];
      if (!result.data) return [];
      return extractEntries(result.data, moduleKey);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const queryClient = useQueryClient();

  const refresh = () => {
    MODULE_KEYS.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  return {
    entries: allEntries,
    loading: isLoading,
    error,
    refresh,
  };
}