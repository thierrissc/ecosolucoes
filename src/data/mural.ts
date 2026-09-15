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
];
