'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  LogOut,
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
  const {
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    naoLidasCount,
    tarefasSemanais,
    metasMensais,
    setores,
    publicacoes,
    eventos,
    user,
    isAuthenticated,
    logout,
  } = useApp();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [demandasOpen, setDemandasOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearchTerm, setMobileSearchTerm] = useState('');
  const [userAvatar, setUserAvatar] = useState<string>('/icon.png');

  useEffect(() => {
    setMounted(true);
    const updateAvatar = () => {
      try {
        const saved = localStorage.getItem('@eco-solucoes:perfil');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.avatarUrl) {
            setUserAvatar(parsed.avatarUrl);
          }
        }
      } catch (e) {}
    };
    updateAvatar();
    window.addEventListener('storage', updateAvatar);
    window.addEventListener('perfilUpdated', updateAvatar);
    return () => {
      window.removeEventListener('storage', updateAvatar);
      window.removeEventListener('perfilUpdated', updateAvatar);
    };
  }, []);

  useEffect(() => {
    closeMobileMenu();
    setDemandasOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  const isDemandasActive = pathname.startsWith('/demandas');

  const executeSearch = (q: string) => {
    const term = q.toLowerCase().trim();
    if (!term) return [];
    const results: Array<{ id: string; category: string; title: string; subtitle: string; href: string }> = [];

    tarefasSemanais.forEach((t) => {
      if (t.nome.toLowerCase().includes(term) || t.responsavel.toLowerCase().includes(term) || (t.descricao && t.descricao.toLowerCase().includes(term))) {
        results.push({
          id: `t_${t.id}`,
          category: 'Demanda Semanal',
          title: t.nome,
          subtitle: `${t.responsavel} · ${t.status.replace('_', ' ')}`,
          href: '/demandas/semanais',
        });
      }
    });

    metasMensais.forEach((m) => {
      if (m.nome.toLowerCase().includes(term) || (m.descricao && m.descricao.toLowerCase().includes(term)) || m.responsavel.toLowerCase().includes(term)) {
        results.push({
          id: `m_${m.id}`,
          category: 'Meta Mensal',
          title: m.nome,
          subtitle: `Progresso: ${m.progresso}% · Resp: ${m.responsavel}`,
          href: '/demandas/mensais',
        });
      }
    });

    setores.forEach((s) => {
      if (s.nome.toLowerCase().includes(term) || s.responsavel.toLowerCase().includes(term)) {
        results.push({
          id: `s_${s.id}`,
          category: 'Setor',
          title: s.nome,
          subtitle: `Líder: ${s.responsavel} · ${s.desempenho}% desempenho`,
          href: '/setores',
        });
      }
    });

    publicacoes.forEach((p) => {
      if (p.titulo.toLowerCase().includes(term) || p.descricao.toLowerCase().includes(term) || p.autor.toLowerCase().includes(term)) {
        results.push({
          id: `p_${p.id}`,
          category: 'Mural',
          title: p.titulo,
          subtitle: `Por ${p.autor} · ${p.tipo}`,
          href: '/mural',
        });
      }
    });

    eventos.forEach((e) => {
      if (e.titulo.toLowerCase().includes(term) || (e.local && e.local.toLowerCase().includes(term))) {
        results.push({
          id: `e_${e.id}`,
          category: 'Calendário',
          title: e.titulo,
          subtitle: `${e.data}${e.hora ? ` às ${e.hora}` : ''}${e.local ? ` · ${e.local}` : ''}`,
          href: '/calendario',
        });
      }
    });

    return results.slice(0, 8);
  };

  const desktopSearchResults = useMemo(() => executeSearch(searchTerm), [searchTerm, tarefasSemanais, metasMensais, setores, publicacoes, eventos]);
  const mobileSearchResults = useMemo(() => executeSearch(mobileSearchTerm), [mobileSearchTerm, tarefasSemanais, metasMensais, setores, publicacoes, eventos]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full print:hidden">
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

                {/* Autenticação: Login/Cadastro ou Perfil */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-1.5 ml-1">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 p-1 hover:bg-surface-hover transition-colors border border-surface-border bg-surface-1"
                      title="Perfil da Empresa"
                    >
                      <div className="w-7 h-7 border border-surface-border bg-surface-2 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img
                          src={user?.avatar || userAvatar || '/icon.png'}
                          alt={user?.companyName || 'Perfil'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left hidden xl:block pr-1.5">
                        <p className="text-xs font-bold text-text-primary leading-tight max-w-[110px] truncate">
                          {user?.companyName || 'Minha Empresa'}
                        </p>
                        <p className="text-[10px] text-text-muted leading-tight truncate">
                          {user?.name || 'Gestor'}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors border border-surface-border"
                      title="Sair da conta"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-1">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-surface-border transition-colors whitespace-nowrap"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/registro"
                      className="btn-primary px-3 py-1.5 text-xs font-bold whitespace-nowrap shadow-sm"
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}

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
          <div className="hidden md:block bg-surface-1/95 backdrop-blur-xl border-b border-surface-border animate-fade-up relative z-50">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar tarefas, setores, avisos..."
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setSearchTerm('');
                    }
                  }}
                  className="input input-with-icon pr-10"
                />
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs px-1.5 py-0.5 border border-surface-border"
                  >
                    ESC
                  </button>
                )}

                {/* Dropdown de Resultados */}
                {searchTerm.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 card p-2 bg-surface-1 border border-surface-border shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {desktopSearchResults.length > 0 ? (
                      <div className="divide-y divide-surface-border">
                        {desktopSearchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchTerm('');
                            }}
                            className="flex items-center justify-between p-2.5 hover:bg-surface-hover transition-colors group text-left"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="text-text-primary text-xs font-semibold truncate group-hover:text-brand transition-colors">
                                {item.title}
                              </p>
                              <p className="text-text-muted text-[11px] truncate">{item.subtitle}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-2 text-text-secondary px-2 py-0.5 border border-surface-border flex-shrink-0">
                              {item.category}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted text-xs text-center py-4">
                        Nenhum resultado encontrado para &quot;{searchTerm}&quot;
                      </p>
                    )}
                  </div>
                )}
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
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar tarefas, setores, avisos..."
                  value={mobileSearchTerm}
                  onChange={(e) => setMobileSearchTerm(e.target.value)}
                  className="input input-with-icon pr-10"
                />
                {mobileSearchTerm && (
                  <button
                    onClick={() => setMobileSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Mobile Dropdown de Resultados */}
                {mobileSearchTerm.trim() && (
                  <div className="mt-2 card p-2 bg-surface-1 border border-surface-border shadow-xl max-h-60 overflow-y-auto">
                    {mobileSearchResults.length > 0 ? (
                      <div className="divide-y divide-surface-border">
                        {mobileSearchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => {
                              closeMobileMenu();
                              setMobileSearchTerm('');
                            }}
                            className="flex items-center justify-between p-2.5 hover:bg-surface-hover transition-colors group text-left"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-text-primary text-xs font-semibold truncate group-hover:text-brand transition-colors">
                                {item.title}
                              </p>
                              <p className="text-text-muted text-[11px] truncate">{item.subtitle}</p>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-2 text-text-secondary px-1.5 py-0.5 border border-surface-border flex-shrink-0">
                              {item.category}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted text-xs text-center py-3">
                        Nenhum resultado para &quot;{mobileSearchTerm}&quot;
                      </p>
                    )}
                  </div>
                )}
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

                {/* Mobile Auth Bottom Section */}
                <div className="pt-2 mt-2 border-t border-surface-border">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/perfil"
                        onClick={closeMobileMenu}
                        className={cn(
                          'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all',
                          isActive('/perfil')
                            ? 'text-brand bg-brand/8'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                        )}
                      >
                        <div className="w-6 h-6 border border-surface-border bg-surface-2 overflow-hidden flex-shrink-0">
                          <img src={user?.avatar || userAvatar || '/icon.png'} alt="Perfil" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">{user?.companyName}</p>
                          <p className="text-[10px] text-text-muted truncate">{user?.name}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 w-full text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair da conta
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 px-3 py-2">
                      <Link
                        href="/login"
                        onClick={closeMobileMenu}
                        className="text-center py-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface-2 border border-surface-border transition-colors"
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/registro"
                        onClick={closeMobileMenu}
                        className="btn-primary justify-center text-center py-2 text-xs font-bold shadow-sm"
                      >
                        Cadastrar
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
