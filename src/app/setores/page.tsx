'use client';

import { Building2, DollarSign, Users, TrendingUp, Megaphone, Monitor, Settings } from 'lucide-react';
import { setores } from '@/data/setores';
import { tarefasSemanais } from '@/data/demandas';
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

export default function SetoresPage() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      <div>
        <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Gestão de Setores</h2>
        <p className="text-text-muted text-sm mt-1">{setores.length} setores cadastrados</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 animate-stagger">
        {[
          { label: 'Colaboradores', value: setores.reduce((a, s) => a + s.colaboradores, 0), color: 'from-blue-500 to-indigo-400' },
          { label: 'Demandas Semanais', value: setores.reduce((a, s) => a + s.demandasSemanais, 0), color: 'from-amber-500 to-yellow-400' },
          { label: 'Demandas Mensais', value: setores.reduce((a, s) => a + s.demandasMensais, 0), color: 'from-violet-500 to-purple-400' },
          { label: 'Desempenho Médio', value: `${Math.round(setores.reduce((a, s) => a + s.desempenho, 0) / setores.length)}%`, color: 'from-emerald-500 to-teal-400' },
        ].map((item) => (
          <div key={item.label} className="card p-5 md:p-6 text-center">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color} mx-auto mb-3 flex items-center justify-center shadow-lg`}>
              <span className="text-white text-sm font-bold">#</span>
            </div>
            <p className="text-text-primary text-3xl md:text-4xl font-extrabold">{item.value}</p>
            <p className="text-text-muted text-xs font-medium mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-stagger">
        {setores.map((setor) => {
          const Icon = iconMap[setor.icone] || Building2;
          const tarefasSetor = tarefasSemanais.filter((t) => t.setorId === setor.id);
          const concluidas = tarefasSetor.filter((t) => t.status === 'concluida').length;

          return (
            <div key={setor.id} className="card card-hover overflow-hidden flex flex-col">
              {/* Header with gradient */}
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${setor.cor}, ${setor.cor}88)` }}
              />

              <div className="p-5 md:p-6 flex flex-col flex-1">
                {/* Top */}
                <div className="flex items-start gap-3.5 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
                    style={{ backgroundColor: setor.cor + '18' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: setor.cor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-bold text-base truncate">{setor.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-offset-1 ring-offset-surface-1"
                        style={{ backgroundColor: setor.cor }}
                      >
                        {setor.avatar}
                      </div>
                      <p className="text-text-muted text-xs truncate">{setor.responsavel}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'Equipe', value: setor.colaboradores, color: 'text-blue-500' },
                    { label: 'Semanais', value: setor.demandasSemanais, color: 'text-amber-500' },
                    { label: 'Mensais', value: setor.demandasMensais, color: 'text-violet-500' },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface-2 rounded-xl p-2.5 text-center">
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
    </div>
  );
}
