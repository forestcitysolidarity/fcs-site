// Re-take the preview screenshots:  python3 -m http.server 8765  (in the site folder), then
//   node preview/shoot.js
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765';
const pages = ['index', 'events', 'donate'];
const themes = ['a', 'b', 'c'];
const widths = [390, 1280];
(async () => {
  const browser = await chromium.launch();
  for (const t of themes) for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(`${BASE}/${p}.html?theme=${t}`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(400);
      const out = path.join(__dirname, `${p}-${t}-${w}.png`);
      await page.screenshot({ path: out, fullPage: true });
      console.log(out);
    }
    await ctx.close();
  }
  await browser.close();
})();
