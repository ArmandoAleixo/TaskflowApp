const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1E3A8A",
  accent:      "#2563EB",
  lightBlue:   "#DBEAFE",
  textDark:    "#1E293B",
  textGray:    "#475569",
  textMuted:   "#94A3B8",
  border:      "#CBD5E1",
  bgLight:     "#F8FAFC",
  white:       "#FFFFFF",
};

// Page dimensions (A4)
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ── HELPERS ──────────────────────────────────────────────────────────────────
function fillRect(doc, x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}
function drawLine(doc, x1, y1, x2, y2, color, lw) {
  doc.save().moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(lw || 0.5).stroke().restore();
}

// ── TABLE ─────────────────────────────────────────────────────────────────────
function drawTable(doc, x, y, colWidths, rows) {
  let curY = y;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  rows.forEach((row, ri) => {
    const rowH = row.height || 24;
    let curX = x;
    // measure if we need to go to next page
    if (curY + rowH > PAGE_H - 70 && ri > 0) {
      addPageFooter(doc);
      doc.addPage();
      pageNum++;
      fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
      curY = MARGIN;
    }
    row.cells.forEach((cell, ci) => {
      const w = colWidths[ci];
      const bg = cell.bg || (ri === 0 ? C.primary : ri % 2 === 0 ? C.white : C.bgLight);
      fillRect(doc, curX, curY, w, rowH, bg);
      doc.save()
        .font(cell.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(cell.fontSize || 9)
        .fillColor(cell.color || C.textDark)
        .text(cell.text, curX + 8, curY + 7, { width: w - 16, lineBreak: true })
        .restore();
      curX += w;
    });
    drawLine(doc, x, curY + rowH, x + totalW, curY + rowH, C.border);
    curY += rowH;
  });
  doc.save().rect(x, y, totalW, curY - y).strokeColor(C.border).lineWidth(0.5).stroke().restore();
  return curY;
}

// ── SECTION TITLE ─────────────────────────────────────────────────────────────
function sectionTitle(doc, num, title) {
  if (doc.y + 60 > PAGE_H - 70) {
    addPageFooter(doc);
    doc.addPage();
    pageNum++;
    fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
    doc.y = MARGIN;
  }
  const y = doc.y + 14;
  fillRect(doc, MARGIN, y, CONTENT_W, 26, C.lightBlue);
  fillRect(doc, MARGIN, y, 4, 26, C.accent);
  doc.save()
    .font("Helvetica-Bold").fontSize(11.5).fillColor(C.primary)
    .text(`${num}.  ${title}`, MARGIN + 14, y + 7)
    .restore();
  doc.y = y + 32;
}

// ── BODY TEXT ────────────────────────────────────────────────────────────────
function bodyText(doc, text) {
  if (doc.y + 40 > PAGE_H - 70) {
    addPageFooter(doc);
    doc.addPage();
    pageNum++;
    fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
    doc.y = MARGIN;
  }
  doc.save()
    .font("Helvetica").fontSize(9.5).fillColor(C.textDark)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, align: "justify", lineGap: 2 })
    .restore();
  doc.y += 6;
}

// ── BULLET LIST ───────────────────────────────────────────────────────────────
function bulletList(doc, items) {
  items.forEach((item) => {
    if (doc.y + 20 > PAGE_H - 70) {
      addPageFooter(doc);
      doc.addPage();
      pageNum++;
      fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
      doc.y = MARGIN;
    }
    const y = doc.y;
    doc.save().circle(MARGIN + 10, y + 5.5, 2.5).fill(C.accent).restore();
    doc.save()
      .font("Helvetica").fontSize(9.5).fillColor(C.textDark)
      .text(item, MARGIN + 20, y, { width: CONTENT_W - 20, lineGap: 2 })
      .restore();
    doc.y += 4;
  });
  doc.y += 4;
}

// ── SUBSECTION ────────────────────────────────────────────────────────────────
function subsection(doc, title) {
  doc.y += 6;
  doc.save()
    .font("Helvetica-Bold").fontSize(10.5).fillColor(C.primary)
    .text(title, MARGIN, doc.y)
    .restore();
  doc.y += 6;
}

// ── CASE OF USE BOX ───────────────────────────────────────────────────────────
function caseOfUseBox(doc, num, title, description, actor, pre, flow, post) {
  // estimate height
  const approxH = 200;
  if (doc.y + approxH > PAGE_H - 70) {
    addPageFooter(doc);
    doc.addPage();
    pageNum++;
    fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
    doc.y = MARGIN;
  }

  const startY = doc.y + 6;
  const boxX = MARGIN;
  const boxW = CONTENT_W;
  const headerH = 26;
  const indent = 12;
  const textW = boxW - 24;

  // header
  fillRect(doc, boxX, startY, boxW, headerH, C.primary);
  doc.save()
    .font("Helvetica-Bold").fontSize(10.5).fillColor(C.white)
    .text(`Caso de Uso ${num} — ${title}`, boxX + 12, startY + 8, { width: boxW - 24 })
    .restore();

  // body background
  fillRect(doc, boxX, startY + headerH, boxW, 600, "#EFF6FF");

  doc.y = startY + headerH + 10;

  function infoLine(label, value) {
    const sy = doc.y;
    doc.save()
      .font("Helvetica-Bold").fontSize(9).fillColor(C.accent)
      .text(label + " ", boxX + indent, sy, { continued: true })
      .font("Helvetica").fillColor(C.textDark)
      .text(value, { width: textW })
      .restore();
    doc.y += 3;
  }

  infoLine("Descrição:", description);
  infoLine("Ator principal:", actor);
  infoLine("Pré-condição:", pre);

  doc.save()
    .font("Helvetica-Bold").fontSize(9).fillColor(C.accent)
    .text("Fluxo principal:", boxX + indent, doc.y)
    .restore();
  doc.y += 4;

  flow.forEach((step, i) => {
    doc.save()
      .font("Helvetica").fontSize(9).fillColor(C.textDark)
      .text(`${i + 1}.  ${step}`, boxX + indent + 10, doc.y, { width: textW - 10, lineGap: 2 })
      .restore();
    doc.y += 2;
  });
  doc.y += 2;
  infoLine("Pós-condição:", post);

  const endY = doc.y + 10;

  // trim and re-draw background to actual height
  fillRect(doc, boxX, startY + headerH, boxW, endY - startY - headerH, "#EFF6FF");

  // border
  doc.save().rect(boxX, startY, boxW, endY - startY).strokeColor(C.accent).lineWidth(0.7).stroke().restore();
  // left bar
  fillRect(doc, boxX, startY + headerH, 4, endY - startY - headerH, C.accent);

  doc.y = endY + 10;
}

// ── COMPONENT ROW ─────────────────────────────────────────────────────────────
function componentCard(doc, name, desc) {
  if (doc.y + 28 > PAGE_H - 70) {
    addPageFooter(doc);
    doc.addPage();
    pageNum++;
    fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
    doc.y = MARGIN;
  }
  const y = doc.y;
  const nameW = 100;
  const descW = CONTENT_W - nameW;
  const rowH = 26;
  fillRect(doc, MARGIN, y, nameW, rowH, C.lightBlue);
  fillRect(doc, MARGIN + nameW, y, descW, rowH, C.white);
  doc.save()
    .font("Helvetica-Bold").fontSize(9).fillColor(C.accent)
    .text(name, MARGIN + 8, y + 8, { width: nameW - 16 })
    .restore();
  doc.save()
    .font("Helvetica").fontSize(9).fillColor(C.textDark)
    .text(desc, MARGIN + nameW + 8, y + 8, { width: descW - 16 })
    .restore();
  drawLine(doc, MARGIN, y + rowH, MARGIN + CONTENT_W, y + rowH, C.border);
  doc.y = y + rowH + 2;
}

// ── REQUIREMENTS TABLE ─────────────────────────────────────────────────────────
function reqTable(doc, items) {
  const codeW = 72;
  const descW = CONTENT_W - codeW;
  const rows = [
    { height: 22, cells: [{ text: "Código", bold: true, color: C.white, bg: C.primary }, { text: "Descrição", bold: true, color: C.white, bg: C.primary }] },
    ...items.map((item, i) => ({
      height: 22,
      cells: [
        { text: item.code, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight },
        { text: item.desc, color: C.textDark, bg: i % 2 === 0 ? C.white : C.bgLight },
      ],
    })),
  ];
  doc.y = drawTable(doc, MARGIN, doc.y, [codeW, descW], rows) + 10;
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
let pageNum = 0;
function addPageFooter(doc) {
  if (pageNum <= 1) return;
  const y = PAGE_H - 40;
  drawLine(doc, MARGIN, y, PAGE_W - MARGIN, y, C.border, 0.5);
  doc.save()
    .font("Helvetica").fontSize(7.5).fillColor(C.textMuted)
    .text("TaskFlow — Gerenciador de Tarefas Pessoais | Pedro Henrique de Almeida Peixoto", MARGIN, y + 7, { width: CONTENT_W - 60 })
    .restore();
  doc.save()
    .font("Helvetica-Bold").fontSize(7.5).fillColor(C.accent)
    .text(`${pageNum - 1}`, PAGE_W - MARGIN - 20, y + 7, { align: "right", width: 20 })
    .restore();
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const doc = new PDFDocument({
  size: "A4",
  margins: { top: MARGIN, bottom: 60, left: MARGIN, right: MARGIN },
  bufferPages: true,
  info: {
    Title: "TaskFlow — Documentação Fase 1",
    Author: "Pedro Henrique de Almeida Peixoto",
    Subject: "Disciplina: Desenvolver Aplicativos para dispositivos móveis e IOT",
    Creator: "TaskFlow Academic Project",
  },
});

const outPath = path.join(__dirname, "..", "TaskFlow_Fase1_Documentacao.pdf");
const stream = fs.createWriteStream(outPath);
doc.pipe(stream);
doc.on("pageAdded", () => { pageNum++; });
pageNum = 1;

// ══════════════════════════════════════════════════════════════════════════════
// CAPA
// ══════════════════════════════════════════════════════════════════════════════
fillRect(doc, 0, 0, PAGE_W, PAGE_H * 0.6, C.primary);
fillRect(doc, 0, PAGE_H * 0.6, PAGE_W, PAGE_H * 0.4, "#1E40AF");
// decorative circles
doc.save().circle(PAGE_W - 70, 90, 130).fillOpacity(0.06).fill(C.white).restore();
doc.save().circle(70, PAGE_H - 110, 100).fillOpacity(0.05).fill(C.white).restore();

// top label
doc.save()
  .font("Helvetica").fontSize(8).fillColor("rgba(255,255,255,0.6)")
  .text("FACULDADE — PROJETO ACADÊMICO", 0, 48, { align: "center", width: PAGE_W, characterSpacing: 2 })
  .restore();
doc.save()
  .font("Helvetica").fontSize(9.5).fillColor("rgba(255,255,255,0.78)")
  .text("Desenvolver Aplicativos para Dispositivos Móveis e IOT", 0, 65, { align: "center", width: PAGE_W })
  .restore();

// icon box
const iconY = 150;
fillRect(doc, PAGE_W / 2 - 40, iconY, 80, 80, "rgba(255,255,255,0.13)");
doc.save()
  .font("Helvetica-Bold").fontSize(42).fillColor("rgba(255,255,255,0.88)")
  .text("✓", PAGE_W / 2 - 22, iconY + 16)
  .restore();

// app name
doc.save()
  .font("Helvetica-Bold").fontSize(42).fillColor(C.white)
  .text("TaskFlow", 0, iconY + 96, { align: "center", width: PAGE_W })
  .restore();
doc.save()
  .font("Helvetica").fontSize(14).fillColor("rgba(255,255,255,0.82)")
  .text("Gerenciador de Tarefas Pessoais", 0, iconY + 148, { align: "center", width: PAGE_W })
  .restore();

// divider
const divY = iconY + 184;
doc.save().moveTo(PAGE_W / 2 - 150, divY).lineTo(PAGE_W / 2 + 150, divY)
  .strokeColor("rgba(255,255,255,0.22)").lineWidth(1).stroke().restore();

// fase badge
const bx = PAGE_W / 2 - 48, by = divY + 16;
fillRect(doc, bx, by, 96, 26, "rgba(255,255,255,0.13)");
doc.save()
  .font("Helvetica-Bold").fontSize(10.5).fillColor("#93C5FD")
  .text("FASE  1", bx, by + 8, { align: "center", width: 96, characterSpacing: 3 })
  .restore();

// info card
const cardX = PAGE_W / 2 - 210, cardY = by + 58, cardW = 420;
fillRect(doc, cardX, cardY, cardW, 108, "rgba(255,255,255,0.09)");
doc.save().rect(cardX, cardY, cardW, 108).strokeColor("rgba(255,255,255,0.18)").lineWidth(0.8).stroke().restore();

[
  ["Integrante", "Pedro Henrique de Almeida Peixoto"],
  ["Professor", "Matheus Batista Silva"],
  ["Disciplina", "Dispositivos Móveis e IOT"],
  ["Entrega", "23 de maio de 2026"],
].forEach(([label, value], i) => {
  const iy = cardY + 13 + i * 22;
  doc.save()
    .font("Helvetica-Bold").fontSize(8.5).fillColor("#93C5FD")
    .text(label + ":", cardX + 16, iy, { continued: true, width: 76 })
    .font("Helvetica").fillColor(C.white)
    .text("  " + value, { width: cardW - 100 })
    .restore();
});

// ══════════════════════════════════════════════════════════════════════════════
// SUMÁRIO
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

doc.save().font("Helvetica-Bold").fontSize(20).fillColor(C.primary).text("Sumário", MARGIN, doc.y).restore();
doc.y += 24;

[
  ["1.", "Introdução"],
  ["2.", "Problema Identificado"],
  ["3.", "Objetivo Geral"],
  ["4.", "Objetivos Específicos"],
  ["5.", "Público-Alvo"],
  ["6.", "Descrição da Solução"],
  ["7.", "Tecnologias Utilizadas"],
  ["8.", "Requisitos Funcionais"],
  ["9.", "Requisitos Não Funcionais"],
  ["10.", "Usuários do Sistema"],
  ["11.", "Casos de Uso Principais"],
  ["12.", "Telas da Aplicação"],
  ["13.", "Organização do Código"],
  ["14.", "Componentes Reutilizáveis"],
  ["15.", "Dados Mockados"],
  ["16.", "Limitações da Fase 1"],
  ["17.", "Planejamento para a Fase 2"],
  ["18.", "Conclusão"],
  ["19.", "Critérios Avaliativos"],
].forEach(([num, title], i) => {
  const ty = doc.y;
  fillRect(doc, MARGIN, ty, CONTENT_W, 20, i % 2 === 0 ? C.white : C.bgLight);
  doc.save().font("Helvetica-Bold").fontSize(9.5).fillColor(C.accent).text(num, MARGIN + 8, ty + 6, { width: 26 }).restore();
  doc.save().font("Helvetica").fontSize(9.5).fillColor(C.textDark).text(title, MARGIN + 34, ty + 6, { width: CONTENT_W - 50 }).restore();
  drawLine(doc, MARGIN, ty + 20, MARGIN + CONTENT_W, ty + 20, C.border);
  doc.y = ty + 20;
});

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 1 — INTRODUÇÃO
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 1, "Introdução");
bodyText(doc, "O avanço dos dispositivos móveis transformou profundamente a maneira como as pessoas gerenciam suas atividades cotidianas. Aplicativos de produtividade tornaram-se ferramentas indispensáveis para estudantes, profissionais e qualquer pessoa que necessite organizar sua rotina com eficiência e praticidade.");
bodyText(doc, "Nesse contexto, o TaskFlow surge como uma solução frontend desenvolvida em React Native com Expo, voltada ao gerenciamento de tarefas pessoais. O aplicativo permite que o usuário crie, visualize, filtre e atualize o andamento de suas tarefas de forma simples e intuitiva, com interface responsiva compatível com dispositivos móveis e navegadores web.");
bodyText(doc, "Este documento descreve o processo de desenvolvimento da Fase 1 do projeto TaskFlow, apresentando o problema identificado, os objetivos, os requisitos, os casos de uso, a estrutura técnica e o planejamento para fases futuras.");

sectionTitle(doc, 2, "Problema Identificado");
bodyText(doc, "A desorganização pessoal é um desafio recorrente na vida de estudantes e profissionais. A ausência de um método claro para registrar, priorizar e acompanhar tarefas frequentemente resulta em esquecimentos, atrasos e baixa produtividade. Os principais problemas identificados são:");
bulletList(doc, [
  "Falta de organização pessoal para controlar atividades e compromissos.",
  "Esquecimento de tarefas importantes por ausência de registro adequado.",
  "Dificuldade para acompanhar prazos e estimar o tempo necessário para cada atividade.",
  "Falta de clareza sobre quais tarefas possuem maior urgência ou prioridade.",
  "Ausência de uma visão consolidada do que está pendente, em andamento ou já concluído.",
]);
bodyText(doc, "O TaskFlow foi concebido para resolver esses problemas, oferecendo uma interface centralizada e de fácil utilização para o controle completo das tarefas pessoais do usuário.");

sectionTitle(doc, 3, "Objetivo Geral");
bodyText(doc, "Desenvolver uma aplicação frontend responsiva utilizando React Native com Expo, capaz de simular o gerenciamento de tarefas pessoais por meio de criação, listagem, visualização, atualização de status e filtragem de tarefas, com interface adaptada para dispositivos móveis e navegadores web.");

sectionTitle(doc, 4, "Objetivos Específicos");
bulletList(doc, [
  "Criar uma interface inicial de apresentação do sistema (tela de boas-vindas).",
  "Implementar telas de login e cadastro simulados para controle de acesso à aplicação.",
  "Permitir a criação de tarefas com título, descrição, prioridade, status e prazo de conclusão.",
  "Exibir uma lista de tarefas cadastradas em formato de cards visuais.",
  "Permitir a visualização detalhada de cada tarefa individualmente.",
  "Permitir a atualização do status de uma tarefa (Pendente, Em Andamento ou Concluída).",
  "Permitir a filtragem de tarefas por status ou nível de prioridade.",
  "Organizar o código-fonte em pastas por responsabilidade, seguindo boas práticas de desenvolvimento.",
  "Preparar a estrutura do frontend para integração futura com backend na Fase 2.",
]);

sectionTitle(doc, 5, "Público-Alvo");
bodyText(doc, "O TaskFlow é destinado a qualquer pessoa que necessite organizar suas atividades pessoais de forma prática. Os principais perfis de usuários incluem:");
bulletList(doc, [
  "Estudantes universitários que precisam controlar prazos de entregas, provas e atividades acadêmicas.",
  "Profissionais que desejam organizar tarefas de trabalho e acompanhar o progresso de atividades diárias.",
  "Pessoas que buscam uma ferramenta simples para gerenciar compromissos e rotinas pessoais.",
  "Usuários que necessitam de uma visão clara e rápida do que está pendente, em execução ou concluído.",
]);

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÕES 6-7
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 6, "Descrição da Solução");
bodyText(doc, "O TaskFlow é um aplicativo de gerenciamento de tarefas pessoais desenvolvido em React Native com Expo, compatível com plataformas mobile e web. A solução permite ao usuário centralizar suas tarefas em um único ambiente, acompanhar o status de cada atividade, definir prioridades e obter uma visão geral do andamento das tarefas.");
bodyText(doc, "Na Fase 1, o sistema é composto exclusivamente pelo frontend da aplicação. Os dados são mockados (simulados em memória) e os fluxos de login e cadastro são implementados de forma simulada, sem validação real. Essa abordagem permite demonstrar o funcionamento completo da interface e validar todos os fluxos de uso antes da integração com o backend na Fase 2.");

sectionTitle(doc, 7, "Tecnologias Utilizadas");
doc.y = drawTable(doc, MARGIN, doc.y, [120, CONTENT_W - 120], [
  { height: 22, cells: [{ text: "Tecnologia", bold: true, color: C.white, bg: C.primary }, { text: "Finalidade", bold: true, color: C.white, bg: C.primary }] },
  ...[
    ["React Native", "Framework principal para desenvolvimento da interface multiplataforma (mobile e web)."],
    ["Expo", "Ambiente para criação, execução e testes simplificados da aplicação React Native."],
    ["JavaScript / TypeScript", "Linguagem de programação e tipagem estática utilizadas no desenvolvimento."],
    ["React Navigation", "Biblioteca para navegação entre telas utilizando stack nativa."],
    ["React Hooks", "Utilizados para controle de estado e comportamento (useState, useContext, useCallback)."],
    ["Dados Mockados", "Simulação de tarefas sem necessidade de banco de dados na Fase 1."],
    ["Replit", "Ambiente de desenvolvimento, execução e hospedagem do projeto."],
  ].map(([t, d], i) => ({ height: 22, cells: [{ text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight }, { text: d, color: C.textDark, bg: i % 2 === 0 ? C.white : C.bgLight }] })),
]) + 10;

sectionTitle(doc, 8, "Requisitos Funcionais");
reqTable(doc, [
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
]);

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

sectionTitle(doc, 9, "Requisitos Não Funcionais");
reqTable(doc, [
  { code: "RNF01", desc: "A aplicação deve ser desenvolvida em React Native com Expo." },
  { code: "RNF02", desc: "A aplicação deve ser responsiva e funcionar em dispositivos mobile e na web." },
  { code: "RNF03", desc: "O código deve ser organizado em pastas por responsabilidade." },
  { code: "RNF04", desc: "A aplicação deve utilizar componentes reutilizáveis para consistência visual e manutenibilidade." },
  { code: "RNF05", desc: "A aplicação deve funcionar completamente sem backend na Fase 1." },
  { code: "RNF06", desc: "Os dados exibidos devem ser mockados, simulando um ambiente real de uso." },
  { code: "RNF07", desc: "A interface deve ser clara, intuitiva e de fácil utilização pelo usuário final." },
  { code: "RNF08", desc: "O projeto deve estar estruturado para permitir integração futura com backend Node.js na Fase 2." },
]);

sectionTitle(doc, 10, "Usuários do Sistema");
subsection(doc, "Usuário Comum");
bodyText(doc, "Pessoa que utiliza o TaskFlow para organizar suas tarefas pessoais. É o único perfil de usuário implementado na Fase 1.");
bodyText(doc, "Ações disponíveis ao usuário comum:");
bulletList(doc, [
  "Acessar a aplicação pela tela de boas-vindas.",
  "Realizar cadastro simulado com nome, e-mail e senha.",
  "Realizar login simulado com e-mail e senha.",
  "Criar novas tarefas com título, descrição, prioridade, status e prazo.",
  "Listar todas as tarefas disponíveis no dashboard.",
  "Visualizar detalhes de uma tarefa específica.",
  "Atualizar o status de uma tarefa.",
  "Filtrar tarefas por status ou prioridade.",
]);
subsection(doc, "Administrador");
bodyText(doc, "Na Fase 1, não há perfil administrativo implementado, pois o foco está no uso individual e pessoal do sistema. Caso necessário, esse perfil poderá ser considerado em versões futuras, contemplando funcionalidades como gerenciamento de múltiplos usuários e controle de acessos.");

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 11 — CASOS DE USO
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 11, "Casos de Uso Principais");
bodyText(doc, "Os cinco casos de uso a seguir representam as funcionalidades centrais do TaskFlow. Login e cadastro são requisitos obrigatórios de acesso simulado, mas não constituem casos de uso principais da aplicação.");
doc.y += 4;

caseOfUseBox(doc, 1, "Criar Tarefa",
  "Permite que o usuário cadastre uma nova tarefa no sistema.",
  "Usuário comum",
  "O usuário deve estar autenticado e na área principal da aplicação (dashboard).",
  ["O usuário acessa o dashboard.", "O usuário seleciona a opção de criar nova tarefa.", "O sistema exibe o formulário de criação de tarefa.", "O usuário informa título, descrição, prioridade, status e prazo.", "O usuário confirma o cadastro da tarefa.", "O sistema adiciona a tarefa à lista e retorna ao dashboard."],
  "A nova tarefa passa a ser exibida na listagem do dashboard e os contadores de resumo são atualizados."
);

caseOfUseBox(doc, 2, "Listar Tarefas",
  "Permite que o usuário visualize as tarefas cadastradas no sistema.",
  "Usuário comum",
  "Existirem tarefas mockadas ou cadastradas durante a sessão atual.",
  ["O usuário acessa o dashboard.", "O sistema carrega e exibe a lista de tarefas disponíveis.", "O sistema apresenta as tarefas em cards individuais.", "Cada card exibe título, descrição resumida, prioridade, status e prazo da tarefa."],
  "O usuário visualiza suas tarefas organizadas e pode interagir com cada uma delas."
);

caseOfUseBox(doc, 3, "Visualizar Detalhes da Tarefa",
  "Permite que o usuário acesse as informações completas de uma tarefa específica.",
  "Usuário comum",
  "A tarefa deve estar disponível na listagem do dashboard.",
  ["O usuário acessa o dashboard.", "O usuário seleciona uma tarefa da lista.", "O sistema abre a tela de detalhes da tarefa selecionada.", "O sistema exibe título, descrição completa, prioridade, status, categoria e prazo."],
  "O usuário compreende todas as informações relacionadas à tarefa selecionada."
);

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

caseOfUseBox(doc, 4, "Atualizar Status da Tarefa",
  "Permite que o usuário altere o andamento de uma tarefa cadastrada.",
  "Usuário comum",
  "A tarefa deve estar cadastrada e o usuário deve estar na tela de detalhes.",
  ["O usuário acessa os detalhes de uma tarefa.", "O sistema exibe as opções de status: Pendente, Em Andamento, Concluída.", "O usuário seleciona o novo status desejado.", "O sistema atualiza o status da tarefa imediatamente.", "O dashboard reflete a alteração nos cards de resumo ao retornar."],
  "A tarefa passa a exibir o novo status selecionado e os contadores do dashboard são atualizados."
);

caseOfUseBox(doc, 5, "Filtrar Tarefas por Status ou Prioridade",
  "Permite que o usuário filtre a visualização das tarefas conforme critérios específicos.",
  "Usuário comum",
  "Existirem tarefas cadastradas ou mockadas na aplicação.",
  ["O usuário acessa o dashboard.", "O sistema exibe abas de filtro por status (Todas, Pendentes, Em Andamento, Concluídas) e por prioridade (Alta, Média, Baixa).", "O usuário seleciona o filtro desejado.", "O sistema atualiza a lista de tarefas conforme o critério selecionado."],
  "O usuário visualiza apenas as tarefas correspondentes ao filtro aplicado."
);

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 12 — TELAS
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 12, "Telas da Aplicação");
doc.y = drawTable(doc, MARGIN, doc.y, [105, CONTENT_W - 105], [
  { height: 22, cells: [{ text: "Tela", bold: true, color: C.white, bg: C.primary }, { text: "Descrição", bold: true, color: C.white, bg: C.primary }] },
  ...[
    ["Boas-vindas", "Tela inicial com o nome TaskFlow, lista de funcionalidades e botões de acesso para login e cadastro. Apresenta a identidade visual do sistema."],
    ["Login", "Tela de acesso simulado ao sistema. Solicita e-mail e senha, valida os campos e redireciona ao dashboard após confirmação."],
    ["Cadastro", "Tela de registro simulado. Solicita nome, e-mail, senha e confirmação de senha, com validação de todos os campos obrigatórios."],
    ["Dashboard", "Tela principal com saudação personalizada, cards de resumo por status, filtros por status e prioridade, e listagem completa de tarefas."],
    ["Criar Tarefa", "Formulário para cadastro de nova tarefa. Permite informar título, descrição, prioridade, status, categoria e prazo de conclusão."],
    ["Detalhes da Tarefa", "Tela com informações completas de uma tarefa. Permite alterar o status (Pendente, Em Andamento, Concluída) e excluir a tarefa."],
  ].map(([t, d], i) => ({ height: 34, cells: [{ text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight }, { text: d, color: C.textDark, bg: i % 2 === 0 ? C.white : C.bgLight }] })),
]) + 12;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 13 — ORGANIZAÇÃO DO CÓDIGO
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 13, "Organização do Código");
bodyText(doc, "O projeto foi estruturado seguindo o princípio de separação por responsabilidade, com cada pasta dedicada a uma camada específica da aplicação:");
doc.y = drawTable(doc, MARGIN, doc.y, [108, CONTENT_W - 108], [
  { height: 22, cells: [{ text: "Pasta", bold: true, color: C.white, bg: C.primary }, { text: "Conteúdo", bold: true, color: C.white, bg: C.primary }] },
  ...[
    ["app/screens", "Telas principais da aplicação (Welcome, Login, Register, Dashboard, CreateTask, TaskDetails)."],
    ["app/components", "Componentes reutilizáveis de interface (Button, Input, Header, TaskCard, FilterTabs, EmptyState, StatusBadge)."],
    ["app/navigation", "Configuração do React Navigation, referências centralizadas e tipagem das rotas da aplicação."],
    ["app/context", "Contextos globais para gerenciamento de estado (TaskContext e AuthContext via React Context API)."],
    ["app/data", "Arquivo de dados mockados utilizado para simular tarefas cadastradas na Fase 1."],
    ["app/styles", "Arquivo de tema com cores, espaçamentos, tipografia e sombras padronizados."],
    ["app/services", "Pasta preparada para integrações futuras com AsyncStorage e API backend na Fase 2."],
  ].map(([t, d], i) => ({ height: 22, cells: [{ text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight }, { text: d, color: C.textDark, bg: i % 2 === 0 ? C.white : C.bgLight }] })),
]) + 12;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 14 — COMPONENTES
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 14, "Componentes Reutilizáveis");
bodyText(doc, "A seguir estão os sete componentes reutilizáveis desenvolvidos para o TaskFlow:");
doc.y += 4;
// header row
fillRect(doc, MARGIN, doc.y, 100, 22, C.primary);
fillRect(doc, MARGIN + 100, doc.y, CONTENT_W - 100, 22, C.primary);
doc.save().font("Helvetica-Bold").fontSize(9).fillColor(C.white).text("Componente", MARGIN + 8, doc.y + 7, { width: 84 }).restore();
doc.save().font("Helvetica-Bold").fontSize(9).fillColor(C.white).text("Descrição", MARGIN + 108, doc.y + 7).restore();
doc.y += 22;
componentCard(doc, "Button", "Botão reutilizável com variantes (primary, secondary, danger, outline), estado de carregamento e ícone opcional.");
componentCard(doc, "Input", "Campo de formulário com ícone lateral, toggle de visibilidade da senha, modo multiline e exibição de erro.");
componentCard(doc, "Header", "Cabeçalho de telas internas com título, subtítulo opcional e botão de voltar configurável.");
componentCard(doc, "TaskCard", "Card de exibição de tarefa com título, descrição resumida, indicador de prioridade, badge de status, categoria e prazo.");
componentCard(doc, "StatusBadge", "Badge visual colorido para indicar status (Pendente, Em Andamento, Concluída) ou prioridade (Alta, Média, Baixa).");
componentCard(doc, "FilterTabs", "Abas horizontais de filtro com scroll e suporte a ícone, para filtrar tarefas por status e prioridade.");
componentCard(doc, "EmptyState", "Estado visual quando não há tarefas disponíveis, com ícone, mensagem explicativa e botão de ação opcional.");
doc.y += 6;

addPageFooter(doc);
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
doc.y = MARGIN;

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÕES 15-19
// ══════════════════════════════════════════════════════════════════════════════
sectionTitle(doc, 15, "Dados Mockados");
bodyText(doc, "Na Fase 1, os dados são fornecidos por um arquivo de tarefas mockadas (mockTasks.js), que contém oito tarefas pré-cadastradas com informações realistas. Cada tarefa possui os campos: identificador único, título, descrição, status, prioridade, prazo de conclusão, data de criação e categoria.");
bodyText(doc, "O uso de dados mockados permite validar o funcionamento completo do frontend — incluindo listagem, filtros, detalhes e atualização de status — sem a necessidade de um backend real. As tarefas criadas pelo usuário durante a sessão são mantidas em memória por meio do TaskContext e descartadas ao encerrar a sessão, conforme esperado para a Fase 1.");

sectionTitle(doc, 16, "Limitações da Fase 1");
bodyText(doc, "Por ser a fase inicial do projeto, o TaskFlow possui as seguintes limitações previstas e documentadas:");
bulletList(doc, [
  "Não há backend real: toda a lógica de dados é gerenciada localmente na memória da aplicação.",
  "Não há banco de dados conectado: os dados não são persistidos entre sessões.",
  "Login e cadastro são simulados: qualquer e-mail e senha válidos permitem acesso ao sistema.",
  "Os dados mockados e as tarefas criadas são perdidos ao encerrar a sessão.",
  "Autenticação real com verificação de credenciais será implementada na Fase 2.",
]);

sectionTitle(doc, 17, "Planejamento para a Fase 2");
bodyText(doc, "A Fase 2 do projeto contemplará a integração do frontend desenvolvido nesta fase com um backend completo:");
bulletList(doc, [
  "Backend em Node.js com Express para criação de uma API REST.",
  "Banco de dados MongoDB ou similar para persistência real de tarefas e usuários.",
  "Autenticação real com geração e validação de tokens JWT.",
  "Persistência das tarefas no banco de dados, mantendo os dados entre sessões.",
  "Integração do frontend com a API por meio de requisições HTTP.",
  "Possível uso de AsyncStorage para armazenamento local do token de autenticação.",
  "Melhorias na segurança, organização e escalabilidade da aplicação.",
]);

sectionTitle(doc, 18, "Conclusão");
bodyText(doc, "O TaskFlow, em sua Fase 1, cumpre com êxito o objetivo de apresentar um frontend funcional, responsivo e visualmente organizado para o gerenciamento de tarefas pessoais. A aplicação demonstra, por meio de dados mockados e fluxos simulados, todas as funcionalidades essenciais do sistema: criação, listagem, visualização, atualização de status e filtragem de tarefas.");
bodyText(doc, "O código foi desenvolvido com foco em organização, modularidade e reutilização de componentes, seguindo boas práticas de desenvolvimento em React Native. A estrutura do projeto foi pensada para facilitar a evolução natural para a Fase 2, onde serão integrados o backend, o banco de dados e a autenticação real.");
bodyText(doc, "Esta entrega representa a base sólida sobre a qual o sistema completo será construído, demonstrando domínio das tecnologias exigidas pela disciplina e capacidade de planejamento e execução de projetos de software para dispositivos móveis.");

sectionTitle(doc, 19, "Critérios Avaliativos");
bodyText(doc, "O projeto TaskFlow foi desenvolvido considerando os critérios de avaliação da disciplina:");
doc.y += 4;

[
  ["Qualidade da documentação", "Documento acadêmico completo com todos os itens obrigatórios: capa, introdução, problema, objetivos, requisitos, casos de uso, telas, componentes e planejamento."],
  ["Nível de detalhes da aplicação", "Seis telas implementadas, sete componentes reutilizáveis, oito tarefas mockadas e cinco casos de uso documentados e funcionais."],
  ["Organização do código", "Estrutura modular em sete pastas por responsabilidade, com nomenclatura clara e separação de contextos, navegação e estilos."],
  ["Funcionamento sem erros", "Aplicação verificada com zero erros de TypeScript, fluxos de navegação validados e todos os casos de uso funcionais."],
  ["Responsividade Web e Mobile", "Interface adaptada para a web (maxWidth 720px) e mobile, com componentes responsivos em todas as telas."],
  ["Uso de React Native com Expo", "Projeto desenvolvido integralmente em React Native com Expo, utilizando React Navigation, Hooks, Context API e dados mockados."],
].forEach(([label, desc], i) => {
  if (doc.y + 44 > PAGE_H - 70) {
    addPageFooter(doc);
    doc.addPage();
    pageNum++;
    fillRect(doc, 0, 0, PAGE_W, 6, C.accent);
    doc.y = MARGIN;
  }
  const y = doc.y;
  const h = 40;
  fillRect(doc, MARGIN, y, CONTENT_W, h, i % 2 === 0 ? C.white : C.bgLight);
  fillRect(doc, MARGIN, y, 4, h, C.accent);
  doc.save().font("Helvetica-Bold").fontSize(9.5).fillColor(C.primary).text(label, MARGIN + 14, y + 6, { width: CONTENT_W - 20 }).restore();
  doc.save().font("Helvetica").fontSize(9).fillColor(C.textGray).text(desc, MARGIN + 14, y + 21, { width: CONTENT_W - 20 }).restore();
  drawLine(doc, MARGIN, y + h, MARGIN + CONTENT_W, y + h, C.border);
  doc.y = y + h;
});

addPageFooter(doc);

// ── END ──────────────────────────────────────────────────────────────────────
doc.end();
stream.on("finish", () => {
  const stat = fs.statSync(outPath);
  console.log("PDF gerado com sucesso: " + outPath);
  console.log("Tamanho: " + (stat.size / 1024).toFixed(1) + " KB");
});
stream.on("error", (err) => {
  console.error("Erro: " + err.message);
  process.exit(1);
});
