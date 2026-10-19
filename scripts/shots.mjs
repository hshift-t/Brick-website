/**
 * Visual capture. Renders the full page at a set of viewports and writes
 * PNGs to .review/ so the design can be eyeballed without a dev server.
 *
 * Run with:  node scripts/shots.mjs
 */
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';
import { mkdir } from 'node:fs/promises';

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = '.review';

const SHOTS = [
  { name: 'desktop-1440', w: 1440, h: 1000, full: true },
  { name: 'laptop-1280', w: 1280, h: 900, full: true },
  { name: 'tablet-834', w: 834, h: 1100, full: true },
  { name: 'mobile-390', w: 390, h: 844, full: true },
  { name: 'mobile-320', w: 320, h: 720, full: true },
];

await mkdir(OUT, { recursive: true });
const server = await createServer({ server: { port: 4324 }, logLevel: 'error' });
await server.listen();
const base = `http://localhost:${server.config.server.port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--force-color-profile=srgb',
    '--font-render-hinting=none',
  ],
});

for (const s of SHOTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));

  // Settle every scroll-reveal so nothing is captured mid-fade, then walk
  // the page so IntersectionObservers have fired for all sections.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1400));

  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log(`wrote ${OUT}/${s.name}.png`);
  await page.close();
}

await browser.close();
await server.close();
