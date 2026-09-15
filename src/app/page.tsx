'use client';

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  Users,
  ArrowUpRight,
  Zap,
  Briefcase,
  AlertCircle,
  BarChart2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Link from 'next/link';
import { tarefasSemanais } from '@/data/demandas';
import { setores } from '@/data/setores';
import { publicacoes } from '@/data/mural';
import { formatDate, getDaysUntil, prioridadeLabel } from '@/lib/utils';
import Badge, { prioridadeVariant } from '@/components/ui/Badge';

const COLORS = ['#16a34a', '#3b82f6', '#475569'];
const BAR_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

const pieData = [
  { name: 'Concluída', value: tarefasSemanais.filter((t) => t.status === 'concluida').length },
  { name: 'Em Andamento', value: tarefasSemanais.filter((t) => t.status === 'em_andamento').length },
  { name: 'Não Iniciada', value: tarefasSemanais.filter((t) => t.status === 'nao_iniciada').length },
];

const barData = setores.map((s) => ({
  name: s.nome.split(' ')[0],
  tarefas: s.demandasSemanais + s.demandasMensais,
}));

const statCards = [
  {
    label: 'Projetos Ativos',
    value: '12',
    icon: Briefcase,
    iconBg: 'bg-green-500/20 text-green-500',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    label: 'Pendências',
    value: '5',
    icon: AlertCircle,
    iconBg: 'bg-orange-500/20 text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    label: 'Tarefas Hoje',
    value: '24',
    icon: CheckCircle2,
    iconBg: 'bg-blue-500/20 text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    label: 'Equipe Online',
    value: '8',
    icon: Users,
    iconBg: 'bg-purple-500/20 text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-sm">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const proximosPrazos = tarefasSemanais
    .filter((t) => t.status !== 'concluida')
    .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
    .slice(0, 5);

  const setorMaisAtivo = [...setores].sort((a, b) => b.desempenho - a.desempenho)[0];
  const totalTarefas = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Welcome banner */}
      <div className="glass-card rounded-2xl p-7 md:p-9 lg:p-10 border border-brand-navy-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Bem-vindo de volta 👋
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Aqui está o resumo das atividades e desempenho de hoje.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-brand-navy/60 p-4 rounded-xl border border-brand-navy-border/60">
            <div className="text-right">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Setor Destaque</p>
              <p className="text-white font-bold text-base">{setorMaisAtivo.nome}</p>
              <p className="text-brand-green-light text-sm font-semibold">{setorMaisAtivo.desempenho}% de desempenho</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center flex-shrink-0 border border-brand-green/30">
              <Zap className="w-6 h-6 text-brand-green-light" />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-card rounded-2xl p-6 md:p-7 border hover-lift cursor-default flex flex-col justify-between ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-semibold tracking-wide">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        {/* Bar Chart */}
        <div className="lg:col-span-7 xl:col-span-8 glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg">Demandas por Setor</h3>
              <p className="text-slate-400 text-xs mt-1">Volume acumulado de tarefas nos principais setores</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-navy-light flex items-center justify-center text-slate-400 border border-brand-navy-border">
              <BarChart2 className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="tarefas" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-5 xl:col-span-4 glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg">Status das Tarefas</h3>
              <p className="text-slate-400 text-xs mt-1">Visão geral do progresso global</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-navy-light flex items-center justify-center text-slate-400 border border-brand-navy-border">
              <PieChartIcon className="w-5 h-5 text-slate-300" />
            </div>
          </div>

          <div className="flex-1 min-h-[220px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Legend */}
          <div className="grid grid-cols-1 gap-2.5 mt-4 pt-4 border-t border-brand-navy-border/60">
            {pieData.map((item, idx) => {
              const pct = totalTarefas > 0 ? Math.round((item.value / totalTarefas) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-brand-navy/50 border border-brand-navy-border/50">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-300 text-xs font-semibold">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-bold">{item.value}</span>
                    <span className="text-slate-400 text-[11px] font-semibold bg-white/5 px-2 py-0.5 rounded-md">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* Próximos Prazos */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h3 className="text-white font-bold text-lg flex items-center gap-2.5">
              <CalendarClock className="w-5 h-5 text-brand-green-light" />
              Próximos Prazos
            </h3>
            <span className="text-xs bg-brand-green/20 text-brand-green-light px-3 py-1 rounded-lg font-semibold whitespace-nowrap flex-shrink-0 border border-brand-green/30">
              Esta semana
            </span>
          </div>
          <div className="space-y-3.5">
            {proximosPrazos.map((t) => {
              const days = getDaysUntil(t.prazo);
              return (
                <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-brand-navy/40 border border-brand-navy-border/40 hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-extrabold ${
                    days <= 1 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    days <= 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {days <= 0 ? '!' : `${days}d`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{t.nome}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{t.responsavel} · {formatDate(t.prazo)}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <Badge variant={prioridadeVariant(t.prioridade)} dot>
                      {prioridadeLabel(t.prioridade)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicadores por Setor */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h3 className="text-white font-bold text-lg flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-brand-green-light" />
              Desempenho por Setor
            </h3>
            <Link href="/setores" className="text-brand-green-light text-xs font-bold hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {setores.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-brand-navy/40 border border-brand-navy-border/40">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: s.cor + '33', color: s.cor }}
                >
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5">
                    <p className="text-white text-xs font-semibold truncate">{s.nome}</p>
                    <p className="text-white text-xs font-extrabold ml-2">{s.desempenho}%</p>
                  </div>
                  <div className="h-2 w-full bg-brand-navy-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.desempenho}%`, backgroundColor: s.cor }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
