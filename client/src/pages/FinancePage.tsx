import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Input, Select, Label } from '../components/ui/Input';
import { FINANCE_FIELDS } from '../config/modules';
import { formatDate, todayStr } from '../lib/utils';
import type { Finance } from '../types';

const catColors: Record<string, string> = {
  '餐饮': '#F97316', '交通': '#0EA5E9', '购物': '#EC4899', '娱乐': '#8B5CF6',
  '房租': '#EF4444', '学习': '#10B981', '投资': '#F59E0B', '其他': '#64748B',
};
const catIcons: Record<string, string> = {
  '餐饮': '🍔', '交通': '🚗', '购物': '🛍️', '娱乐': '🎮',
  '房租': '🏠', '学习': '📚', '投资': '📈', '工资': '💼',
  '兼职': '💻', '其他': '📦',
};

export function FinancePage() {
  const { show, ToastEl } = useToast();
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const refresh = async () => {
    setLoading(true);
    const data = await api.list<Finance>('finance');
    setFinances(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthEntries = finances.filter(f => {
    const d = new Date(f.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const income = monthEntries.filter(e => e.type === '收入').reduce((s, e) => s + Number(e.amount), 0);
  const expense = monthEntries.filter(e => e.type === '支出').reduce((s, e) => s + Number(e.amount), 0);
  const balance = income - expense;

  // Category breakdown
  const catMap: Record<string, number> = {};
  monthEntries.filter(e => e.type === '支出').forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
  });
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxCat = cats.length ? cats[0][1] : 1;

  const handleSave = async () => {
    if (!form.type || !form.amount) { show('请填写必填项'); return; }
    await api.create('finance', form);
    show('记录成功！💰');
    setFormOpen(false);
    setForm({});
    refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await api.delete('finance', id);
    show('已删除');
    refresh();
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: '#8B5CF620' }}>💰</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">财务管理</h2>
            <p className="text-xs text-muted-foreground">让每一分钱都有迹可循</p>
          </div>
        </div>
        <Button onClick={() => { setForm({ date: todayStr() }); setFormOpen(true); }} style={{ backgroundColor: '#8B5CF6' }}>
          <Plus className="h-4 w-4" /> 记一笔
        </Button>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-3.5 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1.5">📊 本月收入</div>
          <div className="text-2xl font-extrabold text-emerald-500">¥{income.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1.5">💸 本月支出</div>
          <div className="text-2xl font-extrabold text-red-500">¥{expense.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1.5">💰 本月结余</div>
          <div className="text-2xl font-extrabold text-primary">¥{balance.toLocaleString()}</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {cats.length > 0 && (
        <Card className="mb-4 p-5">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">📈 支出分类（{month + 1}月）</h3>
          {cats.map(([cat, amt]) => (
            <div key={cat} className="mb-2.5 flex items-center gap-3 last:mb-0">
              <span className="w-7 text-lg">{catIcons[cat] || '📦'}</span>
              <span className="w-14 text-[13px] font-semibold">{cat}</span>
              <div className="flex-1 h-5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(amt / maxCat) * 100}%`, backgroundColor: catColors[cat] || '#64748B' }}
                />
              </div>
              <span className="min-w-[70px] text-right text-[13px] font-bold">¥{amt.toLocaleString()}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Transaction List */}
      <Card className="p-5">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">📋 交易明细</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : finances.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">还没有记录</div>
        ) : (
          <div className="flex flex-col gap-2">
            {finances.map(e => (
              <div key={e.id} className="group flex items-center rounded-md border border-border/50 bg-card p-2.5">
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-base" style={{ backgroundColor: e.type === '收入' ? '#DCFCE7' : '#FEE2E2' }}>
                  {catIcons[e.category] || '📦'}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">{e.category} · {e.type}</div>
                  <div className="text-[11px] text-muted-foreground">{formatDate(e.date)}{e.note ? ` · ${e.note}` : ''}</div>
                </div>
                <div className={`text-[15px] font-bold ${e.type === '收入' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {e.type === '收入' ? '+' : '-'}¥{Number(e.amount).toLocaleString()}
                </div>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="ml-2 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={<span style={{ color: '#8B5CF6' }}>💰 记一笔</span>}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>取消</Button>
            <Button onClick={handleSave} style={{ backgroundColor: '#8B5CF6' }}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          {FINANCE_FIELDS.map((f: any) => (
            <div key={f.key}>
              <Label>{f.label}{f.required && <span className="text-destructive ml-1">*</span>}</Label>
              {f.type === 'select' ? (
                <Select
                  value={form[f.key] || ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                >
                  <option value="">请选择...</option>
                  {f.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </Select>
              ) : f.type === 'date' ? (
                <Input
                  type="date"
                  value={form[f.key] || todayStr()}
                  onChange={e => setForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  type={f.type === 'number' ? 'number' : 'text'}
                  step="0.01"
                  value={form[f.key] || ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      </Dialog>

      {ToastEl}
    </div>
  );
}
