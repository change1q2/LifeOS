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
    return res.status !== 0;
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

  // 读取原始文本,避免非 JSON 响应(HTML/空)导致 JSON parse 崩溃
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    // 尝试从错误响应里提取 message 字段
    let msg = `API Error: ${res.status}`;
    if (text && contentType.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        if (data && data.message) msg = data.message;
        else if (data && data.error) msg = data.error;
      } catch {
        // ignore
      }
    }
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204 || !text) {
    return undefined as unknown as T;
  }

  // 非 JSON 响应直接抛错
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected response (${contentType || 'unknown'}): ${text.slice(0, 80)}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch (e: any) {
    throw new Error(`Invalid JSON response: ${text.slice(0, 80)}`);
  }
}

async function withFallback<T>(apiFn: () => Promise<T>, storageFn: () => T): Promise<T> {
  if (!(await ensureMode())) return storageFn();
  try {
    return await apiFn();
  } catch (e) {
    // API 调用失败(后端挂了/网络不通/返回了 HTML),降级到 localStorage
    console.warn('⚠️ LifeOS: API call failed, falling back to localStorage:', (e as Error).message);
    _useApi = false;
    return storageFn();
  }
}

// ============ 本地存储认证(后端不可用时使用) ============
const LOCAL_USERS_KEY = 'lifeos_local_users';

interface LocalUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  password: string;
}

function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function ensureDefaultAdmin(): void {
  const users = getLocalUsers();
  if (!users.find(u => u.username === 'admin')) {
    users.push({
      id: 1,
      username: 'admin',
      email: 'admin@lifeos.com',
      phone: '',
      password: 'admin123',
    });
    saveLocalUsers(users);
  }
}

ensureDefaultAdmin();

function generateLocalToken(userId: number): string {
  // 简单本地 token: base64 编码的 "local-{userId}-{timestamp}"
  return 'local.' + btoa(`${userId}.${Date.now()}`);
}

function localLogin(identifier: string, password: string) {
  const users = getLocalUsers();
  const user = users.find(u =>
    (u.username === identifier || u.email === identifier || u.phone === identifier) &&
    u.password === password
  );
  if (!user) {
    throw new Error('账号或密码错误');
  }
  return {
    success: true,
    token: generateLocalToken(user.id),
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
  };
}

function localRegister(username: string, email: string, phone: string, password: string) {
  const users = getLocalUsers();
  if (users.find(u => u.username === username)) {
    throw new Error('账号已存在');
  }
  if (email && users.find(u => u.email === email)) {
    throw new Error('邮箱已被注册');
  }
  const newUser: LocalUser = {
    id: Math.max(0, ...users.map(u => u.id)) + 1,
    username: username || email || phone,
    email: email || `${username || 'user'}@local`,
    phone: phone || '',
    password,
  };
  users.push(newUser);
  saveLocalUsers(users);
  return { success: true, id: newUser.id, username: newUser.username };
}

function localResetPassword(identifier: string, newPassword: string) {
  const users = getLocalUsers();
  const user = users.find(u =>
    u.username === identifier || u.email === identifier || u.phone === identifier
  );
  if (!user) {
    throw new Error('账号不存在');
  }
  user.password = newPassword;
  saveLocalUsers(users);
  return { success: true };
}

export const api = {
  register: async (username: string, email: string, phone: string, password: string) => {
    return withFallback(
      () => request('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, phone, password }) }),
      () => localRegister(username, email, phone, password)
    );
  },

  login: async (identifier: string, password: string) => {
    return withFallback(
      () => request<{ token: string; id: number; email: string; username: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ identifier, password }) }
      ),
      () => localLogin(identifier, password)
    );
  },

  resetPassword: async (identifier: string, newPassword: string) => {
    return withFallback(
      () => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ identifier, newPassword }) }),
      () => localResetPassword(identifier, newPassword)
    );
  },

  logout: async () => {
    if (_useApi === false) return { success: true };
    try {
      return await request('/auth/logout', { method: 'POST' });
    } catch {
      return { success: true };
    }
  },

  me: async () => {
    if (_useApi === false) throw new Error('No backend');
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
