// localStorage-based data layer — fallback when backend API is unavailable
// Provides the same CRUD interface as the Express API

const STORAGE_KEY_PREFIX = 'lifeos_data';
const DEFAULT_USER_ID = 'default';

function getUserId(): string {
  const userStr = localStorage.getItem('lifeos_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id ? `user_${user.id}` : DEFAULT_USER_ID;
    } catch {
      return DEFAULT_USER_ID;
    }
  }
  return DEFAULT_USER_ID;
}

function getStorageKey(): string {
  return `${STORAGE_KEY_PREFIX}_${getUserId()}`;
}

interface StoredData {
  learning: any[];
  travel: any[];
  achievements: any[];
  mood: any[];
  goals: any[];
  health_habits: any[];
  habit_records: { habit_id: number; date: string }[];
  health_logs: any[];
  finance: any[];
  social: any[];
  insights: any[];
  [key: string]: any[] | { habit_id: number; date: string }[];
}

let cache: { key: string; data: StoredData } | null = null;

function getStore(): StoredData {
  const key = getStorageKey();
  
  if (cache && cache.key === key) {
    return cache.data;
  }
  
  const raw = localStorage.getItem(key);
  
  if (raw) {
    const data = JSON.parse(raw);
    if (data.learning && data.learning.length > 0 && 'type' in data.learning[0]) {
      data.learning = data.learning.map((item: any) => ({
        id: item.id,
        category: item.type ? mapOldTypeToCategory(item.type) : '其他技能学习',
        title: item.title || '',
        source: item.source || '',
        start_date: item.date || '',
        end_date: '',
        duration_hours: 0,
        progress: mapOldStatusToProgress(item.status),
        self_rating: item.rating || 0,
        notes: item.notes || '',
        created_at: item.created_at || todayISO(),
      }));
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.achievements && data.achievements.length > 0 && !('module' in data.achievements[0])) {
      data.achievements = data.achievements.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        module: '手动成就',
        category: item.category || '',
        source_id: null,
        source_module: '',
        source_title: '',
        parent_id: null,
        locked: false,
        date: item.date || '',
        description: item.description || '',
        feeling: item.feeling || '',
        created_at: item.created_at || todayISO(),
      }));
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.achievements && data.achievements.length > 0 && !('locked' in data.achievements[0])) {
      data.achievements = data.achievements.map((item: any) => ({ ...item, locked: false }));
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.achievements && data.achievements.length > 0 && !('subcategory' in data.achievements[0])) {
      data.achievements = data.achievements.map((item: any) => ({ ...item, subcategory: '' }));
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.travel && data.travel.length > 0) {
      let travelChanged = false;
      data.travel = data.travel.map((item: any) => {
        const next = { ...item };
        if (!('category' in next)) { next.category = '国内旅行'; travelChanged = true; }
        if (!('country' in next)) { next.country = ''; travelChanged = true; }
        if (!('province' in next)) { next.province = ''; travelChanged = true; }
        if (!('city' in next)) { next.city = ''; travelChanged = true; }
        if (!('district' in next)) { next.district = ''; travelChanged = true; }
        if (!('highlights_blocks' in next)) { next.highlights_blocks = []; travelChanged = true; }
        return next;
      });
      if (travelChanged) localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.health_logs && data.health_logs.length > 0) {
      let healthChanged = false;
      data.health_logs = data.health_logs.map((item: any) => {
        const next = { ...item };
        if (!('category' in next)) { next.category = ''; healthChanged = true; }
        return next;
      });
      if (healthChanged) localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.insights && data.insights.length > 0) {
      let insightsChanged = false;
      data.insights = data.insights.map((item: any) => {
        const next = { ...item };
        if (!('category' in next)) { next.category = ''; insightsChanged = true; }
        return next;
      });
      if (insightsChanged) localStorage.setItem(key, JSON.stringify(data));
    }
    if (!data.milestones) {
      data.milestones = [];
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.finance && data.finance.length > 0 && data.finance.some((it: any) => 'type' in it)) {
      data.finance = data.finance.map((item: any) => {
        const next: any = { ...item };
        if (!next.title) next.title = `${item.category || '财务'} 目标`;
        if (next.target_amount === undefined) {
          next.target_amount = item.type === '支出' ? item.amount : 0;
        }
        if (next.current_amount === undefined) {
          next.current_amount = item.type === '收入' ? item.amount : 0;
        }
        if (next.mood === undefined) next.mood = 3;
        if (next.completion === undefined) {
          next.completion = next.target_amount > 0
            ? Math.min(100, Math.round((Number(next.current_amount) / Number(next.target_amount)) * 100))
            : 0;
        }
        if (next.deadline === undefined) next.deadline = '';
        delete next.type;
        delete next.amount;
        return next;
      });
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (data.finance && data.finance.length > 0) {
      let finChanged = false;
      data.finance = data.finance.map((item: any) => {
        const next: any = { ...item };
        if (!('title' in next)) { next.title = `${item.category || '财务'} 目标`; finChanged = true; }
        if (!('target_amount' in next)) { next.target_amount = 0; finChanged = true; }
        if (!('current_amount' in next)) { next.current_amount = 0; finChanged = true; }
        if (!('mood' in next)) { next.mood = 0; finChanged = true; }
        if (!('completion' in next)) { next.completion = 0; finChanged = true; }
        if (!('deadline' in next)) { next.deadline = ''; finChanged = true; }
        return next;
      });
      if (finChanged) localStorage.setItem(key, JSON.stringify(data));
    }
    cache = { key, data };
    return data;
  }
  
  const legacyKey = 'lifeos_data';
  const legacyData = localStorage.getItem(legacyKey);
  if (legacyData && getUserId() === DEFAULT_USER_ID) {
    localStorage.setItem(key, legacyData);
    const data = JSON.parse(legacyData);
    cache = { key, data };
    return data;
  }
  
  const seed = seedData();
  localStorage.setItem(key, JSON.stringify(seed));
  cache = { key, data: seed };
  return seed;
}

function mapOldTypeToCategory(oldType: string): string {
  const map: Record<string, string> = {
    '书籍': '爱好兴趣学习',
    '课程': '职业能力提升',
    '技能': '其他技能学习',
    '文章': '其他技能学习',
    '播客': '爱好兴趣学习',
  };
  return map[oldType] || '其他技能学习';
}

function mapOldStatusToProgress(status: string): number {
  if (status === '已完成') return 100;
  if (status === '进行中') return 50;
  return 0;
}

function saveStore(data: StoredData) {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(data));
  cache = { key, data };
}

let _nextId: Record<string, number> = {};

function nextId(module: string, data: any[]): number {
  const userId = getUserId();
  const key = `${userId}_${module}`;
  if (!_nextId[key]) _nextId[key] = Math.max(0, ...data.map(d => d.id || 0)) + 1;
  else _nextId[key]++;
  return _nextId[key];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function dateOffset(days: number): string {
  const t = new Date();
  t.setDate(t.getDate() - days);
  return t.toISOString().split('T')[0];
}

import { getSeedData } from '@shared/seedData';

function seedData(): StoredData {
  return getSeedData();
}

export const storageApi = {
  list(module: string): any[] {
    const store = getStore();
    const table = module === 'health' ? 'health_logs' : module;
    return (store[table] || []).map(item => {
      if (module === 'mood' && typeof item.emotions === 'string') {
        item.emotions = JSON.parse(item.emotions);
      }
      if (module === 'goals' && typeof item.key_results === 'string') {
        item.key_results = JSON.parse(item.key_results);
      }
      return item;
    });
  },

  create(module: string, data: any): any {
    const store = getStore();
    const table = module === 'health' ? 'health_logs' : module;
    const list = store[table] || [];
    const id = nextId(module, list);
    const item = { ...data, id, created_at: todayISO() };
    if (module === 'goals' && item.keyResults) {
      item.key_results = item.keyResults;
      delete item.keyResults;
    }
    if (module === 'finance') {
      item.target_amount = Number(item.target_amount) || 0;
      item.current_amount = Number(item.current_amount) || 0;
      item.mood = Number(item.mood) || 0;
      item.completion = Number(item.completion) || 0;
    }
    list.unshift(item);
    store[table] = list;
    saveStore(store);
    return item;
  },

  update(module: string, id: number, data: any): any {
    const store = getStore();
    const table = module === 'health' ? 'health_logs' : module;
    const list = store[table] || [];
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) throw new Error('Not found');
    if (data.keyResults) {
      data.key_results = data.keyResults;
      delete data.keyResults;
    }
    list[idx] = { ...list[idx], ...data, updated_at: todayISO() };
    store[table] = list;
    saveStore(store);
    return list[idx];
  },

  delete(module: string, id: number | string): { success: boolean } {
    const store = getStore();
    const table = module === 'health' ? 'health_logs' : module;
    const list = store[table] || [];
    const targetId = Number(id);
    store[table] = list.filter(item => Number(item.id) !== targetId);
    saveStore(store);
    return { success: true };
  },

  toggleKR(goalId: number, krIndex: number): any {
    const store = getStore();
    const list = store.goals || [];
    const goal = list.find(g => g.id === goalId);
    if (!goal) throw new Error('Goal not found');
    if (!goal.key_results || !goal.key_results[krIndex]) throw new Error('KR not found');
    goal.key_results[krIndex].done = !goal.key_results[krIndex].done;
    saveStore(store);
    return goal;
  },

  listHabits(): any[] {
    const store = getStore();
    return (store.health_habits || []).map(h => ({
      ...h,
      records: (store.habit_records || []).filter(r => r.habit_id === h.id).map(r => r.date),
    }));
  },

  createHabit(data: any): any {
    const store = getStore();
    const list = store.health_habits || [];
    const id = nextId('health_habits', list);
    const item = { id, habit_name: data.habitName || data.habit_name, frequency: data.frequency || '每日', created_at: todayISO() };
    list.push(item);
    store.health_habits = list;
    saveStore(store);
    return { ...item, records: [] };
  },

  deleteHabit(id: number | string): { success: boolean } {
    const store = getStore();
    const targetId = Number(id);
    store.health_habits = (store.health_habits || []).filter(h => Number(h.id) !== targetId);
    store.habit_records = (store.habit_records || []).filter(r => Number(r.habit_id) !== targetId);
    saveStore(store);
    return { success: true };
  },

  toggleHabit(habitId: number, date: string): { done: boolean } {
    const store = getStore();
    const records = store.habit_records || [];
    const existing = records.find(r => r.habit_id === habitId && r.date === date);
    if (existing) {
      store.habit_records = records.filter(r => r !== existing);
      saveStore(store);
      return { done: false };
    } else {
      records.push({ habit_id: habitId, date });
      store.habit_records = records;
      saveStore(store);
      return { done: true };
    }
  },

  listLogs(): any[] {
    return storageApi.list('health_logs');
  },

  createLog(data: any): any {
    const store = getStore();
    const list = store.health_logs || [];
    const id = nextId('health_logs', list);
    const item = {
      id,
      category: data.category || '',
      date: data.date || todayISO(),
      exercise: data.exercise || '',
      sleep: Number(data.sleep) || 0,
      water: Number(data.water) || 0,
      weight: Number(data.weight) || 0,
      note: data.note || '',
      created_at: todayISO(),
    };
    list.unshift(item);
    store.health_logs = list;
    saveStore(store);
    return item;
  },

  deleteLog(id: number | string): { success: boolean } {
    const store = getStore();
    const targetId = Number(id);
    store.health_logs = (store.health_logs || []).filter(l => Number(l.id) !== targetId);
    saveStore(store);
    return { success: true };
  },

  exportAll(): StoredData {
    return getStore();
  },

  importAll(data: StoredData): void {
    _nextId = {};
    saveStore(data);
  },

  reset(): void {
    _nextId = {};
    const key = getStorageKey();
    localStorage.removeItem(key);
    cache = null;
  },

  dashboard(): any {
    const store = getStore();

    const learning = store.learning || [];
    const travel = store.travel || [];
    const achievements = store.achievements || [];
    const mood = store.mood || [];
    const goals = store.goals || [];
    const finance = store.finance || [];
    const social = store.social || [];
    const insights = store.insights || [];
    const healthLogs = store.health_logs || [];

    const stats = {
      learning: learning.length,
      travel: travel.length,
      achievements: achievements.length,
      goals: goals.length,
      insights: insights.length,
      social: social.length,
      health: healthLogs.length,
    };

    const moduleMap: Record<string, { name: string; color: string; titleKey: string }> = {
      learning: { name: '学习成长', color: '#0EA5E9', titleKey: 'title' },
      travel: { name: '旅行日记', color: '#F97316', titleKey: 'destination' },
      achievements: { name: '成就墙', color: '#F59E0B', titleKey: 'title' },
      mood: { name: '心情心态', color: '#EC4899', titleKey: 'journal' },
      goals: { name: '目标管理', color: '#10B981', titleKey: 'title' },
      finance: { name: '财务管理', color: '#8B5CF6', titleKey: 'note' },
      social: { name: '社交人脉', color: '#06B6D4', titleKey: 'name' },
      insights: { name: '收获感悟', color: '#F43F5E', titleKey: 'title' },
    };

    const recent: Array<{
      module: string;
      moduleName: string;
      color: string;
      title: string;
      date: string;
    }> = [];

    const moduleData = [
      { data: learning, module: 'learning' },
      { data: travel, module: 'travel' },
      { data: achievements, module: 'achievements' },
      { data: mood, module: 'mood' },
      { data: goals, module: 'goals' },
      { data: finance, module: 'finance' },
      { data: social, module: 'social' },
      { data: insights, module: 'insights' },
    ];

    moduleData.forEach(({ data, module }) => {
      const config = moduleMap[module];
      data.slice(0, 2).forEach((item: any) => {
        const title = item[config.titleKey] || `${item.type || ''} ${item.category || ''}`.trim();
        const date = item.date || item.start_date || item.last_contact || item.created_at || '';
        recent.push({
          module,
          moduleName: config.name,
          color: config.color,
          title: title || '(无标题)',
          date,
        });
      });
    });

    recent.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
    const topRecent = recent.slice(0, 8);

    const today = new Date();
    const moodDays: Array<{ date: string; score: number }> = [];
    const moodMap: Record<string, number> = {};
    mood.forEach((m: any) => { moodMap[m.date] = m.score; });
    for (let i = 13; i >= 0; i--) {
      const t = new Date(today);
      t.setDate(t.getDate() - i);
      const ds = t.toISOString().split('T')[0];
      moodDays.push({ date: ds, score: moodMap[ds] || 0 });
    }

    const topGoals = goals.slice(0, 3).map((g: any) => {
      const keyResults = (g.key_results as any[]) || [];
      const total = keyResults.length || 1;
      const done = keyResults.filter((k: any) => k.done).length || 0;
      const progress = Math.round(done / total * 100);
      return {
        id: g.id,
        title: g.title,
        progress,
      };
    });

    const topFinances = finance.slice(0, 3).map((f: any) => ({
      id: f.id,
      title: f.title,
      completion: f.completion || 0,
      current_amount: Number(f.current_amount) || 0,
      target_amount: Number(f.target_amount) || 0,
    }));

    return {
      stats,
      recent: topRecent,
      moods: moodDays,
      goals: topGoals,
      finances: topFinances,
    };
  },
};
