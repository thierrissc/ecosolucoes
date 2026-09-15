'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Plus, Trash2, X, Palette } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EventoCalendario } from '@/types';
import Badge, { tipoEventoVariant } from '@/components/ui/Badge';

const tipoEventoLabel: Record<string, string> = {
  reuniao: 'Reunião',
  treinamento: 'Treinamento',
  entrega: 'Entrega',
  evento: 'Evento',
};

const tipoEventoColor: Record<string, string> = {
  reuniao: '#3b82f6',
  treinamento: '#f59e0b',
  entrega: '#f97316',
  evento: '#8b5cf6',
};

const COLOR_PRESETS = [
  { label: 'Verde', value: '#16a34a' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Roxo', value: '#8b5cf6' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Amarelo', value: '#eab308' },
  { label: 'Ciano', value: '#06b6d4' },
  { label: 'Rosa', value: '#ec4899' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function CalendarioPage() {
  const { eventos, addEvento, deleteEvento } = useApp();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showModal, setShowModal] = useState(false);

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTipo, setNovoTipo] = useState<'reuniao' | 'treinamento' | 'entrega' | 'evento'>('reuniao');
  const [novaHora, setNovaHora] = useState('');
  const [novoLocal, setNovoLocal] = useState('');
  const [novaCor, setNovaCor] = useState('#16a34a');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventosForDay = (day: number): EventoCalendario[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventos.filter((e) => e.data === dateStr);
  };

  const handleCriarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !selectedDay) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    addEvento({
      titulo: novoTitulo,
      tipo: novoTipo,
      data: dateStr,
      hora: novaHora || undefined,
      local: novoLocal || undefined,
      cor: novaCor,
    });

    setNovoTitulo('');
    setNovaHora('');
    setNovoLocal('');
    setNovaCor('#16a34a');
    setShowModal(false);
  };

  const selectedEvents = selectedDay ? getEventosForDay(selectedDay) : [];
  const nextEvents = eventos
    .filter((e) => new Date(e.data + 'T00:00:00') >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Top action header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Calendário Corporativo</h2>
          <p className="text-text-muted text-sm mt-1">Gerencie cronogramas, reuniões e eventos por setor com tags visuais.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 xl:col-span-8 card p-5 md:p-7 flex flex-col">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text-primary font-extrabold text-xl md:text-2xl">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex gap-1.5">
              <button onClick={prevMonth} className="w-9 h-9 bg-surface-2 border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="w-9 h-9 bg-surface-2 border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-text-muted text-xs font-bold uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] md:min-h-[105px] bg-surface-2/20 border border-transparent" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventosForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[85px] md:min-h-[105px] flex flex-col items-stretch justify-start p-1.5 transition-all text-left relative overflow-hidden border ${
                    isSelected
                      ? 'border-brand bg-brand/10 shadow-sm'
                      : isToday
                      ? 'border-brand/60 bg-brand/5'
                      : 'border-surface-border bg-surface-1 hover:border-text-muted/40 hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-brand' : isToday ? 'text-brand' : 'text-text-primary'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-text-muted font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Tags com cores dos eventos */}
                  <div className="w-full space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((e) => {
                      const eventColor = e.cor || tipoEventoColor[e.tipo] || '#16a34a';
                      return (
                        <div
                          key={e.id}
                          className="w-full text-[10px] font-semibold px-1.5 py-0.5 truncate border leading-tight"
                          style={{
                            backgroundColor: eventColor + '20',
                            borderColor: eventColor + '80',
                            color: eventColor,
                          }}
                          title={`${e.titulo}${e.hora ? ` às ${e.hora}` : ''}`}
                        >
                          {e.titulo}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-text-muted text-center pt-0.5">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-6 pt-4 border-t border-surface-border flex-wrap">
            {Object.entries(tipoEventoLabel).map(([tipo, label]) => (
              <div key={tipo} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5" style={{ backgroundColor: tipoEventoColor[tipo] }} />
                <span className="text-text-secondary text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 md:space-y-5">
          {/* Selected Day Details */}
          {selectedDay && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary font-bold text-base">
                  {selectedDay} de {MONTHS[month]}
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs text-brand hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((e) => {
                    const eventColor = e.cor || tipoEventoColor[e.tipo] || '#16a34a';
                    return (
                      <div
                        key={e.id}
                        className="bg-surface-2 p-4 border relative group"
                        style={{ borderLeftColor: eventColor, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-text-primary text-sm font-semibold pr-6">{e.titulo}</p>
                          <Badge variant={tipoEventoVariant(e.tipo)}>{tipoEventoLabel[e.tipo]}</Badge>
                        </div>
                        {e.hora && (
                          <p className="text-text-muted text-xs flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5" /> {e.hora}
                          </p>
                        )}
                        {e.local && (
                          <p className="text-text-muted text-xs flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3.5 h-3.5" /> {e.local}
                          </p>
                        )}
                        {e.participantes && (
                          <p className="text-text-muted text-xs flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> {e.participantes.slice(0, 2).join(', ')}{e.participantes.length > 2 && ` +${e.participantes.length - 2}`}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir o evento "${e.titulo}"?`)) {
                              deleteEvento(e.id);
                            }
                          }}
                          className="absolute top-3 right-3 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Excluir evento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-text-muted text-sm mb-3">Nenhum evento para este dia.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-ghost text-xs py-1.5 px-3"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar evento em {selectedDay}/{month + 1}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events (with delete capability) */}
          <div className="card p-5">
            <h3 className="text-text-primary font-bold text-base mb-4">Próximos Eventos</h3>
            <div className="space-y-2">
              {nextEvents.map((e) => {
                const d = new Date(e.data + 'T00:00:00');
                const eventColor = e.cor || tipoEventoColor[e.tipo] || '#16a34a';
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2 hover:bg-surface-hover transition-colors group relative border border-transparent hover:border-surface-border">
                    <div
                      className="w-10 h-10 flex-shrink-0 flex items-center justify-center border"
                      style={{ backgroundColor: eventColor + '18', borderColor: eventColor + '40' }}
                    >
                      <span className="text-sm font-bold" style={{ color: eventColor }}>{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-xs font-semibold truncate group-hover:text-brand transition-colors">{e.titulo}</p>
                      <p className="text-text-muted text-[11px]">{e.hora || 'Dia todo'}{e.local ? ` · ${e.local}` : ''}</p>
                    </div>
                    <Badge variant={tipoEventoVariant(e.tipo)}>{tipoEventoLabel[e.tipo]}</Badge>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o evento "${e.titulo}"?`)) {
                          deleteEvento(e.id);
                        }
                      }}
                      title="Excluir evento"
                      className="p-1.5 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {nextEvents.length === 0 && (
                <p className="text-text-muted text-xs text-center py-4">Nenhum evento futuro agendado.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Novo Evento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="card w-full max-w-md p-6 bg-surface-1 border border-surface-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">
                Novo Evento ({selectedDay} de {MONTHS[month]})
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarEvento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Título do Evento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião de Planejamento"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full bg-surface-2 border border-surface-border px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className="w-full bg-surface-2 border border-surface-border px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                  >
                    <option value="reuniao">Reunião</option>
                    <option value="treinamento">Treinamento</option>
                    <option value="entrega">Entrega</option>
                    <option value="evento">Evento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Horário
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 14:00 - 15:30"
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    className="w-full bg-surface-2 border border-surface-border px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Local / Link
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sala de Reunião 2 / Google Meet"
                  value={novoLocal}
                  onChange={(e) => setNovoLocal(e.target.value)}
                  className="w-full bg-surface-2 border border-surface-border px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              {/* Seletor de Cor do Evento */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-brand" />
                  Cor da Tag no Calendário
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((cp) => (
                    <button
                      key={cp.value}
                      type="button"
                      onClick={() => setNovaCor(cp.value)}
                      className={`w-7 h-7 flex items-center justify-center transition-all ${
                        novaCor === cp.value
                          ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface-1 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: cp.value }}
                      title={cp.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={novaCor}
                    onChange={(e) => setNovaCor(e.target.value)}
                    className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer ml-1"
                    title="Cor personalizada"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
