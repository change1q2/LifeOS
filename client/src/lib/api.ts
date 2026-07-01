import { storageApi } from './storage';

const BASE = '/api';

// Auto-detect backend availability
let _useApi: boolean | null = null;

async function detectBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/learning`, { headers: { 'Content-Type': 'application/json' } });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureMode(): Promise<boolean> {
  if (_useApi === null) {
    _useApi = await detectBackend();
    if (!_useApi) {
      console.log('🔄 LifeOS: Backend unavailable, using localStorage mode');
    } else {
      console.log('✅ LifeOS: Backend connected, using API mode');
    }
  }
  return _useApi;
}

// Reset mode detection (e.g. when backend starts/stops)
export function resetMode() {
  _useApi = null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  // Generic CRUD — auto fallback to localStorage
  list: async <T>(module: string): Promise<T[]> => {
    if (!(await ensureMode())) return storageApi.list(module) as T[];
    try {
      return await request<T[]>(`/${module}`);
    } catch {
      _useApi = false;
      return storageApi.list(module) as T[];
    }
  },

  create: async <T>(module: string, data: any): Promise<T> => {
    if (!(await ensureMode())) return storageApi.create(module, data) as T;
    try {
      return await request<T>(`/${module}`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      _useApi = false;
      return storageApi.create(module, data) as T;
    }
  },

  update: async <T>(module: string, id: number, data: any): Promise<T> => {
    if (!(await ensureMode())) return storageApi.update(module, id, data) as T;
    try {
      return await request<T>(`/${module}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      _useApi = false;
      return storageApi.update(module, id, data) as T;
    }
  },

  delete: async (module: string, id: number): Promise<{ success: boolean }> => {
    if (!(await ensureMode())) return storageApi.delete(module, id);
    try {
      return await request<{ success: boolean }>(`/${module}/${id}`, { method: 'DELETE' });
    } catch {
      _useApi = false;
      return storageApi.delete(module, id);
    }
  },

  // Goals — toggle key result
  toggleKR: async (id: number, krIndex: number): Promise<any> => {
    if (!(await ensureMode())) return storageApi.toggleKR(id, krIndex);
    try {
      return await request(`/goals/${id}/toggle-kr`, { method: 'PATCH', body: JSON.stringify({ krIndex }) });
    } catch {
      _useApi = false;
      return storageApi.toggleKR(id, krIndex);
    }
  },

  // Health habits
  listHabits: async <T>(): Promise<T[]> => {
    if (!(await ensureMode())) return storageApi.listHabits() as T[];
    try {
      return await request<T[]>(`/health/habits`);
    } catch {
      _useApi = false;
      return storageApi.listHabits() as T[];
    }
  },

  createHabit: async <T>(data: any): Promise<T> => {
    if (!(await ensureMode())) return storageApi.createHabit(data) as T;
    try {
      return await request<T>(`/health/habits`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      _useApi = false;
      return storageApi.createHabit(data) as T;
    }
  },

  deleteHabit: async (id: number): Promise<{ success: boolean }> => {
    if (!(await ensureMode())) return storageApi.deleteHabit(id);
    try {
      return await request<{ success: boolean }>(`/health/habits/${id}`, { method: 'DELETE' });
    } catch {
      _useApi = false;
      return storageApi.deleteHabit(id);
    }
  },

  toggleHabit: async (id: number, date: string): Promise<{ done: boolean }> => {
    if (!(await ensureMode())) return storageApi.toggleHabit(id, date);
    try {
      return await request<{ done: boolean }>(`/health/habits/${id}/toggle`, { method: 'POST', body: JSON.stringify({ date }) });
    } catch {
      _useApi = false;
      return storageApi.toggleHabit(id, date);
    }
  },

  // Health logs
  listLogs: async <T>(): Promise<T[]> => {
    if (!(await ensureMode())) return storageApi.listLogs() as T[];
    try {
      return await request<T[]>(`/health/logs`);
    } catch {
      _useApi = false;
      return storageApi.listLogs() as T[];
    }
  },

  createLog: async <T>(data: any): Promise<T> => {
    if (!(await ensureMode())) return storageApi.createLog(data) as T;
    try {
      return await request<T>(`/health/logs`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      _useApi = false;
      return storageApi.createLog(data) as T;
    }
  },

  deleteLog: async (id: number): Promise<{ success: boolean }> => {
    if (!(await ensureMode())) return storageApi.deleteLog(id);
    try {
      return await request<{ success: boolean }>(`/health/logs/${id}`, { method: 'DELETE' });
    } catch {
      _useApi = false;
      return storageApi.deleteLog(id);
    }
  },

  // Export / Import (localStorage mode only, but works as utility)
  exportAll: () => storageApi.exportAll(),
  importAll: (data: any) => { storageApi.importAll(data); resetMode(); },
  resetData: () => { storageApi.reset(); resetMode(); },
};
