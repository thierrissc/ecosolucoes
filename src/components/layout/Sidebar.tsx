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
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/notificacoes', label: 'Notificações', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, naoLidasCount } = useApp();

  return (
    <aside
      className={cn(
        'sidebar-gradient sticky left-0 top-0 h-screen z-50 flex flex-col flex-shrink-0 transition-all duration-300 border-r border-brand-navy-border',
        sidebarCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Logo and Collapse Button */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-brand-navy-border min-h-[80px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/10 shadow-md">
            <img src="/logo.png" alt="Eco Soluções Logo" className="w-full h-full object-contain" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-white font-bold text-lg whitespace-nowrap tracking-tight">
              Eco Soluções
            </span>
          )}
        </div>
        
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", sidebarCollapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="px-2 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            const isNotif = href === '/notificacoes';

            return (
              <Link
                key={href}
                href={href}
                title={sidebarCollapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-200 group relative',
                  isActive
                    ? 'bg-brand-green/15 text-brand-green-light border border-brand-green/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center justify-center flex-shrink-0">
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
                  <span className="text-lg font-medium truncate">{label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-1 h-4 rounded-sm bg-brand-green-light flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      {!sidebarCollapsed && (
        <div className="px-4 py-4 border-t border-brand-navy-border">
          <Link href="/perfil" className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">ME</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-semibold truncate">Seu Perfil</p>
                <p className="text-slate-400 text-xs truncate">Administrador</p>
              </div>
            </div>
          </Link>
        </div>
      )}

    </aside>
  );
}
