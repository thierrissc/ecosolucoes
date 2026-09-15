'use client';

import { useState, useEffect } from 'react';
import { Camera, Save, Building, Mail, MapPin, Globe, AtSign, Briefcase, CheckCircle2, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface PerfilData {
  nomeEmpresa: string;
  arrobaEmpresa: string;
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
  email: '',
  telefone: '',
  endereco: '',
  site: '',
  descricao: '',
  setorAtuacao: '',
  avatarUrl: '',
};

export default function PerfilPage() {
  const { limparDadosExemplo, restaurarDadosExemplo } = useApp();
  const [data, setData] = useState<PerfilData>(DEFAULT_DATA);
  const [isClient, setIsClient] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalAction, setModalAction] = useState<'limpar' | 'restaurar' | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('@eco-solucoes:perfil');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved profile data');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('@eco-solucoes:perfil', JSON.stringify(data));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up w-full">
      <div>
        <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Perfil da Empresa</h2>
        <p className="text-text-muted text-sm mt-1">Gerencie as informações corporativas.</p>
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
              {/* Avatar */}
              <div className="relative group mb-4">
                <div className="w-28 h-28 border-4 border-surface-1 overflow-hidden bg-surface-2 flex items-center justify-center shadow-lg">
                  {data.avatarUrl ? (
                    <img src={data.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-white" />
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center backdrop-blur-sm">
                    <Camera className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-[11px] font-medium">Alterar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              <h3 className="text-text-primary font-bold text-xl">{data.nomeEmpresa || 'Sua Empresa'}</h3>
              <p className="text-brand text-sm font-semibold mb-2">
                {data.arrobaEmpresa ? (data.arrobaEmpresa.startsWith('@') ? data.arrobaEmpresa : `@${data.arrobaEmpresa}`) : '@usuario'}
              </p>
              <p className="text-text-muted text-xs leading-relaxed mb-5 line-clamp-3">
                {data.descricao || 'Adicione uma breve descrição sobre a sua empresa.'}
              </p>

              <div className="w-full space-y-2.5 text-left pt-4 border-t border-surface-border">
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
                onClick={() => setModalAction('limpar')}
                className="px-4 py-2 text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all"
              >
                Limpar dados de exemplo (Começar do Zero)
              </button>
              <button
                type="button"
                onClick={() => setModalAction('restaurar')}
                className="btn-ghost text-xs"
              >
                Restaurar dados de demonstração
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalAction === 'limpar'}
        title="Limpar Dados de Exemplo"
        message="Deseja limpar todos os dados de exemplo? O sistema ficará limpo e pronto para o cadastro das informações reais da sua empresa."
        confirmLabel="Limpar Todos os Dados"
        onConfirm={() => {
          limparDadosExemplo();
          setModalAction(null);
        }}
        onCancel={() => setModalAction(null)}
      />

      <ConfirmModal
        isOpen={modalAction === 'restaurar'}
        title="Restaurar Dados de Demonstração"
        message="Deseja restaurar o conjunto de dados demonstrativos do sistema?"
        confirmLabel="Restaurar Dados"
        onConfirm={() => {
          restaurarDadosExemplo();
          setModalAction(null);
        }}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
}
