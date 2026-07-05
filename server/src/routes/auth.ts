import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { register, login as authLogin, resetPassword } from '../lib/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;
  
  if (!username && !email && !phone) {
    return res.status(400).json({ success: false, error: '请至少填写账号、邮箱或手机号中的一项' });
  }
  
  if (!password) {
    return res.status(400).json({ success: false, error: '请填写密码' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: '密码至少需要6个字符' });
  }

  try {
    const db = await getDb();
    const user = await register(db, username || '', email || '', phone || '', password);
    saveDb();
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, phone: user.phone } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: '请填写账号和密码' });
  }

  try {
    const db = await getDb();
    const { token, user } = await authLogin(db, identifier, password);
    res.json({ success: true, token, id: user.id, username: user.username, email: user.email, phone: user.phone });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { identifier, newPassword } = req.body;
  
  if (!identifier) {
    return res.status(400).json({ success: false, error: '请填写账号、邮箱或手机号' });
  }
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: '新密码至少需要6个字符' });
  }

  try {
    const db = await getDb();
    const user = await resetPassword(db, identifier, newPassword);
    saveDb();
    res.json({ success: true, message: '密码重置成功' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

router.get('/me', authMiddleware, (req: any, res) => {
  if (req.userId) {
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.userId);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, phone: user.phone } });
    } else {
      res.status(404).json({ success: false, error: '用户不存在' });
    }
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
});

export default router;
