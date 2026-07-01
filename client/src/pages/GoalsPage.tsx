import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MODULES } from '../config/modules';
import { formatDateFull, badgeColor } from '../lib/utils';
import type { Goal } from '../types';

export function GoalsPage() {
  const config = MODULES.goals;
  const { show, ToastEl } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const refresh = async () => {
    setLoading(true);
    const data = await api.list<Goal>('goals');
    setGoals(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editing) {
        await api.update('goals', editing.id, formData);
        show('更新成功！');
      } else {
        await api.create('goals', formData);
        show('目标创建成功！🎯');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      show('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这个目标？')) return;
    await api.delete('goals', id);
    show('已删除');
    refresh();
  };

  const toggleKR = async (goalId: number, krIndex: number) => {
    await api.toggleKR(goalId, krIndex);
    refresh();
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: config.color + '20' }}>{config.icon}</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.name}</h2>
            <p className="text-xs text-muted-foreground">{config.desc}</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 新增目标
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : goals.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="text-5xl mb-3 opacity-50">🎯</div>
          <h3 className="text-base font-semibold text-foreground/80">还没有目标</h3>
          <p className="text-sm text-muted-foreground mt-1">设定一个目标，把它拆解为可执行的关键结果吧！</p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {goals.map(g => {
            const total = g.key_results?.length || 1;
            const done = g.key_results?.filter(k => k.done).length || 0;
            const pct = total ? Math.round(done / total * 100) : 0;
            return (
              <Card key={g.id} className="border-l-4 p-5" style={{ borderLeftColor: config.color }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-bold">{g.title}</div>
                    <Badge className={`mt-1 ${badgeColor(g.category)}`}>{g.category}</Badge>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">⏰ 截止日期：{formatDateFull(g.deadline) || '未设定'}</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: config.color }} />
                </div>
                <div className="mt-1.5 text-xs font-bold text-muted-foreground">完成进度：{done}/{total}（{pct}%）</div>
                {g.key_results?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {g.key_results.map((kr, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px]">
                        <button
                          onClick={() => toggleKR(g.id, i)}
                          className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all cursor-pointer ${
                            kr.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30'
                          }`}
                        >
                          {kr.done && <Check className="h-2.5 w-2.5" />}
                        </button>
                        <span className={kr.done ? 'line-through text-muted-foreground' : 'text-foreground/70'}>
                          {kr.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {g.note && (
                  <div className="mt-3 text-xs italic text-muted-foreground">📝 {g.note}</div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '新增'}目标`}
        fields={config.fields}
        initialData={editing}
        accentColor={config.color}
      />
      {ToastEl}
    </div>
  );
}
