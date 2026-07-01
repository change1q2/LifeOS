import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'lifeos.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ========== SCHEMA ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS learning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT DEFAULT '',
    title TEXT NOT NULL,
    source TEXT DEFAULT '',
    date TEXT DEFAULT '',
    status TEXT DEFAULT '计划中',
    rating INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS travel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT NOT NULL,
    start_date TEXT DEFAULT '',
    end_date TEXT DEFAULT '',
    mood INTEGER DEFAULT 0,
    weather TEXT DEFAULT '',
    highlights TEXT DEFAULT '',
    reflections TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT '',
    date TEXT DEFAULT '',
    description TEXT DEFAULT '',
    feeling TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mood (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    score INTEGER DEFAULT 3,
    emotions TEXT DEFAULT '[]',
    journal TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT '',
    deadline TEXT DEFAULT '',
    key_results TEXT DEFAULT '[]',
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS health_habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_name TEXT NOT NULL,
    frequency TEXT DEFAULT '每日',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habit_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES health_habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  );

  CREATE TABLE IF NOT EXISTS health_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    exercise TEXT DEFAULT '',
    sleep REAL DEFAULT 0,
    water INTEGER DEFAULT 0,
    weight REAL DEFAULT 0,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    category TEXT DEFAULT '',
    amount REAL DEFAULT 0,
    date TEXT DEFAULT '',
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS social (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    relationship TEXT DEFAULT '',
    category TEXT DEFAULT '其他',
    last_contact TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    source TEXT DEFAULT '',
    date TEXT DEFAULT '',
    content TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// ========== SEED DATA ==========
function seedData() {
  const today = new Date();
  const d = (n: number) => {
    const t = new Date(today);
    t.setDate(t.getDate() - n);
    return t.toISOString().split('T')[0];
  };

  const count = db.prepare('SELECT COUNT(*) as c FROM learning').get() as { c: number };
  if (count.c > 0) return; // Already seeded

  // Learning
  const learnStmt = db.prepare(`INSERT INTO learning (type, title, source, date, status, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  learnStmt.run('书籍', '《原则》', '瑞·达利欧', d(20), '已完成', 5, '关于决策和人生原则的深刻思考，核心观点是"极度透明+极度真实"才能做出好决策。');
  learnStmt.run('课程', '产品经理进阶训练营', '极客时间', d(10), '进行中', 4, '系统学习产品方法论，从需求分析到产品落地全流程。');
  learnStmt.run('技能', 'SQL数据分析', '自学', d(5), '进行中', 0, '为数据驱动决策打基础，正在练习复杂查询。');

  // Travel
  const travelStmt = db.prepare(`INSERT INTO travel (destination, start_date, end_date, mood, weather, highlights, reflections) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  travelStmt.run('京都', d(45), d(41), 5, '晴', '樱花季的哲学之道，漫步在花瓣飘落的小路上，时间仿佛静止了。清水寺的夜景也很震撼。', '旅行最大的收获是学会了放慢脚步。在京都的古寺里坐了一下午，什么也没做，但内心前所未有的平静。原来生活不需要时刻奔跑。');
  travelStmt.run('大理', d(80), d(75), 4, '多云', '洱海骑行，苍山徒步，在古城里喝茶发呆。', '大理让我重新思考了"生活节奏"这件事。不是所有地方都需要像大城市一样快。');

  // Achievements
  const achStmt = db.prepare(`INSERT INTO achievements (title, category, date, description, feeling) VALUES (?, ?, ?, ?, ?)`);
  achStmt.run('独立负责产品从0到1上线', '工作', d(30), '从需求调研到产品上线全流程负责，上线后首周用户量突破预期。', '成就感爆棚！更加坚定了做产品的信心。原来把一件事从头做到尾的感觉这么好。');
  achStmt.run('坚持跑步100天', '健康', d(15), '连续100天每天跑步3公里以上，体重减了5公斤。', '自律带来的自由感，比任何事情都让人踏实。');
  achStmt.run('读完12本书', '学习', d(60), '半年读完12本书，涵盖产品、心理学、传记等领域。', '知识的复利效应开始显现，看问题的角度更多元了。');

  // Mood
  const moodStmt = db.prepare(`INSERT INTO mood (date, score, emotions, journal) VALUES (?, ?, ?, ?)`);
  moodStmt.run(d(0), 4, JSON.stringify(['平静', '感恩', '充实']), '今天完成了季度汇报，反馈不错。晚上散步时突然觉得，生活中值得感激的事情其实很多。');
  moodStmt.run(d(1), 3, JSON.stringify(['一般', '略疲惫']), '加班到很晚，有些累。但想到正在做的产品有意义，也就不那么难熬了。');
  moodStmt.run(d(2), 5, JSON.stringify(['开心', '满足']), '和好朋友吃了一顿火锅，聊了很多。能有人倾诉和分享，是很大的幸福。');
  moodStmt.run(d(3), 2, JSON.stringify(['焦虑', '迷茫']), '对未来有些不确定感。但理性想想，这种焦虑本身也是一种动力。');
  moodStmt.run(d(4), 4, JSON.stringify(['有干劲', '乐观']), '制定了一个新的学习计划，感觉找到了方向。行动是治愈焦虑的良药。');
  moodStmt.run(d(5), 3, JSON.stringify(['平静']), '普通的一天，按部就班。有时候平淡也是一种幸福。');
  moodStmt.run(d(6), 5, JSON.stringify(['兴奋', '自豪']), '跑步突破了个人最好成绩！身体和心态都在变好。');

  // Goals
  const goalStmt = db.prepare(`INSERT INTO goals (title, category, deadline, key_results, note) VALUES (?, ?, ?, ?, ?)`);
  goalStmt.run('2026年读完24本书', '学习', '2026-12-31', JSON.stringify([{ title: '每月读2本书', done: true }, { title: '建立读书笔记体系', done: true }, { title: '输出12篇读书笔记', done: false }]), '阅读是投入产出比最高的自我投资。');
  goalStmt.run('存款达到年度目标', '财务', '2026-12-31', JSON.stringify([{ title: '月度储蓄率≥30%', done: true }, { title: '建立应急基金', done: false }, { title: '开始基金定投', done: true }]), '财务自由是人生自由的基础。');
  goalStmt.run('提升产品专业能力', '职业', '2026-09-30', JSON.stringify([{ title: '完成产品训练营', done: false }, { title: '独立负责一个产品模块', done: true }, { title: '输出5篇产品方法论文章', done: false }]), '持续精进，做有价值的产品。');

  // Health habits
  const habitStmt = db.prepare(`INSERT INTO health_habits (habit_name, frequency) VALUES (?, ?)`);
  habitStmt.run('每日阅读30分钟', '每日');
  habitStmt.run('运动30分钟', '每日');
  habitStmt.run('早起7点前', '每日');
  // Seed some habit records
  const hrStmt = db.prepare(`INSERT OR IGNORE INTO habit_records (habit_id, date) VALUES (?, ?)`);
  const habits = db.prepare('SELECT id FROM health_habits').all() as { id: number }[];
  for (let i = 0; i < 7; i++) {
    const ds = d(i);
    habits.forEach((h, idx) => {
      if (Math.random() > 0.3 || i < 3) hrStmt.run(h.id, ds);
    });
  }

  // Health logs
  const hlStmt = db.prepare(`INSERT INTO health_logs (date, exercise, sleep, water, weight, note) VALUES (?, ?, ?, ?, ?, ?)`);
  hlStmt.run(d(0), '跑步5公里', 7.5, 8, 65.5, '状态不错，跑步时心率稳定。');
  hlStmt.run(d(1), '瑜伽30分钟', 6.5, 6, 65.8, '睡眠不太够，明天早点睡。');
  hlStmt.run(d(2), '游泳40分钟', 8, 8, 65.3, '睡眠充足，感觉精力充沛。');

  // Finance
  const finStmt = db.prepare(`INSERT INTO finance (type, category, amount, date, note) VALUES (?, ?, ?, ?, ?)`);
  finStmt.run('收入', '工资', 15000, d(2), '6月工资');
  finStmt.run('支出', '餐饮', 120, d(0), '和朋友聚餐');
  finStmt.run('支出', '交通', 50, d(1), '打车');
  finStmt.run('支出', '学习', 299, d(3), '买了一个在线课程');
  finStmt.run('支出', '购物', 359, d(5), '买了两本书和运动装备');
  finStmt.run('收入', '兼职', 2000, d(7), '帮朋友做了个产品方案');

  // Social
  const socStmt = db.prepare(`INSERT INTO social (name, relationship, category, last_contact, notes) VALUES (?, ?, ?, ?, ?)`);
  socStmt.run('老王', '大学室友', '挚友', d(3), '最近在创业，做教育方向。可以多交流产品经验。');
  socStmt.run('李老师', '前领导', '导师', d(15), '产品启蒙导师，每隔一段时间聊聊收获很大。');
  socStmt.run('小张', '同事', '同事', d(1), '技术大牛，合作做项目很靠谱。');

  // Insights
  const insStmt = db.prepare(`INSERT INTO insights (title, source, date, content) VALUES (?, ?, ?, ?)`);
  insStmt.run('焦虑的本质是对不确定性的恐惧', '反思', d(3), '发现每次焦虑都是因为想要控制无法控制的事情。真正的解法不是消除不确定性，而是提升自己应对不确定性的能力。行动本身就是最好的焦虑解药。');
  insStmt.run('旅行的意义在于"停下来"', '旅行', d(40), '在京都的时候，最大的收获不是看到了什么，而是终于"停下来"了。日常生活中我们总是在赶路，旅行给了我们一个名正言顺的理由，去享受"无所事事"的奢侈。');
  insStmt.run('输出是最好的输入', '学习', d(12), '读完书后写笔记，比单纯读效果好10倍。因为输出逼迫你思考、组织、表达，这个过程本身就是深度学习。');

  console.log('✅ Seed data inserted');
}

seedData();

export default db;
