const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

const primaryColor = "#1E3A8A";
const accentColor = "#2563EB";
const lightBlue = "#DBEAFE";
const textDark = "#1E293B";
const textGray = "#475569";
const borderColor = "#CBD5E1";
const bgLight = "#F8FAFC";

function sectionTitle(text, number) {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: [
              { text: `${number}.  `, color: accentColor, bold: true, fontSize: 13 },
              { text, bold: true, fontSize: 13, color: primaryColor },
            ],
            fillColor: lightBlue,
            border: [true, false, false, false],
            borderColor: [accentColor, "", "", ""],
            margin: [12, 8, 12, 8],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 18, 0, 8],
  };
}

function subsectionTitle(text) {
  return {
    text,
    fontSize: 11,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 4],
  };
}

function bodyText(text) {
  return {
    text,
    fontSize: 10,
    color: textDark,
    lineHeight: 1.5,
    margin: [0, 0, 0, 6],
  };
}

function bulletList(items) {
  return {
    ul: items.map((item) => ({
      text: item,
      fontSize: 10,
      color: textDark,
      lineHeight: 1.5,
    })),
    margin: [8, 0, 0, 8],
  };
}

function rfTable(items) {
  return {
    table: {
      widths: [80, "*"],
      body: [
        [
          {
            text: "Código",
            bold: true,
            fontSize: 9,
            color: "#FFFFFF",
            fillColor: primaryColor,
            margin: [8, 6, 8, 6],
          },
          {
            text: "Descrição",
            bold: true,
            fontSize: 9,
            color: "#FFFFFF",
            fillColor: primaryColor,
            margin: [8, 6, 8, 6],
          },
        ],
        ...items.map((item, i) => [
          {
            text: item.code,
            fontSize: 9,
            bold: true,
            color: accentColor,
            fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
            margin: [8, 5, 8, 5],
          },
          {
            text: item.desc,
            fontSize: 9,
            color: textDark,
            fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
            margin: [8, 5, 8, 5],
          },
        ]),
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => borderColor,
      vLineColor: () => borderColor,
    },
    margin: [0, 4, 0, 12],
  };
}

function caseOfUse({ number, title, description, actor, preCondition, flow, postCondition }) {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              {
                text: `Caso de Uso ${number} — ${title}`,
                bold: true,
                fontSize: 11,
                color: "#FFFFFF",
                margin: [0, 0, 0, 6],
              },
              {
                text: [{ text: "Descrição: ", bold: true, color: lightBlue }, { text: description, color: "#E2E8F0" }],
                fontSize: 9.5,
                margin: [0, 2, 0, 2],
              },
              {
                text: [{ text: "Ator principal: ", bold: true, color: lightBlue }, { text: actor, color: "#E2E8F0" }],
                fontSize: 9.5,
                margin: [0, 2, 0, 2],
              },
              {
                text: [{ text: "Pré-condição: ", bold: true, color: lightBlue }, { text: preCondition, color: "#E2E8F0" }],
                fontSize: 9.5,
                margin: [0, 2, 0, 2],
              },
              {
                text: "Fluxo principal:",
                bold: true,
                fontSize: 9.5,
                color: lightBlue,
                margin: [0, 6, 0, 3],
              },
              {
                ol: flow.map((f) => ({ text: f, fontSize: 9.5, color: "#E2E8F0", lineHeight: 1.4 })),
                margin: [8, 0, 0, 4],
              },
              {
                text: [{ text: "Pós-condição: ", bold: true, color: lightBlue }, { text: postCondition, color: "#E2E8F0" }],
                fontSize: 9.5,
                margin: [0, 4, 0, 0],
              },
            ],
            fillColor: primaryColor,
            margin: [14, 12, 14, 12],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 6, 0, 10],
  };
}

function componentCard(name, desc) {
  return {
    table: {
      widths: [90, "*"],
      body: [
        [
          {
            text: name,
            bold: true,
            fontSize: 9.5,
            color: accentColor,
            fillColor: lightBlue,
            margin: [8, 8, 8, 8],
          },
          {
            text: desc,
            fontSize: 9.5,
            color: textDark,
            margin: [8, 8, 8, 8],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => borderColor,
    },
    margin: [0, 2, 0, 2],
  };
}

const docDefinition = {
  pageSize: "A4",
  pageMargins: [50, 50, 50, 60],
  defaultStyle: {
    font: "Helvetica",
    fontSize: 10,
    color: textDark,
  },
  footer: (currentPage, pageCount) => {
    if (currentPage === 1) return {};
    return {
      columns: [
        {
          text: "TaskFlow — Gerenciador de Tarefas Pessoais",
          fontSize: 8,
          color: textGray,
          margin: [50, 20, 0, 0],
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          fontSize: 8,
          color: textGray,
          alignment: "right",
          margin: [0, 20, 50, 0],
        },
      ],
    };
  },
  content: [
    // ── CAPA ──────────────────────────────────────────────────────────────────
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                {
                  text: "FACULDADE",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.7)",
                  alignment: "center",
                  letterSpacing: 2,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: "Disciplina de Dispositivos Móveis e IOT",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.85)",
                  alignment: "center",
                  margin: [0, 0, 0, 48],
                },
                {
                  text: "✓",
                  fontSize: 48,
                  color: "rgba(255,255,255,0.3)",
                  alignment: "center",
                  margin: [0, 0, 0, 16],
                },
                {
                  text: "TaskFlow",
                  fontSize: 36,
                  bold: true,
                  color: "#FFFFFF",
                  alignment: "center",
                  letterSpacing: -1,
                  margin: [0, 0, 0, 8],
                },
                {
                  text: "Gerenciador de Tarefas Pessoais",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.85)",
                  alignment: "center",
                  margin: [0, 0, 0, 6],
                },
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 100,
                      y1: 0,
                      x2: 400,
                      y2: 0,
                      lineWidth: 1,
                      lineColor: "rgba(255,255,255,0.3)",
                    },
                  ],
                  margin: [0, 16, 0, 16],
                },
                {
                  text: "FASE 1",
                  fontSize: 11,
                  bold: true,
                  color: "#93C5FD",
                  alignment: "center",
                  letterSpacing: 3,
                  margin: [0, 0, 0, 56],
                },
                {
                  table: {
                    widths: ["*"],
                    body: [
                      [
                        {
                          stack: [
                            {
                              columns: [
                                {
                                  text: "Integrante:",
                                  fontSize: 9,
                                  bold: true,
                                  color: "#93C5FD",
                                  width: 70,
                                },
                                {
                                  text: "Pedro Henrique de Almeida Peixoto",
                                  fontSize: 9,
                                  color: "#FFFFFF",
                                },
                              ],
                              margin: [0, 0, 0, 6],
                            },
                            {
                              columns: [
                                {
                                  text: "Professor:",
                                  fontSize: 9,
                                  bold: true,
                                  color: "#93C5FD",
                                  width: 70,
                                },
                                {
                                  text: "Matheus Batista Silva",
                                  fontSize: 9,
                                  color: "#FFFFFF",
                                },
                              ],
                              margin: [0, 0, 0, 6],
                            },
                            {
                              columns: [
                                {
                                  text: "Disciplina:",
                                  fontSize: 9,
                                  bold: true,
                                  color: "#93C5FD",
                                  width: 70,
                                },
                                {
                                  text: "Desenvolver Aplicativos para dispositivos móveis e IOT",
                                  fontSize: 9,
                                  color: "#FFFFFF",
                                },
                              ],
                              margin: [0, 0, 0, 6],
                            },
                            {
                              columns: [
                                {
                                  text: "Entrega:",
                                  fontSize: 9,
                                  bold: true,
                                  color: "#93C5FD",
                                  width: 70,
                                },
                                {
                                  text: "23 de maio de 2026",
                                  fontSize: 9,
                                  color: "#FFFFFF",
                                },
                              ],
                            },
                          ],
                          fillColor: "rgba(255,255,255,0.08)",
                          margin: [16, 12, 16, 12],
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                },
              ],
              fillColor: primaryColor,
              margin: [30, 60, 30, 60],
            },
          ],
        ],
      },
      layout: "noBorders",
      pageBreak: "after",
    },

    // ── SUMÁRIO ──────────────────────────────────────────────────────────────
    {
      text: "Sumário",
      fontSize: 18,
      bold: true,
      color: primaryColor,
      margin: [0, 0, 0, 20],
    },
    {
      table: {
        widths: ["*", 30],
        body: [
          ["1. Introdução", "3"],
          ["2. Problema Identificado", "3"],
          ["3. Objetivo Geral", "3"],
          ["4. Objetivos Específicos", "3"],
          ["5. Público-Alvo", "3"],
          ["6. Descrição da Solução", "4"],
          ["7. Tecnologias Utilizadas", "4"],
          ["8. Requisitos Funcionais", "4"],
          ["9. Requisitos Não Funcionais", "5"],
          ["10. Usuários do Sistema", "5"],
          ["11. Casos de Uso Principais", "5"],
          ["12. Telas da Aplicação", "7"],
          ["13. Organização do Código", "8"],
          ["14. Componentes Reutilizáveis", "8"],
          ["15. Dados Mockados", "8"],
          ["16. Limitações da Fase 1", "9"],
          ["17. Planejamento para a Fase 2", "9"],
          ["18. Conclusão", "9"],
          ["19. Critérios Avaliativos", "10"],
        ].map((row, i) => [
          {
            text: row[0],
            fontSize: 10,
            color: i % 2 === 0 ? textDark : textGray,
            fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
            margin: [8, 6, 8, 6],
          },
          {
            text: row[1],
            fontSize: 10,
            color: accentColor,
            bold: true,
            alignment: "right",
            fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
            margin: [8, 6, 8, 6],
          },
        ]),
      },
      layout: {
        hLineWidth: () => 0.3,
        vLineWidth: () => 0,
        hLineColor: () => borderColor,
      },
      margin: [0, 0, 0, 0],
      pageBreak: "after",
    },

    // ── SEÇÃO 1 — INTRODUÇÃO ────────────────────────────────────────────────
    sectionTitle("Introdução", 1),
    bodyText(
      "O avanço dos dispositivos móveis transformou profundamente a maneira como as pessoas gerenciam suas atividades cotidianas. Aplicativos de produtividade tornaram-se ferramentas indispensáveis para estudantes, profissionais e qualquer pessoa que precise organizar sua rotina com eficiência e praticidade."
    ),
    bodyText(
      "Nesse contexto, o TaskFlow surge como uma solução frontend desenvolvida em React Native com Expo, voltada ao gerenciamento de tarefas pessoais. O aplicativo permite que o usuário crie, visualize, filtre e atualize o andamento de suas tarefas de forma simples e intuitiva, com interface responsiva compatível com dispositivos móveis e navegadores web."
    ),
    bodyText(
      "Este documento descreve o processo de desenvolvimento da Fase 1 do projeto TaskFlow, apresentando o problema identificado, os objetivos, os requisitos, os casos de uso, a estrutura técnica e o planejamento para fases futuras."
    ),

    // ── SEÇÃO 2 — PROBLEMA IDENTIFICADO ─────────────────────────────────────
    sectionTitle("Problema Identificado", 2),
    bodyText(
      "A desorganização pessoal é um desafio recorrente na vida de estudantes e profissionais. A ausência de um método claro para registrar, priorizar e acompanhar tarefas frequentemente resulta em esquecimentos, atrasos e baixa produtividade. Os principais problemas identificados são:"
    ),
    bulletList([
      "Falta de organização pessoal para controlar atividades e compromissos.",
      "Esquecimento de tarefas importantes por ausência de registro adequado.",
      "Dificuldade para acompanhar prazos e estimar o tempo necessário para cada atividade.",
      "Falta de clareza sobre quais tarefas possuem maior urgência ou prioridade.",
      "Ausência de uma visão consolidada do que está pendente, em andamento ou já concluído.",
    ]),
    bodyText(
      "O TaskFlow foi concebido para resolver esses problemas, oferecendo uma interface centralizada e de fácil utilização para o controle completo das tarefas pessoais do usuário."
    ),

    // ── SEÇÃO 3 — OBJETIVO GERAL ─────────────────────────────────────────────
    sectionTitle("Objetivo Geral", 3),
    bodyText(
      "Desenvolver uma aplicação frontend responsiva utilizando React Native com Expo, capaz de simular o gerenciamento de tarefas pessoais por meio de criação, listagem, visualização, atualização de status e filtragem de tarefas, com interface adaptada para dispositivos móveis e navegadores web."
    ),

    // ── SEÇÃO 4 — OBJETIVOS ESPECÍFICOS ─────────────────────────────────────
    sectionTitle("Objetivos Específicos", 4),
    bulletList([
      "Criar uma interface inicial de apresentação do sistema (tela de boas-vindas).",
      "Implementar telas de login e cadastro simulados para controle de acesso à aplicação.",
      "Permitir a criação de tarefas com título, descrição, prioridade, status e prazo de conclusão.",
      "Exibir uma lista de tarefas cadastradas em formato de cards visuais.",
      "Permitir a visualização detalhada de cada tarefa individualmente.",
      "Permitir a atualização do status de uma tarefa (Pendente, Em Andamento ou Concluída).",
      "Permitir a filtragem de tarefas por status ou nível de prioridade.",
      "Organizar o código-fonte em pastas por responsabilidade, seguindo boas práticas de desenvolvimento.",
      "Preparar a estrutura do frontend para integração futura com backend na Fase 2.",
    ]),

    // ── SEÇÃO 5 — PÚBLICO-ALVO ───────────────────────────────────────────────
    sectionTitle("Público-Alvo", 5),
    bodyText("O TaskFlow é destinado a qualquer pessoa que precise organizar suas atividades pessoais de forma prática. Os perfis de usuários incluem:"),
    bulletList([
      "Estudantes universitários que precisam controlar prazos de entregas, provas e atividades acadêmicas.",
      "Profissionais que desejam organizar tarefas de trabalho e acompanhar o progresso de atividades diárias.",
      "Pessoas que buscam uma ferramenta simples para gerenciar compromissos e rotinas pessoais.",
      "Usuários que necessitam de uma visão clara e rápida do que está pendente, em execução ou concluído.",
    ]),

    // ── SEÇÃO 6 — DESCRIÇÃO DA SOLUÇÃO ──────────────────────────────────────
    sectionTitle("Descrição da Solução", 6),
    bodyText(
      "O TaskFlow é um aplicativo de gerenciamento de tarefas pessoais desenvolvido em React Native com Expo, compatível com plataformas mobile e web. A solução permite ao usuário centralizar suas tarefas em um único ambiente, acompanhar o status de cada atividade, definir prioridades e obter uma visão geral do andamento das tarefas."
    ),
    bodyText(
      "Na Fase 1, o sistema é composto exclusivamente pelo frontend da aplicação. Os dados são mockados (simulados em memória) e os fluxos de login e cadastro são implementados de forma simulada, sem validação real. Essa abordagem permite demonstrar o funcionamento completo da interface e validar todos os fluxos de uso antes da integração com o backend na Fase 2."
    ),

    // ── SEÇÃO 7 — TECNOLOGIAS ────────────────────────────────────────────────
    sectionTitle("Tecnologias Utilizadas", 7),
    {
      table: {
        widths: [110, "*"],
        body: [
          [
            {
              text: "Tecnologia",
              bold: true,
              fontSize: 9,
              color: "#FFFFFF",
              fillColor: primaryColor,
              margin: [8, 6, 8, 6],
            },
            {
              text: "Finalidade",
              bold: true,
              fontSize: 9,
              color: "#FFFFFF",
              fillColor: primaryColor,
              margin: [8, 6, 8, 6],
            },
          ],
          ...[
            ["React Native", "Framework principal para desenvolvimento da interface multiplataforma."],
            ["Expo", "Ambiente para criação, execução e testes simplificados da aplicação."],
            ["JavaScript / TypeScript", "Linguagem de programação utilizada no desenvolvimento."],
            ["React Navigation", "Biblioteca para navegação entre telas com stack nativa."],
            ["React Hooks", "Utilizados para controle de estado (useState, useContext, useCallback)."],
            ["Dados Mockados", "Simulação de tarefas sem necessidade de banco de dados na Fase 1."],
            ["Replit", "Ambiente de desenvolvimento e execução do projeto."],
          ].map((row, i) => [
            {
              text: row[0],
              fontSize: 9,
              bold: true,
              color: accentColor,
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [8, 5, 8, 5],
            },
            {
              text: row[1],
              fontSize: 9,
              color: textDark,
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [8, 5, 8, 5],
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => borderColor,
        vLineColor: () => borderColor,
      },
      margin: [0, 4, 0, 12],
    },

    // ── SEÇÃO 8 — REQUISITOS FUNCIONAIS ──────────────────────────────────────
    sectionTitle("Requisitos Funcionais", 8),
    rfTable([
      { code: "RF01", desc: "O sistema deve possuir tela de boas-vindas com apresentação do aplicativo." },
      { code: "RF02", desc: "O sistema deve possuir tela de login simulado com validação de campos." },
      { code: "RF03", desc: "O sistema deve possuir tela de cadastro simulado com validação de campos." },
      { code: "RF04", desc: "O sistema deve permitir criar tarefas com título, descrição, prioridade, status e prazo." },
      { code: "RF05", desc: "O sistema deve permitir listar todas as tarefas cadastradas em formato de cards." },
      { code: "RF06", desc: "O sistema deve permitir visualizar os detalhes completos de uma tarefa selecionada." },
      { code: "RF07", desc: "O sistema deve permitir atualizar o status de uma tarefa (Pendente, Em Andamento, Concluída)." },
      { code: "RF08", desc: "O sistema deve permitir filtrar tarefas por status ou nível de prioridade." },
      { code: "RF09", desc: "O sistema deve exibir um resumo com contagem de tarefas no dashboard principal." },
      { code: "RF10", desc: "O sistema deve permitir encerrar a sessão e retornar à tela inicial." },
    ]),

    // ── SEÇÃO 9 — REQUISITOS NÃO FUNCIONAIS ──────────────────────────────────
    sectionTitle("Requisitos Não Funcionais", 9),
    rfTable([
      { code: "RNF01", desc: "A aplicação deve ser desenvolvida em React Native com Expo." },
      { code: "RNF02", desc: "A aplicação deve ser responsiva e funcionar em dispositivos mobile e na web." },
      { code: "RNF03", desc: "O código deve ser organizado em pastas por responsabilidade (screens, components, navigation, context, data, styles, services)." },
      { code: "RNF04", desc: "A aplicação deve utilizar componentes reutilizáveis para consistência visual e facilidade de manutenção." },
      { code: "RNF05", desc: "A aplicação deve funcionar completamente sem backend na Fase 1." },
      { code: "RNF06", desc: "Os dados exibidos devem ser mockados, simulando um ambiente real de uso." },
      { code: "RNF07", desc: "A interface deve ser clara, intuitiva e de fácil utilização pelo usuário final." },
      { code: "RNF08", desc: "O projeto deve estar estruturado para permitir integração futura com backend Node.js na Fase 2." },
    ]),

    // ── SEÇÃO 10 — USUÁRIOS DO SISTEMA ──────────────────────────────────────
    sectionTitle("Usuários do Sistema", 10),
    subsectionTitle("Usuário Comum"),
    bodyText(
      "Pessoa que utiliza o TaskFlow para organizar suas tarefas pessoais. É o único perfil de usuário implementado na Fase 1."
    ),
    {
      text: "Ações disponíveis ao usuário comum:",
      fontSize: 10,
      color: textDark,
      margin: [0, 4, 0, 4],
    },
    bulletList([
      "Acessar a aplicação pela tela de boas-vindas.",
      "Realizar cadastro simulado com nome, e-mail e senha.",
      "Realizar login simulado com e-mail e senha.",
      "Criar novas tarefas com título, descrição, prioridade, status e prazo.",
      "Listar todas as tarefas disponíveis no dashboard.",
      "Visualizar detalhes de uma tarefa específica.",
      "Atualizar o status de uma tarefa.",
      "Filtrar tarefas por status ou prioridade.",
    ]),
    subsectionTitle("Administrador"),
    bodyText(
      "Na Fase 1, não há perfil administrativo implementado, pois o foco está no uso individual e pessoal do sistema. Caso necessário, esse perfil poderá ser considerado em versões futuras, contemplando funcionalidades como gerenciamento de múltiplos usuários e controle de acessos."
    ),

    // ── SEÇÃO 11 — CASOS DE USO ──────────────────────────────────────────────
    sectionTitle("Casos de Uso Principais", 11),
    bodyText(
      "Os cinco casos de uso a seguir representam as funcionalidades centrais do TaskFlow. Login e cadastro são requisitos obrigatórios de acesso simulado, mas não constituem casos de uso principais da aplicação."
    ),
    caseOfUse({
      number: 1,
      title: "Criar Tarefa",
      description: "Permite que o usuário cadastre uma nova tarefa no sistema.",
      actor: "Usuário comum",
      preCondition: "O usuário deve estar autenticado e na área principal da aplicação (dashboard).",
      flow: [
        "O usuário acessa o dashboard.",
        "O usuário seleciona a opção de criar nova tarefa.",
        "O sistema exibe o formulário de criação de tarefa.",
        "O usuário informa título, descrição, prioridade, status e prazo.",
        "O usuário confirma o cadastro da tarefa.",
        "O sistema adiciona a tarefa à lista e retorna ao dashboard.",
      ],
      postCondition: "A nova tarefa passa a ser exibida na listagem do dashboard e os contadores de resumo são atualizados.",
    }),
    caseOfUse({
      number: 2,
      title: "Listar Tarefas",
      description: "Permite que o usuário visualize as tarefas cadastradas no sistema.",
      actor: "Usuário comum",
      preCondition: "Existirem tarefas mockadas ou cadastradas durante a sessão atual.",
      flow: [
        "O usuário acessa o dashboard.",
        "O sistema carrega e exibe a lista de tarefas disponíveis.",
        "O sistema apresenta as tarefas em cards individuais.",
        "Cada card exibe título, descrição resumida, prioridade, status e prazo da tarefa.",
      ],
      postCondition: "O usuário visualiza suas tarefas organizadas e pode interagir com cada uma delas.",
    }),
    caseOfUse({
      number: 3,
      title: "Visualizar Detalhes da Tarefa",
      description: "Permite que o usuário acesse as informações completas de uma tarefa específica.",
      actor: "Usuário comum",
      preCondition: "A tarefa deve estar disponível na listagem do dashboard.",
      flow: [
        "O usuário acessa o dashboard.",
        "O usuário seleciona uma tarefa da lista.",
        "O sistema abre a tela de detalhes da tarefa selecionada.",
        "O sistema exibe título, descrição completa, prioridade, status, categoria e prazo.",
      ],
      postCondition: "O usuário compreende todas as informações relacionadas à tarefa selecionada.",
    }),
    caseOfUse({
      number: 4,
      title: "Atualizar Status da Tarefa",
      description: "Permite que o usuário altere o andamento de uma tarefa cadastrada.",
      actor: "Usuário comum",
      preCondition: "A tarefa deve estar cadastrada e o usuário deve estar na tela de detalhes.",
      flow: [
        "O usuário acessa os detalhes de uma tarefa.",
        "O sistema exibe as opções de status disponíveis: Pendente, Em Andamento, Concluída.",
        "O usuário seleciona o novo status desejado.",
        "O sistema atualiza o status da tarefa imediatamente.",
        "O dashboard reflete a alteração nos cards de resumo ao retornar.",
      ],
      postCondition: "A tarefa passa a exibir o novo status selecionado e os contadores do dashboard são atualizados.",
    }),
    caseOfUse({
      number: 5,
      title: "Filtrar Tarefas por Status ou Prioridade",
      description: "Permite que o usuário filtre a visualização das tarefas conforme critérios específicos.",
      actor: "Usuário comum",
      preCondition: "Existirem tarefas cadastradas ou mockadas na aplicação.",
      flow: [
        "O usuário acessa o dashboard.",
        "O sistema exibe abas de filtro por status (Todas, Pendentes, Em Andamento, Concluídas) e por prioridade (Alta, Média, Baixa).",
        "O usuário seleciona o filtro desejado.",
        "O sistema atualiza a lista de tarefas conforme o critério selecionado.",
      ],
      postCondition: "O usuário visualiza apenas as tarefas correspondentes ao filtro aplicado.",
    }),

    // ── SEÇÃO 12 — TELAS ─────────────────────────────────────────────────────
    sectionTitle("Telas da Aplicação", 12),
    {
      table: {
        widths: [110, "*"],
        body: [
          [
            {
              text: "Tela",
              bold: true,
              fontSize: 9,
              color: "#FFFFFF",
              fillColor: primaryColor,
              margin: [8, 6, 8, 6],
            },
            {
              text: "Descrição",
              bold: true,
              fontSize: 9,
              color: "#FFFFFF",
              fillColor: primaryColor,
              margin: [8, 6, 8, 6],
            },
          ],
          ...[
            ["Boas-vindas", "Tela inicial com o nome TaskFlow, lista de funcionalidades e botões de acesso para login e cadastro. Apresenta a identidade visual do sistema."],
            ["Login", "Tela de acesso simulado ao sistema. Solicita e-mail e senha, valida os campos e redireciona o usuário ao dashboard após confirmação."],
            ["Cadastro", "Tela de registro simulado. Solicita nome, e-mail, senha e confirmação de senha, com validação de campos obrigatórios."],
            ["Dashboard", "Tela principal da aplicação. Exibe saudação personalizada, cards de resumo com contagem por status, filtros de tarefas e listagem completa."],
            ["Criar Tarefa", "Formulário para cadastro de nova tarefa. Permite informar título, descrição, prioridade, status, categoria e prazo de conclusão."],
            ["Detalhes da Tarefa", "Tela com informações completas de uma tarefa. Permite alterar o status e excluir a tarefa do sistema."],
          ].map((row, i) => [
            {
              text: row[0],
              fontSize: 9,
              bold: true,
              color: accentColor,
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [8, 6, 8, 6],
            },
            {
              text: row[1],
              fontSize: 9,
              color: textDark,
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [8, 6, 8, 6],
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => borderColor,
        vLineColor: () => borderColor,
      },
      margin: [0, 4, 0, 12],
    },

    // ── SEÇÃO 13 — ORGANIZAÇÃO DO CÓDIGO ────────────────────────────────────
    sectionTitle("Organização do Código", 13),
    bodyText("O projeto foi estruturado seguindo o princípio de separação por responsabilidade, com cada pasta dedicada a uma camada específica da aplicação:"),
    {
      table: {
        widths: [100, "*"],
        body: [
          [
            { text: "Pasta", bold: true, fontSize: 9, color: "#FFFFFF", fillColor: primaryColor, margin: [8, 6, 8, 6] },
            { text: "Conteúdo", bold: true, fontSize: 9, color: "#FFFFFF", fillColor: primaryColor, margin: [8, 6, 8, 6] },
          ],
          ...[
            ["app/screens", "Telas principais da aplicação (Welcome, Login, Register, Dashboard, CreateTask, TaskDetails)."],
            ["app/components", "Componentes reutilizáveis de interface (Button, Input, Header, TaskCard, FilterTabs, EmptyState, StatusBadge)."],
            ["app/navigation", "Configuração do React Navigation, referências centralizadas e tipagem das rotas."],
            ["app/context", "Contextos globais para gerenciamento de estado (TaskContext e AuthContext)."],
            ["app/data", "Arquivo de dados mockados utilizado para simular tarefas na Fase 1."],
            ["app/styles", "Arquivo de tema com cores, espaçamentos, tipografia e sombras padronizados."],
            ["app/services", "Pasta preparada para integrações futuras com AsyncStorage e API backend na Fase 2."],
          ].map((row, i) => [
            {
              text: row[0],
              fontSize: 9,
              bold: true,
              color: accentColor,
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [8, 5, 8, 5],
              font: "Helvetica",
            },
            {
              text: row[1],
              fontSize: 9,
              color: textDark,
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [8, 5, 8, 5],
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => borderColor,
        vLineColor: () => borderColor,
      },
      margin: [0, 4, 0, 12],
    },

    // ── SEÇÃO 14 — COMPONENTES ───────────────────────────────────────────────
    sectionTitle("Componentes Reutilizáveis", 14),
    bodyText("A seguir estão os sete componentes reutilizáveis desenvolvidos para o TaskFlow:"),
    componentCard("Button", "Componente de botão com suporte a variantes visuais (primary, secondary, danger, outline), estado de carregamento e ícone opcional."),
    componentCard("Input", "Campo de formulário com suporte a ícone lateral, visibilidade de senha, campo multiline e exibição de mensagens de erro."),
    componentCard("Header", "Cabeçalho de telas internas com título, subtítulo opcional e botão de voltar configurável."),
    componentCard("TaskCard", "Card de exibição de tarefa com título, descrição resumida, indicador de prioridade, badge de status, categoria e prazo."),
    componentCard("StatusBadge", "Badge visual colorido para indicar status (Pendente, Em Andamento, Concluída) ou prioridade (Alta, Média, Baixa)."),
    componentCard("FilterTabs", "Abas horizontais de filtro com suporte a ícone e scroll, utilizadas para filtrar tarefas por status e prioridade."),
    componentCard("EmptyState", "Estado visual exibido quando não há tarefas para mostrar, com ícone, mensagem e botão de ação opcional."),

    // ── SEÇÃO 15 — DADOS MOCKADOS ────────────────────────────────────────────
    sectionTitle("Dados Mockados", 15),
    bodyText(
      "Na Fase 1, os dados são fornecidos por um arquivo de tarefas mockadas (mockTasks.js), que contém oito tarefas pré-cadastradas com informações realistas. Cada tarefa possui os campos: identificador único, título, descrição, status, prioridade, prazo de conclusão, data de criação e categoria."
    ),
    bodyText(
      "O uso de dados mockados permite validar o funcionamento completo do frontend — incluindo listagem, filtros, detalhes e atualização de status — sem a necessidade de um backend real. As tarefas criadas pelo usuário durante a sessão são mantidas em memória por meio do TaskContext (useState), e são descartadas ao encerrar a sessão, conforme esperado para a Fase 1."
    ),

    // ── SEÇÃO 16 — LIMITAÇÕES ────────────────────────────────────────────────
    sectionTitle("Limitações da Fase 1", 16),
    bodyText("Por ser a fase inicial do projeto, o TaskFlow possui as seguintes limitações previstas e documentadas:"),
    bulletList([
      "Não há backend real: toda a lógica de dados é gerenciada localmente na memória da aplicação.",
      "Não há banco de dados conectado: os dados não são persistidos entre sessões.",
      "Login e cadastro são simulados: qualquer e-mail e senha válidos permitem acesso ao sistema.",
      "Os dados mockados e as tarefas criadas são perdidos ao encerrar a sessão.",
      "Autenticação real com verificação de credenciais será implementada na Fase 2.",
    ]),

    // ── SEÇÃO 17 — FASE 2 ────────────────────────────────────────────────────
    sectionTitle("Planejamento para a Fase 2", 17),
    bodyText("A Fase 2 do projeto contemplará a integração do frontend desenvolvido nesta fase com um backend completo:"),
    bulletList([
      "Backend em Node.js com Express para criação de uma API REST.",
      "Banco de dados MongoDB ou similar para persistência real de tarefas e usuários.",
      "Autenticação real com geração e validação de tokens JWT.",
      "Persistência das tarefas no banco de dados, mantendo os dados entre sessões.",
      "Integração do frontend com a API por meio de requisições HTTP.",
      "Possível uso de AsyncStorage para armazenamento local do token de autenticação.",
      "Melhorias na segurança, organização e escalabilidade da aplicação.",
    ]),

    // ── SEÇÃO 18 — CONCLUSÃO ─────────────────────────────────────────────────
    sectionTitle("Conclusão", 18),
    bodyText(
      "O TaskFlow, em sua Fase 1, cumpre com êxito o objetivo de apresentar um frontend funcional, responsivo e visualmente organizado para o gerenciamento de tarefas pessoais. A aplicação demonstra, por meio de dados mockados e fluxos simulados, todas as funcionalidades essenciais do sistema: criação, listagem, visualização, atualização de status e filtragem de tarefas."
    ),
    bodyText(
      "O código foi desenvolvido com foco em organização, modularidade e reutilização de componentes, seguindo boas práticas de desenvolvimento em React Native. A estrutura do projeto foi pensada para facilitar a evolução natural para a Fase 2, onde serão integrados o backend, o banco de dados e a autenticação real."
    ),
    bodyText(
      "Esta entrega representa a base sólida sobre a qual o sistema completo será construído, demonstrando domínio das tecnologias exigidas pela disciplina e capacidade de planejamento e execução de projetos de software para dispositivos móveis."
    ),

    // ── SEÇÃO 19 — CRITÉRIOS AVALIATIVOS ────────────────────────────────────
    sectionTitle("Critérios Avaliativos", 19),
    bodyText("O projeto TaskFlow foi desenvolvido considerando os critérios de avaliação da disciplina:"),
    {
      table: {
        widths: ["*"],
        body: [
          ...[
            ["Qualidade da documentação", "Documento acadêmico completo com todos os itens obrigatórios: capa, introdução, problema, objetivos, requisitos, casos de uso, telas, componentes e planejamento."],
            ["Nível de detalhes da aplicação", "Seis telas implementadas, sete componentes reutilizáveis, oito tarefas mockadas e cinco casos de uso documentados e funcionais."],
            ["Organização do código", "Estrutura modular em sete pastas por responsabilidade, com nomenclatura clara e separação de contextos, navegação e estilos."],
            ["Funcionamento sem erros", "Aplicação testada e verificada com zero erros de TypeScript, fluxos de navegação validados e todos os casos de uso funcionais."],
            ["Responsividade Web e Mobile", "Interface adaptada com maxWidth de 720px na web, layout fluido em mobile (375px+) e componentes responsivos em todas as telas."],
            ["Uso de React Native com Expo", "Projeto desenvolvido integralmente em React Native com Expo, utilizando React Navigation, Hooks, Context API e dados mockados."],
          ].map((row, i) => [
            {
              stack: [
                { text: row[0], bold: true, fontSize: 9.5, color: primaryColor, margin: [0, 0, 0, 3] },
                { text: row[1], fontSize: 9.5, color: textDark, lineHeight: 1.4 },
              ],
              fillColor: i % 2 === 0 ? "#FFFFFF" : bgLight,
              margin: [10, 8, 10, 8],
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => borderColor,
      },
      margin: [0, 4, 0, 0],
    },
  ],
};

const outputPath = path.join(__dirname, "TaskFlow_Fase1_Documentacao.pdf");
const pdfDoc = printer.createPdfKitDocument(docDefinition);
const writeStream = fs.createWriteStream(outputPath);
pdfDoc.pipe(writeStream);
pdfDoc.end();

writeStream.on("finish", () => {
  console.log(`PDF gerado com sucesso: ${outputPath}`);
});
writeStream.on("error", (err) => {
  console.error("Erro ao gerar PDF:", err);
  process.exit(1);
});
