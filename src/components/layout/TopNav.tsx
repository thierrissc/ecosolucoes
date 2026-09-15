'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Newspaper,
  Building2,
  ListTodo,
  CalendarDays,
  Calendar1,
  BarChart3,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Leaf,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mural', label: 'Mural', icon: Newspaper },
  { href: '/setores', label: 'Setores', icon: Building2 },
  {
    label: 'Demandas',
    icon: ListTodo,
    children: [
      { href: '/demandas/semanais', label: 'Semanais', icon: ListTodo },
      { href: '/demandas/mensais', label: 'Mensais', icon: CalendarDays },
    ],
  },
  { href: '/calendario', label: 'Calendário', icon: Calendar1 },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/mural': 'Mural Corporativo',
  '/setores': 'Gestão de Setores',
  '/demandas/semanais': 'Demandas Semanais',
  '/demandas/mensais': 'Demandas Mensais',
  '/calendario': 'Calendário Corporativo',
  '/relatorios': 'Relatórios',
  '/notificacoes': 'Notificações',
  '/perfil': 'Perfil da Empresa',
};

interface TopNavProps {
  pathname: string;
}

export default function TopNav({ pathname }: TopNavProps) {
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu, naoLidasCount } = useApp();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [demandasOpen, setDemandasOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    closeMobileMenu();
    setDemandasOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  const isDemandasActive = pathname.startsWith('/demandas');

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="bg-surface-1/80 backdrop-blur-xl border-b border-surface-border w-full">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
            <div className="flex items-center justify-between h-16 md:h-[68px]">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                <img
                  src="/logo.png"
                  alt="EcoSoluções"
                  className="w-9 h-9 object-contain"
                />
                <span className="text-text-primary font-bold text-lg tracking-tight hidden sm:block">
                  Eco<span className="text-brand">Soluções</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  if ('children' in item && item.children) {
                    return (
                      <div key={item.label} className="relative">
                        <button
                          onClick={() => setDemandasOpen(!demandasOpen)}
                          onBlur={() => setTimeout(() => setDemandasOpen(false), 150)}
                          className={cn(
                            'flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all relative',
                            isDemandasActive
                              ? 'text-brand bg-brand/8'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', demandasOpen && 'rotate-180')} />
                          {isDemandasActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
                          )}
                        </button>
                        {demandasOpen && (
                          <div className="absolute top-full left-0 mt-1 card p-1.5 min-w-[180px] animate-scale-in z-50">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  'flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all',
                                  isActive(child.href)
                                    ? 'text-brand bg-brand/8'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                )}
                              >
                                <child.icon className="w-4 h-4" />
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all relative',
                        isActive(item.href!)
                          ? 'text-brand bg-brand/8'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {isActive(item.href!) && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-1.5">
                {/* Search Toggle (Desktop) */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="hidden md:flex w-9 h-9 items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
                >
                  {mounted ? (
                    darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />
                  ) : (
                    <div className="w-[18px] h-[18px]" />
                  )}
                </button>

                {/* Notifications */}
                <Link
                  href="/notificacoes"
                  className={cn(
                    'relative w-9 h-9 flex items-center justify-center transition-all',
                    pathname === '/notificacoes'
                      ? 'text-brand bg-brand/8'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  )}
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {naoLidasCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-surface-1">
                      {naoLidasCount > 9 ? '9+' : naoLidasCount}
                    </span>
                  )}
                </Link>

                {/* Avatar */}
                <Link
                  href="/perfil"
                  className="w-9 h-9 flex items-center justify-center hover:shadow-lg hover:shadow-brand/25 transition-all ml-1 border border-surface-border bg-surface-2 overflow-hidden"
                  title="Perfil"
                >
                  <img
                    src="/icon.png"
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Mobile hamburger */}
                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all ml-0.5"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="hidden md:block bg-surface-1/95 backdrop-blur-xl border-b border-surface-border animate-fade-up">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar tarefas, setores, avisos..."
                  autoFocus
                  className="input pl-10"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-1/98 backdrop-blur-xl border-b border-surface-border animate-fade-up">
            <div className="w-full px-4 sm:px-6 py-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input pl-10"
                />
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  if ('children' in item && item.children) {
                    return (
                      <div key={item.label}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={closeMobileMenu}
                            className={cn(
                              'flex items-center gap-3 px-3.5 py-3 text-sm font-medium transition-all',
                              isActive(child.href)
                                ? 'text-brand bg-brand/8'
                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                            )}
                          >
                            <child.icon className="w-5 h-5" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={closeMobileMenu}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-3 text-sm font-medium transition-all',
                        isActive(item.href!)
                          ? 'text-brand bg-brand/8'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
