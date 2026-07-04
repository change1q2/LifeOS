import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const simpleTables = ['learning', 'travel', 'achievements', 'mood', 'finance', 'social', 'insights', 'milestones'];

simpleTables.forEach(table => {
  router.get(`/api/${table}`, authMiddleware, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const result = (db.tables[table] || []).filter((item: any) => item.user_id === req.userId)
      .sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
    res.json(result);
  });

  router.post(`/api/${table}`, authMiddleware, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const { id, user_id, created_at, updated_at, ...data } = req.body;
    const item = { 
      ...data, 
      id: db.nextId[table]++, 
      user_id: req.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    (db.tables[table] ||= []).unshift(item);
    saveDb();
    res.json(item);
  });

  router.put(`/api/${table}/:id`, authMiddleware, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const list = db.tables[table] || [];
    const idx = list.findIndex((item: any) => item.id === Number(req.params.id) && item.user_id === req.userId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    const { id, user_id, created_at, ...data } = req.body;
    list[idx] = { ...list[idx], ...data, updated_at: new Date().toISOString() };
    saveDb();
    res.json(list[idx]);
  });

  router.delete(`/api/${table}/:id`, authMiddleware, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    db.tables[table] = (db.tables[table] || []).filter((item: any) => !(item.id === Number(req.params.id) && item.user_id === req.userId));
    saveDb();
    res.json({ success: true });
  });
});

export default router;
