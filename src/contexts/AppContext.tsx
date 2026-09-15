'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setores as initialSetores } from '@/data/setores';
import { tarefasSemanais as initialTarefas, metasMensais as initialMetas } from '@/data/demandas';
import { publicacoes as initialMural } from '@/data/mural';
import { eventos as initialEventos } from '@/data/calendario';
import { notificacoes as initialNotificacoes } from '@/data/notificacoes';
import { Setor, Tarefa, MetaMensal, PublicacaoMural, EventoCalendario, Notificacao, Status } from '@/types';

interface AppContextType {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Setores
  setores: Setor[];
  addSetor: (setor: Omit<Setor, 'id' | 'demandasSemanais' | 'demandasMensais' | 'desempenho'>) => void;
  deleteSetor: (id: string) => void;

  // Demandas Semanais
  tarefasSemanais: Tarefa[];
  addTarefaSemanal: (tarefa: Omit<Tarefa, 'id' | 'tipo'>) => void;
  updateTarefaStatus: (id: string, status: Status) => void;
  deleteTarefaSemanal: (id: string) => void;

  // Demandas Mensais
  metasMensais: MetaMensal[];
  addMetaMensal: (meta: Omit<MetaMensal, 'id'>) => void;
  updateMetaProgresso: (id: string, progresso: number) => void;
  deleteMetaMensal: (id: string) => void;

  // Mural
  publicacoes: PublicacaoMural[];
  addPublicacao: (pub: Omit<PublicacaoMural, 'id' | 'curtidas' | 'visualizacoes' | 'data'>) => void;
  toggleCurtidaMural: (id: string) => void;
  deletePublicacao: (id: string) => void;
  toggleFixarPublicacao: (id: string) => void;

  // Calendário
  eventos: EventoCalendario[];
  addEvento: (evento: Omit<EventoCalendario, 'id'>) => void;
  deleteEvento: (id: string) => void;

  // Notificações
  notificacoes: Notificacao[];
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  toggleLidaNotificacao: (id: string) => void;
  deleteNotificacao: (id: string) => void;
  naoLidasCount: number;

  // Gestão de Dados
  limparDadosExemplo: () => void;
  restaurarDadosExemplo: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  SETORES: 'ecosolucoes_setores',
  TAREFAS: 'ecosolucoes_tarefas',
  METAS: 'ecosolucoes_metas',
  MURAL: 'ecosolucoes_mural',
  EVENTOS: 'ecosolucoes_eventos',
  NOTIFICACOES: 'ecosolucoes_notificacoes',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const [setores, setSetores] = useState<Setor[]>([]);
  const [tarefasSemanais, setTarefasSemanais] = useState<Tarefa[]>([]);
  const [metasMensais, setMetasMensais] = useState<MetaMensal[]>([]);
  const [publicacoes, setPublicacoes] = useState<PublicacaoMural[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  // Carregar dados persistidos no localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SETORES);
      if (s) setSetores(JSON.parse(s));

      const t = localStorage.getItem(STORAGE_KEYS.TAREFAS);
      if (t) setTarefasSemanais(JSON.parse(t));

      const m = localStorage.getItem(STORAGE_KEYS.METAS);
      if (m) setMetasMensais(JSON.parse(m));

      const mu = localStorage.getItem(STORAGE_KEYS.MURAL);
      if (mu) setPublicacoes(JSON.parse(mu));

      const e = localStorage.getItem(STORAGE_KEYS.EVENTOS);
      if (e) setEventos(JSON.parse(e));

      const n = localStorage.getItem(STORAGE_KEYS.NOTIFICACOES);
      if (n) setNotificacoes(JSON.parse(n));
    } catch {
      // fallback to initial
    }
    setMounted(true);
  }, []);

  // Salvar no localStorage quando o estado mudar
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setores));
    } catch {}
  }, [setores, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(tarefasSemanais));
    } catch {}
  }, [tarefasSemanais, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEYS.METAS, JSON.stringify(metasMensais));
    } catch {}
  }, [metasMensais, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MURAL, JSON.stringify(publicacoes));
    } catch {}
  }, [publicacoes, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
    } catch {}
  }, [eventos, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICACOES, JSON.stringify(notificacoes));
    } catch {}
  }, [notificacoes, mounted]);

  // Setores
  const addSetor = (novo: Omit<Setor, 'id' | 'demandasSemanais' | 'demandasMensais' | 'desempenho'>) => {
    const s: Setor = {
      ...novo,
      id: `s_${Date.now()}`,
      demandasSemanais: 0,
      demandasMensais: 0,
      desempenho: 100,
    };
    setSetores((prev) => [...prev, s]);
  };

  const deleteSetor = (id: string) => {
    setSetores((prev) => prev.filter((s) => s.id !== id));
  };

  // Demandas Semanais
  const addTarefaSemanal = (nova: Omit<Tarefa, 'id' | 'tipo'>) => {
    const t: Tarefa = {
      ...nova,
      id: `t_${Date.now()}`,
      tipo: 'semanal',
    };
    setTarefasSemanais((prev) => [t, ...prev]);
  };

  const updateTarefaStatus = (id: string, status: Status) => {
    setTarefasSemanais((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const deleteTarefaSemanal = (id: string) => {
    setTarefasSemanais((prev) => prev.filter((t) => t.id !== id));
  };

  // Demandas Mensais
  const addMetaMensal = (nova: Omit<MetaMensal, 'id'>) => {
    const m: MetaMensal = {
      ...nova,
      id: `m_${Date.now()}`,
    };
    setMetasMensais((prev) => [m, ...prev]);
  };

  const updateMetaProgresso = (id: string, progresso: number) => {
    setMetasMensais((prev) =>
      prev.map((m) => (m.id === id ? { ...m, progresso } : m))
    );
  };

  const deleteMetaMensal = (id: string) => {
    setMetasMensais((prev) => prev.filter((m) => m.id !== id));
  };

  // Mural
  const addPublicacao = (pub: Omit<PublicacaoMural, 'id' | 'curtidas' | 'visualizacoes' | 'data'>) => {
    const nova: PublicacaoMural = {
      ...pub,
      id: `p_${Date.now()}`,
      curtidas: 0,
      visualizacoes: 1,
      data: new Date().toISOString().split('T')[0],
    };
    setPublicacoes((prev) => [nova, ...prev]);
  };

  const toggleCurtidaMural = (id: string) => {
    setPublicacoes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, curtidas: p.curtidas + 1 } : p))
    );
  };

  const deletePublicacao = (id: string) => {
    setPublicacoes((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFixarPublicacao = (id: string) => {
    setPublicacoes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fixado: !p.fixado } : p))
    );
  };

  // Calendário
  const addEvento = (evento: Omit<EventoCalendario, 'id'>) => {
    const e: EventoCalendario = {
      ...evento,
      id: `e_${Date.now()}`,
    };
    setEventos((prev) => [...prev, e]);
  };

  const deleteEvento = (id: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
  };

  // Notificações
  const marcarLida = (id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const toggleLidaNotificacao = (id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: !n.lida } : n))
    );
  };

  const deleteNotificacao = (id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const marcarTodasLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  // Gestão de dados
  const limparDadosExemplo = () => {
    setSetores([]);
    setTarefasSemanais([]);
    setMetasMensais([]);
    setPublicacoes([]);
    setEventos([]);
    setNotificacoes([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SETORES);
      localStorage.removeItem(STORAGE_KEYS.TAREFAS);
      localStorage.removeItem(STORAGE_KEYS.METAS);
      localStorage.removeItem(STORAGE_KEYS.MURAL);
      localStorage.removeItem(STORAGE_KEYS.EVENTOS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICACOES);
    } catch {}
  };

  const restaurarDadosExemplo = () => {
    setSetores(initialSetores);
    setTarefasSemanais(initialTarefas);
    setMetasMensais(initialMetas);
    setPublicacoes(initialMural);
    setEventos(initialEventos);
    setNotificacoes(initialNotificacoes);
  };

  return (
    <AppContext.Provider
      value={{
        mobileMenuOpen,
        toggleMobileMenu: () => setMobileMenuOpen((c) => !c),
        closeMobileMenu: () => setMobileMenuOpen(false),
        searchQuery,
        setSearchQuery,

        setores,
        addSetor,
        deleteSetor,

        tarefasSemanais,
        addTarefaSemanal,
        updateTarefaStatus,
        deleteTarefaSemanal,

        metasMensais,
        addMetaMensal,
        updateMetaProgresso,
        deleteMetaMensal,

        publicacoes,
        addPublicacao,
        toggleCurtidaMural,
        deletePublicacao,
        toggleFixarPublicacao,

        eventos,
        addEvento,
        deleteEvento,

        notificacoes,
        marcarLida,
        marcarTodasLidas,
        toggleLidaNotificacao,
        deleteNotificacao,
        naoLidasCount,

        limparDadosExemplo,
        restaurarDadosExemplo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
