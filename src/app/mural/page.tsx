'use client';

import { useState } from 'react';
import { Plus, Pin, Heart, Eye, Search, Trash2, Lightbulb, Shield, MessageSquarePlus, UserX, Sparkles, Building2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { PublicacaoMural, Prioridade, TipoMural } from '@/types';
import Badge, { prioridadeVariant, tipoMuralVariant } from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { timeAgo, prioridadeLabel, tipoMuralLabel } from '@/lib/utils';

const tiposOptions = ['todos', 'comunicado', 'sugestao', 'evento', 'aviso_urgente', 'meta', 'mudanca'];
const prioridadesOptions: ('todas' | Prioridade)[] = ['todas', 'alta', 'media', 'baixa'];

export default function MuralPage() {
  const { publicacoes, addPublicacao, toggleCurtidaMural, deletePublicacao, toggleFixarPublicacao, user } = useApp();
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'sugestoes'>('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todas' | Prioridade>('todas');
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalIsSugestao, setModalIsSugestao] = useState(false);
  const [curtidasLocais, setCurtidasLocais] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sugestoesCount = publicacoes.filter((p) => p.tipo === 'sugestao').length;

  const filtered = publicacoes.filter((p) => {
    if (abaAtiva === 'sugestoes' && p.tipo !== 'sugestao') return false;
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

  const handleToggleCurtida = (id: string) => {
    if (!curtidasLocais[id]) {
      toggleCurtidaMural(id);
      setCurtidasLocais((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleOpenSugestaoModal = () => {
    setModalIsSugestao(true);
    setShowModal(true);
  };

  const handleOpenNormalModal = () => {
    setModalIsSugestao(false);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-text-primary font-extrabold text-2xl md:text-3xl tracking-tight">Mural Corporativo</h2>
          <p className="text-text-muted text-sm mt-1">
            {filtered.length} publicações {abaAtiva === 'sugestoes' ? 'na caixa de sugestões' : 'no mural'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {abaAtiva === 'sugestoes' ? (
            <button
              onClick={handleOpenSugestaoModal}
              className="px-4 py-2 text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Nova Sugestão / Melhoria
            </button>
          ) : (
            <button onClick={handleOpenNormalModal} className="btn-primary">
              <Plus className="w-4 h-4" />
              Novo Comunicado
            </button>
          )}
        </div>
      </div>

      {/* Abas de Navegação do Mural */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-1">
        <button
          onClick={() => {
            setAbaAtiva('todos');
            setFiltroTipo('todos');
          }}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-1 flex items-center gap-2 ${
            abaAtiva === 'todos'
              ? 'border-brand text-brand'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Mural Geral
        </button>

        <button
          onClick={() => {
            setAbaAtiva('sugestoes');
            setFiltroTipo('todos');
          }}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-1 flex items-center gap-2 ${
            abaAtiva === 'sugestoes'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Sugestões & Melhorias da Equipe
          {sugestoesCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-500">
              {sugestoesCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 md:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={
              abaAtiva === 'sugestoes'
                ? 'Buscar sugestões de melhoria...'
                : 'Buscar comunicados, avisos ou autores...'
            }
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input input-with-icon w-full"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {abaAtiva === 'todos' && (
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="input input-select w-auto min-w-[150px] text-xs py-2 px-3"
            >
              {tiposOptions.map((t) => (
                <option key={t} value={t}>
                  {t === 'todos' ? 'Todos os Tipos' : tipoMuralLabel(t)}
                </option>
              ))}
            </select>
          )}

          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value as any)}
            className="input input-select w-auto min-w-[140px] text-xs py-2 px-3"
          >
            {prioridadesOptions.map((p) => (
              <option key={p} value={p}>
                {p === 'todas' ? 'Todas Prioridades' : prioridadeLabel(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Banner explicativo na aba de sugestões */}
      {abaAtiva === 'sugestoes' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
          <div className="w-9 h-9 bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">Canal Direto de Melhorias para a Diretoria</h4>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              Espaço reservado para colaboradores enviarem ideias, sugestões de inovação e melhorias de processos para a diretoria. As mensagens podem ser enviadas de forma anônima ou identificada.
            </p>
          </div>
        </div>
      )}

      {/* Fixadas */}
      {fixadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-brand" /> Fixadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-stagger">
            {fixadas.map((pub) => (
              <PostCard
                key={pub.id}
                pub={pub}
                curtida={curtidasLocais[pub.id]}
                onCurtir={handleToggleCurtida}
                onToggleFixar={toggleFixarPublicacao}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Normais */}
      <div className="space-y-3">
        {fixadas.length > 0 && (
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest">
            {abaAtiva === 'sugestoes' ? 'Todas as Sugestões' : 'Todas as Publicações'}
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-stagger">
          {normais.map((pub) => (
            <PostCard
              key={pub.id}
              pub={pub}
              curtida={curtidasLocais[pub.id]}
              onCurtir={handleToggleCurtida}
              onToggleFixar={toggleFixarPublicacao}
              onDelete={handleDelete}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full card p-12 text-center">
              <p className="text-text-muted text-base mb-3">
                {abaAtiva === 'sugestoes'
                  ? 'Nenhuma sugestão enviada até o momento.'
                  : 'Nenhuma publicação no mural.'}
              </p>
              <button
                onClick={abaAtiva === 'sugestoes' ? handleOpenSugestaoModal : handleOpenNormalModal}
                className="btn-primary inline-flex"
              >
                <Plus className="w-4 h-4" />
                {abaAtiva === 'sugestoes' ? 'Enviar Primeira Sugestão' : 'Criar Primeira Publicação'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <NewPostModal
          isSugestaoDefault={modalIsSugestao}
          loggedUserName={user?.name}
          onClose={() => setShowModal(false)}
          onSubmit={(pub) => {
            addPublicacao(pub);
            setShowModal(false);
          }}
        />
      )}

      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Excluir Publicação"
        message="Tem certeza que deseja excluir esta publicação do mural? Esta ação não pode ser desfeita."
        confirmLabel="Excluir Publicação"
        onConfirm={() => {
          if (deletingId) {
            deletePublicacao(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

function PostCard({
  pub,
  curtida,
  onCurtir,
  onToggleFixar,
  onDelete,
}: {
  pub: PublicacaoMural;
  curtida: boolean;
  onCurtir: (id: string) => void;
  onToggleFixar: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isSugestao = pub.tipo === 'sugestao';

  const prioridadeBorder: Record<string, string> = {
    alta: 'border-l-red-500',
    media: 'border-l-amber-500',
    baixa: 'border-l-emerald-500',
  };

  return (
    <div
      className={`card card-hover p-5 md:p-6 flex flex-col justify-between gap-3 border-l-[3px] ${
        isSugestao ? 'border-l-amber-500 bg-amber-500/[0.015]' : prioridadeBorder[pub.prioridade]
      }`}
    >
      {/* Top */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isSugestao ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Sugestão / Melhoria
            </span>
          ) : (
            <Badge variant={tipoMuralVariant(pub.tipo)}>
              {tipoMuralLabel(pub.tipo)}
            </Badge>
          )}

          {pub.anonimo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-surface-2 text-text-muted border border-surface-border">
              <Shield className="w-3 h-3" /> Anônimo
            </span>
          )}

          <Badge variant={prioridadeVariant(pub.prioridade)} dot>
            {prioridadeLabel(pub.prioridade)}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFixar(pub.id)}
            title={pub.fixado ? 'Desfixar publicação' : 'Fixar publicação'}
            className={`p-1.5 transition-colors ${
              pub.fixado
                ? 'text-brand bg-brand/10 hover:bg-brand/20'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${pub.fixado ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onDelete(pub.id)}
            title="Excluir publicação"
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        <h4 className="text-text-primary font-semibold text-sm leading-snug mb-1.5">{pub.titulo}</h4>
        <p className="text-text-muted text-xs leading-relaxed line-clamp-3">{pub.descricao}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-surface-border mt-auto">
        <div
          className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${
            pub.anonimo ? 'bg-surface-2 text-text-muted border border-surface-border' : 'bg-gradient-to-br from-brand to-emerald-400 text-white'
          }`}
        >
          {pub.anonimo ? (
            <UserX className="w-3.5 h-3.5" />
          ) : (
            <span className="text-[10px] font-bold">{pub.avatarAutor || 'CO'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-xs font-medium truncate">
            {pub.anonimo ? 'Colaborador Anônimo' : pub.autor}
          </p>
          <p className="text-text-muted text-[11px] truncate">
            {pub.anonimo ? 'Diretoria' : pub.cargo} · {timeAgo(pub.data)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-text-muted flex-shrink-0">
          <button
            onClick={() => onCurtir(pub.id)}
            className={`flex items-center gap-1 text-xs transition-all ${curtida ? 'text-red-500 scale-110' : 'hover:text-red-400'}`}
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${curtida ? 'fill-current' : ''}`} />
            {pub.curtidas}
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
  isSugestaoDefault = false,
  loggedUserName,
  onClose,
  onSubmit,
}: {
  isSugestaoDefault?: boolean;
  loggedUserName?: string;
  onClose: () => void;
  onSubmit: (pub: PublicacaoMural) => void;
}) {
  const [tipo, setTipo] = useState<TipoMural>(isSugestaoDefault ? 'sugestao' : 'comunicado');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [anonimo, setAnonimo] = useState(isSugestaoDefault);
  const [autorNome, setAutorNome] = useState(loggedUserName || '');
  const [cargo, setCargo] = useState('Colaborador');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAnon = tipo === 'sugestao' && anonimo;
    const finalAutor = isAnon ? 'Colaborador Anônimo' : (autorNome.trim() || 'Você');
    const finalCargo = isAnon ? 'Sugestão para a Diretoria' : (cargo.trim() || 'Colaborador');
    const finalAvatar = isAnon ? 'AN' : finalAutor.substring(0, 2).toUpperCase();

    const nova: PublicacaoMural = {
      id: `p${Date.now()}`,
      titulo,
      descricao,
      autor: finalAutor,
      avatarAutor: finalAvatar,
      cargo: finalCargo,
      data: new Date().toISOString().split('T')[0],
      prioridade,
      tipo,
      curtidas: 0,
      visualizacoes: 1,
      anonimo: isAnon,
      statusSugestao: tipo === 'sugestao' ? 'em_analise' : undefined,
    };

    onSubmit(nova);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card p-6 md:p-7 w-full max-w-lg animate-scale-in my-auto max-h-[85vh] overflow-y-auto shadow-2xl border border-surface-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-5">
          {tipo === 'sugestao' ? (
            <div className="w-8 h-8 bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-brand/20 text-brand flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="text-text-primary font-bold text-lg leading-tight">
              {tipo === 'sugestao' ? 'Enviar Sugestão ou Melhoria' : 'Nova Publicação'}
            </h3>
            <p className="text-text-muted text-xs">
              {tipo === 'sugestao'
                ? 'Sua ideia será enviada diretamente para a análise da diretoria.'
                : 'Compartilhe avisos, comunicados e novidades com a equipe.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-text-muted text-xs font-medium block mb-1.5">Tipo da Publicação</label>
            <select
              value={tipo}
              onChange={(e) => {
                const newTipo = e.target.value as TipoMural;
                setTipo(newTipo);
                if (newTipo === 'sugestao') setAnonimo(true);
              }}
              className="input input-select"
            >
              {tiposOptions.filter((t) => t !== 'todos').map((t) => (
                <option key={t} value={t}>{tipoMuralLabel(t)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-text-muted text-xs font-medium block mb-1.5">
              {tipo === 'sugestao' ? 'Título da Sugestão / Melhoria *' : 'Título *'}
            </label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="input"
              placeholder={tipo === 'sugestao' ? 'Ex: Implementar reciclagem de pilhas no setor operacional' : 'Título da publicação...'}
            />
          </div>

          <div>
            <label className="text-text-muted text-xs font-medium block mb-1.5">
              {tipo === 'sugestao' ? 'Descrição detalhada da proposta de melhoria *' : 'Descrição *'}
            </label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="input resize-none"
              placeholder={tipo === 'sugestao' ? 'Explique os benefícios da sugestão para a empresa...' : 'Descreva o comunicado...'}
            />
          </div>

          {/* Opção de Envio Anônimo (para sugestões) */}
          {tipo === 'sugestao' && (
            <div className="p-3.5 bg-surface-2 border border-surface-border space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
                  className="w-4 h-4 text-brand rounded-none border-surface-border cursor-pointer"
                />
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Enviar de forma anônima
                </span>
              </label>
              <p className="text-[11px] text-text-muted leading-relaxed pl-6">
                {anonimo
                  ? 'Sua identidade será preservada. A publicação aparecerá como "Colaborador Anônimo" para o diretor.'
                  : 'Seu nome e cargo serão exibidos junto à sugestão.'}
              </p>
            </div>
          )}

          {(!anonimo || tipo !== 'sugestao') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Seu Nome</label>
                <input
                  value={autorNome}
                  onChange={(e) => setAutorNome(e.target.value)}
                  className="input"
                  placeholder="Nome do autor..."
                />
              </div>
              <div>
                <label className="text-text-muted text-xs font-medium block mb-1.5">Cargo / Setor</label>
                <input
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="input"
                  placeholder="Ex: Analista de Operações"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-text-muted text-xs font-medium block mb-1.5">Nível de Importância / Urgência</label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as Prioridade)}
              className="input input-select"
            >
              <option value="baixa">Baixa (Ideia para o futuro)</option>
              <option value="media">Média (Melhoria recomendada)</option>
              <option value="alta">Alta (Problema recorrente ou oportunidade crítica)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn-primary flex-1 justify-center ${tipo === 'sugestao' ? 'from-amber-600 to-amber-500' : ''}`}
            >
              {tipo === 'sugestao' ? 'Enviar Sugestão ao Diretor' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
