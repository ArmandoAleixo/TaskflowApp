import { chromium } from "playwright-chromium";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://91511164-3000-4b10-852f-fc254bd8b99c-00-qt1797t1mb8i.expo.spock.replit.dev";
const OUT = path.join(__dirname, "../assets/screenshots");
const VIEWPORT = { width: 390, height: 844 };
const CHROMIUM_PATH = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

async function shot(page, name) {
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log(`✓ ${name}.png`);
}

async function goToWelcome(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(1000);
}

async function doLogin(page) {
  await page.locator("div").filter({ hasText: /^Entrar$/ }).first().click();
  await page.waitForTimeout(700);
  const inputs = page.locator("input");
  await inputs.first().fill("usuario@taskflow.com");
  const cnt = await inputs.count();
  if (cnt > 1) await inputs.nth(1).fill("123456");
  await page.waitForTimeout(400);
  await page.locator("div").filter({ hasText: /^Entrar$/ }).last().click();
  await page.waitForTimeout(2800);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage({ viewport: VIEWPORT });

  // ── 1. Welcome ────────────────────────────────────────────────────────────
  await goToWelcome(page);
  await shot(page, "welcome");

  // ── 2. Login screen ───────────────────────────────────────────────────────
  await goToWelcome(page);
  await page.locator("div").filter({ hasText: /^Entrar$/ }).first().click();
  await page.waitForTimeout(900);
  await shot(page, "login");

  // ── 3. Register screen ────────────────────────────────────────────────────
  await goToWelcome(page);
  await page.locator("div").filter({ hasText: /^Criar Conta$/ }).first().click();
  await page.waitForTimeout(900);
  await shot(page, "register");

  // ── 4. Dashboard (Caso de Uso 2 — Listar Tarefas) ─────────────────────────
  await goToWelcome(page);
  await doLogin(page);
  await shot(page, "dashboard");

  // ── 5. Filters (Caso de Uso 5 — Filtrar por Status/Prioridade) ────────────
  // Fica no dashboard e ativa o filtro "Em Andamento"
  await goToWelcome(page);
  await doLogin(page);
  await page.waitForTimeout(500);
  // Tenta clicar em "Em Andamento" nas abas de filtro
  const filterCandidates = ["Em Andamento", "Andamento", "Pendente", "Alta", "Média"];
  for (const f of filterCandidates) {
    try {
      const el = page.locator("div").filter({ hasText: new RegExp(`^${f}$`) }).first();
      await el.click({ timeout: 3000 });
      console.log(`Clicou no filtro: ${f}`);
      break;
    } catch (_) {}
  }
  await page.waitForTimeout(1000);
  await shot(page, "filters");

  // ── 6. Create Task (Caso de Uso 1 — Criar Tarefa) ─────────────────────────
  await goToWelcome(page);
  await doLogin(page);
  // Clica no botão de criar nova tarefa
  const createTexts = ["Nova Tarefa", "+ Nova", "Criar Tarefa", "Adicionar", "Nova", "+"];
  let createdNav = false;
  for (const t of createTexts) {
    try {
      await page.locator("div").filter({ hasText: new RegExp(`^${t}$`) }).last().click({ timeout: 3000 });
      createdNav = true;
      console.log(`Navegou para criar tarefa via: ${t}`);
      break;
    } catch (_) {
      try {
        await page.click(`text=${t}`, { timeout: 2000 });
        createdNav = true;
        break;
      } catch (_) {}
    }
  }
  if (!createdNav) {
    // Dump screen text para debug
    const texts = await page.$$eval("div", els =>
      els.filter(e => e.textContent?.trim().length > 2 && e.textContent?.trim().length < 40)
        .map(e => e.textContent?.trim()).slice(0, 30)
    );
    console.log("Textos na tela (debug create):", texts);
  }
  await page.waitForTimeout(1400);
  await shot(page, "create-task");

  // ── 7. Task Details (Caso de Uso 3 — Visualizar Detalhes) ─────────────────
  await goToWelcome(page);
  await doLogin(page);
  await page.waitForTimeout(600);
  // Clica no primeiro card de tarefa disponível
  const taskKeywords = ["Preparar", "Estudar", "Comprar", "Revisar", "Ler", "Exerc", "Reuni", "Organiz", "React", "apresenta", "Planejar", "Criar", "Finalizar"];
  let clickedTask = false;
  for (const kw of taskKeywords) {
    try {
      await page.click(`text=${kw}`, { timeout: 2500 });
      clickedTask = true;
      console.log(`Abriu detalhes via: ${kw}`);
      break;
    } catch (_) {}
  }
  if (!clickedTask) {
    const divTexts = await page.$$eval("div", els =>
      els.filter(el => el.textContent?.trim().length > 5 && el.textContent?.trim().length < 60 && el.children.length === 0)
         .map(el => el.textContent?.trim()).slice(0, 20)
    );
    console.log("Textos visíveis (debug task-details):", divTexts);
  }
  await page.waitForTimeout(1400);
  await shot(page, "task-details");

  // ── 8. Update Status (Caso de Uso 4 — Atualizar Status) ───────────────────
  // Já está na tela de detalhes — clica em um botão de status diferente do atual
  // para mostrar a mudança de status
  const statusButtons = ["Em Andamento", "Concluída", "Concluído", "Iniciar", "Concluir", "Pendente"];
  let changedStatus = false;
  for (const s of statusButtons) {
    try {
      const el = page.locator("div").filter({ hasText: new RegExp(`^${s}$`) }).first();
      const count = await el.count();
      if (count > 0) {
        await el.click({ timeout: 2500 });
        changedStatus = true;
        console.log(`Status alterado para: ${s}`);
        break;
      }
    } catch (_) {}
  }
  if (!changedStatus) {
    // Tenta qualquer botão de ação na tela
    try {
      await page.locator("div[role='button']").last().click({ timeout: 2000 });
    } catch (_) {}
  }
  await page.waitForTimeout(1200);
  await shot(page, "update-status");

  await browser.close();
  console.log("\nTodos os screenshots capturados com sucesso.");
})();
