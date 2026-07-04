import { useState } from 'react';
import { Plus, Trash2, Edit3, MapPin, GripVertical, Image as ImageIcon, Calendar, Cloud, Eye } from 'lucide-react';
import { useModuleData, useToast } from '../lib/hooks';
import { api } from '../lib/api';
import { MODULES } from '../config/modules';
import { EntryForm } from '../components/EntryForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RatingDisplay } from '../components/ui/Rating';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DetailView } from '../components/ui/DetailView';
import { formatDate, badgeColor } from '../lib/utils';
import { DEFAULT_TRAVEL_CATEGORIES } from '../data/regions';
import { useCategoryManager } from '../lib/useCategoryManager';

const config = MODULES.travel;

export function TravelPage() {
  const { data, loading, refresh } = useModuleData<any>('travel');
  const { show, ToastEl } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailItem, setDetailItem] = useState<any>(null);

  const catMgr = useCategoryManager({
    storageKey: 'lifeos_travel_categories',
    defaults: DEFAULT_TRAVEL_CATEGORIES,
    fallbackCategory: '国内旅行',
    icons: ['🏠', '🌏', '🌍', '🌎', '🏖️', '🚗', '🗺️', '⛺', '🏔️', '🏛️', '🛕', '🗼'],
    allIcon: '🧳',
    moduleName: 'travel',
    dialogTitle: '管理旅游树分类',
    sectionTitle: '旅游树分类',
  });

  const filtered = catMgr.getFilteredData(data);
  const catCounts = catMgr.getCategoryCounts(data);

  const handleAdd = (cat?: string) => {
    setEditing(null);
    if (cat) catMgr.selectCategory(cat);
    setFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      const payload = { ...formData };
      if (Array.isArray(payload.highlights)) {
        payload.highlights_blocks = payload.highlights;
        delete payload.highlights;
      } else if (payload.highlights && typeof payload.highlights === 'string') {
        payload.highlights_blocks = [];
      } else {
        payload.highlights_blocks = [];
      }
      if (formData.highlightsText) {
        payload.highlights = formData.highlightsText;
      }

      if (editing) {
        await api.update('travel', editing.id, payload);
        show('更新成功！');
      } else {
        await api.create('travel', payload);
        show('记录成功！✈️');
      }
      setFormOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      console.error('保存旅行记录失败:', err);
      show('保存失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条旅行记录吗？')) return;
    await api.delete('travel', id);
    show('已删除');
    refresh();
  };

  // Build location string
  const getLocation = (item: any) => {
    if (item.country || item.province || item.city || item.district) {
      return [item.country, item.province, item.city, item.district].filter(Boolean).join(' / ');
    }
    return item.destination || '';
  };

  // Check if item has rich content
  const hasRichContent = (item: any) => {
    return Array.isArray(item.highlights_blocks) && item.highlights_blocks.length > 0;
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
            <h2 className="text-xl font-bold tracking-tight">旅行日记</h2>
            <p className="text-xs text-muted-foreground">用图文记录每一段旅程的精彩</p>
          </div>
        </div>
        <Button onClick={() => handleAdd()} style={{ backgroundColor: config.color }}>
          <Plus className="h-4 w-4" /> 添加旅行
        </Button>
      </div>

      {/* Travel Tree: Category Cards */}
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
            style={{ borderColor: config.color }}
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
            const count = catCounts[cat] || 0;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${catMgr.selectedCategory === cat ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                style={{ borderColor: config.color }}
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
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="text-5xl mb-3 opacity-50">✈️</div>
          <h3 className="text-base font-semibold text-foreground/80">
            {catMgr.selectedCategory ? `"${catMgr.selectedCategory}" 还没有旅行记录` : '还没有旅行记录'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">点击右上角按钮开始记录旅程吧！</p>
          {catMgr.selectedCategory && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => handleAdd(catMgr.selectedCategory!)}>
              <Plus className="h-3 w-3" /> 在"{catMgr.selectedCategory}"添加
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {filtered.map((item: any) => {
            const location = getLocation(item);
            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden border-l-4 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: config.color }}
              >
                <div className="p-4 cursor-pointer" onClick={() => setDetailItem(item)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      {item.category && <Badge className={badgeColor(item.category)}>{item.category}</Badge>}
                      <div className="mt-1.5 text-sm font-bold leading-snug flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" style={{ color: config.color }} />
                        {location || item.destination}
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

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {item.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(item.start_date)}</span>}
                    {item.end_date && item.end_date !== item.start_date && <span>→ {formatDate(item.end_date)}</span>}
                    {item.weather && <span className="flex items-center gap-1"><Cloud className="h-3 w-3" /> {item.weather}</span>}
                  </div>

                  {hasRichContent(item) ? (
                    <div className="mt-3 grid grid-cols-3 gap-1 rounded-md overflow-hidden bg-muted/30">
                      {item.highlights_blocks.filter((b: any) => b.type === 'image').slice(0, 3).map((b: any, i: number) => (
                        <img key={i} src={b.value} className="aspect-square w-full object-cover" alt="" />
                      ))}
                      {item.highlights_blocks.filter((b: any) => b.type === 'image').length === 0 && (
                        <div className="col-span-3 p-3 text-xs text-muted-foreground flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {item.highlights_blocks.filter((b: any) => b.type === 'text').length} 段图文
                        </div>
                      )}
                    </div>
                  ) : item.highlights ? (
                    <div className="mt-2.5 text-[13px] text-foreground/70 line-clamp-2 leading-relaxed">
                      {item.highlights}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                    <div className="flex items-center gap-2">
                      {item.mood > 0 && <RatingDisplay value={item.mood} />}
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 text-primary">
                      <Eye className="h-3 w-3" /> 查看详情
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Entry Form */}
      <EntryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        title={`${editing ? '编辑' : '添加'}旅行日记`}
        fields={config.fields}
        initialData={editing}
        accentColor={config.color}
      />

      {/* Category Management Dialog */}
      <Dialog
        open={catMgr.manageOpen}
        onClose={() => catMgr.setManageOpen(false)}
        title={catMgr.config.dialogTitle}
        footer={
          <Button onClick={() => catMgr.setManageOpen(false)}>完成</Button>
        }
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
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      catMgr.confirmEdit(catMgr.editingIndex!.value);
                    }
                    if (e.key === 'Escape') catMgr.cancelEdit();
                  }}
                  className="flex-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm">{cat}</span>
              )}
              <button
                onClick={() => catMgr.startEdit(idx)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => catMgr.deleteCategory(idx)}
                className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={catMgr.addCategory}>
            <Plus className="h-3 w-3" /> 添加新分类
          </Button>
        </div>
      </Dialog>

      {/* Detail View */}
      <DetailView
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={getLocation(detailItem || {}) || (detailItem?.destination || '旅行详情')}
        data={detailItem || {}}
        category={detailItem?.category}
        fields={config.fields}
        richBlocks={hasRichContent(detailItem) ? detailItem.highlights_blocks : undefined}
        accentColor={config.color}
      />

      {ToastEl}
    </div>
  );
}
