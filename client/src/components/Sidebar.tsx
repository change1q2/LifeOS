import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SIDEBAR_ITEMS } from '../config/modules';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { LogOut, Sprout } from 'lucide-react';

const STORAGE_KEY = 'lifeos_sidebar_order';

function SortableItem({ item }: { item: typeof SIDEBAR_ITEMS[0] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md px-3.5 py-2.5 my-0.5 text-[13.5px] font-medium transition-all',
        isDragging && 'opacity-50 shadow-lg shadow-indigo-500/25 scale-[1.02] z-50'
      )}
    >
      <NavLink
        to={item.key === 'dashboard' ? '/' : `/${item.key}`}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2.5 w-full',
            isActive
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400" />
            )}
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </>
        )}
      </NavLink>
    </div>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [items, setItems] = useState(SIDEBAR_ITEMS);

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        const orderedItems = [...SIDEBAR_ITEMS].sort((a, b) => {
          const indexA = order.indexOf(a.key);
          const indexB = order.indexOf(b.key);
          return indexA - indexB;
        });
        setItems(orderedItems);
      } catch {
        setItems(SIDEBAR_ITEMS);
      }
    } else {
      setItems(SIDEBAR_ITEMS);
    }
  }, []);

  useEffect(() => {
    const order = items.map((item) => item.key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 shadow-[4px_0_20px_-5px_rgba(0,0,0,0.3)]">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/20">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-wide">LifeOS</div>
            <div className="text-[11px] text-slate-400">人生系统</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-0" style={{ minHeight: '100%' }}>
            {items.map((item) => (
              <SortableItem key={item.key} item={item} />
            ))}
          </div>
        </DndContext>
      </nav>

      <div className="border-t border-white/8 px-3 py-3">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all hover:shadow-md"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>退出登录</span>
        </button>
        <div className="mt-2 text-[11px] text-slate-500 text-center">
          {user?.email && <span className="text-slate-400">{user.email}</span>}
        </div>
        <div className="text-[11px] text-slate-500 text-center">
          LifeOS v2.0 · Full Stack
        </div>
      </div>
    </aside>
  );
}
