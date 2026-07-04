import { storageApi } from './storage';

const BASE = '/api';

let _useApi: boolean | null = null;

function getToken(): string | null {
  return localStorage.getItem('lifeos_token');
}

async function detectBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/me`, { 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken() || ''}`
      } 
    });
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

export function resetMode() {
  _useApi = null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${BASE}${url}`, {
    headers,
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

async function withFallback<T>(apiFn: () => Promise<T>, storageFn: () => T): Promise<T> {
  if (!(await ensureMode())) return storageFn();
  try {
    return await apiFn();
  } catch {
    _useApi = false;
    return storageFn();
  }
}

export const api = {
  register: async (username: string, email: string, phone: string, password: string) => {
    return request('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, phone, password }) });
  },

  login: async (identifier: string, password: string) => {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
  },

  resetPassword: async (identifier: string, newPassword: string) => {
    return request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ identifier, newPassword }) });
  },

  logout: async () => {
    return request('/auth/logout', { method: 'POST' });
  },

  me: async () => {
    return request('/auth/me');
  },

  list: async <T>(module: string): Promise<T[]> => {
    return withFallback(
      () => request<T[]>(`/${module}`),
      () => storageApi.list(module) as T[]
    );
  },

  create: async <T>(module: string, data: any): Promise<T> => {
    return withFallback(
      () => request<T>(`/${module}`, { method: 'POST', body: JSON.stringify(data) }),
      () => storageApi.create(module, data) as T
    );
  },

  update: async <T>(module: string, id: number, data: any): Promise<T> => {
    return withFallback(
      () => request<T>(`/${module}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => storageApi.update(module, id, data) as T
    );
  },

  delete: async (module: string, id: number): Promise<{ success: boolean }> => {
    return withFallback(
      () => request<{ success: boolean }>(`/${module}/${id}`, { method: 'DELETE' }),
      () => storageApi.delete(module, id)
    );
  },

  toggleKR: async (id: number, krIndex: number): Promise<any> => {
    return withFallback(
      () => request(`/goals/${id}/toggle-kr`, { method: 'PATCH', body: JSON.stringify({ krIndex }) }),
      () => storageApi.toggleKR(id, krIndex)
    );
  },

  listHabits: async <T>(): Promise<T[]> => {
    return withFallback(
      () => request<T[]>(`/health/habits`),
      () => storageApi.listHabits() as T[]
    );
  },

  createHabit: async <T>(data: any): Promise<T> => {
    return withFallback(
      () => request<T>(`/health/habits`, { method: 'POST', body: JSON.stringify(data) }),
      () => storageApi.createHabit(data) as T
    );
  },

  deleteHabit: async (id: number): Promise<{ success: boolean }> => {
    return withFallback(
      () => request<{ success: boolean }>(`/health/habits/${id}`, { method: 'DELETE' }),
      () => storageApi.deleteHabit(id)
    );
  },

  toggleHabit: async (id: number, date: string): Promise<{ done: boolean }> => {
    return withFallback(
      () => request<{ done: boolean }>(`/health/habits/${id}/toggle`, { method: 'POST', body: JSON.stringify({ date }) }),
      () => storageApi.toggleHabit(id, date)
    );
  },

  listLogs: async <T>(): Promise<T[]> => {
    return withFallback(
      () => request<T[]>(`/health/logs`),
      () => storageApi.listLogs() as T[]
    );
  },

  createLog: async <T>(data: any): Promise<T> => {
    return withFallback(
      () => request<T>(`/health/logs`, { method: 'POST', body: JSON.stringify(data) }),
      () => storageApi.createLog(data) as T
    );
  },

  deleteLog: async (id: number): Promise<{ success: boolean }> => {
    return withFallback(
      () => request<{ success: boolean }>(`/health/logs/${id}`, { method: 'DELETE' }),
      () => storageApi.deleteLog(id)
    );
  },

  exportAll: () => storageApi.exportAll(),
  importAll: (data: any) => { storageApi.importAll(data); resetMode(); },
  resetData: () => { storageApi.reset(); resetMode(); },
};
