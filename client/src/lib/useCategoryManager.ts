import { useState, useCallback } from 'react';
import { api } from './api';

/**
 * Category manager configuration
 */
export interface CategoryConfig {
  /** localStorage key, e.g. 'lifeos_skill_categories' */
  storageKey: string;
  /** Default category list (used when localStorage is empty) */
  defaults: string[];
  /** Category name to assign when a category is deleted */
  fallbackCategory: string;
  /** Emoji icon pool for category cards */
  icons: string[];
  /** Emoji for the "All" card */
  allIcon: string;
  /** Module English name for API calls (e.g. 'learning', 'travel') */
  moduleName: string;
  /** Dialog title, e.g. '管理技能树分类' */
  dialogTitle: string;
  /** Section title, e.g. '技能树分类' */
  sectionTitle: string;
}

function loadFromStorage(key: string, defaults: string[]): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...defaults];
}

function saveToStorage(key: string, cats: string[]) {
  localStorage.setItem(key, JSON.stringify(cats));
}

/**
 * Reusable hook for category/tree management.
 * Used by LearningPage, TravelPage, GoalsPage, FinancePage, HealthPage, etc.
 */
export function useCategoryManager(config: CategoryConfig) {
  const [categories, setCategories] = useState<string[]>(() => loadFromStorage(config.storageKey, config.defaults));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<{ index: number; value: string } | null>(null);

  const refreshCategories = useCallback(() => {
    setCategories(loadFromStorage(config.storageKey, config.defaults));
  }, [config.storageKey, config.defaults]);

  const selectCategory = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
  }, []);

  /** Toggle: if already selected, deselect; otherwise select */
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategory(prev => prev === cat ? null : cat);
  }, []);

  const addCategory = useCallback(() => {
    const newCats = [...categories, '新分类'];
    setCategories(newCats);
    saveToStorage(config.storageKey, newCats);
    setEditingIndex({ index: newCats.length - 1, value: '新分类' });
  }, [categories, config.storageKey]);

  const renameCategory = useCallback(async (idx: number, newName: string) => {
    const oldName = categories[idx];
    const newCats = [...categories];
    newCats[idx] = newName;
    setCategories(newCats);
    saveToStorage(config.storageKey, newCats);
    // Update all items with the old category name
    try {
      const items = await api.list(config.moduleName);
      for (const item of items) {
        if (item.category === oldName) {
          await api.update(config.moduleName, item.id, { ...item, category: newName });
        }
      }
    } catch (err) {
      console.error(`Failed to migrate items for category rename:`, err);
    }
    setEditingIndex(null);
  }, [categories, config.storageKey, config.moduleName]);

  const deleteCategory = useCallback(async (idx: number) => {
    const cat = categories[idx];
    if (!confirm(`确定删除分类"${cat}"？该分类下的记录将移至"${config.fallbackCategory}"。`)) return;
    const newCats = categories.filter((_, i) => i !== idx);
    setCategories(newCats);
    saveToStorage(config.storageKey, newCats);
    // Move items to fallback category
    try {
      const items = await api.list(config.moduleName);
      for (const item of items) {
        if (item.category === cat) {
          await api.update(config.moduleName, item.id, { ...item, category: config.fallbackCategory });
        }
      }
    } catch (err) {
      console.error(`Failed to migrate items for category deletion:`, err);
    }
    if (selectedCategory === cat) setSelectedCategory(null);
  }, [categories, config.storageKey, config.moduleName, config.fallbackCategory, selectedCategory]);

  const startEdit = useCallback((idx: number) => {
    setEditingIndex({ index: idx, value: categories[idx] });
  }, [categories]);

  const confirmEdit = useCallback((newName: string) => {
    if (editingIndex && newName.trim()) {
      renameCategory(editingIndex.index, newName.trim());
    } else {
      setEditingIndex(null);
    }
  }, [editingIndex, renameCategory]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  /**
   * Compute per-category item counts.
   * Pass the full data array.
   */
  const getCategoryCounts = useCallback((data: any[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const c = item.category || config.fallbackCategory;
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [config.fallbackCategory]);

  /**
   * Filter data by selected category.
   */
  const getFilteredData = useCallback((data: any[]): any[] => {
    if (!selectedCategory) return data;
    return data.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  /**
   * Get the icon for a category at given index.
   */
  const getCategoryIcon = useCallback((idx: number): string => {
    return config.icons[idx % config.icons.length];
  }, [config.icons]);

  return {
    categories,
    selectedCategory,
    manageOpen,
    setManageOpen,
    editingIndex,
    setEditingIndex,
    refreshCategories,
    selectCategory,
    toggleCategory,
    addCategory,
    renameCategory,
    deleteCategory,
    startEdit,
    confirmEdit,
    cancelEdit,
    getCategoryCounts,
    getFilteredData,
    getCategoryIcon,
    config,
  };
}
