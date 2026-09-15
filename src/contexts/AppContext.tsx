'use client';

import React, { createContext, useContext, useState } from 'react';
import { notificacoes as notifData } from '@/data/notificacoes';
import { Notificacao } from '@/types';

interface AppContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notificacoes: Notificacao[];
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  naoLidasCount: number;
}

const AppContext = createContext<AppContextType>({
  sidebarCollapsed: false,
  toggleSidebar: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  notificacoes: [],
  marcarLida: () => {},
  marcarTodasLidas: () => {},
  naoLidasCount: 0,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(notifData);

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

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
        sidebarCollapsed,
        toggleSidebar,
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
