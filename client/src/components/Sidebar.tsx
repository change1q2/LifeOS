import { NavLink } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../config/modules';
import { cn } from '../lib/utils';

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-gradient-to-b from-slate-800 to-slate-900">
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl">
            🌱
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-wide">LifeOS</div>
            <div className="text-[11px] text-slate-400">产品人生系统</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.key === 'dashboard' ? '/' : `/${item.key}`}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-2.5 rounded-md px-3.5 py-2.5 my-0.5 text-[13.5px] font-medium transition-all cursor-pointer',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400" />
                )}
                <span className="text-[17px] w-5 text-center">{item.icon}</span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="text-[11px] text-slate-500 text-center">
          LifeOS v2.0 · Full Stack
        </div>
      </div>
    </aside>
  );
}
