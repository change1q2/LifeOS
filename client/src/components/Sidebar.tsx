import { useState, useEffect, lazy, Suspense } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../config/modules';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { LogOut, Sprout, Menu, X } from 'lucide-react';

const STORAGE_KEY = 'lifeos_sidebar_order';

const SidebarSortable = lazy(() => import('./SidebarSortable'));

type SidebarItem = typeof SIDEBAR_ITEMS[0];

function StaticSidebarList({ items }: { items: SidebarItem[] }) {
  return (
    <div className="flex flex-col gap-0" style={{ minHeight: '100%' }}>
      {items.map((item) => (
        <div
          key={item.key}
          className="group relative flex items-center gap-2.5 rounded-md px-3.5 py-2.5 my-0.5 text-[13.5px] font-medium transition-all"
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
      ))}
    </div>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      <button
        onClick={onMobileClose}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-lg md:hidden"
      >
        <X className="w-5 h-5" />
      </button>

      <aside className={cn(
        'flex flex-shrink-0 flex-col bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 shadow-[4px_0_20px_-5px_rgba(0,0,0,0.3)]',
        'w-60 lg:w-60 xl:w-60',
        mobileOpen ? 'fixed inset-y-0 left-0 z-40 w-72' : 'hidden md:flex'
      )}>
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
          <Suspense fallback={<StaticSidebarList items={items} />}>
            <SidebarSortable items={items} onItemsChange={setItems} />
          </Suspense>
        </nav>

        <div className="border-t border-white/8 px-3 py-3">
          <button
            onClick={handleLogout}
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

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-white shadow-lg md:hidden fixed top-4 left-4 z-50"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}