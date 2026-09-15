export type Prioridade = 'baixa' | 'media' | 'alta';
export type Status = 'nao_iniciada' | 'em_andamento' | 'concluida';
export type TipoMural = 'comunicado' | 'evento' | 'aviso_urgente' | 'meta' | 'mudanca';
export type TipoEvento = 'reuniao' | 'treinamento' | 'entrega' | 'evento';
export type TipoNotificacao = 'aviso' | 'tarefa' | 'prazo' | 'meta';

export interface Setor {
  id: string;
  nome: string;
  responsavel: string;
  avatar: string;
  colaboradores: number;
  demandasSemanais: number;
  demandasMensais: number;
  desempenho: number;
  cor: string;
  icone: string;
}

export interface Tarefa {
  id: string;
  nome: string;
  descricao: string;
  responsavel: string;
  avatarResponsavel: string;
  prazo: string;
  prioridade: Prioridade;
  status: Status;
  setorId: string;
  progresso?: number;
  tipo: 'semanal' | 'mensal';
  categoria?: string;
}

export interface PublicacaoMural {
  id: string;
  titulo: string;
  descricao: string;
  autor: string;
  avatarAutor: string;
  cargo: string;
  data: string;
  prioridade: Prioridade;
  tipo: TipoMural;
  curtidas: number;
  visualizacoes: number;
  fixado?: boolean;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  tipo: TipoEvento;
  cor?: string;
  descricao?: string;
  participantes?: string[];
  local?: string;
}

export interface Mensagem {
  id: string;
  remetenteId: string;
  remetente: string;
  avatar: string;
  texto: string;
  timestamp: string;
  lida: boolean;
  tipo?: 'normal' | 'aviso';
}

export interface Conversa {
  id: string;
  participante: string;
  avatar: string;
  cargo: string;
  ultimaMensagem: string;
  timestamp: string;
  naoLidas: number;
  mensagens: Mensagem[];
}

export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoNotificacao;
  timestamp: string;
  lida: boolean;
  link?: string;
}

export interface MetaMensal {
  id: string;
  nome: string;
  descricao: string;
  setorId: string;
  progresso: number;
  prazo: string;
  responsavel: string;
  categoria: 'meta' | 'projeto' | 'relatorio';
}
