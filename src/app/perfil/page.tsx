'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Save,
  Building,
  Mail,
  MapPin,
  Globe,
  AtSign,
  Briefcase,
  CheckCircle2,
  Leaf,
  LogOut,
  Trash2,
  User,
  X,
  Pencil,
  Upload,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface PerfilData {
  nomeEmpresa: string;
  arrobaEmpresa: string;
  cargo: string;
  email: string;
  telefone: string;
  endereco: string;
  site: string;
  descricao: string;
  setorAtuacao: string;
  avatarUrl: string;
}

const DEFAULT_DATA: PerfilData = {
  nomeEmpresa: '',
  arrobaEmpresa: '',
  cargo: '',
  email: '',
  telefone: '',
  endereco: '',
  site: '',
  descricao: '',
  setorAtuacao: '',
  avatarUrl: '',
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, logout, checkAuth, limparDadosExemplo, restaurarDadosExemplo } = useApp();
  const [data, setData] = useState<PerfilData>(DEFAULT_DATA);
  const [isClient, setIsClient] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalAction, setModalAction] = useState<'limpar' | 'restaurar' | null>(null);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);

  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeAvatar, setEmployeeAvatar] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading && (!isAuthenticated || !user)) {
      window.location.replace('/');
    }
  }, [isClient, authLoading, isAuthenticated, user]);

  useEffect(() => {
    const handleNavigation = () => {
      if (!isAuthenticated || !user) {
        window.location.replace('/');
      }
    };
    window.addEventListener('pageshow', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('pageshow', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditDropdownOpen(false);
      }
    };
    if (editDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editDropdownOpen]);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'funcionario') {
      setEmployeeEmail(user.email || '');
      setEmployeeAvatar(user.avatar || '');
      return;
    }

    const saved = localStorage.getItem('@eco-solucoes:perfil');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({
          ...DEFAULT_DATA,
          ...parsed,
          nomeEmpresa: parsed.nomeEmpresa || user.companyName || '',
          cargo: parsed.cargo || user.name || '',
          email: parsed.email || user.email || '',
          avatarUrl: parsed.avatarUrl !== undefined ? parsed.avatarUrl : (user.avatar || ''),
        });
      } catch (e) {
        setData({
          ...DEFAULT_DATA,
          nomeEmpresa: user.companyName || '',
          cargo: user.name || '',
          email: user.email || '',
          avatarUrl: user.avatar || '',
        });
      }
    } else {
      setData({
        ...DEFAULT_DATA,
        nomeEmpresa: user.companyName || '',
        cargo: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const syncWithServer = async (updated: Partial<PerfilData>) => {
    if (!isAuthenticated) return;
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          user?.role === 'funcionario'
            ? { email: employeeEmail, avatar: updated.avatarUrl !== undefined ? updated.avatarUrl : employeeAvatar }
            : {
                companyName: updated.nomeEmpresa,
                name: updated.cargo || user?.name,
                avatar: updated.avatarUrl,
              }
        ),
      });
      await checkAuth();
    } catch (err) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'funcionario') {
      await syncWithServer({ avatarUrl: employeeAvatar });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    localStorage.setItem('@eco-solucoes:perfil', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('perfilUpdated', { detail: data }));
    await syncWithServer(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newUrl = reader.result as string;
        if (user?.role === 'funcionario') {
          setEmployeeAvatar(newUrl);
          await syncWithServer({ avatarUrl: newUrl });
          return;
        }
        const updated = { ...data, avatarUrl: newUrl };
        setData(updated);
        localStorage.setItem('@eco-solucoes:perfil', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('perfilUpdated', { detail: updated }));
        await syncWithServer(updated);
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    if (user?.role === 'funcionario') {
      setEmployeeAvatar('');
      await syncWithServer({ avatarUrl: '' });
      return;
    }
    const updated = { ...data, avatarUrl: '' };
    setData(updated);
    localStorage.setItem('@eco-solucoes:perfil', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('perfilUpdated', { detail: updated }));
    await syncWithServer(updated);
  };

  const handleLogoutAction = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  if (!isClient || authLoading || !isAuthenticated || !user) {
    return null;
  }

  if (user.role === 'funcionario') {
    const permissoesAtivas = [
      { key: 'podeCriarMural', label: 'Publicar Avisos no Mural' },
      { key: 'podeApagarMural', label: 'Apagar Postagens do Mural' },
      { key: 'podeCriarDemandas', label: 'Criar Tarefas & Metas' },
      { key: 'podeEditarDemandas', label: 'Editar Demandas' },
      { key: 'podeApagarDemandas', label: 'Excluir Demandas' },
      { key: 'podeGerenciarSetores', label: 'Gerenciar Setores' },
      { key: 'podeGerenciarCalendario', label: 'Gerenciar Calendário' },
      { key: 'podeVisualizarRelatorios', label: 'Visualizar Relatórios Executivos' },
    ].filter((p) => (user.permissoes as any)?.[p.key]);

    return (
      <div className="space-y-6 md:space-y-8 animate-fade-up w-full pb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">
              Meu Perfil de Colaborador
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Suas informações de acesso pessoal e credenciais vinculadas a {user.companyName}.
            </p>
          </div>
          <button
            onClick={handleLogoutAction}
            className="px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors inline-flex items-center justify-center gap-2 rounded-lg w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="card overflow-hidden">
              <div className="h-24 gradient-mesh relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-1/80" />
              </div>

              <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center text-center">
                <div className="relative mb-4" ref={dropdownRef}>
                  <div className="w-24 h-24 border-4 border-surface-1 overflow-hidden bg-surface-2 flex items-center justify-center shadow-lg relative rounded-xl">
                    {employeeAvatar ? (
                      <img src={employeeAvatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-2xl flex items-center justify-center">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="absolute -bottom-2 -left-1 z-20">
                    <button
                      type="button"
                      onClick={() => setEditDropdownOpen((prev) => !prev)}
                      className="px-2.5 py-1 bg-surface-1 hover:bg-surface-2 border border-surface-border text-text-primary text-xs font-semibold rounded-md shadow-md flex items-center gap-1.5 transition-all group"
                    >
                      <Pencil className="w-3.5 h-3.5 text-text-secondary group-hover:text-brand transition-colors" />
                      <span>Edit</span>
                    </button>

                    {editDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-44 bg-surface-1 border border-surface-border rounded-lg shadow-2xl p-1.5 z-50 animate-scale-in text-left">
                        <div className="absolute -top-1.5 left-4 w-3 h-3 bg-surface-1 border-t border-l border-surface-border rotate-45" />
                        <div className="relative z-10 space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditDropdownOpen(false);
                              fileInputRef.current?.click();
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-md text-left flex items-center gap-2 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5 text-text-muted" />
                            <span>Carregar foto...</span>
                          </button>

                          {employeeAvatar && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditDropdownOpen(false);
                                handleRemoveAvatar();
                              }}
                              className="w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-md text-left flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Remover foto</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <h3 className="text-text-primary font-bold text-xl">{user.name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {user.cargo || 'Colaborador'}
                </span>

                <div className="w-full space-y-2.5 text-left pt-5 mt-5 border-t border-surface-border">
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Building className="w-4 h-4 text-brand flex-shrink-0" />
                    <span className="truncate">{user.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Conta Ativa no Espaço Corporativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Informações Funcionais
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Empresa Vinculada
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      disabled
                      value={user.companyName}
                      className="input input-with-icon opacity-80 cursor-not-allowed bg-surface-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Cargo / Função
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      disabled
                      value={user.cargo || 'Colaborador'}
                      className="input input-with-icon opacity-80 cursor-not-allowed bg-surface-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Minhas Permissões de Acesso
                </h3>
                <span className="text-xs text-text-muted">
                  {permissoesAtivas.length} liberadas
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Ferramentas e módulos habilitados pelo gestor da sua empresa para a sua conta:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {permissoesAtivas.length > 0 ? (
                  permissoesAtivas.map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center gap-2 p-2.5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{p.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted italic col-span-2">
                    Nenhuma permissão especial liberada. Você tem acesso para visualização e leitura.
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Contato Pessoal
              </h3>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  E-mail Pessoal / Notificações
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {saveSuccess ? (
                  <span className="text-xs text-brand font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> E-mail atualizado!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs font-bold shadow-md inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Save className="w-4 h-4" /> Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Perfil da Empresa</h2>
          <p className="text-text-muted text-sm mt-1">Gerencie as informações corporativas.</p>
        </div>
        <button
          onClick={handleLogoutAction}
          className="px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 md:space-y-5">
          <div className="card overflow-hidden">
            <div className="h-28 gradient-mesh relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-1/80" />
            </div>

            <div className="px-6 pb-6 -mt-14 relative flex flex-col items-center text-center">
              <div className="relative mb-5" ref={dropdownRef}>
                <div className="w-28 h-28 border-4 border-surface-1 overflow-hidden bg-surface-2 flex items-center justify-center shadow-lg relative">
                  {data.avatarUrl ? (
                    <img src={data.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/icon.png" alt="Eco Soluções" className="w-full h-full object-cover bg-surface-2" />
                  )}
                </div>

                <div className="absolute -bottom-2 -left-1 z-20">
                  <button
                    type="button"
                    onClick={() => setEditDropdownOpen((prev) => !prev)}
                    className="px-2.5 py-1 bg-surface-1 hover:bg-surface-2 border border-surface-border text-text-primary text-xs font-semibold rounded-md shadow-md flex items-center gap-1.5 transition-all group"
                  >
                    <Pencil className="w-3.5 h-3.5 text-text-secondary group-hover:text-brand transition-colors" />
                    <span>Edit</span>
                  </button>

                  {editDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-44 bg-surface-1 border border-surface-border rounded-lg shadow-2xl p-1.5 z-50 animate-scale-in text-left">
                      <div className="absolute -top-1.5 left-4 w-3 h-3 bg-surface-1 border-t border-l border-surface-border rotate-45" />

                      <div className="relative z-10 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditDropdownOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-md text-left flex items-center gap-2 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-text-muted" />
                          <span>Carregar foto...</span>
                        </button>

                        {data.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditDropdownOpen(false);
                              handleRemoveAvatar();
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-md text-left flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Remover foto</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <h3 className="text-text-primary font-bold text-xl">{data.nomeEmpresa || 'Sua Empresa'}</h3>
              <p className="text-brand text-sm font-semibold mb-2">
                {data.cargo ? `${data.cargo} · ` : ''}{data.arrobaEmpresa ? (data.arrobaEmpresa.startsWith('@') ? data.arrobaEmpresa : `@${data.arrobaEmpresa}`) : '@usuario'}
              </p>
              <p className="text-text-muted text-xs leading-relaxed mb-5 line-clamp-3">
                {data.descricao || 'Adicione uma breve descrição sobre a sua empresa.'}
              </p>

              <div className="w-full space-y-2.5 text-left pt-4 border-t border-surface-border">
                {data.cargo && (
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <User className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{data.cargo}</span>
                  </div>
                )}
                {data.setorAtuacao && (
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Briefcase className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{data.setorAtuacao}</span>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{data.email}</span>
                  </div>
                )}
                {data.site && (
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Globe className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{data.site}</span>
                  </div>
                )}
                {data.endereco && (
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{data.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 space-y-4 md:space-y-5">
          <form onSubmit={handleSave} className="card p-5 md:p-7 space-y-5">
            <h3 className="text-text-primary font-bold text-base border-b border-surface-border pb-3">
              Informações da Organização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Nome da Empresa / Organização
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    name="nomeEmpresa"
                    value={data.nomeEmpresa}
                    onChange={handleChange}
                    placeholder="Eco Soluções Sustentáveis"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Identificador / @ da Empresa
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    name="arrobaEmpresa"
                    value={data.arrobaEmpresa}
                    onChange={handleChange}
                    placeholder="@ecosolucoes"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Nome do Responsável
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    name="cargo"
                    value={data.cargo}
                    onChange={handleChange}
                    placeholder="Carlos Mendes"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Setor Principal de Atuação
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    name="setorAtuacao"
                    value={data.setorAtuacao}
                    onChange={handleChange}
                    placeholder="Gestão Ambiental & Sustentabilidade"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  E-mail de Contato
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="contato@ecosolucoes.com.br"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={data.telefone}
                  onChange={handleChange}
                  placeholder="(11) 98765-4321"
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Endereço / Cidade
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    name="endereco"
                    value={data.endereco}
                    onChange={handleChange}
                    placeholder="Av. Paulista, 1000 - São Paulo, SP"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Website Corporativo
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="url"
                    name="site"
                    value={data.site}
                    onChange={handleChange}
                    placeholder="https://ecosolucoes.com.br"
                    className="input input-with-icon"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-text-secondary text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Sobre a Empresa
                </label>
                <textarea
                  name="descricao"
                  rows={4}
                  value={data.descricao}
                  onChange={handleChange}
                  placeholder="Descreva a missão e os principais objetivos da organização..."
                  className="input resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-surface-border">
              {saveSuccess ? (
                <span className="text-xs text-brand font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Dados salvos com sucesso!
                </span>
              ) : (
                <span />
              )}
              <button type="submit" className="btn-primary w-full sm:w-auto justify-center">
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </form>

          <div className="card p-5 md:p-6 space-y-4 border border-surface-border">
            <div>
              <h3 className="text-text-primary font-bold text-sm">Modo de Demonstração</h3>
              <p className="text-text-muted text-xs mt-1">
                Controle o preenchimento inicial dos dados didáticos do sistema (setores, demandas, mural e equipe de exemplo).
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setModalAction('limpar')}
                className="px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar dados de exemplo (Zerar)
              </button>

              <button
                type="button"
                onClick={() => setModalAction('restaurar')}
                className="px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/10 border border-brand/30 transition-colors inline-flex items-center gap-2"
              >
                <Leaf className="w-3.5 h-3.5" /> Restaurar dados de exemplo
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalAction !== null}
        title={modalAction === 'limpar' ? 'Limpar Dados de Exemplo?' : 'Restaurar Dados de Exemplo?'}
        message={
          modalAction === 'limpar'
            ? 'Isso removerá os dados de exemplo pré-carregados (setores, demandas, mural e colaboradores). O painel ficará zerado para preenchimento real.'
            : 'Isso carregará novamente as informações didáticas de demonstração em todos os módulos.'
        }
        confirmLabel={modalAction === 'limpar' ? 'Sim, Zerar Painel' : 'Sim, Restaurar'}
        onConfirm={() => {
          if (modalAction === 'limpar') limparDadosExemplo();
          else if (modalAction === 'restaurar') restaurarDadosExemplo();
          setModalAction(null);
        }}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
}
