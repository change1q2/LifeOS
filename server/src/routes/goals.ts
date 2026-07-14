import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getNodeByPath(nodes: any[], path: number[]): { node: any; parents: any[] } | null {
  let current = nodes;
  let node: any;
  const parents: any[] = [];

  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    node = current[index];
    if (!node) return null;

    if (i < path.length - 1) {
      if (!Array.isArray(node.children)) return null;
      parents.push(node);
      current = node.children;
    }
  }

  return { node, parents };
}

function isNodeComplete(node: any): boolean {
  if (node.done !== true) return false;
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.every(isNodeComplete);
  }
  return true;
}

function isGoalFullyComplete(keyResults: any[]): boolean {
  if (!Array.isArray(keyResults) || keyResults.length === 0) return false;
  return keyResults.every(isNodeComplete);
}

function unlockLinkedAchievement(goal: any, userId: number): void {
  const db = getDb();
  const achievements = db.tables.achievements || [];
  const achievement = achievements.find((a: any) => a.id === goal.linked_achievement_id && a.user_id === userId);
  if (!achievement) return;

  achievement.locked = false;
  achievement.date = todayISO();
  achievement.updated_at = new Date().toISOString();
  saveDb();
}

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
  const { keyResults, linked_achievement_id, id, user_id, created_at, updated_at, ...rest } = req.body;
  const item = {
    ...rest,
    linked_achievement_id,
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
  const { keyResults, linked_achievement_id, id, user_id, created_at, ...rest } = req.body;
  list[idx] = {
    ...list[idx],
    ...rest,
    linked_achievement_id: linked_achievement_id !== undefined ? linked_achievement_id : list[idx].linked_achievement_id,
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
  const { path } = req.body;

  if (!Array.isArray(path) || path.length === 0 || !path.every((i: any) => typeof i === 'number')) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const list = db.tables.goals || [];
  const idx = list.findIndex((item: any) => item.id === Number(req.params.id) && item.user_id === req.userId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  const goal = list[idx];
  let keyResults: any[] = [];
  if (goal.key_results && typeof goal.key_results === 'string') {
    try { keyResults = JSON.parse(goal.key_results); } catch {}
  } else if (Array.isArray(goal.key_results)) {
    keyResults = goal.key_results;
  }

  const result = getNodeByPath(keyResults, path);
  if (!result) {
    return res.status(404).json({ error: 'Key result not found' });
  }

  const { node, parents } = result;
  node.done = !node.done;

  for (let i = parents.length - 1; i >= 0; i--) {
    const parent = parents[i];
    if (Array.isArray(parent.children)) {
      parent.done = parent.children.every((child: any) => child.done === true);
    }
  }

  goal.key_results = JSON.stringify(keyResults);
  goal.updated_at = new Date().toISOString();
  saveDb();

  goal.key_results = keyResults;

  if (req.userId && isGoalFullyComplete(keyResults) && goal.linked_achievement_id) {
    unlockLinkedAchievement(goal, req.userId);
  }

  res.json(goal);
});

export default router;
