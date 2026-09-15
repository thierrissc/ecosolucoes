'use client';

import React, { createContext, useContext, useState } from 'react';
import { notificacoes as notifData } from '@/data/notificacoes';
import { Notificacao } from '@/types';

interface AppContextType {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notificacoes: Notificacao[];
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  naoLidasCount: number;
}

const AppContext = createContext<AppContextType>({
  mobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  notificacoes: [],
  marcarLida: () => {},
  marcarTodasLidas: () => {},
  naoLidasCount: 0,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(notifData);

  const toggleMobileMenu = () => setMobileMenuOpen((c) => !c);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const marcarLida = (id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const marcarTodasLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <AppContext.Provider
      value={{
        mobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        searchQuery,
        setSearchQuery,
        notificacoes,
        marcarLida,
        marcarTodasLidas,
        naoLidasCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
