# Eco Soluções - Plataforma de Gestão Corporativa

> Plataforma web corporativa e inteligente para gestão integrada de setores, demandas, mural de comunicação e relatórios de desempenho.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-18+-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>


## Sobre

O **Eco Soluções** é uma solução corporativa completa projetada para centralizar a operação interna de empresas. O sistema combina controle de produtividade por setor, planejamento semanal e mensal, relatórios gráficos com exportação e um canal direto de comunicação interna.

O projeto oferece suporte a múltiplos dispositivos simultâneos, permitindo que a liderança e os colaboradores acessem do celular ou computador mantendo os mesmos dados atualizados. Para novos visitantes, inclui um modo didático de demonstração que pode ser zerado a qualquer momento para uso corporativo real.



## Funcionalidades Principais

- **Dashboard em Tempo Real:** Indicadores-chave, resumo de demandas concluídas, prazos próximos e volume por setor.
- **Gestão de Setores:** Cadastro de departamentos corporativos, cores customizadas, indicadores de líderes e taxa de desempenho individual.
- **Demandas Semanais & Metas Mensais:** Acompanhamento de entregas por status (*Não Iniciada*, *Em Andamento*, *Concluída* e *Prazo Passado*), nível de prioridade e filtros dinâmicos.
- **Mural da Empresa & Canal de Sugestões:** Publicações corporativas com suporte a curtidas e aba dedicada a **Sugestões & Melhorias** para a diretoria, com opção de envio anônimo ou identificado.
- **Calendário Corporativo:** Visualização mensal de prazos, reuniões e eventos internos com marcações coloridas e seletor livre de cor.
- **Relatórios com Exportação em PDF:** Histórico comparativo de evolução mensal, distribuição de tarefas, ranking dos setores mais ativos e impressão pronta para PDF.
- **Perfil da Empresa & Upload Dinâmico:** Edição de dados cadastrais, cargo, arroba da empresa e gerenciamento de foto de perfil com opções diretas de carregar ou remover.
- **Tema Adaptável ao Navegador:** Detecção automática do modo escuro/claro do sistema operacional e botão manual para alternância rápida.



## Tecnologias Utilizadas

- **Core:** [Next.js](https://nextjs.org/) (App Router) & [React](https://react.dev/)
 **Ambiente de Execução:** [Node.js](https://nodejs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) & CSS Variables
- **Banco de Dados:** PostgreSQL Serverless com pooling de conexões
- **Autenticação:** Web Crypto API nativa (PBKDF2 + JWT assinado HMAC-SHA256 via Cookies HttpOnly)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)



## Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Git instalado

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/thierrissc/ecosolucoes.git

# 2. Acessar a pasta do projeto
cd ecosolucoes

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para visualizar a plataforma.



## Licença

Projeto desenvolvido para uso corporativo interno e gestão de produtividade. Todos os direitos reservados.
