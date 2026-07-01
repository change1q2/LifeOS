import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/hooks';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RatingDisplay } from '../components/ui/Rating';
import { MODULES } from '../config/modules';
import { formatDateFull, todayStr, badgeColor } from '../lib/utils';
import type { Mood } from '../types';

const moodEmojis = ['', '😞', '😕', '😐', '😊', '🤩'];

export function MoodPage() {
  const config = MODULES.mood;
  const { show, ToastEl } = useToast();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Mood | null>(null);
  const [prefillDate, setPrefillDate] = useState('');

  const refresh = async () => {
    setLoading(true);
    const data = await api.list<Mood>('mood');
    setMoods(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleAdd = (date?: string) => {
    setEditing(null);
    setPrefillDate(date || todayStr());
    setFormOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editing) {
        await api.update('mood', editing.id, formData);
        show('更新成功！');
      } else {
        await api.create('mood', formData);
        show('记录成功！🌙');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      show('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await api.delete('mood', id);
    show('已删除');
    refresh();
  };

  // Calendar
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = now.getDate();

  const moodMap: Record<string, number> = {};
  moods.forEach(m => { if (m.date) moodMap[m.date] = m.score; });

  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const scoreColors: Record<number, string> = {
    0: 'bg-muted text-muted-foreground',
    1: 'bg-red-200 text-red-800',
    2: 'bg-orange-200 text-orange-800',
    3: 'bg-amber-200 text-amber-800',
    4: 'bg-green-200 text-green-800',
    5: 'bg-green-400 text-green-900',
  };

  const initialData = prefillDate ? { date: prefillDate } : undefined;

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: config.color + '20' }}>{config.icon}</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.name}</h2>
            <p className="text-xs text-muted-foreground">{config.desc} · 点击日历可直接记录</p>
          </div>
        </div>
        <Button onClick={() => handleAdd()} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 记录心情
        </Button>
      </div>

      {/* Calendar */}
      <Card className="mb-4 p-5">
        <h3 className="mb-3.5 text-sm font-bold">{year}年{month + 1}月心情日历</h3>
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {weekDayNames.map(w => <span key={w} className="text-center text-[11px] font-semibold text-muted-foreground">{w}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startWeekday }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const score = moodMap[dateStr] || 0;
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold cursor-pointer transition-all hover:scale-105 border-2 ${scoreColors[score]} ${isToday ? 'border-primary' : 'border-transparent'}`}
                onClick={() => handleAdd(dateStr)}
                title={`${dateStr}: ${score ? score + '⭐' : '点击记录'}`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>心情指数：</span>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className={`h-3 w-3 rounded-sm ${scoreColors[n]}`} />
          ))}
          <span>1-5</span>
        </div>
      </Card>

      {/* Recent entries */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {moods.slice(0, 8).map(m => (
            <Card key={m.id} className="group border-l-4" style={{ borderLeftColor: config.color }}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{moodEmojis[m.score] || '😐'}</span>
                    <RatingDisplay value={m.score} />
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {m.emotions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.emotions.map((t, i) => <Badge key={i} className="bg-pink-100 text-pink-700">{t}</Badge>)}
                  </div>
                )}
                {m.journal && <p className="mt-2 text-[13px] text-foreground/70 leading-relaxed">{m.journal}</p>}
                <div className="mt-3 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                  {formatDateFull(m.date)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '记录'}心情`}
        fields={config.fields}
        initialData={editing || initialData}
        accentColor={config.color}
      />
      {ToastEl}
    </div>
  );
}
