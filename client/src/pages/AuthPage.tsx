import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sprout } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password';
type RegisterMethod = 'username' | 'email' | 'phone';

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('请填写账号和密码');
      return;
    }

    setLoading(true);
    try {
      const result = await api.login(identifier, password) as { token: string; id: number; email: string; username: string };
      login(result.token, { id: result.id, email: result.email || result.username || '' });
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerMethod === 'username' && !username) {
      setError('请填写账号');
      return;
    }
    if (registerMethod === 'email' && !email) {
      setError('请填写邮箱');
      return;
    }
    if (registerMethod === 'phone' && !phone) {
      setError('请填写手机号');
      return;
    }
    if (registerMethod === 'phone' && !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (!password) {
      setError('请填写密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.register(username, email, phone, password);
      const result = await api.login(identifier || email || phone, password) as { token: string; id: number; email: string; username: string };
      login(result.token, { id: result.id, email: result.email || result.username || '' });
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier) {
      setError('请填写账号、邮箱或手机号');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('新密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(identifier, newPassword);
      setSuccess('密码重置成功，请返回登录');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || '重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 mb-4 shadow-xl shadow-cyan-500/20">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">人生系统</h1>
          <p className="text-slate-400">记录你的成长旅程</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          {mode !== 'forgot-password' && (
            <div className="flex mb-8">
              <button
                className={`flex-1 py-3 text-sm font-semibold transition-all rounded-lg ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setMode('login')}
              >
                登录
              </button>
              <button
                className={`flex-1 py-3 text-sm font-semibold transition-all rounded-lg ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setMode('register')}
              >
                注册
              </button>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">账号 / 邮箱 / 手机号</label>
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="请输入账号、邮箱或手机号"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">密码</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl"
              >
                {loading ? '请稍候...' : '登录'}
              </Button>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setMode('register')}
                  className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  还没有账号？立即注册
                </button>
                <button
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">注册方式</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      registerMethod === 'username'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setRegisterMethod('username')}
                  >
                    账号
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      registerMethod === 'email'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setRegisterMethod('email')}
                  >
                    邮箱
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      registerMethod === 'phone'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setRegisterMethod('phone')}
                  >
                    手机号
                  </button>
                </div>
              </div>

              {registerMethod === 'username' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">账号</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setIdentifier(e.target.value); }}
                    placeholder="请输入账号"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              {registerMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">邮箱</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setIdentifier(e.target.value); }}
                    placeholder="请输入邮箱"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              {registerMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">手机号</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setIdentifier(e.target.value); }}
                    placeholder="请输入手机号"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">密码</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">确认密码</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl"
              >
                {loading ? '请稍候...' : '注册并登录'}
              </Button>

              <button
                onClick={() => setMode('login')}
                className="w-full text-sm text-slate-400 hover:text-indigo-400 transition-colors"
              >
                已有账号？立即登录
              </button>
            </form>
          )}

          {mode === 'forgot-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white">忘记密码</h3>
                <p className="text-sm text-slate-400 mt-1">输入账号、邮箱或手机号重置密码</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">账号 / 邮箱 / 手机号</label>
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="请输入账号、邮箱或手机号"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">新密码</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl"
              >
                {loading ? '请稍候...' : '重置密码'}
              </Button>

              <button
                onClick={() => setMode('login')}
                className="w-full text-sm text-slate-400 hover:text-indigo-400 transition-colors"
              >
                返回登录
              </button>
            </form>
          )}

          {mode !== 'forgot-password' && (
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-center text-slate-500 text-xs">
                管理员测试账号：admin / admin123（或 admin@lifeos.com / admin123）
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
