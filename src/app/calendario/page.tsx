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
  reuniao: 'bg-blue-500',
  treinamento: 'bg-yellow-500',
  entrega: 'bg-orange-500',
  evento: 'bg-purple-500',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function CalendarioPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sep 2026
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
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-6 border border-brand-navy-border">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl bg-brand-navy-light border border-brand-navy-border flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl bg-brand-navy-light border border-brand-navy-border flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-slate-500 text-xs font-semibold py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
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
                  className={`aspect-square rounded-xl flex flex-col items-center justify-start p-1 transition-all cal-day ${
                    isSelected
                      ? 'bg-brand-green text-white'
                      : isToday
                      ? 'border border-brand-green/50 text-brand-green-light'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={`w-1.5 h-1.5 rounded-full ${tipoEventoColor[e.tipo]} ${isSelected ? 'bg-white/60' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-brand-navy-border flex-wrap">
            {Object.entries(tipoEventoLabel).map(([tipo, label]) => (
              <div key={tipo} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${tipoEventoColor[tipo]}`} />
                <span className="text-slate-400 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          {selectedDay && (
            <div className="glass-card rounded-2xl p-5 border border-brand-navy-border">
              <h3 className="text-white font-semibold mb-3">
                {selectedDay} de {MONTHS[month]}
                <span className="text-slate-400 text-sm font-normal ml-2">
                  {selectedEvents.length} {selectedEvents.length === 1 ? 'evento' : 'eventos'}
                </span>
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((e) => (
                    <div key={e.id} className="bg-brand-navy/50 rounded-xl p-3 border border-brand-navy-border/50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-white text-sm font-medium">{e.titulo}</p>
                        <Badge variant={tipoEventoVariant(e.tipo)}>{tipoEventoLabel[e.tipo]}</Badge>
                      </div>
                      {e.hora && (
                        <p className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" /> {e.hora}
                        </p>
                      )}
                      {e.local && (
                        <p className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" /> {e.local}
                        </p>
                      )}
                      {e.participantes && (
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" /> {e.participantes.slice(0, 2).join(', ')}{e.participantes.length > 2 && ` +${e.participantes.length - 2}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">Nenhum evento neste dia.</p>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="glass-card rounded-2xl p-5 border border-brand-navy-border">
            <h3 className="text-white font-semibold mb-3">Próximos Eventos</h3>
            <div className="space-y-3">
              {nextEvents.map((e) => {
                const d = new Date(e.data + 'T00:00:00');
                return (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${tipoEventoColor[e.tipo]}/20`}
                      style={{ backgroundColor: tipoEventoColor[e.tipo].replace('bg-', '') + '22' }}>
                      <span className="text-white text-xs font-bold">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{e.titulo}</p>
                      <p className="text-slate-500 text-xs">{e.hora || 'Dia todo'}</p>
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
