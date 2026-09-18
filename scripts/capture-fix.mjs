import { chromium } from "playwright-chromium";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://91511164-3000-4b10-852f-fc254bd8b99c-00-qt1797t1mb8i.expo.spock.replit.dev";
const OUT = path.join(__dirname, "../assets/screenshots");
const VIEWPORT = { width: 390, height: 844 };
const CHROMIUM_PATH = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

async function shot(page, name) {
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log(`✓ ${name}.png`);
}

async function goToWelcome(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(1200);
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
  await page.waitForTimeout(3000);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage({ viewport: VIEWPORT });

  // ── CU1: Criar Tarefa — botão "+" é o PRIMEIRO ícone no header (x≈272) ─────
  console.log("\n[CU1] Criar Tarefa...");
  await goToWelcome(page);
  await doLogin(page);

  // Encontra os dois botões do header e clica no PRIMEIRO ("+", não logout)
  const iconBtns = await page.$$("[role='button'], button");
  let plusClicked = false;
  for (const btn of iconBtns) {
    const box = await btn.boundingBox();
    // O botão "+" fica em x≈272, y≈68 (primeiro dos dois ícones do header)
    if (box && box.x < 310 && box.x > 250 && box.y > 50 && box.y < 100) {
      await btn.click();
      plusClicked = true;
      console.log(`  Clicou no botão + em x:${box.x.toFixed(0)} y:${box.y.toFixed(0)}`);
      break;
    }
  }
  if (!plusClicked) {
    // Fallback: clica diretamente na posição x:294 (centro do botão +)
    await page.mouse.click(294, 90);
    console.log("  Clicou via posição x:294 y:90");
  }
  await page.waitForTimeout(2000);
  
  // Verifica se chegou na tela de criar tarefa
  const content = await page.content();
  if (content.includes("Nova Tarefa") || content.includes("Título")) {
    console.log("  ✓ Chegou na tela de Nova Tarefa");
    await shot(page, "create-task");
  } else {
    // Tenta novamente clicando mais à esquerda (x:272 exato)
    await goToWelcome(page);
    await doLogin(page);
    await page.mouse.click(272 + 22, 68 + 22); // centro do primeiro botão
    await page.waitForTimeout(2000);
    const content2 = await page.content();
    console.log("  Conteúdo após clique:", content2.includes("Nova Tarefa") ? "Nova Tarefa OK" : "ainda errado");
    await shot(page, "create-task");
  }

  // ── CU4: Atualizar Status — abre tarefa com status "Em Andamento" e muda ──
  console.log("\n[CU4] Atualizar Status...");
  await goToWelcome(page);
  await doLogin(page);
  await page.waitForTimeout(600);

  // Abre a primeira tarefa que tem status "Em Andamento" (Estudar para prova)
  try {
    await page.click("text=Estudar para prova", { timeout: 3000 });
    console.log("  Abriu: Estudar para prova");
  } catch (_) {
    try {
      await page.click("text=Estudar", { timeout: 3000 });
      console.log("  Abriu: Estudar");
    } catch (_) {
      await page.click("text=Entregar", { timeout: 3000 }).catch(() => {});
      console.log("  Abriu: Entregar");
    }
  }
  await page.waitForTimeout(1500);

  // Clica em "Concluída" para mostrar a mudança de status
  // O botão "Concluída" fica na seção "ALTERAR STATUS"
  let clicked = false;
  for (const btn of await page.$$("[role='button'], button, div")) {
    const text = (await btn.innerText().catch(() => "")).trim();
    const box = await btn.boundingBox();
    if (box && box.y > 400 && (text === "Concluída" || text === "Concluído")) {
      await btn.click();
      clicked = true;
      console.log(`  Clicou em "${text}" na posição y:${box.y.toFixed(0)}`);
      break;
    }
  }
  if (!clicked) {
    // Usa posição aproximada dos botões de status (estão na parte inferior da tela)
    // Baseado na tela de detalhes: botões ficam em y≈630, sendo Concluída em x≈310
    await page.mouse.click(310, 632);
    console.log("  Clicou em Concluída via posição");
  }
  await page.waitForTimeout(1500);
  await shot(page, "update-status");

  // ── CU5: Filtrar — ativa o filtro "Pendentes" para mostrar filtro ativo ──
  console.log("\n[CU5] Filtrar Tarefas com filtro ativo...");
  await goToWelcome(page);
  await doLogin(page);
  await page.waitForTimeout(600);

  // Clica em "Pendentes" nas abas de filtro de status
  try {
    const pendentesEl = page.locator("div").filter({ hasText: /^Pendentes$/ }).first();
    await pendentesEl.click({ timeout: 3000 });
    console.log("  Filtro 'Pendentes' ativado");
  } catch (_) {
    console.log("  Não encontrou 'Pendentes', usando dashboard padrão");
  }
  await page.waitForTimeout(1000);
  await shot(page, "filters");

  await browser.close();
  console.log("\nCorreções concluídas.");
})();
