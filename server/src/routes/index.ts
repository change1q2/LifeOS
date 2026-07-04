import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Helper: parse JSON fields
function parseJSONFields(row: any, fields: string[]) {
  if (!row) return row;
  const result = { ...row };
  for (const f of fields) {
    if (result[f] && typeof result[f] === 'string') {
      try { result[f] = JSON.parse(result[f]); } catch { result[f] = []; }
    }
  }
  return result;
}

// ========== GENERIC CRUD for simple tables ==========
const SIMPLE_TABLES: Record<string, { table: string; jsonFields?: string[] }> = {
  learning: { table: 'learning' },
  travel: { table: 'travel', jsonFields: ['highlights_blocks'] },
  achievements: { table: 'achievements' },
  mood: { table: 'mood', jsonFields: ['emotions'] },
  insights: { table: 'insights' },
  social: { table: 'social' },
  finance: { table: 'finance' },
};

// Generic CRUD for simple tables
for (const [key, config] of Object.entries(SIMPLE_TABLES)) {
  const { table, jsonFields } = config;

  // GET all
  router.get(`/api/${key}`, (_req, res) => {
    const rows = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
    const parsed = jsonFields ? rows.map((r: any) => parseJSONFields(r, jsonFields)) : rows;
    res.json(parsed);
  });

  // POST create
  router.post(`/api/${key}`, (req, res) => {
    const body = req.body;
    const keys = Object.keys(body).filter(k => body[k] !== undefined);
    const values = keys.map(k => {
      const v = body[k];
      if (jsonFields?.includes(k) && Array.isArray(v)) return JSON.stringify(v);
      return v;
    });
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.map(k => {
      // Convert camelCase to snake_case
      return k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }).join(', ');

    const stmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);
    const result = stmt.run(...values);
    const newRow = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid);
    res.json(jsonFields ? parseJSONFields(newRow, jsonFields) : newRow);
  });

  // PUT update
  router.put(`/api/${key}/:id`, (req, res) => {
    const body = req.body;
    const keys = Object.keys(body).filter(k => body[k] !== undefined && k !== 'id');
    const sets = keys.map(k => {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `${col} = ?`;
    }).join(', ');
    const values = keys.map(k => {
      const v = body[k];
      if (jsonFields?.includes(k) && Array.isArray(v)) return JSON.stringify(v);
      return v;
    });

    db.prepare(`UPDATE ${table} SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, req.params.id);
    const updated = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    res.json(jsonFields ? parseJSONFields(updated, jsonFields) : updated);
  });

  // DELETE
  router.delete(`/api/${key}/:id`, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
  });
}

// ========== GOALS (special: key_results JSON) ==========
router.get('/api/goals', (_req, res) => {
  const rows = db.prepare('SELECT * FROM goals ORDER BY id DESC').all() as any[];
  res.json(rows.map(r => ({ ...r, key_results: JSON.parse(r.key_results || '[]') })));
});

router.post('/api/goals', (req, res) => {
  const { title, category, deadline, keyResults, note } = req.body;
  const result = db.prepare(`INSERT INTO goals (title, category, deadline, key_results, note) VALUES (?, ?, ?, ?, ?)`)
    .run(title, category || '', deadline || '', JSON.stringify(keyResults || []), note || '');
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid) as any;
  res.json({ ...row, key_results: JSON.parse(row.key_results || '[]') });
});

router.put('/api/goals/:id', (req, res) => {
  const { title, category, deadline, keyResults, note } = req.body;
  db.prepare(`UPDATE goals SET title = ?, category = ?, deadline = ?, key_results = ?, note = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(title, category, deadline, JSON.stringify(keyResults || []), note, req.params.id);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as any;
  res.json({ ...row, key_results: JSON.parse(row.key_results || '[]') });
});

// Toggle key result
router.patch('/api/goals/:id/toggle-kr', (req, res) => {
  const { krIndex } = req.body;
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Not found' });
  const krs = JSON.parse(row.key_results || '[]');
  if (krs[krIndex]) {
    krs[krIndex].done = !krs[krIndex].done;
    db.prepare('UPDATE goals SET key_results = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(JSON.stringify(krs), req.params.id);
  }
  res.json({ ...row, key_results: krs });
});

// ========== HEALTH HABITS ==========
router.get('/api/health/habits', (_req, res) => {
  const habits = db.prepare('SELECT * FROM health_habits ORDER BY id DESC').all() as any[];
  const records = db.prepare('SELECT * FROM habit_records').all() as any[];
  const recordMap: Record<number, string[]> = {};
  records.forEach(r => {
    if (!recordMap[r.habit_id]) recordMap[r.habit_id] = [];
    recordMap[r.habit_id].push(r.date);
  });
  res.json(habits.map(h => ({ ...h, records: recordMap[h.id] || [] })));
});

router.post('/api/health/habits', (req, res) => {
  const { habitName, frequency } = req.body;
  const result = db.prepare('INSERT INTO health_habits (habit_name, frequency) VALUES (?, ?)').run(habitName, frequency || '每日');
  const row = db.prepare('SELECT * FROM health_habits WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...row, records: [] });
});

router.delete('/api/health/habits/:id', (req, res) => {
  db.prepare('DELETE FROM health_habits WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Toggle habit record
router.post('/api/health/habits/:id/toggle', (req, res) => {
  const habitId = req.params.id;
  const { date } = req.body;
  const existing = db.prepare('SELECT id FROM habit_records WHERE habit_id = ? AND date = ?').get(habitId, date);
  if (existing) {
    db.prepare('DELETE FROM habit_records WHERE habit_id = ? AND date = ?').run(habitId, date);
    res.json({ done: false });
  } else {
    db.prepare('INSERT INTO habit_records (habit_id, date) VALUES (?, ?)').run(habitId, date);
    res.json({ done: true });
  }
});

// ========== HEALTH LOGS ==========
router.get('/api/health/logs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM health_logs ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/api/health/logs', (req, res) => {
  const { category, date, exercise, sleep, water, weight, note } = req.body;
  const result = db.prepare(`INSERT INTO health_logs (category, date, exercise, sleep, water, weight, note) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(category || '', date, exercise || '', sleep || 0, water || 0, weight || 0, note || '');
  const row = db.prepare('SELECT * FROM health_logs WHERE id = ?').get(result.lastInsertRowid);
  res.json(row);
});

router.delete('/api/health/logs/:id', (req, res) => {
  db.prepare('DELETE FROM health_logs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PUT update health log
router.put('/api/health_logs/:id', (req, res) => {
  const { category, date, exercise, sleep, water, weight, note } = req.body;
  db.prepare(`UPDATE health_logs SET category = ?, date = ?, exercise = ?, sleep = ?, water = ?, weight = ?, note = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(category || '', date || '', exercise || '', sleep || 0, water || 0, weight || 0, note || '', req.params.id);
  const row = db.prepare('SELECT * FROM health_logs WHERE id = ?').get(req.params.id);
  res.json(row);
});

export default router;
