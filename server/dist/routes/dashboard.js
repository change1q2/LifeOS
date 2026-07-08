import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
const MODULE_MAP = {
    learning: { name: '学习成长', color: '#0EA5E9', titleKey: 'title', dateKey: 'start_date' },
    travel: { name: '旅行日记', color: '#F97316', titleKey: 'destination', dateKey: 'start_date' },
    achievements: { name: '成就墙', color: '#F59E0B', titleKey: 'title', dateKey: 'date' },
    mood: { name: '心情心态', color: '#EC4899', titleKey: 'journal', dateKey: 'date' },
    goals: { name: '目标管理', color: '#10B981', titleKey: 'title', dateKey: 'created_at' },
    finance: { name: '财务管理', color: '#8B5CF6', titleKey: 'note', dateKey: 'date' },
    social: { name: '社交人脉', color: '#06B6D4', titleKey: 'name', dateKey: 'last_contact' },
    insights: { name: '收获感悟', color: '#F43F5E', titleKey: 'title', dateKey: 'date' },
};
function getUserData(db, userId, table) {
    return (db.tables[table] || []).filter((item) => item.user_id === userId);
}
router.get('/api/dashboard', authMiddleware, (req, res) => {
    const db = getDb();
    const userId = req.userId;
    const learning = getUserData(db, userId, 'learning');
    const travel = getUserData(db, userId, 'travel');
    const achievements = getUserData(db, userId, 'achievements');
    const mood = getUserData(db, userId, 'mood');
    const goals = getUserData(db, userId, 'goals');
    const finance = getUserData(db, userId, 'finance');
    const social = getUserData(db, userId, 'social');
    const insights = getUserData(db, userId, 'insights');
    const healthLogs = getUserData(db, userId, 'health_logs');
    const stats = {
        learning: learning.length,
        travel: travel.length,
        achievements: achievements.length,
        goals: goals.length,
        insights: insights.length,
        social: social.length,
        health: healthLogs.length,
    };
    const recent = [];
    const moduleData = [
        { data: learning, module: 'learning' },
        { data: travel, module: 'travel' },
        { data: achievements, module: 'achievements' },
        { data: mood, module: 'mood' },
        { data: goals, module: 'goals' },
        { data: finance, module: 'finance' },
        { data: social, module: 'social' },
        { data: insights, module: 'insights' },
    ];
    moduleData.forEach(({ data, module }) => {
        const config = MODULE_MAP[module];
        data.slice(0, 2).forEach((item) => {
            const title = item[config.titleKey] || `${item.type || ''} ${item.category || ''}`.trim();
            const date = item.date || item.start_date || item.last_contact || item.created_at || '';
            recent.push({
                module,
                moduleName: config.name,
                color: config.color,
                title: title || '(无标题)',
                date,
            });
        });
    });
    recent.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
    const topRecent = recent.slice(0, 8);
    const today = new Date();
    const moodDays = [];
    const moodMap = {};
    mood.forEach((m) => { moodMap[m.date] = m.score; });
    for (let i = 13; i >= 0; i--) {
        const t = new Date(today);
        t.setDate(t.getDate() - i);
        const ds = t.toISOString().split('T')[0];
        moodDays.push({ date: ds, score: moodMap[ds] || 0 });
    }
    const topGoals = goals.slice(0, 3).map((g) => {
        const keyResults = g.key_results || [];
        const total = keyResults.length || 1;
        const done = keyResults.filter((k) => k.done).length || 0;
        const progress = Math.round(done / total * 100);
        return {
            id: g.id,
            title: g.title,
            progress,
        };
    });
    const topFinances = finance.slice(0, 3).map((f) => ({
        id: f.id,
        title: f.title,
        completion: f.completion || 0,
        current_amount: Number(f.current_amount) || 0,
        target_amount: Number(f.target_amount) || 0,
    }));
    res.json({
        stats,
        recent: topRecent,
        moods: moodDays,
        goals: topGoals,
        finances: topFinances,
    });
});
export default router;
