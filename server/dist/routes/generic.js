import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
const simpleTables = ['learning', 'travel', 'achievements', 'mood', 'finance', 'social', 'insights', 'milestones'];
simpleTables.forEach(table => {
    router.get(`/api/${table}`, authMiddleware, (req, res) => {
        const db = getDb();
        const result = (db.tables[table] || []).filter((item) => item.user_id === req.userId)
            .sort((a, b) => (b.id || 0) - (a.id || 0));
        res.json(result);
    });
    router.post(`/api/${table}`, authMiddleware, (req, res) => {
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
    router.put(`/api/${table}/:id`, authMiddleware, (req, res) => {
        const db = getDb();
        const list = db.tables[table] || [];
        const idx = list.findIndex((item) => item.id === Number(req.params.id) && item.user_id === req.userId);
        if (idx === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }
        const { id, user_id, created_at, ...data } = req.body;
        list[idx] = { ...list[idx], ...data, updated_at: new Date().toISOString() };
        saveDb();
        res.json(list[idx]);
    });
    router.delete(`/api/${table}/:id`, authMiddleware, (req, res) => {
        const db = getDb();
        db.tables[table] = (db.tables[table] || []).filter((item) => !(item.id === Number(req.params.id) && item.user_id === req.userId));
        saveDb();
        res.json({ success: true });
    });
});
export default router;
