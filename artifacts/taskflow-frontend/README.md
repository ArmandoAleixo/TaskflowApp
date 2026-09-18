# TaskFlow — Gerenciador de Tarefas Pessoais

Aplicação frontend desenvolvida em **React Native com Expo** para auxiliar usuários na organização de tarefas pessoais, com foco em simplicidade, clareza visual e responsividade entre dispositivos móveis e web.

---

## Contexto Acadêmico

Esta versão corresponde à **Fase 1** do projeto da disciplina, com foco exclusivo no desenvolvimento do frontend, interface de usuário e experiência mobile/web. Nesta fase, a aplicação utiliza **dados mockados** e **autenticação simulada** para demonstrar o fluxo completo de uso. A integração com backend e banco de dados está prevista para a **Fase 2**.

---

## Problema Identificado

No dia a dia, estudantes e profissionais enfrentam dificuldades para organizar tarefas, definir prioridades e acompanhar prazos. A falta de uma ferramenta simples e acessível leva à procrastinação, esquecimento de compromissos e baixa produtividade. O TaskFlow propõe uma solução leve, intuitiva e visualmente organizada para esse problema.

---

## Objetivo da Aplicação

Permitir que o usuário:

- Crie tarefas com título, descrição, prioridade, status e prazo
- Liste todas as tarefas em um dashboard central
- Visualize detalhes de cada tarefa individualmente
- Atualize o status de uma tarefa (Pendente → Em Andamento → Concluída)
- Filtre tarefas por status ou prioridade

---

## Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| React Native | Framework principal para UI multiplataforma |
| Expo | Ambiente de desenvolvimento, build e preview |
| TypeScript | Tipagem estática para maior segurança e manutenibilidade |
| React Navigation | Navegação entre telas com stack nativa |
| React Hooks (useState, useContext, useCallback) | Gerenciamento de estado local e global |
| Dados Mockados | Simulação de dados para demonstração da Fase 1 |

---

## Requisitos Obrigatórios

- Interface responsiva para **Web e Mobile**
- **Login simulado** com validação de campos
- **Cadastro simulado** com validação de campos
- **Navegação entre telas** com React Navigation
- **Organização modular do código** em pastas por responsabilidade

---

## Casos de Uso Principais

1. **Criar tarefa** — formulário completo com título, descrição, prioridade, status, categoria e prazo
2. **Listar tarefas** — dashboard com cards de resumo, lista scrollável e filtros dinâmicos
3. **Visualizar detalhes da tarefa** — tela dedicada com todas as informações da tarefa selecionada
4. **Atualizar status da tarefa** — botões rápidos para alternar entre Pendente, Em Andamento e Concluída
5. **Filtrar tarefas** — filtros por status (Todas, Pendentes, Em Andamento, Concluídas) e prioridade (Alta, Média, Baixa)

---

## Estrutura de Pastas

```
app/
  screens/        # Telas da aplicação (Welcome, Login, Register, Dashboard, CreateTask, TaskDetails)
  components/     # Componentes reutilizáveis (Button, Input, Header, TaskCard, FilterTabs, EmptyState, StatusBadge)
  navigation/     # Configuração do React Navigation e referências centralizadas
  context/        # Contextos globais (TaskContext, AuthContext)
  data/           # Dados mockados para a Fase 1
  styles/         # Tema, cores e estilos globais
  services/       # Serviços simulados (storageService placeholder para Fase 2)
```

---

## Telas da Aplicação

| Tela | Descrição |
|---|---|
| **WelcomeScreen** | Tela inicial com identidade visual, lista de recursos e ações de entrada |
| **LoginScreen** | Formulário de acesso simulado com validação de e-mail e senha |
| **RegisterScreen** | Formulário de cadastro simulado com validação de nome, e-mail e senha |
| **DashboardScreen** | Tela principal com saudação personalizada, estatísticas, filtros e lista de tarefas |
| **CreateTaskScreen** | Formulário para criação de nova tarefa com seleção de prioridade, status e categoria |
| **TaskDetailsScreen** | Tela de detalhes com informações completas da tarefa e opções de alterar status ou excluir |

---

## Planejamento para a Fase 2

A próxima fase do projeto prevê a integração com backend e persistência real:

- **Backend em Node.js** com Express para API REST
- **Banco de dados MongoDB** para armazenamento de tarefas e usuários
- **Autenticação real** com JWT (JSON Web Tokens)
- **Persistência de tarefas** — dados salvos no banco, não apenas em memória
- **Integração do frontend com API** — substituição dos dados mockados por requisições HTTP

---

## Como Executar o Projeto

O projeto está configurado para rodar no ambiente **Replit**.

### Pré-requisitos

- Node.js (gerenciado pelo Replit automaticamente)
- pnpm (gerenciador de pacotes do projeto)

### Instalação

```bash
# Na raiz do projeto (artifacts/taskflow)
pnpm install
```

### Execução

```bash
# Iniciar o servidor Expo
pnpm run dev
```

O comando acima inicia o Metro Bundler e disponibiliza a aplicação para preview web e mobile (via Expo Go).

---

## Informações Adicionais

- **Sem backend** — todos os dados são mockados e mantidos em memória durante a sessão
- **Sem banco de dados** — persistência será implementada na Fase 2
- **Sem autenticação real** — login e cadastro são simulados com validação de campos apenas
- **Responsividade** — layout adaptado para telas mobile (375px) e desktop (1280px+)

---

> Projeto acadêmico — Fase 1 — Interface Web & Mobile
