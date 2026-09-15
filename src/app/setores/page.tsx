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
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      <div>
        <h2 className="text-white font-extrabold text-2xl md:text-3xl tracking-tight">Gestão de Setores</h2>
        <p className="text-slate-400 text-sm mt-1">{setores.length} setores cadastrados no sistema</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Total Colaboradores', value: setores.reduce((a, s) => a + s.colaboradores, 0), color: 'text-blue-400' },
          { label: 'Demandas Semanais', value: setores.reduce((a, s) => a + s.demandasSemanais, 0), color: 'text-yellow-400' },
          { label: 'Demandas Mensais', value: setores.reduce((a, s) => a + s.demandasMensais, 0), color: 'text-purple-400' },
          { label: 'Desempenho Médio', value: `${Math.round(setores.reduce((a, s) => a + s.desempenho, 0) / setores.length)}%`, color: 'text-brand-green-light' },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-2xl p-6 md:p-7 border border-brand-navy-border text-center flex flex-col justify-center items-center">
            <p className={`text-3xl md:text-4xl font-extrabold ${item.color}`}>{item.value}</p>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-1.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Setor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {setores.map((setor) => {
          const Icon = iconMap[setor.icone] || Building2;
          const tarefasSetor = tarefasSemanais.filter((t) => t.setorId === setor.id);
          const concluidas = tarefasSetor.filter((t) => t.status === 'concluida').length;

          return (
            <div key={setor.id} className="glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border hover-lift group flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-md"
                    style={{ backgroundColor: setor.cor + '22' }}
                  >
                    <Icon className="w-7 h-7" style={{ color: setor.cor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg truncate">{setor.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: setor.cor }}>
                        {setor.avatar}
                      </div>
                      <p className="text-slate-400 text-xs font-medium truncate">{setor.responsavel}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Colaboradores', value: setor.colaboradores, color: 'text-blue-400' },
                    { label: 'Dem. Semanais', value: setor.demandasSemanais, color: 'text-yellow-400' },
                    { label: 'Dem. Mensais', value: setor.demandasMensais, color: 'text-purple-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-brand-navy/60 rounded-xl p-3 text-center border border-brand-navy-border/60">
                      <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                      <p className="text-slate-400 text-[11px] font-medium mt-0.5 truncate">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Performance */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-semibold">Desempenho Geral</span>
                    <span className="text-white text-xs font-extrabold">{setor.desempenho}%</span>
                  </div>
                  <div className="h-2 w-full bg-brand-navy-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${setor.desempenho}%`, backgroundColor: setor.cor }}
                    />
                  </div>
                </div>
              </div>

              {/* Tarefas da semana */}
              {tarefasSetor.length > 0 && (
                <div className="mt-6 pt-4 border-t border-brand-navy-border/60">
                  <p className="text-slate-400 text-xs mb-2">
                    Tarefas esta semana: <strong className="text-white font-bold">{concluidas}/{tarefasSetor.length}</strong> concluídas
                  </p>
                  <ProgressBar value={(concluidas / tarefasSetor.length) * 100} size="sm" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
