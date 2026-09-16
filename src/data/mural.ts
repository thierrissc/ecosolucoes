import { PublicacaoMural } from '@/types';

export const publicacoes: PublicacaoMural[] = [
  {
    id: 'p1',
    titulo: 'Boas-vindas ao Mural Corporativo EcoSoluções',
    descricao: 'Este é um exemplo de publicação institucional no mural da empresa. Aqui a equipe pode compartilhar avisos, metas, eventos e comunicados importantes. Você pode fixar, desfixar ou excluir esta publicação.',
    autor: 'Diretoria / Comunicação',
    avatarAutor: 'ES',
    cargo: 'Comunicação Interna',
    data: '2026-09-15',
    prioridade: 'media',
    tipo: 'comunicado',
    curtidas: 1,
    visualizacoes: 12,
    fixado: true,
  },
  {
    id: 'p2',
    titulo: 'Sugestão: Digitalização de relatórios impressos para redução de custos',
    descricao: 'Propomos substituir a impressão semanal dos relatórios financeiros por dashboards digitais no próprio sistema Eco Soluções. Isso reduz custos com papel e agiliza a tomada de decisão da diretoria.',
    autor: 'Colaborador Anônimo',
    avatarAutor: 'AN',
    cargo: 'Sugestão para a Diretoria',
    data: '2026-09-16',
    prioridade: 'alta',
    tipo: 'sugestao',
    curtidas: 4,
    visualizacoes: 18,
    anonimo: true,
    statusSugestao: 'em_analise',
  },
];
