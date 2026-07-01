import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useModuleData, useToast } from '../lib/hooks';
import { api } from '../lib/api';
import { MODULES } from '../config/modules';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RatingDisplay } from '../components/ui/Rating';
import { formatDate, formatDateFull, badgeColor } from '../lib/utils';

export function GenericListPage({ module }: { module: string }) {
  const config = MODULES[module];
  const { data, loading, refresh } = useModuleData<any>(module);
  const { show, ToastEl } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const handleAdd = () => { setEditing(null); setFormOpen(true); };
  const handleEdit = (item: any) => { setEditing(item); setFormOpen(true); };

  const handleSave = async (formData: any) => {
    try {
      if (editing) {
        await api.update(module, editing.id, formData);
        show('更新成功！');
      } else {
        await api.create(module, formData);
        show('记录成功！🎉');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      show('保存失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条记录吗？')) return;
    await api.delete(module, id);
    show('已删除');
    refresh();
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: config.color + '20' }}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.name}</h2>
            <p className="text-xs text-muted-foreground">{config.desc}</p>
          </div>
        </div>
        <Button onClick={handleAdd} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 添加记录
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : data.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="text-5xl mb-3 opacity-50">{config.icon}</div>
          <h3 className="text-base font-semibold text-foreground/80">还没有记录</h3>
          <p className="text-sm text-muted-foreground mt-1">点击右上角按钮，开始记录你的{config.name}吧！</p>
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {data.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden cursor-pointer border-l-4"
              style={{ borderLeftColor: config.color }}
              onClick={() => handleEdit(item)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    {renderBadge(module, item)}
                    <div className="mt-1.5 text-sm font-bold leading-snug">
                      {item.title || item.destination || item.name}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all rounded p-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2">
                  {renderBody(module, item)}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                  {renderFooter(module, item)}
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
        title={`${editing ? '编辑' : '添加'}${config.name}`}
        fields={config.fields}
        initialData={editing}
        accentColor={config.color}
      />
      {ToastEl}
    </div>
  );
}

function renderBadge(module: string, item: any) {
  const cat = item.type || item.category || item.source;
  if (!cat) return null;
  return <Badge className={badgeColor(cat)}>{cat}</Badge>;
}

function renderBody(module: string, item: any) {
  if (module === 'learning') {
    return (
      <>
        {item.source && <div className="mb-1 text-xs text-muted-foreground">📖 {item.source}</div>}
        {item.notes && <div className="text-[13px] text-foreground/70 line-clamp-3">{item.notes}</div>}
      </>
    );
  }
  if (module === 'travel') {
    return (
      <>
        {item.highlights && <div className="mb-1.5 text-[13px]"><span className="font-semibold">✨ </span>{item.highlights}</div>}
        {item.reflections && <div className="text-[13px] text-muted-foreground line-clamp-2">{item.reflections}</div>}
      </>
    );
  }
  if (module === 'achievements') {
    return (
      <>
        {item.description && <div className="text-[13px] text-foreground/70 mb-1">{item.description}</div>}
        {item.feeling && <div className="text-[13px] text-muted-foreground italic">"{item.feeling}"</div>}
      </>
    );
  }
  if (module === 'social') {
    return (
      <>
        {item.relationship && <div className="mb-1 text-xs text-muted-foreground">关系：{item.relationship}</div>}
        {item.notes && <div className="text-[13px] text-foreground/70 line-clamp-2">{item.notes}</div>}
      </>
    );
  }
  if (module === 'insights') {
    return <div className="text-[13px] text-foreground/70 leading-relaxed line-clamp-3">{item.content}</div>;
  }
  return null;
}

function renderFooter(module: string, item: any) {
  if (module === 'learning') {
    const statusColor = item.status === '已完成' ? 'bg-green-100 text-green-700' : item.status === '进行中' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600';
    return (
      <>
        <div className="flex items-center gap-2">
          <Badge className={statusColor}>{item.status}</Badge>
          {item.rating > 0 && <RatingDisplay value={item.rating} />}
        </div>
        <span className="text-[11px] text-muted-foreground">{formatDate(item.date)}</span>
      </>
    );
  }
  if (module === 'travel') {
    return (
      <>
        <div className="flex items-center gap-2">
          {item.mood > 0 && <RatingDisplay value={item.mood} />}
          {item.weather && <span className="text-[11px] text-muted-foreground">🌤 {item.weather}</span>}
        </div>
        <span className="text-[11px] text-muted-foreground">{formatDate(item.start_date)} - {formatDate(item.end_date)}</span>
      </>
    );
  }
  if (module === 'achievements') {
    return <><span /><span className="text-[11px] text-muted-foreground">🏆 {formatDate(item.date)}</span></>;
  }
  if (module === 'social') {
    return <><span /><span className="text-[11px] text-muted-foreground">📞 最近联系：{formatDate(item.last_contact) || '未记录'}</span></>;
  }
  if (module === 'insights') {
    return <><span /><span className="text-[11px] text-muted-foreground">💡 {formatDate(item.date)}</span></>;
  }
  return null;
}
