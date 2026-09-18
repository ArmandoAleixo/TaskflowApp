const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  primary:   "#1E3A8A",
  accent:    "#2563EB",
  lightBlue: "#DBEAFE",
  textDark:  "#1E293B",
  textGray:  "#475569",
  textMuted: "#94A3B8",
  border:    "#CBD5E1",
  bgLight:   "#F8FAFC",
  white:     "#FFFFFF",
  coverBg:   "#F8FAFC",
  coverText: "#334155",
};

const PAGE_W  = 595.28;
const PAGE_H  = 841.89;
const MARGIN  = 50;
const CW      = PAGE_W - MARGIN * 2;

const SS = path.join(__dirname, "../assets/screenshots");
const OUT = path.join(__dirname, "../TaskFlow-Fase1.pdf");

// ── HELPERS ──────────────────────────────────────────────────────────────────
function fillRect(doc, x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}
function drawLine(doc, x1, y1, x2, y2, color, lw) {
  doc.save().moveTo(x1, y1).lineTo(x2, y2)
    .strokeColor(color).lineWidth(lw || 0.5).stroke().restore();
}
function needPage(doc, neededH) {
  if (doc.y + neededH > PAGE_H - 62) {
    addFooter(doc);
    doc.addPage();
    fillRect(doc, 0, 0, PAGE_W, 5, C.accent);
    doc.y = MARGIN + 4;
  }
}

// ── FOOTER ───────────────────────────────────────────────────────────────────
let pageNum = 0;
function addFooter(doc) {
  if (pageNum <= 2) return; // no footer on cover + TOC
  const y = PAGE_H - 38;
  drawLine(doc, MARGIN, y, PAGE_W - MARGIN, y, C.border, 0.5);
  doc.save()
    .font("Helvetica").fontSize(7.5).fillColor(C.textMuted)
    .text("TaskFlow — Gerenciador de Tarefas Pessoais  |  Pedro Henrique de Almeida Peixoto  |  Prof. Matheus Batista Silva",
      MARGIN, y + 8, { width: CW - 30 })
    .restore();
  doc.save()
    .font("Helvetica-Bold").fontSize(7.5).fillColor(C.accent)
    .text(String(pageNum - 2), PAGE_W - MARGIN - 20, y + 8, { align: "right", width: 24 })
    .restore();
}

// ── SECTION TITLE ─────────────────────────────────────────────────────────────
function secTitle(doc, num, title) {
  needPage(doc, 48);
  const y = doc.y + 10;
  fillRect(doc, MARGIN, y, CW, 28, C.lightBlue);
  fillRect(doc, MARGIN, y, 5, 28, C.accent);
  doc.save().font("Helvetica-Bold").fontSize(12).fillColor(C.primary)
    .text(`${num}.  ${title}`, MARGIN + 16, y + 8).restore();
  doc.y = y + 34;
}

// ── BODY TEXT ─────────────────────────────────────────────────────────────────
function body(doc, text, extraGap) {
  needPage(doc, 32);
  doc.save().font("Helvetica").fontSize(9.5).fillColor(C.textDark)
    .text(text, MARGIN, doc.y, { width: CW, align: "justify", lineGap: 2 }).restore();
  doc.y += extraGap !== undefined ? extraGap : 5;
}

// ── BULLET LIST ───────────────────────────────────────────────────────────────
function bullets(doc, items) {
  items.forEach(item => {
    needPage(doc, 18);
    const y = doc.y;
    doc.save().circle(MARGIN + 10, y + 5.5, 2.8).fill(C.accent).restore();
    doc.save().font("Helvetica").fontSize(9.5).fillColor(C.textDark)
      .text(item, MARGIN + 22, y, { width: CW - 22, lineGap: 2 }).restore();
    doc.y += 3;
  });
  doc.y += 4;
}

// ── SUBSECTION ────────────────────────────────────────────────────────────────
function sub(doc, title) {
  needPage(doc, 24);
  doc.y += 4;
  doc.save().font("Helvetica-Bold").fontSize(10.5).fillColor(C.primary)
    .text(title, MARGIN, doc.y).restore();
  doc.y += 6;
}

// ── TABLE ─────────────────────────────────────────────────────────────────────
function drawTable(doc, colWidths, rows) {
  let curY = doc.y;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  rows.forEach((row, ri) => {
    const rowH = row.h || 22;
    needPage(doc, rowH);
    curY = doc.y;
    let curX = MARGIN;
    row.cells.forEach((cell, ci) => {
      const w = colWidths[ci];
      const bg = cell.bg || (ri === 0 ? C.primary : ri % 2 === 0 ? C.white : C.bgLight);
      fillRect(doc, curX, curY, w, rowH, bg);
      const textY = curY + Math.max(4, (rowH - 10) / 2);
      doc.save()
        .font(cell.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(cell.fs || 9)
        .fillColor(cell.color || C.textDark)
        .text(cell.text, curX + 9, textY, { width: w - 18, lineBreak: true })
        .restore();
      curX += w;
    });
    drawLine(doc, MARGIN, curY + rowH, MARGIN + totalW, curY + rowH, C.border);
    doc.y = curY + rowH;
  });
  doc.save().rect(MARGIN, doc.y - rows.reduce((a, r) => a + (r.h || 22), 0), totalW, rows.reduce((a, r) => a + (r.h || 22), 0))
    .strokeColor(C.border).lineWidth(0.5).stroke().restore();
  doc.y += 8;
}

// ── REQUIREMENT TABLE ────────────────────────────────────────────────────────
function reqTable(doc, items) {
  const cW = 70, dW = CW - cW;
  drawTable(doc, [cW, dW], [
    { cells: [{ text: "Código", bold: true, color: C.white }, { text: "Descrição", bold: true, color: C.white }] },
    ...items.map((x, i) => ({
      cells: [
        { text: x.code, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight },
        { text: x.desc, color: C.textDark, bg: i % 2 === 0 ? C.white : C.bgLight },
      ]
    }))
  ]);
}

// ── CASE OF USE BOX ───────────────────────────────────────────────────────────
function caseBox(doc, num, title, desc, actor, pre, flow, post) {
  needPage(doc, 160);
  const startY = doc.y + 6;
  const bx = MARGIN, bw = CW;
  const hH = 26;
  // header
  fillRect(doc, bx, startY, bw, hH, C.primary);
  doc.save().font("Helvetica-Bold").fontSize(10.5).fillColor(C.white)
    .text(`Caso de Uso ${num} — ${title}`, bx + 14, startY + 8, { width: bw - 28 }).restore();
  // body bg
  fillRect(doc, bx, startY + hH, bw, 1, C.bgLight); // placeholder; real bg drawn after
  doc.y = startY + hH + 10;

  function infoLine(label, value) {
    needPage(doc, 16);
    const sy = doc.y;
    doc.save()
      .font("Helvetica-Bold").fontSize(9).fillColor(C.accent)
      .text(label + " ", bx + 14, sy, { continued: true, width: bw - 28 })
      .font("Helvetica").fillColor(C.textDark)
      .text(value).restore();
    doc.y += 3;
  }

  infoLine("Descrição:", desc);
  infoLine("Ator principal:", actor);
  infoLine("Pré-condição:", pre);
  doc.save().font("Helvetica-Bold").fontSize(9).fillColor(C.accent)
    .text("Fluxo principal:", bx + 14, doc.y).restore();
  doc.y += 4;
  flow.forEach((step, i) => {
    needPage(doc, 15);
    doc.save().font("Helvetica").fontSize(9).fillColor(C.textDark)
      .text(`${i + 1}.  ${step}`, bx + 24, doc.y, { width: bw - 40, lineGap: 2 }).restore();
    doc.y += 2;
  });
  doc.y += 2;
  infoLine("Pós-condição:", post);
  const endY = doc.y + 8;
  // Now fill body background
  fillRect(doc, bx, startY + hH, bw, endY - startY - hH, "#EFF6FF");
  // left bar
  fillRect(doc, bx, startY + hH, 4, endY - startY - hH, C.accent);
  // re-draw text on top (body content is already rendered above, so draw bg BEHIND it)
  // Actually we can't draw behind so let's just draw border
  doc.save().rect(bx, startY, bw, endY - startY).strokeColor(C.accent).lineWidth(0.7).stroke().restore();
  doc.y = endY + 8;
}

// ── INSERT SCREENSHOT ─────────────────────────────────────────────────────────
function insertScreenshot(doc, filename, caption, figNum) {
  const filePath = path.join(SS, filename);
  if (!fs.existsSync(filePath)) {
    // Placeholder
    needPage(doc, 100);
    const ph = 80, py = doc.y;
    fillRect(doc, MARGIN, py, CW, ph, C.bgLight);
    doc.save().rect(MARGIN, py, CW, ph).strokeColor(C.border).lineWidth(0.8).stroke().restore();
    doc.save().font("Helvetica").fontSize(9).fillColor(C.textMuted)
      .text("Inserir print da tela aqui", MARGIN, py + 34, { align: "center", width: CW }).restore();
    doc.y = py + ph + 4;
  } else {
    // Natural dimensions: 390 × 844 → scale to fit 55% of content width
    const imgW = Math.round(CW * 0.52);
    const imgH = Math.round(imgW * (844 / 390));
    needPage(doc, imgH + 30);
    const imgX = MARGIN + (CW - imgW) / 2;
    // subtle shadow/border
    doc.save().rect(imgX - 1, doc.y - 1, imgW + 2, imgH + 2).strokeColor(C.border).lineWidth(0.8).stroke().restore();
    doc.image(filePath, imgX, doc.y, { width: imgW, height: imgH });
    doc.y += imgH + 6;
  }
  // Caption
  needPage(doc, 18);
  doc.save().font("Helvetica-Oblique").fontSize(8.5).fillColor(C.textGray)
    .text(`Figura ${figNum} — ${caption}`, MARGIN, doc.y, { align: "center", width: CW }).restore();
  doc.y += 12;
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const ICON_PATH = path.join(__dirname, "../artifacts/taskflow/assets/images/icon.png");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: MARGIN, bottom: 62, left: MARGIN, right: MARGIN },
  bufferPages: true,
  info: {
    Title: "TaskFlow — Documentação Fase 1",
    Author: "Pedro Henrique de Almeida Peixoto; Marcos Marinho Segundo; Armando Aleixo; Samuel Soares",
    Subject: "Desenvolver Aplicativos para dispositivos móveis e IOT",
    Creator: "TaskFlow",
  },
});
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);
doc.on("pageAdded", () => { pageNum++; });
pageNum = 1;

// ══════════════════════════════════════════════════════════════════════════════
// CAPA  (página 1)
// ══════════════════════════════════════════════════════════════════════════════
// Background branco + barra azul escura no topo
fillRect(doc, 0, 0, PAGE_W, PAGE_H, C.coverBg);
fillRect(doc, 0, 0, PAGE_W, 8, C.accent);

// Barra decorativa lateral esquerda
fillRect(doc, 0, 0, 6, PAGE_H, C.primary);

// Topo — nome da instituição / disciplina
const topTextY = 32;
doc.save()
  .font("Helvetica").fontSize(8.5).fillColor(C.textMuted)
  .text("PROJETO ACADÊMICO  ·  FASE 1", 20, topTextY, { align: "center", width: PAGE_W - 20 })
  .restore();
doc.save()
  .font("Helvetica").fontSize(9).fillColor(C.textGray)
  .text("Disciplina: Desenvolver Aplicativos para Dispositivos Móveis e IOT", 20, topTextY + 14, { align: "center", width: PAGE_W - 20 })
  .restore();

// Linha separadora sutil
drawLine(doc, MARGIN + 30, 76, PAGE_W - MARGIN - 30, 76, C.border, 0.8);

// ── Logo / ícone real do TaskFlow ─────────────────────────────────────────────
const logoSize = 80;
const logoX = PAGE_W / 2 - logoSize / 2;
const logoY = 96;
// círculo de fundo (halo)
doc.save().circle(PAGE_W / 2, logoY + logoSize / 2, logoSize / 2 + 6)
  .fill(C.lightBlue).restore();
doc.save().circle(PAGE_W / 2, logoY + logoSize / 2, logoSize / 2 + 6)
  .strokeColor(C.accent).lineWidth(1.5).stroke().restore();
// imagem recortada em círculo
if (fs.existsSync(ICON_PATH)) {
  const cx = PAGE_W / 2, cy = logoY + logoSize / 2, r = logoSize / 2;
  doc.save()
    .circle(cx, cy, r)
    .clip()
    .image(ICON_PATH, logoX, logoY, { width: logoSize, height: logoSize })
    .restore();
} else {
  doc.save().font("Helvetica-Bold").fontSize(40).fillColor(C.accent)
    .text("✓", logoX + 16, logoY + 18).restore();
}

// ── Títulos principais ────────────────────────────────────────────────────────
const titleY = logoY + logoSize + 24;
doc.save()
  .font("Helvetica-Bold").fontSize(44).fillColor(C.primary)
  .text("TaskFlow", 0, titleY, { align: "center", width: PAGE_W, characterSpacing: 0.5 })
  .restore();

doc.save()
  .font("Helvetica").fontSize(15).fillColor(C.textGray)
  .text("Gerenciador de Tarefas Pessoais", 0, titleY + 56, { align: "center", width: PAGE_W })
  .restore();

// ── Faixa azul "Documentação da Fase 1" ──────────────────────────────────────
const badgeFaseY = titleY + 86;
const badgeFaseW = 260;
const badgeFaseX = PAGE_W / 2 - badgeFaseW / 2;
fillRect(doc, badgeFaseX, badgeFaseY, badgeFaseW, 32, C.primary);
doc.save().rect(badgeFaseX, badgeFaseY, badgeFaseW, 32)
  .strokeColor(C.accent).lineWidth(0.5).stroke().restore();
doc.save()
  .font("Helvetica-Bold").fontSize(11.5).fillColor(C.white)
  .text("Documentação da Fase 1", badgeFaseX, badgeFaseY + 10,
    { align: "center", width: badgeFaseW, characterSpacing: 0.4 })
  .restore();

// ── Linha divisória central ───────────────────────────────────────────────────
const divY = badgeFaseY + 52;
drawLine(doc, MARGIN + 40, divY, PAGE_W - MARGIN - 40, divY, C.border, 0.8);

// ── Bloco de informações (4 integrantes + professor + disciplina + data) ──────
const infoBoxW = 400;
const infoBoxX = PAGE_W / 2 - infoBoxW / 2;
const infoBoxY = divY + 22;

// Seção: Integrantes
const integrantes = [
  "Pedro Henrique de Almeida Peixoto",
  "Marcos Marinho Segundo",
  "Armando Aleixo",
  "Samuel Soares",
  "João Victor Silva Guedes",
];
const integrantesH = 14 + integrantes.length * 16 + 8; // label + linhas + padding
const metaRows = [
  ["Instituição",     "Unifacisa"],
  ["Professor",       "Matheus Batista Silva"],
  ["Disciplina",      "Dispositivos Móveis e IOT"],
  ["Data de entrega", "23 de maio de 2026"],
];
const metaH = metaRows.length * 28;
const infoBoxH = integrantesH + metaH + 16;

fillRect(doc, infoBoxX, infoBoxY, infoBoxW, infoBoxH, C.white);
doc.save().rect(infoBoxX, infoBoxY, infoBoxW, infoBoxH)
  .strokeColor(C.border).lineWidth(0.8).stroke().restore();
fillRect(doc, infoBoxX, infoBoxY, 5, infoBoxH, C.accent);

// — Integrantes label
let iy = infoBoxY + 14;
doc.save()
  .font("Helvetica-Bold").fontSize(8).fillColor(C.accent)
  .text("INTEGRANTES", infoBoxX + 18, iy, { width: 100 })
  .restore();
iy += 14;
integrantes.forEach((nome, idx) => {
  doc.save()
    .font("Helvetica").fontSize(9.5).fillColor(C.coverText)
    .text(`• ${nome}`, infoBoxX + 118, iy - 1, { width: infoBoxW - 134 })
    .restore();
  iy += 16;
});
iy += 6;

// — Demais campos
metaRows.forEach(([label, value], i) => {
  drawLine(doc, infoBoxX + 14, iy - 6, infoBoxX + infoBoxW - 14, iy - 6, C.bgLight, 0.5);
  doc.save()
    .font("Helvetica-Bold").fontSize(8).fillColor(C.accent)
    .text(label.toUpperCase(), infoBoxX + 18, iy, { width: 100 })
    .restore();
  doc.save()
    .font("Helvetica").fontSize(10).fillColor(C.coverText)
    .text(value, infoBoxX + 118, iy - 1, { width: infoBoxW - 134 })
    .restore();
  iy += 28;
});

// ── Rodapé da capa ────────────────────────────────────────────────────────────
const coverFootY = PAGE_H - 38;
drawLine(doc, MARGIN, coverFootY, PAGE_W - MARGIN, coverFootY, C.border, 0.5);
doc.save()
  .font("Helvetica").fontSize(7.5).fillColor(C.textMuted)
  .text("TaskFlow  ·  Projeto Acadêmico  ·  2026", 0, coverFootY + 10, { align: "center", width: PAGE_W })
  .restore();

// ══════════════════════════════════════════════════════════════════════════════
// SUMÁRIO  (página 2)
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 5, C.accent);
doc.y = MARGIN + 4;

doc.save().font("Helvetica-Bold").fontSize(20).fillColor(C.primary)
  .text("Sumário", MARGIN, doc.y).restore();
doc.y += 22;

const tocItems = [
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
];
tocItems.forEach(([num, title], i) => {
  const ty = doc.y;
  fillRect(doc, MARGIN, ty, CW, 21, i % 2 === 0 ? C.white : C.bgLight);
  doc.save().font("Helvetica-Bold").fontSize(9.5).fillColor(C.accent)
    .text(num, MARGIN + 10, ty + 6, { width: 28 }).restore();
  doc.save().font("Helvetica").fontSize(9.5).fillColor(C.textDark)
    .text(title, MARGIN + 40, ty + 6, { width: CW - 56 }).restore();
  drawLine(doc, MARGIN, ty + 21, MARGIN + CW, ty + 21, C.border);
  doc.y = ty + 21;
});

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT PAGES start here — page 3 onwards
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
fillRect(doc, 0, 0, PAGE_W, 5, C.accent);
doc.y = MARGIN + 4;

// ── 1. INTRODUÇÃO ─────────────────────────────────────────────────────────────
secTitle(doc, 1, "Introdução");
body(doc, "O avanço dos dispositivos móveis transformou profundamente a maneira como as pessoas gerenciam suas atividades cotidianas. Aplicativos de produtividade tornaram-se ferramentas indispensáveis para estudantes, profissionais e qualquer pessoa que necessite organizar sua rotina com eficiência e praticidade.");
body(doc, "Nesse contexto, o TaskFlow surge como uma solução frontend desenvolvida em React Native com Expo, voltada ao gerenciamento de tarefas pessoais. O aplicativo permite que o usuário crie, visualize, filtre e atualize o andamento de suas tarefas de forma simples e intuitiva, com interface responsiva compatível com dispositivos móveis e navegadores web.");
body(doc, "Este documento descreve o processo de desenvolvimento da Fase 1 do projeto TaskFlow, apresentando o problema identificado, os objetivos, os requisitos, os casos de uso, a estrutura técnica e o planejamento para fases futuras.", 0);

// ── 2. PROBLEMA ───────────────────────────────────────────────────────────────
secTitle(doc, 2, "Problema Identificado");
body(doc, "A desorganização pessoal é um desafio recorrente na vida de estudantes e profissionais. A ausência de um método claro para registrar, priorizar e acompanhar tarefas frequentemente resulta em esquecimentos, atrasos e baixa produtividade. Os principais problemas identificados são:");
bullets(doc, [
  "Falta de organização pessoal para controlar atividades e compromissos.",
  "Esquecimento de tarefas importantes por ausência de registro adequado.",
  "Dificuldade para acompanhar prazos e estimar o tempo necessário para cada atividade.",
  "Falta de clareza sobre quais tarefas possuem maior urgência ou prioridade.",
  "Ausência de uma visão consolidada do que está pendente, em andamento ou já concluído.",
]);
body(doc, "O TaskFlow foi concebido para resolver esses problemas, oferecendo uma interface centralizada e de fácil utilização para o controle completo das tarefas pessoais do usuário.", 0);

// ── 3. OBJETIVO GERAL ─────────────────────────────────────────────────────────
secTitle(doc, 3, "Objetivo Geral");
body(doc, "Desenvolver uma aplicação frontend responsiva utilizando React Native com Expo, capaz de simular o gerenciamento de tarefas pessoais por meio de criação, listagem, visualização, atualização de status e filtragem de tarefas, com interface adaptada para dispositivos móveis e navegadores web.", 0);

// ── 4. OBJETIVOS ESPECÍFICOS ──────────────────────────────────────────────────
secTitle(doc, 4, "Objetivos Específicos");
bullets(doc, [
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

// ── 5. PÚBLICO-ALVO ───────────────────────────────────────────────────────────
secTitle(doc, 5, "Público-Alvo");
body(doc, "O TaskFlow é destinado a qualquer pessoa que necessite organizar suas atividades pessoais de forma prática. Os principais perfis de usuários incluem:");
bullets(doc, [
  "Estudantes universitários que precisam controlar prazos de entregas, provas e atividades acadêmicas.",
  "Profissionais que desejam organizar tarefas de trabalho e acompanhar o progresso de atividades diárias.",
  "Pessoas que buscam uma ferramenta simples para gerenciar compromissos e rotinas pessoais.",
  "Usuários que necessitam de uma visão clara e rápida do que está pendente, em execução ou concluído.",
]);

// ── 6. DESCRIÇÃO DA SOLUÇÃO ───────────────────────────────────────────────────
secTitle(doc, 6, "Descrição da Solução");
body(doc, "O TaskFlow é um aplicativo de gerenciamento de tarefas pessoais desenvolvido em React Native com Expo, compatível com plataformas mobile e web. A solução permite ao usuário centralizar suas tarefas em um único ambiente, acompanhar o status de cada atividade, definir prioridades e obter uma visão geral do andamento das tarefas.");
body(doc, "Na Fase 1, o sistema é composto exclusivamente pelo frontend da aplicação. Os dados são mockados (simulados em memória) e os fluxos de login e cadastro são implementados de forma simulada, sem validação real. Essa abordagem permite demonstrar o funcionamento completo da interface e validar todos os fluxos de uso antes da integração com o backend na Fase 2.", 0);

// ── 7. TECNOLOGIAS ────────────────────────────────────────────────────────────
secTitle(doc, 7, "Tecnologias Utilizadas");
const techW = 126;
drawTable(doc, [techW, CW - techW], [
  { cells: [{ text: "Tecnologia", bold: true, color: C.white }, { text: "Finalidade", bold: true, color: C.white }] },
  ...[
    ["React Native",          22, "Framework principal para desenvolvimento da interface multiplataforma (mobile e web)."],
    ["Expo",                  22, "Ambiente para criação, execução e testes simplificados da aplicação React Native."],
    ["JavaScript/TypeScript", 22, "Linguagem de programação e tipagem estática utilizadas no desenvolvimento."],
    ["React Navigation",      22, "Biblioteca para navegação entre telas utilizando stack nativa."],
    ["React Hooks",           22, "Utilizados para controle de estado e comportamento (useState, useContext, useCallback)."],
    ["Dados Mockados",        22, "Simulação de tarefas sem necessidade de banco de dados na Fase 1."],
    ["Replit",                22, "Ambiente de desenvolvimento, execução e hospedagem do projeto."],
  ].map(([t, h, d], i) => ({
    h,
    cells: [
      { text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight },
      { text: d, color: C.textDark,            bg: i % 2 === 0 ? C.white : C.bgLight },
    ]
  }))
]);

// ── 8. REQUISITOS FUNCIONAIS ──────────────────────────────────────────────────
secTitle(doc, 8, "Requisitos Funcionais");
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

// ── 9. REQUISITOS NÃO FUNCIONAIS ─────────────────────────────────────────────
secTitle(doc, 9, "Requisitos Não Funcionais");
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

// ── 10. USUÁRIOS DO SISTEMA ───────────────────────────────────────────────────
secTitle(doc, 10, "Usuários do Sistema");
sub(doc, "Usuário Comum");
body(doc, "Pessoa que utiliza o TaskFlow para organizar suas tarefas pessoais. É o único perfil de usuário implementado na Fase 1.");
bullets(doc, [
  "Acessar a aplicação pela tela de boas-vindas.",
  "Realizar cadastro simulado com nome, e-mail e senha.",
  "Realizar login simulado com e-mail e senha.",
  "Criar novas tarefas com título, descrição, prioridade, status e prazo.",
  "Listar e filtrar tarefas disponíveis no dashboard.",
  "Visualizar detalhes de uma tarefa específica.",
  "Atualizar o status de uma tarefa.",
]);
sub(doc, "Administrador");
body(doc, "Na Fase 1 não há perfil administrativo. Caso necessário, esse perfil poderá ser implementado em versões futuras, contemplando gerenciamento de múltiplos usuários e controle de acessos.", 0);

// ── 11. CASOS DE USO ──────────────────────────────────────────────────────────
secTitle(doc, 11, "Casos de Uso Principais");
body(doc, "Os cinco casos de uso a seguir representam as funcionalidades centrais do TaskFlow. Login e cadastro são requisitos obrigatórios de acesso simulado, mas não constituem casos de uso principais da aplicação.");
doc.y += 4;

// CU 1
caseBox(doc, 1, "Criar Tarefa",
  "Permite que o usuário cadastre uma nova tarefa no sistema.",
  "Usuário comum",
  "O usuário deve estar autenticado e na área principal da aplicação.",
  ["O usuário acessa o dashboard.", "O usuário seleciona a opção de criar nova tarefa.", "O sistema exibe o formulário de criação.", "O usuário preenche título, descrição, prioridade, status e prazo.", "O usuário confirma o cadastro.", "O sistema adiciona a tarefa e atualiza os contadores do dashboard."],
  "A nova tarefa é exibida na listagem e os resumos do dashboard são atualizados."
);
insertScreenshot(doc, "create-task.png", "Tela de criação de tarefa no TaskFlow.", 1);

// CU 2
caseBox(doc, 2, "Listar Tarefas",
  "Permite que o usuário visualize as tarefas cadastradas no sistema.",
  "Usuário comum",
  "Existirem tarefas mockadas ou cadastradas durante a sessão atual.",
  ["O usuário acessa o dashboard.", "O sistema carrega e exibe as tarefas disponíveis.", "As tarefas são apresentadas em cards individuais.", "Cada card exibe título, prioridade, status e prazo."],
  "O usuário visualiza suas tarefas organizadas e pode interagir com cada uma delas."
);
insertScreenshot(doc, "dashboard.png", "Dashboard com listagem de tarefas cadastradas.", 2);

// CU 3
caseBox(doc, 3, "Visualizar Detalhes da Tarefa",
  "Permite que o usuário acesse as informações completas de uma tarefa específica.",
  "Usuário comum",
  "A tarefa deve estar disponível na listagem do dashboard.",
  ["O usuário acessa o dashboard.", "O usuário seleciona uma tarefa da lista.", "O sistema abre a tela de detalhes.", "O sistema exibe título, descrição completa, prioridade, status, categoria e prazo."],
  "O usuário compreende todas as informações relacionadas à tarefa selecionada."
);
insertScreenshot(doc, "task-details.png", "Tela de detalhes de uma tarefa selecionada.", 3);

// CU 4
caseBox(doc, 4, "Atualizar Status da Tarefa",
  "Permite que o usuário altere o andamento de uma tarefa cadastrada.",
  "Usuário comum",
  "A tarefa deve estar cadastrada e o usuário na tela de detalhes.",
  ["O usuário acessa os detalhes de uma tarefa.", "O sistema exibe as opções: Pendente, Em Andamento, Concluída.", "O usuário seleciona o novo status.", "O sistema atualiza o status imediatamente.", "O dashboard reflete a alteração ao retornar."],
  "A tarefa exibe o novo status e os contadores do dashboard são atualizados."
);
insertScreenshot(doc, "update-status.png", "Atualização do status de uma tarefa.", 4);

// CU 5
caseBox(doc, 5, "Filtrar Tarefas por Status ou Prioridade",
  "Permite que o usuário filtre a visualização conforme critérios específicos.",
  "Usuário comum",
  "Existirem tarefas cadastradas ou mockadas na aplicação.",
  ["O usuário acessa o dashboard.", "O sistema exibe abas de filtro por status e por prioridade.", "O usuário seleciona o filtro desejado.", "O sistema atualiza a lista conforme o critério escolhido."],
  "O usuário visualiza apenas as tarefas correspondentes ao filtro aplicado."
);
insertScreenshot(doc, "filters.png", "Filtros de tarefas por status e prioridade.", 5);

// ── 12. TELAS DA APLICAÇÃO ────────────────────────────────────────────────────
secTitle(doc, 12, "Telas da Aplicação");
const screenW = 100;
drawTable(doc, [screenW, CW - screenW], [
  { cells: [{ text: "Tela", bold: true, color: C.white }, { text: "Descrição", bold: true, color: C.white }] },
  ...[
    ["Boas-vindas",     "Tela inicial com o nome TaskFlow, lista de funcionalidades e botões de acesso para login e cadastro."],
    ["Login",           "Tela de acesso simulado ao sistema. Solicita e-mail e senha e redireciona ao dashboard após confirmação."],
    ["Cadastro",        "Tela de registro simulado. Solicita nome, e-mail, senha e confirmação de senha, com validação dos campos."],
    ["Dashboard",       "Tela principal com saudação personalizada, cards de resumo por status, filtros e listagem de tarefas."],
    ["Criar Tarefa",    "Formulário para cadastro de nova tarefa: título, descrição, prioridade, status, categoria e prazo."],
    ["Detalhes",        "Tela com informações completas. Permite alterar o status (Pendente, Em Andamento, Concluída) e excluir a tarefa."],
  ].map(([t, d], i) => ({
    h: 30,
    cells: [
      { text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight },
      { text: d, color: C.textDark,            bg: i % 2 === 0 ? C.white : C.bgLight },
    ]
  }))
]);

doc.y += 4;
insertScreenshot(doc, "welcome.png",     "Tela de boas-vindas do TaskFlow.", 6);
insertScreenshot(doc, "login.png",       "Tela de login simulado.", 7);
insertScreenshot(doc, "register.png",    "Tela de cadastro simulado.", 8);
insertScreenshot(doc, "dashboard.png",   "Dashboard principal do TaskFlow.", 9);
insertScreenshot(doc, "create-task.png", "Tela de criação de tarefa.", 10);
insertScreenshot(doc, "task-details.png","Tela de detalhes da tarefa.", 11);

// ── 13. ORGANIZAÇÃO DO CÓDIGO ─────────────────────────────────────────────────
secTitle(doc, 13, "Organização do Código");
body(doc, "O projeto foi estruturado seguindo o princípio de separação por responsabilidade, com cada pasta dedicada a uma camada específica da aplicação:");
const dirW = 106;
drawTable(doc, [dirW, CW - dirW], [
  { cells: [{ text: "Pasta", bold: true, color: C.white }, { text: "Conteúdo", bold: true, color: C.white }] },
  ...[
    ["app/screens",    "Telas principais: Welcome, Login, Register, Dashboard, CreateTask e TaskDetails."],
    ["app/components", "Componentes reutilizáveis: Button, Input, Header, TaskCard, FilterTabs, EmptyState e StatusBadge."],
    ["app/navigation", "Configuração do React Navigation, referências centralizadas e tipagem das rotas."],
    ["app/context",    "Contextos globais de estado: TaskContext e AuthContext via React Context API."],
    ["app/data",       "Arquivo de dados mockados para simular tarefas cadastradas na Fase 1."],
    ["app/styles",     "Arquivo de tema com cores, espaçamentos, tipografia e sombras padronizados."],
    ["app/services",   "Pasta preparada para integrações futuras com AsyncStorage e API na Fase 2."],
  ].map(([t, d], i) => ({
    h: 22,
    cells: [
      { text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight },
      { text: d, color: C.textDark,            bg: i % 2 === 0 ? C.white : C.bgLight },
    ]
  }))
]);

// ── 14. COMPONENTES ───────────────────────────────────────────────────────────
secTitle(doc, 14, "Componentes Reutilizáveis");
body(doc, "O TaskFlow possui sete componentes reutilizáveis que garantem consistência visual e facilitam a manutenção da interface:");
const compW = 98;
drawTable(doc, [compW, CW - compW], [
  { cells: [{ text: "Componente", bold: true, color: C.white }, { text: "Descrição", bold: true, color: C.white }] },
  ...[
    ["Button",      "Botão reutilizável com variantes (primary, secondary, danger, outline), carregamento e ícone opcional."],
    ["Input",       "Campo de formulário com ícone, toggle de senha, modo multiline e exibição de erro."],
    ["Header",      "Cabeçalho com título, subtítulo opcional e botão de voltar configurável."],
    ["TaskCard",    "Card de tarefa com título, descrição resumida, indicador de prioridade, badge de status e prazo."],
    ["StatusBadge", "Badge colorido para status (Pendente, Em Andamento, Concluída) ou prioridade (Alta, Média, Baixa)."],
    ["FilterTabs",  "Abas horizontais de filtro com scroll para filtrar tarefas por status e prioridade."],
    ["EmptyState",  "Estado vazio com ícone, mensagem explicativa e botão de ação quando não há tarefas."],
  ].map(([t, d], i) => ({
    h: 22,
    cells: [
      { text: t, bold: true, color: C.accent, bg: i % 2 === 0 ? C.white : C.bgLight },
      { text: d, color: C.textDark,            bg: i % 2 === 0 ? C.white : C.bgLight },
    ]
  }))
]);

// ── 15. DADOS MOCKADOS ────────────────────────────────────────────────────────
secTitle(doc, 15, "Dados Mockados");
body(doc, "Na Fase 1, os dados são fornecidos por um arquivo de tarefas mockadas (mockTasks.js), com oito tarefas pré-cadastradas e informações realistas. Cada tarefa possui: identificador único, título, descrição, status, prioridade, prazo de conclusão, data de criação e categoria.");
body(doc, "O uso de dados mockados permite validar o funcionamento completo do frontend — incluindo listagem, filtros, detalhes e atualização de status — sem a necessidade de um backend real. As tarefas criadas durante a sessão são mantidas em memória via TaskContext e descartadas ao encerrar a sessão.", 0);

// ── 16. LIMITAÇÕES ────────────────────────────────────────────────────────────
secTitle(doc, 16, "Limitações da Fase 1");
bullets(doc, [
  "Não há backend real: toda a lógica de dados é gerenciada localmente em memória.",
  "Não há banco de dados conectado: os dados não persistem entre sessões.",
  "Login e cadastro são simulados: qualquer e-mail e senha válidos concedem acesso.",
  "Os dados mockados e as tarefas criadas são perdidos ao encerrar a sessão.",
  "Autenticação real com verificação de credenciais será implementada na Fase 2.",
]);

// ── 17. PLANEJAMENTO FASE 2 ───────────────────────────────────────────────────
secTitle(doc, 17, "Planejamento para a Fase 2");
bullets(doc, [
  "Backend em Node.js com Express para criação de uma API REST.",
  "Banco de dados MongoDB ou similar para persistência real de tarefas e usuários.",
  "Autenticação real com geração e validação de tokens JWT.",
  "Persistência das tarefas no banco de dados entre sessões.",
  "Integração do frontend com a API por meio de requisições HTTP.",
  "Uso de AsyncStorage para armazenamento local do token de autenticação.",
  "Melhorias em segurança, organização e escalabilidade da aplicação.",
]);

// ── 18. CONCLUSÃO ─────────────────────────────────────────────────────────────
secTitle(doc, 18, "Conclusão");
body(doc, "O TaskFlow, em sua Fase 1, cumpre com êxito o objetivo de apresentar um frontend funcional, responsivo e visualmente organizado para o gerenciamento de tarefas pessoais. A aplicação demonstra, por meio de dados mockados e fluxos simulados, todas as funcionalidades essenciais do sistema: criação, listagem, visualização, atualização de status e filtragem de tarefas.");
body(doc, "O código foi desenvolvido com foco em organização, modularidade e reutilização de componentes, seguindo boas práticas de desenvolvimento em React Native. A estrutura do projeto foi pensada para facilitar a evolução natural para a Fase 2, onde serão integrados o backend, o banco de dados e a autenticação real.");
body(doc, "Esta entrega representa a base sólida sobre a qual o sistema completo será construído, demonstrando domínio das tecnologias exigidas pela disciplina e capacidade de planejamento e execução de projetos de software para dispositivos móveis.", 0);

// ── 19. CRITÉRIOS AVALIATIVOS ─────────────────────────────────────────────────
secTitle(doc, 19, "Critérios Avaliativos");
body(doc, "O projeto TaskFlow foi desenvolvido considerando os seguintes critérios de avaliação da disciplina:");
doc.y += 4;
[
  ["Qualidade da documentação",    "Documento acadêmico completo com capa, introdução, problema, objetivos, requisitos, casos de uso com prints, telas e planejamento."],
  ["Nível de detalhes da aplicação","Seis telas implementadas, sete componentes reutilizáveis, oito tarefas mockadas e cinco casos de uso documentados e funcionais."],
  ["Organização do código",         "Estrutura modular em sete pastas por responsabilidade, com nomenclatura clara e separação de contextos, navegação e estilos."],
  ["Funcionamento sem erros",       "Aplicação verificada com zero erros de TypeScript, fluxos de navegação validados e todos os casos de uso funcionais."],
  ["Responsividade Web e Mobile",   "Interface adaptada para a web (maxWidth 720px) e mobile, com componentes responsivos em todas as telas."],
  ["Uso de React Native com Expo",  "Projeto desenvolvido em React Native com Expo, utilizando React Navigation, Hooks, Context API e dados mockados."],
].forEach(([label, desc], i) => {
  needPage(doc, 44);
  const y = doc.y;
  const h = 42;
  fillRect(doc, MARGIN, y, CW, h, i % 2 === 0 ? C.white : C.bgLight);
  fillRect(doc, MARGIN, y, 5, h, C.accent);
  doc.save().font("Helvetica-Bold").fontSize(9.5).fillColor(C.primary)
    .text(label, MARGIN + 14, y + 7, { width: CW - 20 }).restore();
  doc.save().font("Helvetica").fontSize(9).fillColor(C.textGray)
    .text(desc, MARGIN + 14, y + 22, { width: CW - 20 }).restore();
  drawLine(doc, MARGIN, y + h, MARGIN + CW, y + h, C.border);
  doc.y = y + h;
});

addFooter(doc);

// ── FINISH ────────────────────────────────────────────────────────────────────
doc.end();
stream.on("finish", () => {
  const stat = fs.statSync(OUT);
  console.log("PDF gerado: " + OUT);
  console.log("Tamanho: " + (stat.size / 1024).toFixed(1) + " KB");
  console.log("Total de páginas: " + pageNum);
});
stream.on("error", err => { console.error(err.message); process.exit(1); });
