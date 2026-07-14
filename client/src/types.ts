export type {
  ContentBlock,
  KeyResult,
  Learning,
  Travel,
  Achievement,
  Mood,
  Goal,
  HealthHabit,
  HealthLog,
  Finance,
  Social,
  Insight,
  Milestone,
} from '@shared/schemas';

// ========== Field Config ==========

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'rating' | 'tags' | 'keyresults' | 'progress' | 'module-category' | 'cascader' | 'rich-content' | 'achievement-select';

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
  { key: 'learning', name: '学习成长', icon: 'BookOpen' },
  { key: 'travel', name: '旅行日记', icon: 'Plane' },
  { key: 'goals', name: '目标管理', icon: 'Target' },
  { key: 'health', name: '健康习惯', icon: 'Dumbbell' },
  { key: 'finance', name: '财务管理', icon: 'Wallet' },
  { key: 'social', name: '社交人脉', icon: 'Users' },
  { key: 'insights', name: '收获感悟', icon: 'Lightbulb' },
  { key: 'manual', name: '手动成就', icon: 'Trophy' },
];
