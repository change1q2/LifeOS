import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/api/goals', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const result = (db.tables.goals || []).filter((item: any) => item.user_id === req.userId)
    .sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
    .map((item: any) => {
      if (item.key_results && typeof item.key_results === 'string') {
        try { item.key_results = JSON.parse(item.key_results); } catch {}
      }
      return item;
    });
  res.json(result);
});

router.post('/api/goals', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const { keyResults, id, user_id, created_at, updated_at, ...rest } = req.body;
  const item = {
    ...rest,
    key_results: keyResults ? JSON.stringify(keyResults) : '[]',
    id: db.nextId.goals++,
    user_id: req.userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  (db.tables.goals ||= []).unshift(item);
  saveDb();
  
  if (item.key_results && typeof item.key_results === 'string') {
    try { item.key_results = JSON.parse(item.key_results); } catch {}
  }
  res.json(item);
});

router.put('/api/goals/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const list = db.tables.goals || [];
  const idx = list.findIndex((item: any) => item.id === Number(req.params.id) && item.user_id === req.userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  const { keyResults, id, user_id, created_at, ...rest } = req.body;
  list[idx] = {
    ...list[idx],
    ...rest,
    key_results: keyResults !== undefined ? JSON.stringify(keyResults) : list[idx].key_results,
    updated_at: new Date().toISOString()
  };
  saveDb();
  
  if (list[idx].key_results && typeof list[idx].key_results === 'string') {
    try { list[idx].key_results = JSON.parse(list[idx].key_results); } catch {}
  }
  res.json(list[idx]);
});

router.delete('/api/goals/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  db.tables.goals = (db.tables.goals || []).filter((item: any) => !(item.id === Number(req.params.id) && item.user_id === req.userId));
  saveDb();
  res.json({ success: true });
});

router.patch('/api/goals/:id/toggle-kr', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const { krIndex } = req.body;
  const list = db.tables.goals || [];
  const idx = list.findIndex((item: any) => item.id === Number(req.params.id) && item.user_id === req.userId);
  
  if (idx === -1) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  
  const goal = list[idx];
  let keyResults = [];
  if (goal.key_results && typeof goal.key_results === 'string') {
    try { keyResults = JSON.parse(goal.key_results); } catch {}
  }
  
  if (!keyResults[krIndex]) {
    return res.status(404).json({ error: 'Key result not found' });
  }
  
  keyResults[krIndex].done = !keyResults[krIndex].done;
  goal.key_results = JSON.stringify(keyResults);
  goal.updated_at = new Date().toISOString();
  saveDb();
  
  goal.key_results = keyResults;
  res.json(goal);
});

export default router;
