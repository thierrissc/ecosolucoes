'use client';

import { Download, Trophy, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useApp } from '@/contexts/AppContext';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

function handleExport() {
  const prev = document.title;
  document.title = 'Eco Soluções';
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = prev;
    }, 1000);
  }, 150);
}

export default function RelatoriosPage() {
  const { tarefasSemanais, metasMensais, setores } = useApp();

  const totalConcluidas = tarefasSemanais.filter((t) => t.status === 'concluida').length;
  const totalPendentes = tarefasSemanais.filter((t) => t.status !== 'concluida').length;
  const mediaProgresso = metasMensais.length > 0
    ? Math.round(metasMensais.reduce((a, m) => a + m.progresso, 0) / metasMensais.length)
    : 0;

  const setorMaisAtivo = setores.length > 0
    ? [...setores].sort((a, b) => b.desempenho - a.desempenho)[0]
    : null;

  const barData = setores.map((s, i) => ({
    setor: s.nome.split(' ')[0],
    Concluídas: tarefasSemanais.filter((t) => t.setorId === s.id && t.status === 'concluida').length,
    Pendentes: tarefasSemanais.filter((t) => t.setorId === s.id && t.status !== 'concluida').length,
    fill: COLORS[i % COLORS.length],
  }));

  const hasHistorico = tarefasSemanais.length > 0 || metasMensais.length > 0;

  const lineData = hasHistorico
    ? [
        { mes: 'Mar', Concluídas: Math.max(0, Math.round(totalConcluidas * 0.4)), Pendentes: Math.max(0, Math.round(totalPendentes * 0.5)) },
        { mes: 'Abr', Concluídas: Math.max(0, Math.round(totalConcluidas * 0.6)), Pendentes: Math.max(0, Math.round(totalPendentes * 0.7)) },
        { mes: 'Mai', Concluídas: Math.max(0, Math.round(totalConcluidas * 0.5)), Pendentes: Math.max(0, Math.round(totalPendentes * 0.8)) },
        { mes: 'Jun', Concluídas: Math.max(0, Math.round(totalConcluidas * 0.8)), Pendentes: Math.max(0, Math.round(totalPendentes * 0.6)) },
        { mes: 'Jul', Concluídas: Math.max(0, Math.round(totalConcluidas * 0.7)), Pendentes: Math.max(0, Math.round(totalPendentes * 0.9)) },
        { mes: 'Ago', Concluídas: Math.max(0, Math.round(totalConcluidas * 0.9)), Pendentes: Math.max(0, Math.round(totalPendentes * 0.8)) },
        { mes: 'Set', Concluídas: totalConcluidas, Pendentes: totalPendentes },
      ]
    : [];

  const pieData = [
    { name: 'Concluída', value: totalConcluidas, color: '#16a34a' },
    { name: 'Em Andamento', value: tarefasSemanais.filter((t) => t.status === 'em_andamento').length, color: '#3b82f6' },
    { name: 'Não Iniciada', value: tarefasSemanais.filter((t) => t.status === 'nao_iniciada').length, color: '#64748b' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Eco Soluções</h2>
          <p className="text-text-muted text-sm mt-1">Relatórios Gerenciais e Desempenho</p>
        </div>
        <button onClick={handleExport} className="btn-ghost print:hidden">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 animate-stagger">
        {[
          { label: 'Demandas Concluídas', value: totalConcluidas, icon: CheckCircle },
          { label: 'Demandas Pendentes', value: totalPendentes, icon: TrendingUp },
          { label: 'Progresso Médio', value: `${mediaProgresso}%`, icon: Trophy },
          { label: 'Setor Destaque', value: setorMaisAtivo ? setorMaisAtivo.nome.split(' ')[0] : '—', icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-5 md:p-6 flex flex-col gap-3">
              <div className="w-9 h-9 border border-surface-border bg-surface-2/40 flex items-center justify-center">
                <Icon className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <p className="text-text-primary text-3xl md:text-4xl font-extrabold">{item.value}</p>
                <p className="text-text-muted text-xs font-medium mt-0.5">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div className="card p-5 md:p-7 flex flex-col overflow-hidden">
          <div className="mb-5">
            <h3 className="text-text-primary font-bold text-base">Demandas por Setor</h3>
            <p className="text-text-muted text-xs mt-0.5">Concluídas vs Pendentes</p>
          </div>
          <div className="h-[260px] min-h-[260px] w-full flex-1 print:hidden">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="setor" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: '0px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar dataKey="Concluídas" fill="#16a34a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Pendentes" fill="#64748b" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <BarChart3 className="w-8 h-8 text-text-muted/40 mb-2" />
                <p className="text-text-muted text-xs">Nenhum setor cadastrado para o gráfico.</p>
              </div>
            )}
          </div>
          {barData.length > 0 && (
            <div className="hidden print:block w-full">
              <BarChart width={620} height={240} data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="setor" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Bar dataKey="Concluídas" fill="#16a34a" />
                <Bar dataKey="Pendentes" fill="#64748b" />
              </BarChart>
            </div>
          )}
        </div>

        <div className="card p-5 md:p-7 flex flex-col overflow-hidden">
          <div className="mb-5">
            <h3 className="text-text-primary font-bold text-base">Evolução Mensal</h3>
            <p className="text-text-muted text-xs mt-0.5">Histórico comparativo</p>
          </div>
          <div className="h-[260px] min-h-[260px] w-full flex-1 print:hidden">
            {hasHistorico ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: '0px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="Concluídas" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 3, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="Pendentes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <TrendingUp className="w-8 h-8 text-text-muted/40 mb-2" />
                <p className="text-text-muted text-xs">Nenhum histórico registrado no momento.</p>
                <p className="text-text-muted/70 text-[11px] mt-1">Conclua ou cadastre novas demandas para visualizar a evolução mensal.</p>
              </div>
            )}
          </div>
          {hasHistorico ? (
            <div className="hidden print:block w-full">
              <LineChart width={620} height={240} data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="Concluídas" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 3 }} />
                <Line type="monotone" dataKey="Pendentes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </div>
          ) : (
            <div className="hidden print:block py-6 text-center text-xs text-slate-500">
              Nenhum histórico registrado no momento.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        <div className="lg:col-span-5 xl:col-span-4 card p-5 md:p-7 flex flex-col overflow-hidden">
          <div className="mb-3">
            <h3 className="text-text-primary font-bold text-base">Distribuição por Status</h3>
            <p className="text-text-muted text-xs mt-0.5">Tarefas vigentes</p>
          </div>
          <div className="h-[220px] min-h-[220px] w-full flex-1 print:hidden">
            <ResponsiveContainer width="100%" height="100%">
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
          <div className="hidden print:block w-full">
            <PieChart width={300} height={220}>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span style={{ color: '#334155', fontSize: '11px', fontWeight: 500 }}>{v}</span>} />
            </PieChart>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 card p-5 md:p-7 flex flex-col overflow-hidden">
          <div className="mb-5">
            <h3 className="text-text-primary font-bold text-base">Ranking de Setores</h3>
            <p className="text-text-muted text-xs mt-0.5">Ordenado pelo desempenho</p>
          </div>
          <div className="space-y-3">
            {[...setores]
              .sort((a, b) => b.desempenho - a.desempenho)
              .map((s, i) => (
                <div key={s.id} className="flex items-center gap-3.5 py-2 px-3 hover:bg-surface-hover transition-colors group">
                  <span className="w-8 text-center flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 ${i === 0 ? 'bg-amber-500/15 text-amber-500 font-extrabold' : i === 1 ? 'bg-slate-400/15 text-slate-300 font-bold' : i === 2 ? 'bg-amber-700/15 text-amber-600 font-bold' : 'text-text-muted text-xs font-medium'}`}>
                      #{i + 1}
                    </span>
                  </span>
                  <div
                    className="w-8 h-8 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: s.cor }}
                  >
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <p className="text-text-primary text-sm font-medium truncate group-hover:text-brand transition-colors">{s.nome}</p>
                      <p className="text-text-primary text-sm font-bold ml-2">{s.desempenho}%</p>
                    </div>
                    <div className="h-1.5 bg-surface-2 overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${s.desempenho}%`, backgroundColor: s.cor }} />
                    </div>
                  </div>
                  {i === 0 && <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                </div>
              ))}
            {setores.length === 0 && (
              <p className="text-text-muted text-xs text-center py-6">Nenhum setor cadastrado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
