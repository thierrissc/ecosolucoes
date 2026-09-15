'use client';

import { useState } from 'react';
import { Plus, Pin, Heart, Eye, Search } from 'lucide-react';
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
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Mural Corporativo</h2>
          <p className="text-text-muted text-sm mt-1">{filtered.length} publicações encontradas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova Publicação
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 md:p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar publicação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input pl-9 w-56"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {tiposOptions.map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`chip ${filtroTipo === t ? 'active' : ''}`}
              >
                {t === 'todos' ? 'Todos' : tipoMuralLabel(t)}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto flex-wrap">
            {prioridadesOptions.map((p) => (
              <button
                key={p}
                onClick={() => setFiltroPrioridade(p)}
                className={`chip ${filtroPrioridade === p ? 'active' : ''}`}
              >
                {p === 'todas' ? 'Todas' : prioridadeLabel(p)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixadas */}
      {fixadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-brand" /> Fixadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-stagger">
            {fixadas.map((pub) => (
              <PostCard key={pub.id} pub={pub} curtida={curtidas[pub.id]} onCurtir={toggleCurtida} />
            ))}
          </div>
        </div>
      )}

      {/* Normais */}
      <div className="space-y-3">
        {fixadas.length > 0 && (
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest">Todas as Publicações</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-stagger">
          {normais.map((pub) => (
            <PostCard key={pub.id} pub={pub} curtida={curtidas[pub.id]} onCurtir={toggleCurtida} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 card p-12 text-center">
              <p className="text-text-muted text-lg">Nenhuma publicação encontrada.</p>
            </div>
          )}
        </div>
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
  const prioridadeBorder: Record<string, string> = {
    alta: 'border-l-red-500',
    media: 'border-l-amber-500',
    baixa: 'border-l-emerald-500',
  };

  return (
    <div className={`card card-hover p-5 md:p-6 flex flex-col justify-between gap-3 border-l-[3px] ${prioridadeBorder[pub.prioridade]}`}>
      {/* Top */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{tipoIcons[pub.tipo]}</span>
          <Badge variant={tipoMuralVariant(pub.tipo)}>
            {tipoMuralLabel(pub.tipo)}
          </Badge>
          <Badge variant={prioridadeVariant(pub.prioridade)} dot>
            {prioridadeLabel(pub.prioridade)}
          </Badge>
        </div>
        {pub.fixado && <Pin className="w-3.5 h-3.5 text-brand flex-shrink-0" />}
      </div>

      {/* Content */}
      <div>
        <h4 className="text-text-primary font-semibold text-sm leading-snug mb-1.5">{pub.titulo}</h4>
        <p className="text-text-muted text-xs leading-relaxed line-clamp-3">{pub.descricao}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-surface-border mt-auto">
        <div className="w-7 h-7 bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">{pub.avatarAutor}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-xs font-medium truncate">{pub.autor}</p>
          <p className="text-text-muted text-[11px]">{pub.cargo} · {timeAgo(pub.data)}</p>
        </div>
        <div className="flex items-center gap-3 text-text-muted flex-shrink-0">
          <button
            onClick={() => onCurtir(pub.id)}
            className={`flex items-center gap-1 text-xs transition-all ${curtida ? 'text-red-500 scale-110' : 'hover:text-red-400'}`}
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${curtida ? 'fill-current' : ''}`} />
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card p-6 md:p-7 w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-text-primary font-bold text-lg mb-5">Nova Publicação</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-text-muted text-xs font-medium block mb-1.5">Título *</label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="input"
              placeholder="Título da publicação..."
            />
          </div>
          <div>
            <label className="text-text-muted text-xs font-medium block mb-1.5">Descrição *</label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="input resize-none"
              placeholder="Descreva o comunicado..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-muted text-xs font-medium block mb-1.5">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as PublicacaoMural['tipo'])}
                className="input input-select"
              >
                {tiposOptions.filter((t) => t !== 'todos').map((t) => (
                  <option key={t} value={t}>{tipoMuralLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs font-medium block mb-1.5">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="input input-select"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
