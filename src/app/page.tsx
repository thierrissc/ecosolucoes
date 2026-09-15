'use client';

import {
  CheckCircle2,
  Clock,
  TrendingUp,
  CalendarClock,
  Users,
  ArrowUpRight,
  Zap,
  Briefcase,
  AlertCircle,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Flame,
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
  Area,
  AreaChart,
} from 'recharts';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { formatDate, getDaysUntil, prioridadeLabel } from '@/lib/utils';
import Badge, { prioridadeVariant } from '@/components/ui/Badge';

const COLORS = ['#16a34a', '#3b82f6', '#64748b'];
const BAR_COLORS = ['#16a34a', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const sparkData = Array.from({ length: 7 }, (_, i) => ({
  v: Math.floor(Math.random() * 20) + 10,
}));

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card p-3 text-sm">
        <p className="text-text-primary font-semibold mb-1">{label}</p>
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
  const { tarefasSemanais, setores, metasMensais } = useApp();

  const proximosPrazos = tarefasSemanais
    .filter((t) => t.status !== 'concluida')
    .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
    .slice(0, 5);

  const setorMaisAtivo = setores.length > 0
    ? [...setores].sort((a, b) => b.desempenho - a.desempenho)[0]
    : null;

  const concluidasCount = tarefasSemanais.filter((t) => t.status === 'concluida').length;
  const andamentoCount = tarefasSemanais.filter((t) => t.status === 'em_andamento').length;
  const naoIniciadaCount = tarefasSemanais.filter((t) => t.status === 'nao_iniciada').length;

  const pieData = [
    { name: 'Concluída', value: concluidasCount },
    { name: 'Em Andamento', value: andamentoCount },
    { name: 'Não Iniciada', value: naoIniciadaCount },
  ];

  const barData = setores.map((s) => ({
    name: s.nome.split(' ')[0],
    tarefas: tarefasSemanais.filter((t) => t.setorId === s.id).length || (s.demandasSemanais + s.demandasMensais),
  }));

  const totalTarefas = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const statCards = [
    {
      label: 'Projetos e Metas',
      value: String(metasMensais.length),
      change: `${metasMensais.filter((m) => m.progresso >= 100).length} concluídas`,
      icon: Briefcase,
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      label: 'Demandas Pendentes',
      value: String(tarefasSemanais.filter((t) => t.status !== 'concluida').length),
      change: `${proximosPrazos.length} prazos próximos`,
      icon: AlertCircle,
      gradient: 'from-amber-500 to-orange-400',
    },
    {
      label: 'Demandas Concluídas',
      value: String(concluidasCount),
      change: `de ${tarefasSemanais.length} totais`,
      icon: CheckCircle2,
      gradient: 'from-blue-500 to-indigo-400',
    },
    {
      label: 'Setores Ativos',
      value: String(setores.length),
      change: `${setores.reduce((a, s) => a + (s.colaboradores || 0), 0)} colaboradores`,
      icon: Users,
      gradient: 'from-violet-500 to-purple-400',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden gradient-mesh p-7 md:p-10">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white/90 text-xs font-medium backdrop-blur-sm">
                <Activity className="w-3 h-3" />
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1.5 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-md">
              Aqui está o resumo das atividades e desempenho de hoje.
            </p>
          </div>

          {setorMaisAtivo && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 border border-white/10">
              <div className="w-12 h-12 bg-white/15 flex items-center justify-center animate-float">
                <Flame className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Setor Destaque</p>
                <p className="text-white font-bold text-base">{setorMaisAtivo.nome}</p>
                <p className="text-emerald-300 text-sm font-semibold">{setorMaisAtivo.desempenho}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 animate-stagger">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card card-hover p-5 md:p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 border border-surface-border bg-surface-2/40 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="w-16 h-8 opacity-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <Area type="monotone" dataKey="v" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">{card.value}</h3>
                <p className="text-text-muted text-xs font-medium mt-0.5">{card.label}</p>
                <p className="text-text-muted text-[11px] mt-1 opacity-70">{card.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Charts Row (Bento Grid) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        {/* Bar Chart — spans 7/8 cols */}
        <div className="lg:col-span-7 xl:col-span-8 card p-5 md:p-7 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-text-primary font-bold text-base">Demandas por Setor</h3>
              <p className="text-text-muted text-xs mt-0.5">Volume acumulado de tarefas</p>
            </div>
            <div className="w-9 h-9 bg-surface-2 flex items-center justify-center text-text-muted">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '0px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  cursor={{ fill: 'var(--surface-hover)' }}
                />
                <Bar dataKey="tarefas" radius={[0, 0, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — spans 5/4 cols */}
        <div className="lg:col-span-5 xl:col-span-4 card p-5 md:p-7 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-text-primary font-bold text-base">Status das Tarefas</h3>
              <p className="text-text-muted text-xs mt-0.5">Visão geral do progresso</p>
            </div>
            <div className="w-9 h-9 bg-surface-2 flex items-center justify-center text-text-muted">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '0px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-3 pt-4 border-t border-surface-border">
            {pieData.map((item, idx) => {
              const pct = totalTarefas > 0 ? Math.round((item.value / totalTarefas) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-text-secondary text-xs font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary text-xs font-bold">{item.value}</span>
                    <span className="text-text-muted text-[11px] font-medium bg-surface-2 px-2 py-0.5">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
        {/* Próximos Prazos — Timeline */}
        <div className="card p-5 md:p-7 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-text-primary font-bold text-base flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-brand" />
              Próximos Prazos
            </h3>
            <span className="text-xs bg-brand/10 text-brand px-3 py-1 font-semibold">
              Esta semana
            </span>
          </div>

          <div className="space-y-1">
            {proximosPrazos.map((t, i) => {
              const days = getDaysUntil(t.prazo);
              return (
                <div key={t.id} className="flex items-center gap-4 py-3 px-3 hover:bg-surface-hover transition-colors group">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-3 h-3 border-2 ${
                      days <= 1 ? 'border-red-500 bg-red-500/30' :
                      days <= 3 ? 'border-amber-500 bg-amber-500/30' : 'border-blue-500 bg-blue-500/30'
                    }`} />
                    {i < proximosPrazos.length - 1 && (
                      <div className="w-px h-6 bg-surface-border" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate group-hover:text-brand transition-colors">{t.nome}</p>
                    <p className="text-text-muted text-xs mt-0.5">{t.responsavel} · {formatDate(t.prazo)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={prioridadeVariant(t.prioridade)} dot>
                      {prioridadeLabel(t.prioridade)}
                    </Badge>
                    <span className={`text-xs font-bold px-2 py-0.5 ${
                      days <= 1 ? 'bg-red-500/10 text-red-500' :
                      days <= 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {days <= 0 ? 'Hoje!' : `${days}d`}
                    </span>
                  </div>
                </div>
              );
            })}
            {proximosPrazos.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">Nenhuma demanda pendente no momento.</p>
            )}
          </div>
        </div>

        {/* Desempenho por Setor */}
        <div className="card p-5 md:p-7 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-text-primary font-bold text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              Desempenho por Setor
            </h3>
            <Link href="/setores" className="text-brand text-xs font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {setores.map((s) => (
              <div key={s.id} className="flex items-center gap-3.5 py-2 group">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: s.cor }}
                >
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5">
                    <p className="text-text-primary text-sm font-medium truncate group-hover:text-brand transition-colors">{s.nome}</p>
                    <p className="text-text-primary text-sm font-bold ml-2">{s.desempenho}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{ width: `${s.desempenho}%`, backgroundColor: s.cor }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {setores.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">Nenhum setor cadastrado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
