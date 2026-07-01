// ========== Types ==========

export interface Learning {
  id: number;
  type: string;
  title: string;
  source: string;
  date: string;
  status: string;
  rating: number;
  notes: string;
  created_at: string;
}

export interface Travel {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  mood: number;
  weather: string;
  highlights: string;
  reflections: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  title: string;
  category: string;
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
  type: string;
  category: string;
  amount: number;
  date: string;
  note: string;
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
  source: string;
  date: string;
  content: string;
  created_at: string;
}

// ========== Field Config ==========

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'rating' | 'tags' | 'keyresults';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface ModuleConfig {
  name: string;
  icon: string;
  color: string;
  desc: string;
  fields: FieldConfig[];
}
