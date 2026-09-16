'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Save, Building, Mail, MapPin, Globe, AtSign, Briefcase, CheckCircle2, Leaf, LogOut, Trash2, User, X, Pencil, Upload } from 'lucide-react';
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
  const { user, isAuthenticated, logout, checkAuth, limparDadosExemplo, restaurarDadosExemplo } = useApp();
  const [data, setData] = useState<PerfilData>(DEFAULT_DATA);
  const [isClient, setIsClient] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalAction, setModalAction] = useState<'limpar' | 'restaurar' | null>(null);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    setIsClient(true);
    const saved = localStorage.getItem('@eco-solucoes:perfil');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({
          ...DEFAULT_DATA,
          ...parsed,
          nomeEmpresa: parsed.nomeEmpresa || user?.companyName || '',
          cargo: parsed.cargo || user?.name || '',
          email: parsed.email || user?.email || '',
          avatarUrl: parsed.avatarUrl !== undefined ? parsed.avatarUrl : (user?.avatar || ''),
        });
      } catch (e) {
        console.error('Failed to parse saved profile data');
      }
    } else if (user) {
      setData((prev) => ({
        ...prev,
        nomeEmpresa: user.companyName || '',
        cargo: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatar || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const syncWithServer = async (updated: PerfilData) => {
    if (isAuthenticated) {
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: updated.nomeEmpresa,
            name: updated.cargo || user?.name,
            avatar: updated.avatarUrl,
          }),
        });
        await checkAuth();
      } catch (err) {
        console.error('Erro ao sincronizar perfil:', err);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const updated = { ...data, avatarUrl: '' };
    setData(updated);
    localStorage.setItem('@eco-solucoes:perfil', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('perfilUpdated', { detail: updated }));
    await syncWithServer(updated);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Perfil da Empresa</h2>
          <p className="text-text-muted text-sm mt-1">Gerencie as informações corporativas.</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        {/* Profile Card */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 md:space-y-5">
          <div className="card overflow-hidden">
            {/* Cover gradient */}
            <div className="h-28 gradient-mesh relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-1/80" />
            </div>

            <div className="px-6 pb-6 -mt-14 relative flex flex-col items-center text-center">
              {/* Avatar quadrado com botão Edit dropdown */}
              <div className="relative mb-5" ref={dropdownRef}>
                <div className="w-28 h-28 border-4 border-surface-1 overflow-hidden bg-surface-2 flex items-center justify-center shadow-lg relative">
                  {data.avatarUrl ? (
                    <img src={data.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/icon.png" alt="Eco Soluções" className="w-full h-full object-cover bg-surface-2" />
                  )}
                </div>

                {/* Botão [ Edit ] ancorado no canto inferior esquerdo */}
                <div className="absolute -bottom-2 -left-1 z-20">
                  <button
                    type="button"
                    onClick={() => setEditDropdownOpen((prev) => !prev)}
                    className="px-2.5 py-1 bg-surface-1 hover:bg-surface-2 border border-surface-border text-text-primary text-xs font-semibold rounded-md shadow-md flex items-center gap-1.5 transition-all group"
                  >
                    <Pencil className="w-3.5 h-3.5 text-text-secondary group-hover:text-brand transition-colors" />
                    <span>Edit</span>
                  </button>

                  {/* Dropdown ancorado com seta */}
                  {editDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-44 bg-surface-1 border border-surface-border rounded-lg shadow-2xl p-1.5 z-50 animate-scale-in text-left">
                      {/* Triângulo / Seta indicativa */}
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

        {/* Form */}
        <div className="lg:col-span-7 xl:col-span-8 card p-5 md:p-7">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-text-primary font-semibold text-base mb-4 pb-2 border-b border-surface-border">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Nome da Empresa</label>
                  <input name="nomeEmpresa" value={data.nomeEmpresa} onChange={handleChange} placeholder="Ex: Eco Soluções LTDA" className="input" />
                </div>
                <div>
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Username / @</label>
                  <input name="arrobaEmpresa" value={data.arrobaEmpresa} onChange={handleChange} placeholder="Ex: @ecosolucoes" className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Seu Nome / Cargo do Responsável</label>
                  <input name="cargo" value={data.cargo} onChange={handleChange} placeholder="Ex: Diretor Geral / Tonga" className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Breve Descrição</label>
                  <textarea name="descricao" value={data.descricao} onChange={handleChange} rows={3} placeholder="Conte-nos sobre a empresa..." className="input resize-none" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-text-primary font-semibold text-base mb-4 pb-2 border-b border-surface-border">Contato & Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted font-medium text-xs block mb-1.5">E-mail Corporativo</label>
                  <input type="email" name="email" value={data.email} onChange={handleChange} placeholder="contato@empresa.com" className="input" />
                </div>
                <div>
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Setor de Atuação</label>
                  <input name="setorAtuacao" value={data.setorAtuacao} onChange={handleChange} placeholder="Ex: Tecnologia Sustentável" className="input" />
                </div>
                <div>
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Website</label>
                  <input name="site" value={data.site} onChange={handleChange} placeholder="https://www.empresa.com.br" className="input" />
                </div>
                <div>
                  <label className="text-text-muted font-medium text-xs block mb-1.5">Sede / Endereço</label>
                  <input name="endereco" value={data.endereco} onChange={handleChange} placeholder="São Paulo, SP" className="input" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-surface-border">
              {saveSuccess && (
                <span className="text-brand text-sm font-medium animate-fade-up flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
                </span>
              )}
              <button type="submit" className="btn-primary">
                <Save className="w-4 h-4" /> Salvar Perfil
              </button>
            </div>
          </form>

          {/* Gerenciamento de Dados do Sistema */}
          <div className="mt-8 pt-6 border-t border-surface-border">
            <h3 className="text-text-primary font-semibold text-base mb-2">Dados do Sistema</h3>
            <p className="text-text-muted text-xs mb-4">
              Você pode zerar os dados de exemplo para que os colaboradores da sua empresa comecem a preencher tudo do zero, ou restaurar os dados de demonstração a qualquer momento.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setModalAction('restaurar')}
                className="px-4 py-2.5 text-xs font-semibold bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30 transition-all flex items-center gap-2"
              >
                <Leaf className="w-4 h-4" /> Iniciar Demonstração (Dados Fictícios)
              </button>
              <button
                type="button"
                onClick={() => setModalAction('limpar')}
                className="px-4 py-2.5 text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-2"
              >
                Voltar ao Site Zerado (Limpar Tudo)
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalAction === 'limpar'}
        title="Voltar ao Site Zerado"
        message="Deseja limpar todos os dados do sistema e deixar a plataforma completamente zerada para uso real da sua empresa?"
        confirmLabel="Zerar Plataforma"
        onConfirm={() => {
          limparDadosExemplo();
          setModalAction(null);
        }}
        onCancel={() => setModalAction(null)}
      />

      <ConfirmModal
        isOpen={modalAction === 'restaurar'}
        title="Iniciar Demonstração"
        message="Deseja carregar dados fictícios para teste? Tarefas, metas, setores e eventos de exemplo serão adicionados para visualização das funcionalidades."
        confirmLabel="Iniciar Demonstração"
        onConfirm={() => {
          restaurarDadosExemplo();
          setModalAction(null);
        }}
        onCancel={() => setModalAction(null)}
      />

    </div>
  );
}
