import { NavLink } from 'react-router-dom';
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

type SidebarItem = typeof SIDEBAR_ITEMS[0];

function SortableItem({ item }: { item: SidebarItem }) {
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

interface SidebarSortableProps {
  items: SidebarItem[];
  onItemsChange: (items: SidebarItem[]) => void;
}

export function SidebarSortable({ items, onItemsChange }: SidebarSortableProps) {
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
      const oldIndex = items.findIndex((item) => item.key === active.id);
      const newIndex = items.findIndex((item) => item.key === over.id);
      onItemsChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
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
  );
}

export default SidebarSortable;
