// ========== Types ==========

export interface Learning {
  id: number;
  category: string;
  title: string;
  source: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  progress: number;
  self_rating: number;
  notes: string;
  created_at: string;
}

export interface Travel {
  id: number;
  destination: string;
  category: string;
  country: string;
  province: string;
  city: string;
  district: string;
  start_date: string;
  end_date: string;
  mood: number;
  weather: string;
  highlights: string; // legacy plain text (kept for backward compat)
  highlights_blocks?: ContentBlock[]; // new rich content
  reflections: string;
  created_at: string;
}

// Rich content block — used in travel highlights for text+image mixing
export type ContentBlock =
  | { type: 'text'; value: string }
  | { type: 'image'; value: string; caption?: string };

export interface Achievement {
  id: number;
  title: string;
  module: string;
  category: string;
  subcategory: string;
  source_id: number | null;
  source_module: string;
  source_title: string;
  parent_id: number | null;
  locked: boolean;
  date: string;
  description: string;
  feeling: string;
  created_at: string;
}

export interface Mood {
  id: number;
  date: string;
  score: number;
  emotions: string[];
  journal: string;
  created_at: string;
}

export interface KeyResult {
  title: string;
  done: boolean;
}

export interface Goal {
  id: number;
  title: string;
  category: string;
  deadline: string;
  key_results: KeyResult[];
  note: string;
  created_at: string;
}

export interface HealthHabit {
  id: number;
  habit_name: string;
  frequency: string;
  records: string[];
  created_at: string;
}

export interface HealthLog {
  id: number;
  category: string;
  date: string;
  exercise: string;
  sleep: number;
  water: number;
  weight: number;
  note: string;
  created_at: string;
}

export interface Finance {
  id: number;
  title: string;
  category: string;
  target_amount: number;
  current_amount: number;
  mood: number;
  completion: number;
  deadline: string;
  note: string;
  date: string;
  created_at: string;
}

export interface Social {
  id: number;
  name: string;
  relationship: string;
  category: string;
  last_contact: string;
  notes: string;
  created_at: string;
}

export interface Insight {
  id: number;
  title: string;
  category: string;
  source: string;
  date: string;
  content: string;
  created_at: string;
}

// ========== Field Config ==========

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'rating' | 'tags' | 'keyresults' | 'progress' | 'module-category' | 'cascader' | 'rich-content';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  dependsOn?: string; // field key this select depends on (for dynamic options)
  presetOptions?: string[]; // preset tag options (for tags field type)
  dynamicCategories?: string; // localStorage key for dynamic category options (for select field type)
}

export interface ModuleConfig {
  name: string;
  icon: string;
  color: string;
  desc: string;
  fields: FieldConfig[];
}

export const ACHIEVEMENT_MODULES = [
  { key: 'learning', name: '📚 学习成长', icon: '📚' },
  { key: 'travel', name: '✈️ 旅行日记', icon: '✈️' },
  { key: 'goals', name: '🎯 目标管理', icon: '🎯' },
  { key: 'health', name: '💪 健康习惯', icon: '💪' },
  { key: 'finance', name: '💰 财务管理', icon: '💰' },
  { key: 'social', name: '🤝 社交人脉', icon: '🤝' },
  { key: 'insights', name: '💡 收获感悟', icon: '💡' },
  { key: 'manual', name: '🏆 手动成就', icon: '🏆' },
];
