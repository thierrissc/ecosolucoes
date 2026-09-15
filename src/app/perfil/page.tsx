'use client';

import { useState, useEffect } from 'react';
import { Camera, Save, Building, Mail, MapPin, Globe, AtSign, Briefcase, CheckCircle2 } from 'lucide-react';

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
  const [data, setData] = useState<PerfilData>(DEFAULT_DATA);
  const [isClient, setIsClient] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-white font-bold text-xl">Perfil da Empresa</h2>
        <p className="text-slate-400 text-sm">Gerencie as informações corporativas que aparecerão na plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-brand-navy-border flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-brand-navy-border overflow-hidden bg-brand-navy-light flex items-center justify-center relative">
                {data.avatarUrl ? (
                  <img src={data.avatarUrl} alt="Logo da Empresa" className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-10 h-10 text-slate-500" />
                )}
                
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-xs font-medium">Alterar Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <h3 className="text-white font-bold text-lg">{data.nomeEmpresa || 'Sua Empresa'}</h3>
            <p className="text-brand-green-light text-sm font-medium mb-1">
              {data.arrobaEmpresa ? (data.arrobaEmpresa.startsWith('@') ? data.arrobaEmpresa : `@${data.arrobaEmpresa}`) : '@usuario'}
            </p>
            <p className="text-slate-400 text-xs mb-4 line-clamp-3">
              {data.descricao || 'Adicione uma breve descrição sobre a sua empresa aqui.'}
            </p>

            <div className="w-full space-y-2 text-left pt-4 border-t border-brand-navy-border">
              {data.setorAtuacao && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{data.setorAtuacao}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{data.email}</span>
                </div>
              )}
              {data.site && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{data.site}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-brand-navy-border">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-4 border-b border-brand-navy-border pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 font-medium text-xs block mb-1">Nome da Empresa</label>
                  <input
                    name="nomeEmpresa"
                    value={data.nomeEmpresa}
                    onChange={handleChange}
                    placeholder="Ex: Eco Soluções LTDA"
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium text-xs block mb-1">Username / @</label>
                  <input
                    name="arrobaEmpresa"
                    value={data.arrobaEmpresa}
                    onChange={handleChange}
                    placeholder="Ex: @ecosolucoes"
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-500 font-medium text-xs block mb-1">Breve Descrição</label>
                  <textarea
                    name="descricao"
                    value={data.descricao}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Conte-nos um pouco sobre a empresa..."
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 border-b border-brand-navy-border pb-2">Contato & Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 font-medium text-xs block mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com"
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium text-xs block mb-1">Setor de Atuação</label>
                  <input
                    name="setorAtuacao"
                    value={data.setorAtuacao}
                    onChange={handleChange}
                    placeholder="Ex: Tecnologia Sustentável"
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium text-xs block mb-1">Website</label>
                  <input
                    name="site"
                    value={data.site}
                    onChange={handleChange}
                    placeholder="https://www.empresa.com.br"
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium text-xs block mb-1">Sede / Endereço</label>
                  <input
                    name="endereco"
                    value={data.endereco}
                    onChange={handleChange}
                    placeholder="São Paulo, SP"
                    className="w-full bg-brand-navy-light border border-brand-navy-border rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              {saveSuccess && (
                <span className="text-brand-green-light text-sm font-medium animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
                </span>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 px-6 py-2 rounded-md font-medium text-sm transition-all shadow-sm"
              >
                <Save className="w-4 h-4" /> Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
