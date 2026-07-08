import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/api/health/habits', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const habits = (db.tables.health_habits || []).filter((h: any) => h.user_id === req.userId);
  const records = (db.tables.habit_records || []).filter((r: any) => r.user_id === req.userId);
  
  const recordsMap: Record<number, string[]> = {};
  records.forEach((r: any) => {
    if (!recordsMap[r.habit_id]) recordsMap[r.habit_id] = [];
    recordsMap[r.habit_id].push(r.date);
  });
  
  res.json(habits.map((h: any) => ({ ...h, records: recordsMap[h.id] || [] })));
});

router.post('/api/health/habits', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const { habitName, frequency } = req.body;
  const item = {
    id: db.nextId.health_habits++,
    user_id: req.userId,
    habit_name: habitName || '',
    frequency: frequency || '每日',
    created_at: new Date().toISOString(),
  };
  (db.tables.health_habits ||= []).push(item);
  saveDb();
  res.json({ ...item, records: [] });
});

router.delete('/api/health/habits/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const targetId = Number(req.params.id);
  db.tables.health_habits = (db.tables.health_habits || []).filter((h: any) => {
    const idMatch = Number(h.id) === targetId;
    const userMatch = h.user_id === req.userId;
    return !(idMatch && userMatch);
  });
  db.tables.habit_records = (db.tables.habit_records || []).filter((r: any) => {
    const habitIdMatch = Number(r.habit_id) === targetId;
    const userMatch = r.user_id === req.userId;
    return !(habitIdMatch && userMatch);
  });
  saveDb();
  res.json({ success: true });
});

router.post('/api/health/habits/:id/toggle', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const habitId = Number(req.params.id);
  const { date } = req.body;
  
  const records = db.tables.habit_records || [];
  const existingIdx = records.findIndex((r: any) => r.habit_id === habitId && r.date === date && r.user_id === req.userId);
  
  if (existingIdx !== -1) {
    records.splice(existingIdx, 1);
    saveDb();
    res.json({ done: false });
  } else {
    records.push({
      id: db.nextId.habit_records++,
      user_id: req.userId,
      habit_id: habitId,
      date,
    });
    saveDb();
    res.json({ done: true });
  }
});

router.get('/api/health/logs', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const result = (db.tables.health_logs || []).filter((item: any) => item.user_id === req.userId)
    .sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
  res.json(result);
});

router.post('/api/health/logs', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const { category, date, exercise, sleep, water, weight, note } = req.body;
  const item = {
    id: db.nextId.health_logs++,
    user_id: req.userId,
    category: category || '',
    date,
    exercise: exercise || '',
    sleep: Number(sleep) || 0,
    water: Number(water) || 0,
    weight: Number(weight) || 0,
    note: note || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  (db.tables.health_logs ||= []).unshift(item);
  saveDb();
  res.json(item);
});

router.put('/api/health_logs/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const list = db.tables.health_logs || [];
  const idx = list.findIndex((item: any) => item.id === Number(req.params.id) && item.user_id === req.userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  const { category, date, exercise, sleep, water, weight, note } = req.body;
  list[idx] = {
    ...list[idx],
    category: category || '',
    date: date || '',
    exercise: exercise || '',
    sleep: Number(sleep) || 0,
    water: Number(water) || 0,
    weight: Number(weight) || 0,
    note: note || '',
    updated_at: new Date().toISOString(),
  };
  saveDb();
  res.json(list[idx]);
});

router.delete('/api/health/logs/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const targetId = Number(req.params.id);
  db.tables.health_logs = (db.tables.health_logs || []).filter((item: any) => {
    const idMatch = Number(item.id) === targetId;
    const userMatch = item.user_id === req.userId;
    return !(idMatch && userMatch);
  });
  saveDb();
  res.json({ success: true });
});

export default router;
