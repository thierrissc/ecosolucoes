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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="glass-card rounded-lg p-6 border border-brand-navy-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Bem-vindo de volta 👋
            </h2>
            <p className="text-slate-400">
              Aqui está o resumo das atividades de hoje.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Setor destaque</p>
              <p className="text-white font-bold">{setorMaisAtivo.nome}</p>
              <p className="text-brand-green-light text-sm font-semibold">{setorMaisAtivo.desempenho}% desempenho</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-brand-green-light" />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-card rounded-lg p-5 border hover-lift cursor-default ${card.bg}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="xl:col-span-2 glass-card rounded-lg p-6 border border-brand-navy-border flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 className="text-white font-semibold">Demandas por Setor</h3>
              <p className="text-slate-400 text-xs mt-1">Volume de tarefas nos principais setores</p>
            </div>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="tarefas" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-lg p-6 border border-brand-navy-border flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 className="text-white font-semibold">Status das Tarefas</h3>
              <p className="text-slate-400 text-xs mt-1">Visão geral do progresso</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Próximos Prazos */}
        <div className="glass-card rounded-lg p-6 border border-brand-navy-border flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-brand-green-light" />
              Próximos Prazos
            </h3>
            <span className="text-xs bg-brand-green/20 text-brand-green-light px-2 py-1 rounded-full font-medium">
              Esta semana
            </span>
          </div>
          <div className="space-y-3">
            {proximosPrazos.map((t) => {
              const days = getDaysUntil(t.prazo);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    days <= 1 ? 'bg-red-500/20 text-red-400' :
                    days <= 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {days <= 0 ? '!' : days}d
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{t.nome}</p>
                    <p className="text-slate-400 text-xs">{t.responsavel} · {formatDate(t.prazo)}</p>
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
        <div className="glass-card rounded-lg p-6 border border-brand-navy-border flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-green-light" />
              Desempenho por Setor
            </h3>
            <Link href="/setores" className="text-brand-green-light text-xs hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {setores.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ backgroundColor: s.cor + '33', color: s.cor }}
                >
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <p className="text-white text-xs font-medium truncate">{s.nome}</p>
                    <p className="text-white text-xs font-bold ml-2">{s.desempenho}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-brand-navy-border rounded-full overflow-hidden">
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
