'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Building2,
  ListTodo,
  Calendar1,
  MessageSquare,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Leaf,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mural', label: 'Mural Corporativo', icon: Newspaper },
  { href: '/setores', label: 'Gestão de Setores', icon: Building2 },
  { href: '/demandas/semanais', label: 'Demandas Semanais', icon: ListTodo },
  { href: '/demandas/mensais', label: 'Demandas Mensais', icon: CalendarDays },
  { href: '/calendario', label: 'Calendário', icon: Calendar1 },
  { href: '/comunicacao', label: 'Comunicação', icon: MessageSquare },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/notificacoes', label: 'Notificações', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, naoLidasCount } = useApp();

  return (
    <aside
      className={cn(
        'sidebar-gradient fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 border-r border-brand-navy-border',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-navy-border min-h-[72px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shadow-lg shadow-brand-green/30">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <span className="text-white font-bold text-lg leading-tight block">Eco</span>
            <span className="text-brand-green-light font-semibold text-sm leading-tight block -mt-0.5">Soluções</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            const isNotif = href === '/notificacoes';

            return (
              <Link
                key={href}
                href={href}
                title={sidebarCollapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-brand-green/15 text-brand-green-light border border-brand-green/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="relative flex-shrink-0">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-brand-green-light' : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  {isNotif && naoLidasCount > 0 && (
                    <span className="notification-badge text-[10px]">
                      {naoLidasCount > 9 ? '9+' : naoLidasCount}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green-light flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-brand-navy-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">ME</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">Seu Perfil</p>
              <p className="text-slate-400 text-xs truncate">Administrador</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-brand-navy-border border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-green hover:border-brand-green transition-all duration-200 z-10"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
