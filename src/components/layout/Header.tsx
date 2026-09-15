'use client';

import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/mural': 'Mural Corporativo',
  '/setores': 'Gestão de Setores',
  '/demandas/semanais': 'Demandas Semanais',
  '/demandas/mensais': 'Demandas Mensais',
  '/calendario': 'Calendário Corporativo',
  '/comunicacao': 'Central de Comunicação',
  '/relatorios': 'Relatórios',
  '/notificacoes': 'Notificações',
};

interface HeaderProps {
  pathname: string;
}

export default function Header({ pathname }: HeaderProps) {
  const { searchQuery, setSearchQuery, naoLidasCount, toggleSidebar } = useApp();
  const { darkMode, toggleDarkMode } = useTheme();

  const title = pageTitles[pathname] || 'Eco Soluções';

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-4 bg-brand-navy/80 backdrop-blur-md border-b border-brand-navy-border">
      {/* Mobile menu */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-slate-400 hover:text-white transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-shrink-0">
        <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
        <p className="text-slate-400 text-xs">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tarefas, setores, avisos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-navy-light border border-brand-navy-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl bg-brand-navy-light border border-brand-navy-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-green/40 transition-all"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          href="/notificacoes"
          className="relative w-9 h-9 rounded-xl bg-brand-navy-light border border-brand-navy-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-green/40 transition-all"
        >
          <Bell className="w-4 h-4" />
          {naoLidasCount > 0 && (
            <span className="notification-badge">{naoLidasCount > 9 ? '9+' : naoLidasCount}</span>
          )}
        </Link>

        <Link href="/perfil" className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-brand-green/30 transition-all">
          <span className="text-white text-xs font-bold">ME</span>
        </Link>
      </div>
    </header>
  );
}
