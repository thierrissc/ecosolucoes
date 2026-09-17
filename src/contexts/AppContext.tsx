'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setores as initialSetores } from '@/data/setores';
import { tarefasSemanais as initialTarefas, metasMensais as initialMetas } from '@/data/demandas';
import { publicacoes as initialMural } from '@/data/mural';
import { eventos as initialEventos } from '@/data/calendario';
import { notificacoes as initialNotificacoes } from '@/data/notificacoes';
import { funcionariosDemonstracao } from '@/data/funcionarios';
import { Setor, Tarefa, MetaMensal, PublicacaoMural, EventoCalendario, Notificacao, Status, Funcionario, PermissoesFuncionario } from '@/types';
import { AuthUser } from '@/lib/auth';

interface AppContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permKey: keyof PermissoesFuncionario) => boolean;

  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  funcionarios: Funcionario[];
  funcionariosLoading: boolean;
  refreshFuncionarios: () => Promise<void>;
  addFuncionario: (func: Omit<Funcionario, 'id' | 'companyId' | 'createdAt'>) => Promise<{ success: boolean; error?: string; funcionario?: Funcionario }>;
  updateFuncionario: (func: Partial<Funcionario> & { id: string }) => Promise<{ success: boolean; error?: string }>;
  deleteFuncionario: (id: string) => Promise<{ success: boolean; error?: string }>;

  setores: Setor[];
  addSetor: (setor: Omit<Setor, 'id' | 'demandasSemanais' | 'demandasMensais' | 'desempenho'>) => void;
  deleteSetor: (id: string) => void;

  tarefasSemanais: Tarefa[];
  addTarefaSemanal: (tarefa: Omit<Tarefa, 'id' | 'tipo'>) => void;
  updateTarefaStatus: (id: string, status: Status) => void;
  deleteTarefaSemanal: (id: string) => void;

  metasMensais: MetaMensal[];
  addMetaMensal: (meta: Omit<MetaMensal, 'id'>) => void;
  updateMetaProgresso: (id: string, progresso: number) => void;
  deleteMetaMensal: (id: string) => void;

  publicacoes: PublicacaoMural[];
  addPublicacao: (pub: Omit<PublicacaoMural, 'id' | 'curtidas' | 'visualizacoes' | 'data'>) => void;
  toggleCurtidaMural: (id: string) => void;
  deletePublicacao: (id: string) => void;
  toggleFixarPublicacao: (id: string) => void;

  eventos: EventoCalendario[];
  addEvento: (evento: Omit<EventoCalendario, 'id'>) => void;
  deleteEvento: (id: string) => void;

  notificacoes: Notificacao[];
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  toggleLidaNotificacao: (id: string) => void;
  deleteNotificacao: (id: string) => void;
  naoLidasCount: number;

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
  FUNCIONARIOS: 'ecosolucoes_funcionarios',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('@eco-solucoes:auth_user');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('@eco-solucoes:auth_user');
        if (cached) return false;
      } catch {}
    }
    return true;
  });

  const [setores, setSetores] = useState<Setor[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedWs = localStorage.getItem('@eco-solucoes:user_workspace');
        if (cachedWs) {
          const parsed = JSON.parse(cachedWs);
          if (parsed.setores && parsed.setores.length > 0) return parsed.setores;
        }
        const s = localStorage.getItem(STORAGE_KEYS.SETORES);
        if (s) return JSON.parse(s);
      } catch {}
    }
    return initialSetores;
  });

  const [tarefasSemanais, setTarefasSemanais] = useState<Tarefa[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedWs = localStorage.getItem('@eco-solucoes:user_workspace');
        if (cachedWs) {
          const parsed = JSON.parse(cachedWs);
          if (parsed.tarefas && parsed.tarefas.length > 0) return parsed.tarefas;
        }
        const t = localStorage.getItem(STORAGE_KEYS.TAREFAS);
        if (t) return JSON.parse(t);
      } catch {}
    }
    return initialTarefas;
  });

  const [metasMensais, setMetasMensais] = useState<MetaMensal[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedWs = localStorage.getItem('@eco-solucoes:user_workspace');
        if (cachedWs) {
          const parsed = JSON.parse(cachedWs);
          if (parsed.metas && parsed.metas.length > 0) return parsed.metas;
        }
        const m = localStorage.getItem(STORAGE_KEYS.METAS);
        if (m) return JSON.parse(m);
      } catch {}
    }
    return initialMetas;
  });

  const [publicacoes, setPublicacoes] = useState<PublicacaoMural[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedWs = localStorage.getItem('@eco-solucoes:user_workspace');
        if (cachedWs) {
          const parsed = JSON.parse(cachedWs);
          if (parsed.mural && parsed.mural.length > 0) return parsed.mural;
        }
        const mu = localStorage.getItem(STORAGE_KEYS.MURAL);
        if (mu) return JSON.parse(mu);
      } catch {}
    }
    return initialMural;
  });

  const [eventos, setEventos] = useState<EventoCalendario[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedWs = localStorage.getItem('@eco-solucoes:user_workspace');
        if (cachedWs) {
          const parsed = JSON.parse(cachedWs);
          if (parsed.eventos && parsed.eventos.length > 0) return parsed.eventos;
        }
        const e = localStorage.getItem(STORAGE_KEYS.EVENTOS);
        if (e) return JSON.parse(e);
      } catch {}
    }
    return initialEventos;
  });

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedWs = localStorage.getItem('@eco-solucoes:user_workspace');
        if (cachedWs) {
          const parsed = JSON.parse(cachedWs);
          if (parsed.notificacoes && parsed.notificacoes.length > 0) return parsed.notificacoes;
        }
        const n = localStorage.getItem(STORAGE_KEYS.NOTIFICACOES);
        if (n) return JSON.parse(n);
      } catch {}
    }
    return initialNotificacoes;
  });

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionariosLoading, setFuncionariosLoading] = useState(false);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshFuncionarios = useCallback(async () => {
    try {
      setFuncionariosLoading(true);
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setFuncionarios(data.funcionarios || []);
      }
    } catch (err) {
    } finally {
      setFuncionariosLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem('@eco-solucoes:auth_user', JSON.stringify(data.user));
        } catch {}

        refreshFuncionarios();

        try {
          const dataRes = await fetch('/api/user/data');
          if (dataRes.ok) {
            const userData = await dataRes.json();
            setSetores(userData.setores || []);
            setTarefasSemanais(userData.tarefas || []);
            setMetasMensais(userData.metas || []);
            setPublicacoes(userData.mural || []);
            setEventos(userData.eventos || []);
            setNotificacoes(userData.notificacoes || []);
            try {
              localStorage.setItem('@eco-solucoes:user_workspace', JSON.stringify(userData));
            } catch {}
          }
        } catch {
          setSetores([]);
          setTarefasSemanais([]);
          setMetasMensais([]);
          setPublicacoes([]);
          setEventos([]);
          setNotificacoes([]);
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem('@eco-solucoes:auth_user');
          localStorage.removeItem('@eco-solucoes:user_workspace');
        } catch {}

        const s = localStorage.getItem(STORAGE_KEYS.SETORES);
        setSetores(s ? JSON.parse(s) : initialSetores);

        const t = localStorage.getItem(STORAGE_KEYS.TAREFAS);
        setTarefasSemanais(t ? JSON.parse(t) : initialTarefas);

        const m = localStorage.getItem(STORAGE_KEYS.METAS);
        setMetasMensais(m ? JSON.parse(m) : initialMetas);

        const mu = localStorage.getItem(STORAGE_KEYS.MURAL);
        setPublicacoes(mu ? JSON.parse(mu) : initialMural);

        const e = localStorage.getItem(STORAGE_KEYS.EVENTOS);
        setEventos(e ? JSON.parse(e) : initialEventos);

        const n = localStorage.getItem(STORAGE_KEYS.NOTIFICACOES);
        setNotificacoes(n ? JSON.parse(n) : initialNotificacoes);

        const f = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS);
        setFuncionarios(f ? JSON.parse(f) : funcionariosDemonstracao);
      }
    } catch {
      setUser(null);
      try {
        localStorage.removeItem('@eco-solucoes:auth_user');
        localStorage.removeItem('@eco-solucoes:user_workspace');
      } catch {}
      setSetores(initialSetores);
      setTarefasSemanais(initialTarefas);
      setMetasMensais(initialMetas);
      setPublicacoes(initialMural);
      setEventos(initialEventos);
      setNotificacoes(initialNotificacoes);
      setFuncionarios(funcionariosDemonstracao);
    } finally {
      setAuthLoading(false);
      setMounted(true);
    }
  }, [refreshFuncionarios]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted || authLoading) return;

    if (user) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch('/api/user/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              setores,
              tarefas: tarefasSemanais,
              metas: metasMensais,
              mural: publicacoes,
              eventos,
              notificacoes,
            }),
          });
        } catch (err) {}
      }, 800);
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setores));
        localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(tarefasSemanais));
        localStorage.setItem(STORAGE_KEYS.METAS, JSON.stringify(metasMensais));
        localStorage.setItem(STORAGE_KEYS.MURAL, JSON.stringify(publicacoes));
        localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
        localStorage.setItem(STORAGE_KEYS.NOTIFICACOES, JSON.stringify(notificacoes));
      } catch {}
    }
  }, [setores, tarefasSemanais, metasMensais, publicacoes, eventos, notificacoes, user, mounted, authLoading]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setFuncionarios([]);
    try {
      localStorage.removeItem('@eco-solucoes:auth_user');
      localStorage.removeItem('@eco-solucoes:user_workspace');
      localStorage.removeItem('@eco-solucoes:perfil');
      sessionStorage.clear();
      window.dispatchEvent(new CustomEvent('perfilUpdated', { detail: {} }));
    } catch {}
    setSetores(initialSetores);
    setTarefasSemanais(initialTarefas);
    setMetasMensais(initialMetas);
    setPublicacoes(initialMural);
    setEventos(initialEventos);
    setNotificacoes(initialNotificacoes);
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  const hasPermission = (permKey: keyof PermissoesFuncionario): boolean => {
    if (!user) return true;
    if (user.role !== 'funcionario') return true;
    return !!user.permissoes?.[permKey];
  };

  const addFuncionario = async (
    novo: Omit<Funcionario, 'id' | 'companyId' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string; funcionario?: Funcionario }> => {
    if (!user) {
      const novoDemo: Funcionario = {
        ...novo,
        id: `emp_demo_${Date.now()}`,
        companyId: 'demo_company',
        createdAt: new Date().toISOString(),
      };
      setFuncionarios((prev) => {
        const updated = [novoDemo, ...prev];
        try {
          localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true, funcionario: novoDemo };
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao cadastrar colaborador.' };
      }
      setFuncionarios((prev) => [data.funcionario, ...prev]);
      return { success: true, funcionario: data.funcionario };
    } catch {
      return { success: false, error: 'Falha na comunicação com o servidor.' };
    }
  };

  const updateFuncionario = async (
    func: Partial<Funcionario> & { id: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      setFuncionarios((prev) => {
        const updated = prev.map((f) => (f.id === func.id ? ({ ...f, ...func } as Funcionario) : f));
        try {
          localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true };
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(func),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao atualizar colaborador.' };
      }
      setFuncionarios((prev) =>
        prev.map((f) => (f.id === func.id ? ({ ...f, ...func } as Funcionario) : f))
      );
      return { success: true };
    } catch {
      return { success: false, error: 'Falha na comunicação com o servidor.' };
    }
  };

  const deleteFuncionario = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      setFuncionarios((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        try {
          localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true };
    }

    try {
      const res = await fetch(`/api/employees?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao excluir colaborador.' };
      }
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
      return { success: true };
    } catch {
      return { success: false, error: 'Falha na comunicação com o servidor.' };
    }
  };

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

  const limparDadosExemplo = () => {
    setSetores([]);
    setTarefasSemanais([]);
    setMetasMensais([]);
    setPublicacoes([]);
    setEventos([]);
    setNotificacoes([]);
    setFuncionarios([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SETORES);
      localStorage.removeItem(STORAGE_KEYS.TAREFAS);
      localStorage.removeItem(STORAGE_KEYS.METAS);
      localStorage.removeItem(STORAGE_KEYS.MURAL);
      localStorage.removeItem(STORAGE_KEYS.EVENTOS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICACOES);
      localStorage.removeItem(STORAGE_KEYS.FUNCIONARIOS);
    } catch {}
  };

  const restaurarDadosExemplo = () => {
    setSetores(initialSetores);
    setTarefasSemanais(initialTarefas);
    setMetasMensais(initialMetas);
    setPublicacoes(initialMural);
    setEventos(initialEventos);
    setNotificacoes(initialNotificacoes);
    setFuncionarios(funcionariosDemonstracao);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        checkAuth,
        logout,
        hasPermission,

        mobileMenuOpen,
        toggleMobileMenu: () => setMobileMenuOpen((c) => !c),
        closeMobileMenu: () => setMobileMenuOpen(false),
        searchQuery,
        setSearchQuery,

        funcionarios,
        funcionariosLoading,
        refreshFuncionarios,
        addFuncionario,
        updateFuncionario,
        deleteFuncionario,

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
