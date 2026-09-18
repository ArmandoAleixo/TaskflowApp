# TaskFlow — Gerenciador de Tarefas Pessoais

> Projeto acadêmico desenvolvido para a disciplina **Desenvolver Aplicativos para Dispositivos Móveis e IOT**  
> Instituição: **Unifacisa** | Professor: **Matheus Batista Silva**

---

## Integrantes

| Nome |
|------|
| Pedro Henrique de Almeida Peixoto |
| Marcos Marinho Segundo |
| Armando Aleixo |
| Samuel Soares |
| João Victor Silva Guedes |

---

## Sobre o Projeto

O **TaskFlow** é uma aplicação mobile e web de gerenciamento de tarefas pessoais, desenvolvida em **React Native com Expo**. A proposta é oferecer ao usuário uma interface simples, responsiva e visualmente organizada para criar, listar, filtrar e acompanhar suas tarefas do dia a dia.

Esta entrega corresponde à **Fase 1** do projeto, com foco no desenvolvimento completo do frontend. Os dados são mockados e a autenticação é simulada. A integração com backend e banco de dados está prevista para a **Fase 2**.

---

## Telas da Aplicação

| Tela | Descrição |
|------|-----------|
| **Boas-vindas** | Tela inicial com identidade visual do app e opções de Login e Cadastro |
| **Login** | Acesso simulado com validação de e-mail e senha |
| **Cadastro** | Registro simulado com validação de nome, e-mail e senha |
| **Dashboard** | Tela principal com saudação, cards de resumo por status, filtros e lista de tarefas |
| **Criar Tarefa** | Formulário completo para nova tarefa: título, descrição, prioridade, status, categoria e prazo |
| **Detalhes da Tarefa** | Informações completas da tarefa com opções de alterar status e excluir |

---

## Funcionalidades

- Criar tarefas com título, descrição, prioridade, status e prazo
- Listar tarefas em formato de cards no dashboard
- Visualizar detalhes completos de uma tarefa
- Atualizar o status da tarefa: **Pendente → Em Andamento → Concluída**
- Filtrar tarefas por **status** (Todas, Pendente, Em Andamento, Concluída) e **prioridade** (Alta, Média, Baixa)
- Interface responsiva para **mobile e web**

---

## Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| React Native | Framework principal para UI multiplataforma |
| Expo | Ambiente de desenvolvimento, build e preview |
| TypeScript | Tipagem estática para segurança e manutenibilidade |
| React Navigation | Navegação entre telas com stack nativa |
| React Context API | Gerenciamento de estado global (TaskContext, AuthContext) |
| React Hooks | Controle de estado local (useState, useCallback, useContext) |
| Dados Mockados | Simulação de dados reais para a Fase 1 |

---

## Estrutura de Pastas

```
artifacts/taskflow/
├── App.tsx                   # Ponto de entrada da aplicação
├── app/
│   ├── screens/              # Telas da aplicação
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── create-task.tsx
│   │   └── task-details.tsx
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Header.tsx
│   │   ├── TaskCard.tsx
│   │   ├── FilterTabs.tsx
│   │   ├── StatusBadge.tsx
│   │   └── EmptyState.tsx
│   ├── navigation/           # Configuração do React Navigation
│   ├── context/              # Contextos globais (Auth e Tasks)
│   ├── data/                 # Dados mockados (mockTasks.js)
│   ├── styles/               # Tema, cores e espaçamentos
│   └── services/             # Placeholder para integração futura
├── assets/
│   └── screenshots/          # Prints reais das telas da aplicação
└── scripts/
    └── generate-pdf-v2.cjs   # Script de geração da documentação PDF
```

---

## Casos de Uso Principais

1. **Criar Tarefa** — O usuário preenche o formulário e a tarefa é adicionada ao dashboard
2. **Listar Tarefas** — O dashboard exibe todas as tarefas em cards com informações resumidas
3. **Visualizar Detalhes** — O usuário acessa a tela de detalhes de uma tarefa específica
4. **Atualizar Status** — O usuário altera o status diretamente na tela de detalhes
5. **Filtrar Tarefas** — O usuário filtra a listagem por status ou prioridade

---

## Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Instalação

```bash
# Instalar dependências do workspace
pnpm install
```

### Executar a aplicação

```bash
# Iniciar o servidor Expo (mobile + web)
pnpm --filter @workspace/taskflow run dev
```

A aplicação ficará disponível no navegador e também via **Expo Go** no celular (escaneando o QR Code exibido no terminal).

---

## Documentação

A documentação completa da Fase 1 está disponível em:

```
TaskFlow_Fase1_Documentacao_Revisada.pdf
```

O documento contém: capa, sumário, introdução, problema identificado, objetivos, público-alvo, descrição da solução, tecnologias, requisitos funcionais e não funcionais, usuários do sistema, casos de uso com prints reais, telas da aplicação, organização do código, componentes reutilizáveis, dados mockados, limitações da Fase 1, planejamento para a Fase 2, conclusão e critérios avaliativos.

---

## Limitações da Fase 1

- Sem backend real — dados mantidos em memória durante a sessão
- Sem banco de dados — persistência será implementada na Fase 2
- Sem autenticação real — login e cadastro são simulados
- Dados perdidos ao encerrar a sessão

---

## Planejamento para a Fase 2

- Backend em **Node.js** com Express (API REST)
- Banco de dados **MongoDB** para persistência de dados
- **Autenticação real** com JWT
- Integração do frontend com a API via requisições HTTP
- Uso de **AsyncStorage** para cache local do token

---

> **Fase 1 — Interface Web & Mobile** | Entrega: 23 de maio de 2026
