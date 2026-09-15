'use client';

import { useState } from 'react';
import { Building2, DollarSign, Users, TrendingUp, Megaphone, Monitor, Settings, Plus, X, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Megaphone,
  Monitor,
  Settings,
};

const CORES = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#64748b', // slate
];

export default function SetoresPage() {
  const { setores, addSetor, deleteSetor, tarefasSemanais } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [colaboradores, setColaboradores] = useState(1);
  const [cor, setCor] = useState(CORES[0]);
  const [icone, setIcone] = useState('Building2');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !responsavel.trim()) return;

    const avatar = responsavel
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    addSetor({
      nome,
      responsavel,
      avatar: avatar || 'US',
      colaboradores: Number(colaboradores) || 1,
      cor,
      icone,
    });

    setNome('');
    setResponsavel('');
    setColaboradores(1);
    setShowModal(false);
  };

  const totalColaboradores = setores.reduce((a, s) => a + (s.colaboradores || 0), 0);
  const totalSemanais = setores.reduce((a, s) => a + (s.demandasSemanais || 0), 0);
  const totalMensais = setores.reduce((a, s) => a + (s.demandasMensais || 0), 0);
  const mediaDesempenho = setores.length > 0
    ? Math.round(setores.reduce((a, s) => a + (s.desempenho || 0), 0) / setores.length)
    : 100;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Gestão de Setores</h2>
          <p className="text-text-muted text-sm mt-1">{setores.length} setores cadastrados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Setor
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 animate-stagger">
        {[
          { label: 'Colaboradores', value: totalColaboradores, color: 'from-blue-500 to-indigo-400' },
          { label: 'Demandas Semanais', value: totalSemanais, color: 'from-amber-500 to-yellow-400' },
          { label: 'Demandas Mensais', value: totalMensais, color: 'from-violet-500 to-purple-400' },
          { label: 'Desempenho Médio', value: `${mediaDesempenho}%`, color: 'from-emerald-500 to-teal-400' },
        ].map((item) => (
          <div key={item.label} className="card p-5 md:p-6 text-center">
            <div className={`w-10 h-10 bg-gradient-to-br ${item.color} mx-auto mb-3 flex items-center justify-center shadow-lg`}>
              <span className="text-white text-sm font-bold">#</span>
            </div>
            <p className="text-text-primary text-3xl md:text-4xl font-extrabold">{item.value}</p>
            <p className="text-text-muted text-xs font-medium mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {setores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-stagger">
          {setores.map((setor) => {
            const Icon = iconMap[setor.icone] || Building2;
            const tarefasSetor = tarefasSemanais.filter((t) => t.setorId === setor.id);
            const concluidas = tarefasSetor.filter((t) => t.status === 'concluida').length;

            return (
              <div key={setor.id} className="card card-hover overflow-hidden flex flex-col relative group">
                {/* Header with gradient */}
                <div
                  className="h-2 w-full"
                  style={{ background: `linear-gradient(90deg, ${setor.cor}, ${setor.cor}88)` }}
                />

                <div className="p-5 md:p-6 flex flex-col flex-1">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3.5 mb-5">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
                        style={{ backgroundColor: setor.cor + '18' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: setor.cor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-bold text-base truncate">{setor.nome}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-offset-1 ring-offset-surface-1"
                            style={{ backgroundColor: setor.cor }}
                          >
                            {setor.avatar}
                          </div>
                          <p className="text-text-muted text-xs truncate">{setor.responsavel}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteSetor(setor.id)}
                      title="Excluir setor"
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 p-1.5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                      { label: 'Equipe', value: setor.colaboradores, color: 'text-blue-500' },
                      { label: 'Semanais', value: tarefasSetor.length || setor.demandasSemanais, color: 'text-amber-500' },
                      { label: 'Mensais', value: setor.demandasMensais, color: 'text-violet-500' },
                    ].map((s) => (
                      <div key={s.label} className="bg-surface-2 p-2.5 text-center">
                        <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-text-muted text-[10px] font-medium mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Performance */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs font-medium">Desempenho</span>
                      <span className="text-text-primary text-xs font-extrabold">{setor.desempenho}%</span>
                    </div>
                    <ProgressBar value={setor.desempenho} size="sm" color={setor.cor} />
                  </div>

                  {/* Weekly tasks */}
                  {tarefasSetor.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-surface-border">
                      <p className="text-text-muted text-xs">
                        Tarefas: <strong className="text-text-primary font-bold">{concluidas}/{tarefasSetor.length}</strong> concluídas
                      </p>
                      <ProgressBar value={(concluidas / tarefasSetor.length) * 100} size="sm" className="mt-1.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-text-primary font-bold text-lg mb-1">Nenhum setor cadastrado</h3>
          <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">
            Cadastre os setores da sua empresa para organizar suas demandas, metas e equipes.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Setor
          </button>
        </div>
      )}

      {/* Modal Novo Setor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="card p-6 md:p-7 w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-text-primary font-bold text-lg">Novo Setor</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Nome do Setor *</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                  placeholder="Ex: Comercial, Financeiro, Operações..."
                />
              </div>

              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Responsável pelo Setor *</label>
                <input
                  required
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="input"
                  placeholder="Ex: Maria Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Colaboradores</label>
                  <input
                    type="number"
                    min={1}
                    value={colaboradores}
                    onChange={(e) => setColaboradores(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium block mb-1.5">Ícone</label>
                  <select value={icone} onChange={(e) => setIcone(e.target.value)} className="input input-select">
                    <option value="Building2">Empresa / Predial</option>
                    <option value="DollarSign">Financeiro</option>
                    <option value="Users">Pessoas / RH</option>
                    <option value="TrendingUp">Vendas / Comercial</option>
                    <option value="Megaphone">Marketing</option>
                    <option value="Monitor">Tecnologia / TI</option>
                    <option value="Settings">Operações / Suporte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Cor Temática</label>
                <div className="flex gap-2 flex-wrap pt-1">
                  {CORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCor(c)}
                      className={`w-7 h-7 transition-all ${cor === c ? 'ring-2 ring-offset-2 ring-offset-surface-1 scale-110' : 'opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Cadastrar Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
