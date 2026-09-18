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

  // ── CU1: Criar Tarefa — navega pelo botão "+" no header ───────────────────
  console.log("\n[CU1] Criar Tarefa...");
  await goToWelcome(page);
  await doLogin(page);

  // O botão "+" é um TouchableOpacity no canto superior direito do dashboard.
  // Em React Native Web, renderiza como div com role="button" ou como div clicável.
  // Vamos clicar na posição do botão + (canto superior direito da tela).
  // Baseado no layout: topBar com paddingTop ~52, botão fica em ~x:340, y:60
  let navigatedToCreate = false;
  try {
    // Tenta encontrar pelo aria-label ou role
    await page.locator("[aria-label*='ova']").first().click({ timeout: 2000 });
    navigatedToCreate = true;
    console.log("  Navegou via aria-label");
  } catch (_) {}

  if (!navigatedToCreate) {
    try {
      // Clica na posição do botão "+" no canto superior direito
      await page.mouse.click(345, 62);
      await page.waitForTimeout(1000);
      // Verifica se saiu do dashboard
      const url = page.url();
      const content = await page.content();
      if (content.includes("Nova Tarefa") || content.includes("Título")) {
        navigatedToCreate = true;
        console.log("  Navegou via clique em posição");
      }
    } catch (_) {}
  }

  if (!navigatedToCreate) {
    try {
      // Tenta clicar em "Criar primeira tarefa" se visível (EmptyState)
      await page.click("text=Criar primeira tarefa", { timeout: 2000 });
      navigatedToCreate = true;
      console.log("  Navegou via 'Criar primeira tarefa'");
    } catch (_) {}
  }

  if (!navigatedToCreate) {
    // Debug: vê todos os elementos clicáveis
    const clickables = await page.$$eval(
      "div[role='button'], button, [tabindex='0']",
      els => els.map(el => ({
        text: el.textContent?.trim().slice(0, 30),
        rect: el.getBoundingClientRect ? JSON.stringify(el.getBoundingClientRect()) : "?"
      })).slice(0, 20)
    );
    console.log("  Clicáveis disponíveis:", JSON.stringify(clickables, null, 2));

    // Tenta clicar em todos os botões no canto superior direito (x > 300, y < 100)
    for (const el of await page.$$("div[role='button'], button, [tabindex='0']")) {
      const box = await el.boundingBox();
      if (box && box.x > 300 && box.y < 100) {
        console.log(`  Clicando em elemento em x:${box.x.toFixed(0)} y:${box.y.toFixed(0)}`);
        await el.click();
        await page.waitForTimeout(1000);
        const content = await page.content();
        if (content.includes("Nova Tarefa") || content.includes("Título *")) {
          navigatedToCreate = true;
          console.log("  Navegou via elemento posicional");
          break;
        }
      }
    }
  }

  await shot(page, "create-task");

  // ── CU3: Detalhes da Tarefa ───────────────────────────────────────────────
  console.log("\n[CU3] Detalhes da Tarefa...");
  await goToWelcome(page);
  await doLogin(page);
  await page.waitForTimeout(600);

  // Clica no primeiro card de tarefa — procura pelos títulos das tarefas mockadas
  const taskTitles = [
    "Estudar React Native",
    "Preparar apresentação",
    "Comprar mantimentos",
    "Revisar projeto",
    "Organizar",
    "Finalizar",
    "Planejar",
    "Estudar",
    "Preparar",
    "Comprar",
    "Revisar",
    "React",
    "Node",
    "TypeScript",
  ];

  let clickedTask = false;
  for (const title of taskTitles) {
    try {
      await page.click(`text=${title}`, { timeout: 2500 });
      clickedTask = true;
      console.log(`  Abriu detalhes: "${title}"`);
      break;
    } catch (_) {}
  }

  if (!clickedTask) {
    // Clica no primeiro card — procura divs que parecem cards (y entre 300-600, altura > 50)
    const cards = await page.$$("div");
    for (const card of cards) {
      const box = await card.boundingBox();
      if (box && box.width > 300 && box.height > 50 && box.height < 200 && box.y > 280) {
        const text = await card.innerText().catch(() => "");
        if (text.length > 10) {
          await card.click();
          console.log(`  Clicou em card: "${text.slice(0, 40)}"`);
          await page.waitForTimeout(1200);
          const content = await page.content();
          if (content.includes("Descrição") || content.includes("Prioridade") || content.includes("Prazo")) {
            clickedTask = true;
            break;
          }
        }
      }
    }
  }

  await shot(page, "task-details");

  // ── CU4: Atualizar Status ─────────────────────────────────────────────────
  console.log("\n[CU4] Atualizar Status...");
  // Já deve estar na tela de detalhes — clica em um botão de status diferente

  // Verifica qual status está ativo e clica em outro
  const statusLabels = ["Em Andamento", "Concluída", "Pendente", "Concluído", "Iniciar", "Concluir", "Em andamento"];
  let changedStatus = false;
  for (const s of statusLabels) {
    try {
      const el = page.locator("div").filter({ hasText: new RegExp(`^${s}$`) }).first();
      const count = await el.count();
      if (count > 0) {
        const box = await el.boundingBox();
        if (box && box.y > 100) { // não clica em elementos no topo da tela (filtros do dashboard)
          await el.click({ timeout: 2500 });
          changedStatus = true;
          console.log(`  Status alterado para: "${s}"`);
          break;
        }
      }
    } catch (_) {}
  }

  if (!changedStatus) {
    // Procura botões de status pelo conteúdo do elemento pai
    const buttons = await page.$$("div[role='button'], button");
    for (const btn of buttons) {
      const text = await btn.innerText().catch(() => "");
      const box = await btn.boundingBox();
      if (box && box.y > 300 && (
        text.includes("Andamento") || text.includes("Conclu") || text.includes("Pendente")
      )) {
        await btn.click();
        changedStatus = true;
        console.log(`  Status alterado via botão: "${text.slice(0, 30)}"`);
        break;
      }
    }
  }

  await page.waitForTimeout(1200);
  await shot(page, "update-status");

  await browser.close();
  console.log("\nCaptura de casos de uso concluída.");
})();
