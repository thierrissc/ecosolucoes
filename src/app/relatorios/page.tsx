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
  { name: 'Não Iniciada', value: tarefasSemanais.filter((t) => t.status === 'nao_iniciada').length, color: '#64748b' },
];

const setorMaisAtivo = [...setores].sort((a, b) => b.desempenho - a.desempenho)[0];

const medalColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
const medalEmojis = ['🥇', '🥈', '🥉'];

function handleExport() {
  window.print();
}

export default function RelatoriosPage() {
  const totalConcluidas = tarefasSemanais.filter((t) => t.status === 'concluida').length;
  const totalPendentes = tarefasSemanais.filter((t) => t.status !== 'concluida').length;
  const mediaProgresso = Math.round(metasMensais.reduce((a, m) => a + m.progresso, 0) / metasMensais.length);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Relatórios</h2>
          <p className="text-text-muted text-sm mt-1">Análise consolidada de desempenho</p>
        </div>
        <button onClick={handleExport} className="btn-ghost">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 animate-stagger">
        {[
          { label: 'Concluídas', value: totalConcluidas, gradient: 'from-emerald-500 to-teal-400', icon: CheckCircle },
          { label: 'Pendentes', value: totalPendentes, gradient: 'from-amber-500 to-yellow-400', icon: TrendingUp },
          { label: 'Progresso Médio', value: `${mediaProgresso}%`, gradient: 'from-blue-500 to-indigo-400', icon: Trophy },
          { label: 'Setor Destaque', value: setorMaisAtivo.nome.split(' ')[0], gradient: 'from-emerald-500 to-brand', icon: Trophy },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-5 md:p-6 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-text-primary text-3xl md:text-4xl font-extrabold">{item.value}</p>
                <p className="text-text-muted text-xs font-medium mt-0.5">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Bar */}
        <div className="card p-5 md:p-7 flex flex-col">
          <div className="mb-5">
            <h3 className="text-text-primary font-bold text-base">Demandas por Setor</h3>
            <p className="text-text-muted text-xs mt-0.5">Concluídas vs Pendentes</p>
          </div>
          <div className="min-h-[260px] flex-1">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="setor" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: '14px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-lg)' }} />
                <Bar dataKey="Concluídas" fill="#16a34a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Pendentes" fill="#64748b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line */}
        <div className="card p-5 md:p-7 flex flex-col">
          <div className="mb-5">
            <h3 className="text-text-primary font-bold text-base">Evolução Mensal</h3>
            <p className="text-text-muted text-xs mt-0.5">Histórico dos últimos 7 meses</p>
          </div>
          <div className="min-h-[260px] flex-1">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: '14px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-lg)' }} />
                <Line type="monotone" dataKey="Concluídas" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="Pendentes" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        {/* Pie */}
        <div className="lg:col-span-5 xl:col-span-4 card p-5 md:p-7 flex flex-col">
          <div className="mb-3">
            <h3 className="text-text-primary font-bold text-base">Distribuição por Status</h3>
            <p className="text-text-muted text-xs mt-0.5">Tarefas semanais vigentes</p>
          </div>
          <div className="min-h-[220px] flex-1">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking */}
        <div className="lg:col-span-7 xl:col-span-8 card p-5 md:p-7 flex flex-col">
          <div className="mb-5">
            <h3 className="text-text-primary font-bold text-base">Ranking de Setores</h3>
            <p className="text-text-muted text-xs mt-0.5">Ordenado pelo desempenho</p>
          </div>
          <div className="space-y-3">
            {[...setores]
              .sort((a, b) => b.desempenho - a.desempenho)
              .map((s, i) => (
                <div key={s.id} className="flex items-center gap-3.5 py-2 px-3 rounded-2xl hover:bg-surface-hover transition-colors group">
                  <span className="text-lg w-8 text-center flex-shrink-0">
                    {i < 3 ? medalEmojis[i] : <span className="text-text-muted text-sm font-bold">{i + 1}</span>}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: s.cor }}
                  >
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <p className="text-text-primary text-sm font-medium truncate group-hover:text-brand transition-colors">{s.nome}</p>
                      <p className="text-text-primary text-sm font-bold ml-2">{s.desempenho}%</p>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.desempenho}%`, backgroundColor: s.cor }} />
                    </div>
                  </div>
                  {i === 0 && <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-float" />}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
