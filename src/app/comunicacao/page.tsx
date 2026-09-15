'use client';

import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { conversas as allConversas } from '@/data/chat';
import { Conversa, Mensagem } from '@/types';
import { timeAgo } from '@/lib/utils';

export default function ComunicacaoPage() {
  const [conversas, setConversas] = useState<Conversa[]>(allConversas);
  const [selectedId, setSelectedId] = useState<string>(allConversas[0].id);
  const [novaMensagem, setNovaMensagem] = useState('');

  const selected = conversas.find((c) => c.id === selectedId)!;

  const marcarLida = (id: string) => {
    setConversas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, naoLidas: 0 } : c))
    );
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    marcarLida(id);
  };

  const enviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;
    const msg: Mensagem = {
      id: `msg${Date.now()}`,
      remetenteId: 'eu',
      remetente: 'Você',
      avatar: 'ME',
      texto: novaMensagem,
      timestamp: new Date().toISOString(),
      lida: true,
    };
    setConversas((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, mensagens: [...c.mensagens, msg], ultimaMensagem: novaMensagem }
          : c
      )
    );
    setNovaMensagem('');
  };

  const totalNaoLidas = conversas.reduce((acc, c) => acc + c.naoLidas, 0);

  return (
    <div className="animate-fade-in h-[calc(100vh-140px)] flex gap-4">
      {/* Sidebar conversas */}
      <div className="w-72 flex-shrink-0 glass-card rounded-2xl border border-brand-navy-border flex flex-col">
        <div className="p-4 border-b border-brand-navy-border">
          <h3 className="text-white font-semibold">Conversas</h3>
          {totalNaoLidas > 0 && (
            <p className="text-slate-400 text-xs">{totalNaoLidas} não lidas</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-brand-navy-border">
          {conversas.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left ${
                selectedId === conv.id ? 'bg-brand-green/10 border-r-2 border-brand-green' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green/40 to-brand-green-dark/40 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{conv.avatar}</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-brand-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium truncate">{conv.participante.split(' ')[0]}</p>
                  <p className="text-slate-500 text-xs flex-shrink-0">{timeAgo(conv.timestamp)}</p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-slate-400 text-xs truncate">{conv.ultimaMensagem}</p>
                  {conv.naoLidas > 0 && (
                    <span className="bg-brand-green text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                      {conv.naoLidas}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 glass-card rounded-2xl border border-brand-navy-border flex flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 p-4 border-b border-brand-navy-border">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green/40 to-brand-green-dark/40 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{selected.avatar}</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-brand-navy" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{selected.participante}</p>
            <p className="text-slate-400 text-xs">{selected.cargo}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selected.mensagens.map((msg) => {
            const isMe = msg.remetenteId === 'eu';
            return (
              <div key={msg.id} className={`flex gap-3 chat-bubble ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green/40 to-brand-green-dark/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{msg.avatar}</span>
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.tipo === 'aviso' && (
                    <div className="flex items-center gap-1 text-orange-400 text-xs mb-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Aviso do Gestor
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-brand-green text-white rounded-tr-sm'
                        : msg.tipo === 'aviso'
                        ? 'bg-orange-500/15 text-white border border-orange-500/25 rounded-tl-sm'
                        : 'bg-brand-navy-light text-white border border-brand-navy-border rounded-tl-sm'
                    }`}
                  >
                    {msg.texto}
                  </div>
                  <p className="text-slate-500 text-xs px-1">{timeAgo(msg.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={enviarMensagem} className="p-4 border-t border-brand-navy-border flex items-center gap-3">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder={`Mensagem para ${selected.participante.split(' ')[0]}...`}
            className="flex-1 bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green/50 transition-all"
          />
          <button
            type="submit"
            className="w-10 h-10 bg-brand-green hover:bg-brand-green-dark rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-green/20"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
