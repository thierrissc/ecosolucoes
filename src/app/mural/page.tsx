'use client';

import { useState } from 'react';
import { Plus, Pin, Heart, Eye, Filter } from 'lucide-react';
import { publicacoes as allPublicacoes } from '@/data/mural';
import { PublicacaoMural, Prioridade } from '@/types';
import Badge, { prioridadeVariant, tipoMuralVariant } from '@/components/ui/Badge';
import { timeAgo, prioridadeLabel, tipoMuralLabel } from '@/lib/utils';

const tiposOptions = ['todos', 'comunicado', 'evento', 'aviso_urgente', 'meta', 'mudanca'];
const prioridadesOptions: ('todas' | Prioridade)[] = ['todas', 'alta', 'media', 'baixa'];

const tipoIcons: Record<string, string> = {
  aviso_urgente: '🚨',
  meta: '🎯',
  evento: '🎉',
  comunicado: '📢',
  mudanca: '🔄',
  treinamento: '📚',
};

export default function MuralPage() {
  const [publicacoes, setPublicacoes] = useState<PublicacaoMural[]>(allPublicacoes);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todas' | Prioridade>('todas');
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [curtidas, setCurtidas] = useState<Record<string, boolean>>({});

  const filtered = publicacoes.filter((p) => {
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;
    const matchPrioridade = filtroPrioridade === 'todas' || p.prioridade === filtroPrioridade;
    const matchBusca =
      busca === '' ||
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.autor.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchPrioridade && matchBusca;
  });

  const fixadas = filtered.filter((p) => p.fixado);
  const normais = filtered.filter((p) => !p.fixado);

  const toggleCurtida = (id: string) => {
    setCurtidas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">Publicações do Mural</h2>
          <p className="text-slate-400 text-sm">{filtered.length} publicações encontradas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30"
        >
          <Plus className="w-4 h-4" />
          Nova Publicação
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-brand-navy-border">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar publicação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-brand-navy-light border border-brand-navy-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green/50 w-48"
          />
          <div className="flex gap-2 flex-wrap">
            {tiposOptions.map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filtroTipo === t
                    ? 'bg-brand-green text-white'
                    : 'bg-brand-navy-light text-slate-400 hover:text-white border border-brand-navy-border'
                }`}
              >
                {t === 'todos' ? 'Todos' : tipoMuralLabel(t)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {prioridadesOptions.map((p) => (
              <button
                key={p}
                onClick={() => setFiltroPrioridade(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filtroPrioridade === p
                    ? 'bg-brand-green text-white'
                    : 'bg-brand-navy-light text-slate-400 hover:text-white border border-brand-navy-border'
                }`}
              >
                {p === 'todas' ? 'Todas' : prioridadeLabel(p)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixadas */}
      {fixadas.length > 0 && (
        <div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Pin className="w-3.5 h-3.5" /> Fixadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fixadas.map((pub) => (
              <PostCard key={pub.id} pub={pub} curtida={curtidas[pub.id]} onCurtir={toggleCurtida} />
            ))}
          </div>
        </div>
      )}

      {/* Normais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {normais.map((pub) => (
          <PostCard key={pub.id} pub={pub} curtida={curtidas[pub.id]} onCurtir={toggleCurtida} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 glass-card rounded-2xl p-12 border border-brand-navy-border text-center">
            <p className="text-slate-400 text-lg">Nenhuma publicação encontrada.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onSubmit={(pub) => {
            setPublicacoes([pub, ...publicacoes]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function PostCard({ pub, curtida, onCurtir }: { pub: PublicacaoMural; curtida: boolean; onCurtir: (id: string) => void }) {
  const prioridadeColors: Record<string, string> = {
    alta: 'border-l-red-500',
    media: 'border-l-yellow-500',
    baixa: 'border-l-green-500',
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border border-brand-navy-border hover-lift flex flex-col gap-3 border-l-4 ${prioridadeColors[pub.prioridade]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={tipoMuralVariant(pub.tipo)}>
            {tipoIcons[pub.tipo]} {tipoMuralLabel(pub.tipo)}
          </Badge>
          <Badge variant={prioridadeVariant(pub.prioridade)} dot>
            {prioridadeLabel(pub.prioridade)}
          </Badge>
        </div>
        {pub.fixado && <Pin className="w-4 h-4 text-brand-green-light flex-shrink-0" />}
      </div>

      <div>
        <h4 className="text-white font-semibold text-sm leading-snug mb-2">{pub.titulo}</h4>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{pub.descricao}</p>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-brand-navy-border mt-auto">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{pub.avatarAutor}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{pub.autor}</p>
          <p className="text-slate-500 text-xs">{pub.cargo} · {timeAgo(pub.data)}</p>
        </div>
        <div className="flex items-center gap-3 text-slate-500 flex-shrink-0">
          <button
            onClick={() => onCurtir(pub.id)}
            className={`flex items-center gap-1 text-xs hover:text-red-400 transition-colors ${curtida ? 'text-red-400' : ''}`}
          >
            <Heart className={`w-3.5 h-3.5 ${curtida ? 'fill-current' : ''}`} />
            {pub.curtidas + (curtida ? 1 : 0)}
          </button>
          <span className="flex items-center gap-1 text-xs">
            <Eye className="w-3.5 h-3.5" />
            {pub.visualizacoes}
          </span>
        </div>
      </div>
    </div>
  );
}

function NewPostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (pub: PublicacaoMural) => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<PublicacaoMural['tipo']>('comunicado');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: PublicacaoMural = {
      id: `p${Date.now()}`,
      titulo,
      descricao,
      autor: 'Você',
      avatarAutor: 'ME',
      cargo: 'Administrador',
      data: new Date().toISOString().split('T')[0],
      prioridade,
      tipo,
      curtidas: 0,
      visualizacoes: 1,
    };
    onSubmit(nova);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 border border-brand-navy-border w-full max-w-lg animate-fade-in">
        <h3 className="text-white font-bold text-lg mb-4">Nova Publicação</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Título *</label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green/50"
              placeholder="Título da publicação..."
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Descrição *</label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green/50 resize-none"
              placeholder="Descreva o comunicado..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs block mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as PublicacaoMural['tipo'])}
                className="w-full bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              >
                {tiposOptions.filter((t) => t !== 'todos').map((t) => (
                  <option key={t} value={t}>{tipoMuralLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full bg-brand-navy-light border border-brand-navy-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 border border-brand-navy-border hover:text-white hover:border-slate-500 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm bg-brand-green hover:bg-brand-green-dark text-white font-medium transition-all"
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
