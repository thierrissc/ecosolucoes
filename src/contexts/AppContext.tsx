'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setores as initialSetores } from '@/data/setores';
import { tarefasSemanais as initialTarefas, metasMensais as initialMetas } from '@/data/demandas';
import { publicacoes as initialMural } from '@/data/mural';
import { eventos as initialEventos } from '@/data/calendario';
import { notificacoes as initialNotificacoes } from '@/data/notificacoes';
import { Setor, Tarefa, MetaMensal, PublicacaoMural, EventoCalendario, Notificacao, Status, Funcionario, PermissoesFuncionario } from '@/types';
import { AuthUser } from '@/lib/auth';

interface AppContextType {
  // Autenticação
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

  // Funcionários / Colaboradores
  funcionarios: Funcionario[];
  funcionariosLoading: boolean;
  refreshFuncionarios: () => Promise<void>;
  addFuncionario: (func: Omit<Funcionario, 'id' | 'companyId' | 'createdAt'>) => Promise<{ success: boolean; error?: string; funcionario?: Funcionario }>;
  updateFuncionario: (func: Partial<Funcionario> & { id: string }) => Promise<{ success: boolean; error?: string }>;
  deleteFuncionario: (id: string) => Promise<{ success: boolean; error?: string }>;

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

  // Estado de Autenticação
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados dos Dados
  const [setores, setSetores] = useState<Setor[]>([]);
  const [tarefasSemanais, setTarefasSemanais] = useState<Tarefa[]>([]);
  const [metasMensais, setMetasMensais] = useState<MetaMensal[]>([]);
  const [publicacoes, setPublicacoes] = useState<PublicacaoMural[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  // Estados dos Colaboradores
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionariosLoading, setFuncionariosLoading] = useState(false);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Buscar Funcionários da Empresa ───
  const refreshFuncionarios = useCallback(async () => {
    try {
      setFuncionariosLoading(true);
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setFuncionarios(data.funcionarios || []);
      }
    } catch (err) {
      console.error('Erro ao buscar colaboradores:', err);
    } finally {
      setFuncionariosLoading(false);
    }
  }, []);

  // ─── Verificar Autenticação ───
  const checkAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.authenticated && data.user) {
        setUser(data.user);

        // Se for gestor ou colaborador, carregar lista de colaboradores
        refreshFuncionarios();

        // Carregar dados salvos no banco SQL do usuário
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
          }
        } catch {
          // Mantém estado limpo
          setSetores([]);
          setTarefasSemanais([]);
          setMetasMensais([]);
          setPublicacoes([]);
          setEventos([]);
          setNotificacoes([]);
        }
      } else {
        setUser(null);
        // Modo Visitante: exibe os dados didáticos de exemplo
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
      }
    } catch {
      setUser(null);
      setSetores(initialSetores);
      setTarefasSemanais(initialTarefas);
      setMetasMensais(initialMetas);
      setPublicacoes(initialMural);
      setEventos(initialEventos);
      setNotificacoes(initialNotificacoes);
    } finally {
      setAuthLoading(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ─── Sincronização de Dados ───
  useEffect(() => {
    if (!mounted || authLoading) return;

    if (user) {
      // Usuário autenticado: salva no banco de dados SQL com debounce
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
        } catch (err) {
          console.error('Erro ao sincronizar com banco de dados:', err);
        }
      }, 800);
    } else {
      // Visitante: armazena alterações temporárias no localStorage
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

  // ─── Logout ───
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setFuncionarios([]);
    // Restaura os dados de exemplo para o modo visitante
    setSetores(initialSetores);
    setTarefasSemanais(initialTarefas);
    setMetasMensais(initialMetas);
    setPublicacoes(initialMural);
    setEventos(initialEventos);
    setNotificacoes(initialNotificacoes);
  };

  // ─── Permissões de Usuário / Colaborador ───
  const hasPermission = (permKey: keyof PermissoesFuncionario): boolean => {
    if (!user) return true; // Visitante / Demonstração
    if (user.role !== 'funcionario') return true; // Dono da empresa tem acesso irrestrito
    return !!user.permissoes?.[permKey];
  };

  // ─── Gestão de Funcionários ───
  const addFuncionario = async (
    novo: Omit<Funcionario, 'id' | 'companyId' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string; funcionario?: Funcionario }> => {
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

  // ─── Setores ───
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

  // ─── Demandas Semanais ───
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

  // ─── Demandas Mensais ───
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

  // ─── Mural ───
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

  // ─── Calendário ───
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

  // ─── Notificações ───
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

  // ─── Gestão de Dados ───
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
