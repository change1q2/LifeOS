import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(s?: string): string {
  if (!s) return '';
  const d = new Date(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateFull(s?: string): string {
  if (!s) return '';
  const d = new Date(s);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function badgeColor(cat: string): string {
  const map: Record<string, string> = {
    '工作': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    '学习': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    '生活': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    '个人成长': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    '健康': 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    '社交': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    '职业': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    '财务': 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    '收入': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    '支出': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    '挚友': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    '同事': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    '行业人脉': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    '家人': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    '导师': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    '其他': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    '反思': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    '旅行': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    '阅读': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    '对话': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  };
  return map[cat] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}
