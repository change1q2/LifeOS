import { useState, useEffect } from 'react';
import { Plus, Trash2, Flame } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Input, Textarea, Label } from '../components/ui/Input';
import { MODULES, HEALTH_LOG_FIELDS } from '../config/modules';
import { formatDate, todayStr } from '../lib/utils';
import type { HealthHabit, HealthLog } from '../types';

export function HealthPage() {
  const color = MODULES.goals.color; // teal-ish
  const { show, ToastEl } = useToast();
  const [habits, setHabits] = useState<HealthHabit[]>([]);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [logForm, setLogForm] = useState<any>({});

  const refresh = async () => {
    setLoading(true);
    const [habitData, logData] = await Promise.all([
      api.listHabits<HealthHabit>(),
      api.listLogs<HealthLog>(),
    ]);
    setHabits(habitData);
    setLogs(logData);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  // Generate last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const t = new Date();
    t.setDate(t.getDate() - i);
    days.push({
      date: t.toISOString().split('T')[0],
      label: `${t.getMonth() + 1}/${t.getDate()}`,
      weekday: '日一二三四五六'[t.getDay()],
      isToday: i === 0,
    });
  }

  const toggleHabit = async (habitId: number, date: string) => {
    const result = await api.toggleHabit(habitId, date);
    show(result.done ? '打卡成功！💪' : '已取消打卡');
    refresh();
  };

  const addHabit = async (data: any) => {
    await api.createHabit(data);
    show('习惯已添加！');
    setHabitFormOpen(false);
    refresh();
  };

  const deleteHabit = async (id: number) => {
    if (!confirm('确定删除这个习惯？')) return;
    await api.deleteHabit(id);
    show('已删除');
    refresh();
  };

  const calcStreak = (records: string[]) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const t = new Date();
      t.setDate(t.getDate() - i);
      const ds = t.toISOString().split('T')[0];
      if (records.includes(ds)) streak++;
      else break;
    }
    return streak;
  };

  const handleLogSave = async () => {
    if (!logForm.date) { show('请填写日期'); return; }
    await api.createLog(logForm);
    show('健康记录已保存！💪');
    setLogFormOpen(false);
    setLogForm({});
    refresh();
  };

  const deleteLog = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await api.deleteLog(id);
    show('已删除');
    refresh();
  };

  const habitFields = [
    { key: 'habitName', label: '习惯名称', type: 'text' as const, required: true, placeholder: '如：每日阅读30分钟' },
    { key: 'frequency', label: '频率', type: 'select' as const, options: ['每日', '每周', '自定义'] },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: '#14B8A620' }}>💪</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">健康习惯</h2>
            <p className="text-xs text-muted-foreground">身体是革命的本钱</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setHabitFormOpen(true)} style={{ backgroundColor: '#14B8A6' }}>
            <Plus className="h-4 w-4" /> 习惯
          </Button>
          <Button
            onClick={() => { setLogForm({ date: todayStr() }); setLogFormOpen(true); }}
            style={{ backgroundColor: '#14B8A6' }}
          >
            <Plus className="h-4 w-4" /> 健康记录
          </Button>
        </div>
      </div>

      {/* Habits */}
      <Card className="mb-4 p-5">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">✅ 习惯打卡（近7天）</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : habits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">还没有习惯，添加一个开始打卡吧！</div>
        ) : (
          <>
            <div className="mb-2 grid items-center gap-3 text-[11px] text-muted-foreground" style={{ gridTemplateColumns: '1fr auto' }}>
              <span>习惯</span>
              <div className="flex gap-1.5">
                {days.map(d => (
                  <span key={d.date} className="w-8 text-center">
                    {d.label}<br /><span className="text-muted-foreground/60">周{d.weekday}</span>
                  </span>
                ))}
              </div>
            </div>
            {habits.map(h => {
              const streak = calcStreak(h.records);
              return (
                <div key={h.id} className="group flex items-center gap-3 border-t border-border/50 py-2.5" style={{ gridTemplateColumns: '1fr auto' }}>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{h.habit_name}</span>
                    {streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                        <Flame className="h-3 w-3" /> {streak}天
                      </span>
                    )}
                    <button
                      onClick={() => deleteHabit(h.id)}
                      className="ml-auto text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {days.map(d => {
                      const done = h.records.includes(d.date);
                      return (
                        <button
                          key={d.date}
                          onClick={() => toggleHabit(h.id, d.date)}
                          className={`h-8 w-8 rounded-lg border-2 text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
                            done ? 'border-teal-500 bg-teal-500 text-white' : 'border-muted-foreground/20 text-muted-foreground hover:border-teal-400'
                          } ${d.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          title={d.date}
                        >
                          {d.weekday}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Card>

      {/* Health Logs */}
      <Card className="p-5">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold">📊 健康记录</h3>
        {logs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">还没有健康记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-2 px-2 text-left">日期</th>
                  <th className="py-2 px-2 text-left">运动</th>
                  <th className="py-2 px-2 text-center">睡眠(h)</th>
                  <th className="py-2 px-2 text-center">饮水(杯)</th>
                  <th className="py-2 px-2 text-center">体重(kg)</th>
                  <th className="py-2 px-2 text-left">备注</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className="group border-b border-border/50">
                    <td className="py-2 px-2">{formatDate(l.date)}</td>
                    <td className="py-2 px-2">{l.exercise || '-'}</td>
                    <td className="py-2 px-2 text-center">{l.sleep || '-'}</td>
                    <td className="py-2 px-2 text-center">{l.water || '-'}</td>
                    <td className="py-2 px-2 text-center">{l.weight || '-'}</td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">{l.note || ''}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => deleteLog(l.id)}
                        className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Habit Form */}
      <EntryForm
        open={habitFormOpen}
        onClose={() => setHabitFormOpen(false)}
        onSave={addHabit}
        title="添加习惯"
        fields={habitFields}
        accentColor="#14B8A6"
      />

      {/* Health Log Form */}
      <Dialog
        open={logFormOpen}
        onClose={() => setLogFormOpen(false)}
        title={<span style={{ color: '#14B8A6' }}>💪 添加健康记录</span>}
        footer={
          <>
            <Button variant="secondary" onClick={() => setLogFormOpen(false)}>取消</Button>
            <Button onClick={handleLogSave} style={{ backgroundColor: '#14B8A6' }}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          {HEALTH_LOG_FIELDS.map((f: any) => (
            <div key={f.key}>
              <Label>{f.label}{f.required && <span className="text-destructive ml-1">*</span>}</Label>
              {f.type === 'textarea' ? (
                <Textarea
                  value={logForm[f.key] || ''}
                  onChange={e => setLogForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              ) : f.type === 'date' ? (
                <Input
                  type="date"
                  value={logForm[f.key] || todayStr()}
                  onChange={e => setLogForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  type={f.type === 'number' ? 'number' : 'text'}
                  step="0.1"
                  value={logForm[f.key] || ''}
                  onChange={e => setLogForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
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
