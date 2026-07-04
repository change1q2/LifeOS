import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { COUNTRIES, getProvinces, getCities, getDistricts, getCountriesByRegions, type CountryRegion } from '../../data/regions';

interface CascaderValue {
  country: string;
  province: string;
  city: string;
  district: string;
}

interface CascaderProps {
  value: CascaderValue;
  onChange: (v: CascaderValue) => void;
  placeholder?: string;
  /**
   * 限定可选的国家 region 范围,例如 ['domestic'] 只显示中国、['asia'] 显示亚洲国家
   * 不传则显示全部国家
   */
  allowedRegions?: CountryRegion[];
  /** 当输入的 value.country 不在 allowedRegions 内时,提示文字 */
  rangeHint?: string;
  /** 弹层打开/关闭时通知外层,用于在父级禁用 Dialog footer 避免物理遮挡 */
  onOpenChange?: (open: boolean) => void;
}

interface PopoverPos {
  top: number;
  left: number;
  width: number;
  placeAbove: boolean;
}

export function Cascader({ value, onChange, placeholder = '请选择国家 / 省 / 市 / 区', allowedRegions, rangeHint, onOpenChange }: CascaderProps) {
  const [open, setOpen] = useState(false);
  const [activeCountry, setActiveCountry] = useState<string>(value.country || '');
  const [activeProvince, setActiveProvince] = useState<string>(value.province || '');
  const [activeCity, setActiveCity] = useState<string>(value.city || '');
  const [searchCountry, setSearchCountry] = useState('');
  const [pos, setPos] = useState<PopoverPos>({ top: 0, left: 0, width: 0, placeAbove: false });

  // 同步 open 状态给父组件(用于在弹层打开时禁用 Dialog footer,避免物理遮挡)
  const updateOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 受 allowedRegions 约束的可选国家列表
  const availableCountries = allowedRegions && allowedRegions.length > 0
    ? getCountriesByRegions(allowedRegions)
    : COUNTRIES;

  // 计算弹层位置
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePos = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const POPOVER_HEIGHT = 380; // 略大于实际 360,留点 padding
      const POPOVER_MIN_WIDTH = 720; // 4 列更宽
      const POPOVER_WIDTH = Math.max(POPOVER_MIN_WIDTH, rect.width);
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < POPOVER_HEIGHT + 20 && rect.top > spaceBelow;
      const top = placeAbove
        ? rect.top - POPOVER_HEIGHT - 4
        : rect.bottom + 4;
      // 水平居中对齐 trigger,防止超出视口
      let left = rect.left;
      if (left + POPOVER_WIDTH > window.innerWidth - 8) {
        left = window.innerWidth - POPOVER_WIDTH - 8;
      }
      if (left < 8) left = 8;
      setPos({ top, left, width: POPOVER_WIDTH, placeAbove });
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        updateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // 同步外部 value
  useEffect(() => {
    setActiveCountry(value.country || '');
    setActiveProvince(value.province || '');
    setActiveCity(value.city || '');
  }, [value.country, value.province, value.city]);

  // allowedRegions 变化时,如果已选国家不在范围内,清空选择
  useEffect(() => {
    if (!allowedRegions || allowedRegions.length === 0) return;
    if (!value.country) return;
    const available = getCountriesByRegions(allowedRegions);
    if (!available.find(c => c.value === value.country)) {
      onChange({ country: '', province: '', city: '', district: '' });
    }
  }, [allowedRegions?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const display = value.country
    ? [value.country, value.province, value.city, value.district].filter(Boolean).join(' / ')
    : '';

  const provinces = activeCountry ? getProvinces(activeCountry) : [];
  const cities = activeCountry && activeProvince ? getCities(activeCountry, activeProvince) : [];
  const districts = activeCountry && activeProvince && activeCity
    ? getDistricts(activeCountry, activeProvince, activeCity)
    : [];

  const filteredCountries = searchCountry
    ? availableCountries.filter(c =>
        c.label.toLowerCase().includes(searchCountry.toLowerCase()) ||
        c.value.includes(searchCountry)
      )
    : availableCountries;

  const selectCountry = (c: string) => {
    setActiveCountry(c);
    setActiveProvince('');
    setActiveCity('');
    setSearchCountry('');
    onChange({ country: c, province: '', city: '', district: '' });
  };

  const selectProvince = (p: string) => {
    setActiveProvince(p);
    setActiveCity('');
    onChange({ country: activeCountry, province: p, city: '', district: '' });
  };

  const selectCity = (city: string) => {
    if (city === '__none__') {
      // 跳过区/县,直接关闭
      onChange({ country: activeCountry, province: activeProvince, city: '', district: '' });
      updateOpen(false);
      return;
    }
    setActiveCity(city);
    // 查该城市是否有区/县数据,没有就关闭,有就保持打开
    const ds = getDistricts(activeCountry, activeProvince, city);
    const hasRealDistricts = ds.length > 0 && !(ds.length === 1 && ds[0].value === '__none__');
    if (!hasRealDistricts) {
      onChange({ country: activeCountry, province: activeProvince, city, district: '' });
      updateOpen(false);
    } else {
      onChange({ country: activeCountry, province: activeProvince, city, district: '' });
    }
  };

  const selectDistrict = (district: string) => {
    const real = district === '__none__' ? '' : district;
    onChange({ country: activeCountry, province: activeProvince, city: activeCity, district: real });
    updateOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCountry('');
    setActiveProvince('');
    setActiveCity('');
    onChange({ country: '', province: '', city: '', district: '' });
  };

  const popover = open && (
    <div
      ref={popoverRef}
      className="fixed z-[9999] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        animation: 'cascaderFadeIn 0.15s ease-out',
        isolation: 'isolate',
        // 确保不透明背景
        backgroundColor: 'rgb(255, 255, 255)',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex h-[340px] overflow-hidden rounded-lg bg-white dark:bg-slate-900">
        {/* 国家列表 */}
        <div className="w-[180px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700 space-y-1.5">
            {rangeHint && (
              <div className="px-1.5 py-0.5 rounded text-[10px] font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 truncate">
                {rangeHint}
              </div>
            )}
            <input
              type="text"
              value={searchCountry}
              onChange={e => setSearchCountry(e.target.value)}
              placeholder="搜索国家..."
              className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">无匹配国家</div>
            ) : (
              filteredCountries.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => selectCountry(c.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer flex items-center justify-between',
                    activeCountry === c.value
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  )}
                >
                  <span className="truncate">{c.label}</span>
                  {c.children && c.children.length > 0 && (
                    <ChevronDown className={cn('h-3 w-3 -rotate-90 flex-shrink-0', activeCountry === c.value ? 'opacity-90' : 'opacity-40')} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 省份/州列表 */}
        <div className="w-[180px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            {activeCountry ? `${activeCountry} · 省/州` : '请选择国家'}
          </div>
          <div className="flex-1 overflow-y-auto">
            {!activeCountry ? (
              <div className="p-4 text-xs text-muted-foreground text-center mt-6">← 请先选择国家</div>
            ) : provinces.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center mt-6">暂无省份数据</div>
            ) : (
              provinces.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => selectProvince(p.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer flex items-center justify-between',
                    activeProvince === p.value
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  )}
                >
                  <span className="truncate">{p.label}</span>
                  {p.children && p.children.length > 0 && (
                    <ChevronDown className={cn('h-3 w-3 -rotate-90 flex-shrink-0', activeProvince === p.value ? 'opacity-80' : 'opacity-30')} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 城市列表 */}
        <div className="w-[180px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            {activeProvince ? `${activeProvince} · 城市` : '请选择省份'}
          </div>
          <div className="flex-1 overflow-y-auto">
            {!activeProvince ? (
              <div className="p-4 text-xs text-muted-foreground text-center mt-6">← 请先选择省/州</div>
            ) : cities.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center mt-6">该省下暂无城市数据</div>
            ) : (
              cities.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => selectCity(c.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                    value.city === c.value
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  )}
                >
                  {c.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 区/县列表 (第4列) */}
        <div className="w-[180px] flex-shrink-0 flex flex-col">
          <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            {activeCity ? `${activeCity} · 区/县` : '请选择城市'}
          </div>
          <div className="flex-1 overflow-y-auto">
            {!activeCity ? (
              <div className="p-4 text-xs text-muted-foreground text-center mt-6">← 请先选择城市</div>
            ) : districts.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center mt-6">该城市暂无区/县数据</div>
            ) : (
              districts.map(d => {
                const isNone = d.value === '__none__';
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => selectDistrict(d.value)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                      value.district === d.value
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : isNone
                          ? 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-400 dark:text-slate-500 italic'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                    )}
                  >
                    {d.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 rounded-b-lg">
        <span className="truncate">
          {value.country || '未选国家'}
          {value.province && ` › ${value.province}`}
          {value.city && ` › ${value.city}`}
          {value.district && ` › ${value.district}`}
        </span>
        <button
          type="button"
          onClick={() => updateOpen(false)}
          className="hover:text-foreground transition-colors px-1"
        >
          关闭 ✕
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => updateOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'hover:bg-accent/30 transition-colors cursor-pointer'
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          <span className={cn('truncate', !display && 'text-muted-foreground')}>
            {display || placeholder}
          </span>
        </span>
        <div className="flex items-center gap-1">
          {display && (
            <span
              role="button"
              tabIndex={-1}
              onClick={clear}
              className="p-0.5 hover:text-destructive rounded cursor-pointer"
              aria-label="清除"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {/* 弹层通过 Portal 渲染到 body,避免被 Dialog 滚动容器裁切 */}
      {popover && createPortal(popover, document.body)}

      <style>{`
        @keyframes cascaderFadeIn {
          from { opacity: 0; transform: translateY(${pos.placeAbove ? '4px' : '-4px'}); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
