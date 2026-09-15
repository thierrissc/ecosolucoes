'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';
import { eventos } from '@/data/calendario';
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

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function CalendarioPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

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

  const selectedEvents = selectedDay ? getEventosForDay(selectedDay) : [];
  const nextEvents = eventos
    .filter((e) => new Date(e.data + 'T00:00:00') >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 xl:col-span-8 card p-5 md:p-7 flex flex-col">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-text-primary font-extrabold text-xl md:text-2xl">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-1.5">
              <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-surface-2 border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-surface-2 border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand transition-all">
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

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
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
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-start p-1.5 transition-all cal-cell ${
                    isSelected
                      ? 'bg-brand text-white shadow-md shadow-brand/20'
                      : isToday
                      ? 'ring-1 ring-brand text-brand bg-brand/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <span className="text-xs font-bold">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isSelected ? 'white' : tipoEventoColor[e.tipo] }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className={`text-[8px] font-bold ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-6 pt-4 border-t border-surface-border flex-wrap">
            {Object.entries(tipoEventoLabel).map(([tipo, label]) => (
              <div key={tipo} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tipoEventoColor[tipo] }} />
                <span className="text-text-secondary text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 md:space-y-5">
          {/* Selected Day */}
          {selectedDay && (
            <div className="card p-5">
              <h3 className="text-text-primary font-bold text-base mb-4 flex items-center justify-between">
                <span>{selectedDay} de {MONTHS[month]}</span>
                <span className="text-text-muted text-xs font-medium bg-surface-2 px-3 py-1 rounded-full">
                  {selectedEvents.length} {selectedEvents.length === 1 ? 'evento' : 'eventos'}
                </span>
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((e) => (
                    <div key={e.id} className="bg-surface-2 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-text-primary text-sm font-semibold">{e.titulo}</p>
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-6">Nenhum evento para este dia.</p>
              )}
            </div>
          )}

          {/* Upcoming */}
          <div className="card p-5">
            <h3 className="text-text-primary font-bold text-base mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {nextEvents.map((e) => {
                const d = new Date(e.data + 'T00:00:00');
                return (
                  <div key={e.id} className="flex items-center gap-3 group">
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: tipoEventoColor[e.tipo] + '18' }}
                    >
                      <span className="text-sm font-bold" style={{ color: tipoEventoColor[e.tipo] }}>{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-xs font-medium truncate group-hover:text-brand transition-colors">{e.titulo}</p>
                      <p className="text-text-muted text-[11px]">{e.hora || 'Dia todo'}</p>
                    </div>
                    <Badge variant={tipoEventoVariant(e.tipo)}>{tipoEventoLabel[e.tipo]}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
