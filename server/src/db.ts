import fs from 'fs';
import path from 'path';
import { getSeedData } from '@shared/seedData';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'lifeos.json');

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  password_hash: string;
  created_at: string;
}

interface TableData {
  [key: string]: any[];
}

interface Database {
  users: User[];
  tables: TableData;
  nextId: Record<string, number>;
}

let db: Database = {
  users: [],
  tables: {},
  nextId: {},
};

const tableNames = ['learning', 'travel', 'achievements', 'mood', 'goals', 'health_habits', 'habit_records', 'health_logs', 'finance', 'social', 'insights', 'milestones'];

function initDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      db = JSON.parse(raw);
    } catch {
      resetDb();
    }
  } else {
    resetDb();
  }
  
  ensureSeedData();
}

function resetDb() {
  db = {
    users: [],
    tables: {},
    nextId: {},
  };
  
  tableNames.forEach(name => {
    db.tables[name] = [];
    db.nextId[name] = 1;
  });
  
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.users.push({
    id: 1,
    username: 'admin',
    email: 'admin@lifeos.com',
    phone: '',
    password_hash: hashedPassword,
    created_at: new Date().toISOString(),
  });
  
  saveDb();
}

function ensureSeedData() {
  tableNames.forEach(name => {
    if (!db.tables[name]) db.tables[name] = [];
    if (!db.nextId[name]) db.nextId[name] = 1;
  });
  
  const adminUserId = db.users.find(u => u.email === 'admin@lifeos.com')?.id || 1;
  const seedData = getSeedData();
  
  Object.entries(seedData).forEach(([table, items]: [string, any[]]) => {
    if (!Array.isArray(items) || !(table in db.tables)) return;
    
    const existing = (db.tables[table] as any[]).filter((item: any) => item.user_id === adminUserId);
    if (existing.length === 0) {
      items.forEach(item => {
        const id = db.nextId[table]++;
        db.tables[table].push({ ...item, id, user_id: adminUserId });
      });
    }
  });
  
  if (db.users.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.users.push({
      id: 1,
      username: 'admin',
      email: 'admin@lifeos.com',
      phone: '',
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
    });
  }
  
  saveDb();
}

function saveDb() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDb() {
  initDb();
  return db;
}

export { saveDb };
