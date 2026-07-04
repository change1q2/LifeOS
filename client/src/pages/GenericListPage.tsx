import { useState } from 'react';
import { Plus, Trash2, Edit3, GripVertical, Eye } from 'lucide-react';
import { useModuleData, useToast } from '../lib/hooks';
import { api } from '../lib/api';
import { MODULES } from '../config/modules';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DetailView } from '../components/ui/DetailView';
import { formatDate, formatDateFull, badgeColor } from '../lib/utils';
import { useCategoryManager, type CategoryConfig } from '../lib/useCategoryManager';

interface GenericListPageProps {
  module: string;
  categoryConfig?: CategoryConfig;
}

export function GenericListPage({ module, categoryConfig }: GenericListPageProps) {
  const config = MODULES[module];
  const { data, loading, refresh } = useModuleData<any>(module);
  const { show, ToastEl } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailItem, setDetailItem] = useState<any>(null);

  // Optional category tree
  const catMgr = categoryConfig ? useCategoryManager(categoryConfig) : null;

  const filtered = catMgr ? catMgr!.getFilteredData(data) : data;
  const catCounts = catMgr ? catMgr!.getCategoryCounts(data) : null;

  // Dynamic fields: inject dynamicCategories for select fields
  const dynamicFields = config.fields.map(f => {
    if (f.type === 'select' && f.dynamicCategories && catMgr) {
      return { ...f, options: catMgr!.categories };
    }
    return f;
  });

  const handleAdd = (cat?: string) => {
    setEditing(null);
    if (cat && catMgr) catMgr!.selectCategory(cat);
    setFormOpen(true);
  };

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
        <Button onClick={() => handleAdd()} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 添加记录
        </Button>
      </div>

      {/* Category Tree (if configured) */}
      {catMgr && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground/70">{catMgr.config.sectionTitle}</h3>
            <Button variant="outline" size="sm" onClick={() => { catMgr.refreshCategories(); catMgr.setManageOpen(true); }}>
              <Edit3 className="h-3 w-3" /> 管理分类
            </Button>
          </div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === null ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
              style={{ ringColor: config.color }}
              onClick={() => catMgr.selectCategory(null)}
            >
              <div className="p-3 text-center">
                <div className="text-2xl mb-1">{catMgr.config.allIcon}</div>
                <div className="text-xs font-bold">全部</div>
                <div className="text-[11px] text-muted-foreground">{data.length} 条</div>
              </div>
            </Card>
            {catMgr.categories.map((cat, idx) => {
              const icon = catMgr.getCategoryIcon(idx);
              const count = catCounts![cat] || 0;
              return (
                <Card
                  key={cat}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === cat ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                  style={{ ringColor: config.color }}
                  onClick={() => catMgr.toggleCategory(cat)}
                >
                  <div className="p-3 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-xs font-bold leading-tight">{cat}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{count} 条</div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Category Management Dialog */}
          <Dialog
            open={catMgr.manageOpen}
            onClose={() => catMgr.setManageOpen(false)}
            title={catMgr.config.dialogTitle}
            footer={<Button onClick={() => catMgr.setManageOpen(false)}>完成</Button>}
          >
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {catMgr.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-border/50 p-2.5">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  {catMgr.editingIndex?.index === idx ? (
                    <Input
                      value={catMgr.editingIndex.value}
                      onChange={e => catMgr.setEditingIndex({ ...catMgr.editingIndex!, value: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); catMgr.confirmEdit(catMgr.editingIndex!.value); }
                        if (e.key === 'Escape') catMgr.cancelEdit();
                      }}
                      className="flex-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm">{cat}</span>
                  )}
                  <button onClick={() => catMgr.startEdit(idx)} className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => catMgr.deleteCategory(idx)} className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={catMgr.addCategory}>
                <Plus className="h-3 w-3" /> 添加新分类
              </Button>
            </div>
          </Dialog>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="text-5xl mb-3 opacity-50">{config.icon}</div>
          <h3 className="text-base font-semibold text-foreground/80">
            {catMgr?.selectedCategory ? `"${catMgr.selectedCategory}" 还没有记录` : '还没有记录'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">点击右上角按钮，开始记录你的{config.name}吧！</p>
          {catMgr?.selectedCategory && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => handleAdd(catMgr.selectedCategory!)}>
              <Plus className="h-3 w-3" /> 在"{catMgr.selectedCategory}"添加
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: config.color }}
            >
              <div className="p-4 cursor-pointer" onClick={() => setDetailItem(item)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2 min-w-0">
                    {renderBadge(module, item)}
                    <div className="mt-1.5 text-sm font-bold leading-snug">
                      {item.title || item.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      title="编辑"
                      className="text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all rounded p-1.5 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      title="删除"
                      className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded p-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
        fields={dynamicFields}
        initialData={editing}
        accentColor={config.color}
      />

      <DetailView
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem ? (detailItem.title || detailItem.name || '详情') : '详情'}
        data={detailItem || {}}
        category={detailItem?.category || detailItem?.source}
        fields={dynamicFields}
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
  if (module === 'social') {
    return <><span className="text-[11px] text-muted-foreground">📞 最近联系：{formatDate(item.last_contact) || '未记录'}</span><span className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary"><Eye className="h-3 w-3" /> 查看详情</span></>;
  }
  if (module === 'insights') {
    return <><span className="text-[11px] text-muted-foreground">💡 {formatDate(item.date)}</span><span className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary"><Eye className="h-3 w-3" /> 查看详情</span></>;
  }
  return <><span className="text-[11px] text-muted-foreground">{formatDate(item.date || item.created_at)}</span><span className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary"><Eye className="h-3 w-3" /> 查看详情</span></>;
}
