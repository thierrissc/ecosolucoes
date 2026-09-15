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

const pieData = [
  { name: 'Concluída', value: tarefasSemanais.filter((t) => t.status === 'concluida').length, color: '#16a34a' },
  { name: 'Em Andamento', value: tarefasSemanais.filter((t) => t.status === 'em_andamento').length, color: '#3b82f6' },
  { name: 'Não Iniciada', value: tarefasSemanais.filter((t) => t.status === 'nao_iniciada').length, color: '#475569' },
];

const barData = setores.map((s) => ({
  setor: s.nome.split(' ')[0],
  Semanais: s.demandasSemanais,
  Mensais: s.demandasMensais,
}));

const statCards = [
  {
    label: 'Tarefas Pendentes',
    value: tarefasSemanais.filter((t) => t.status !== 'concluida').length,
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    iconBg: 'bg-yellow-500/20',
    change: '+3 esta semana',
    changeType: 'neutral',
  },
  {
    label: 'Tarefas Concluídas',
    value: tarefasSemanais.filter((t) => t.status === 'concluida').length,
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    iconBg: 'bg-green-500/20',
    change: '+2 hoje',
    changeType: 'positive',
  },
  {
    label: 'Avisos no Mural',
    value: publicacoes.length,
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    iconBg: 'bg-orange-500/20',
    change: '2 urgentes',
    changeType: 'negative',
  },
  {
    label: 'Total Colaboradores',
    value: setores.reduce((acc, s) => acc + s.colaboradores, 0),
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    change: '7 setores ativos',
    changeType: 'neutral',
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
      <div className="glass-card rounded-2xl p-6 border border-brand-navy-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Bem-vindo de volta 👋</p>
            <h2 className="text-white text-2xl font-bold">Painel de Controle</h2>
            <p className="text-slate-400 text-sm mt-1">
              Você tem{' '}
              <span className="text-brand-green-light font-semibold">
                {tarefasSemanais.filter((t) => t.status !== 'concluida').length} tarefas pendentes
              </span>{' '}
              e{' '}
              <span className="text-orange-400 font-semibold">
                {publicacoes.filter((p) => p.prioridade === 'alta').length} avisos urgentes
              </span>{' '}
              esta semana.
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
              className={`glass-card rounded-2xl p-5 border hover-lift cursor-default ${card.bg}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ArrowUpRight className={`w-4 h-4 ${card.color} opacity-60`} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
              <p className="text-slate-400 text-sm">{card.label}</p>
              <p className={`text-xs mt-2 font-medium ${
                card.changeType === 'positive' ? 'text-green-400' :
                card.changeType === 'negative' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-6 border border-brand-navy-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Demandas por Setor</h3>
              <p className="text-slate-400 text-sm">Semanais e Mensais</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-green-light" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="setor" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Semanais" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Mensais" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-6 border border-brand-navy-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Status das Tarefas</h3>
              <p className="text-slate-400 text-sm">Distribuição atual</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Próximos Prazos */}
        <div className="glass-card rounded-2xl p-6 border border-brand-navy-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-brand-green-light" />
              Próximos Prazos
            </h3>
            <Link href="/demandas/semanais" className="text-brand-green-light text-xs hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {proximosPrazos.map((t) => {
              const days = getDaysUntil(t.prazo);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-brand-navy/50 border border-brand-navy-border/50">
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
        <div className="glass-card rounded-2xl p-6 border border-brand-navy-border">
          <div className="flex items-center justify-between mb-4">
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
