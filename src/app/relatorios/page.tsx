'use client';

import { Download, Trophy, TrendingUp, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { setores } from '@/data/setores';
import { tarefasSemanais, metasMensais } from '@/data/demandas';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

const barData = setores.map((s, i) => ({
  setor: s.nome.split(' ')[0],
  Concluídas: tarefasSemanais.filter((t) => t.setorId === s.id && t.status === 'concluida').length,
  Pendentes: tarefasSemanais.filter((t) => t.setorId === s.id && t.status !== 'concluida').length,
  fill: COLORS[i],
}));

const lineData = [
  { mes: 'Mar', Concluídas: 18, Pendentes: 12 },
  { mes: 'Abr', Concluídas: 24, Pendentes: 9 },
  { mes: 'Mai', Concluídas: 21, Pendentes: 15 },
  { mes: 'Jun', Concluídas: 30, Pendentes: 8 },
  { mes: 'Jul', Concluídas: 28, Pendentes: 11 },
  { mes: 'Ago', Concluídas: 35, Pendentes: 7 },
  { mes: 'Set', Concluídas: tarefasSemanais.filter((t) => t.status === 'concluida').length, Pendentes: tarefasSemanais.filter((t) => t.status !== 'concluida').length },
];

const pieData = [
  { name: 'Concluída', value: tarefasSemanais.filter((t) => t.status === 'concluida').length, color: '#16a34a' },
  { name: 'Em Andamento', value: tarefasSemanais.filter((t) => t.status === 'em_andamento').length, color: '#3b82f6' },
  { name: 'Não Iniciada', value: tarefasSemanais.filter((t) => t.status === 'nao_iniciada').length, color: '#475569' },
];

const setorMaisAtivo = [...setores].sort((a, b) => b.desempenho - a.desempenho)[0];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-sm border border-brand-navy-border">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

function handleExport() {
  window.print();
}

export default function RelatoriosPage() {
  const totalConcluidas = tarefasSemanais.filter((t) => t.status === 'concluida').length;
  const totalPendentes = tarefasSemanais.filter((t) => t.status !== 'concluida').length;
  const mediaProgresso = Math.round(metasMensais.reduce((a, m) => a + m.progresso, 0) / metasMensais.length);

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-white font-extrabold text-2xl md:text-3xl tracking-tight">Relatórios de Desempenho</h2>
          <p className="text-slate-400 text-sm mt-1">Análise consolidada e métricas de todos os setores</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-brand-navy-light border border-brand-navy-border hover:border-brand-green/40 text-slate-300 hover:text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all"
        >
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Concluídas', value: totalConcluidas, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Pendentes', value: totalPendentes, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Progresso Médio', value: `${mediaProgresso}%`, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Setor Destaque', value: setorMaisAtivo.nome.split(' ')[0], icon: Trophy, color: 'text-brand-green-light', bg: 'bg-brand-green/10 border-brand-green/20' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`glass-card rounded-2xl p-6 md:p-7 border ${item.bg} flex flex-col justify-between`}>
              <Icon className={`w-6 h-6 ${item.color} mb-3`} />
              <p className={`text-3xl md:text-4xl font-extrabold ${item.color}`}>{item.value}</p>
              <p className="text-slate-400 text-xs md:text-sm font-medium mt-1.5">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Bar Chart — Demandas por Setor */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg">Demandas por Setor</h3>
            <p className="text-slate-400 text-xs mt-1">Concluídas vs Pendentes</p>
          </div>
          <div className="min-h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="setor" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Concluídas" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pendentes" fill="#475569" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart — Evolução */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg">Evolução Mensal</h3>
            <p className="text-slate-400 text-xs mt-1">Histórico dos últimos 7 meses</p>
          </div>
          <div className="min-h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Concluídas" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} />
                <Line type="monotone" dataKey="Pendentes" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Pie */}
        <div className="lg:col-span-5 xl:col-span-4 glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-white font-bold text-lg">Distribuição por Status</h3>
            <p className="text-slate-400 text-xs mt-1">Tarefas semanais vigentes</p>
          </div>
          <div className="min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Setor Ranking */}
        <div className="lg:col-span-7 xl:col-span-8 glass-card rounded-2xl p-6 md:p-8 border border-brand-navy-border flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg">Ranking de Setores</h3>
            <p className="text-slate-400 text-xs mt-1">Ordenado pelo percentual de desempenho</p>
          </div>
          <div className="space-y-4">
            {[...setores]
              .sort((a, b) => b.desempenho - a.desempenho)
              .map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-brand-navy/40 border border-brand-navy-border/40">
                  <span className={`w-6 text-center text-sm font-extrabold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: s.cor + '33', color: s.cor }}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <p className="text-white text-xs font-semibold truncate">{s.nome}</p>
                      <p className="text-white text-xs font-extrabold ml-2">{s.desempenho}%</p>
                    </div>
                    <div className="h-2 bg-brand-navy-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.desempenho}%`, backgroundColor: s.cor }} />
                    </div>
                  </div>
                  {i === 0 && <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

