import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lifeos_secret_key_2024';
const JWT_EXPIRES_IN = '24h';

export async function register(db: any, username: string, email: string, phone: string, password: string) {
  if (username) {
    const existingByUsername = db.users.find((u: any) => u.username === username);
    if (existingByUsername) {
      throw new Error('账号已被注册');
    }
  }

  if (email) {
    const existingByEmail = db.users.find((u: any) => u.email === email);
    if (existingByEmail) {
      throw new Error('邮箱已被注册');
    }
  }

  if (phone) {
    const existingByPhone = db.users.find((u: any) => u.phone === phone);
    if (existingByPhone) {
      throw new Error('手机号已被注册');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: db.users.length > 0 ? Math.max(...db.users.map((u: any) => u.id)) + 1 : 1,
    username: username || '',
    email: email || '',
    phone: phone || '',
    password_hash: hashedPassword,
    created_at: new Date().toISOString(),
  };
  db.users.push(user);
  
  return user;
}

export async function login(db: any, identifier: string, password: string) {
  let user = null;
  
  if (identifier.includes('@')) {
    user = db.users.find((u: any) => u.email === identifier);
  } else if (/^1[3-9]\d{9}$/.test(identifier)) {
    user = db.users.find((u: any) => u.phone === identifier);
  } else {
    user = db.users.find((u: any) => u.username === identifier);
  }
  
  if (!user) {
    throw new Error('账号或密码错误');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('账号或密码错误');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  return { token, user };
}

export async function resetPassword(db: any, identifier: string, newPassword: string) {
  let user = null;
  
  if (identifier.includes('@')) {
    user = db.users.find((u: any) => u.email === identifier);
  } else if (/^1[3-9]\d{9}$/.test(identifier)) {
    user = db.users.find((u: any) => u.phone === identifier);
  } else {
    user = db.users.find((u: any) => u.username === identifier);
  }
  
  if (!user) {
    throw new Error('用户不存在');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password_hash = hashedPassword;
  
  return user;
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch {
    return null;
  }
}
