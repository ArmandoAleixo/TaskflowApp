import { chromium } from "playwright-chromium";

const BASE_URL = "https://91511164-3000-4b10-852f-fc254bd8b99c-00-qt1797t1mb8i.expo.spock.replit.dev";
const CHROMIUM_PATH = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(800);
  await page.click("text=Entrar");
  await page.waitForTimeout(1200);

  // Fill inputs
  const inputs = page.locator("input");
  const cnt = await inputs.count();
  console.log("Input count:", cnt);
  if (cnt > 0) await inputs.first().fill("usuario@taskflow.com");
  if (cnt > 1) await inputs.nth(1).fill("123456");
  await page.waitForTimeout(500);

  // Get all clickable text on page
  const texts = await page.$$eval("*", els => 
    els.filter(el => el.textContent?.trim().length < 30 && el.children.length === 0)
       .map(el => ({ tag: el.tagName, text: el.textContent?.trim(), role: el.getAttribute("role") }))
       .filter(x => x.text)
       .slice(0, 40)
  );
  console.log("Leaf text elements:", JSON.stringify(texts, null, 2));

  await browser.close();
})();
