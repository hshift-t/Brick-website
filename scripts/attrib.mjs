/**
 * Attribution probe: scroll the page with individual effects disabled to
 * find what actually costs frames, instead of guessing.
 */
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const server = await createServer({ server: { port: 4326 }, logLevel: 'error' });
await server.listen();
const base = `http://localhost:${server.config.server.port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--use-gl=swiftshader'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

const VARIANTS = {
  baseline: '',
  'no-backdrop-filter': `.glass,.glass-soft{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`,
  'smaller-backdrop-blur': `.glass{backdrop-filter:blur(12px) saturate(120%)!important;-webkit-backdrop-filter:blur(12px) saturate(120%)!important}`,
  'no-aurora-text-sweep': `.text-aurora-animated{animation:none!important}`,
  'no-nebula-blur': `.nebula{filter:none!important}`,
  'no-mesh-mask': `.mesh-grid{display:none!important}`,
  'no-boxshadow-stars': `.starfield__sheet{box-shadow:none!important}`,
  'no-big-shadows': `*{box-shadow:none!important}`,
  'no-fixed-bg-layers': `.starfield,.nebula,.horizon-glow{display:none!important}`,
};

const measure = async (label, css) => {
  await page.goto(base, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  if (css) await page.addStyleTag({ content: css });
  await new Promise((r) => setTimeout(r, 300));

  const r = await page.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    let running = true;
    const tick = (t) => {
      frames.push(t - last);
      last = t;
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const total = document.body.scrollHeight - window.innerHeight;
    const start = performance.now();
    for (let y = 0; y <= total; y += 24) {
      window.scrollTo(0, y);
      await new Promise((res) => requestAnimationFrame(res));
    }
    const elapsed = performance.now() - start;
    running = false;
    frames.shift();
    const sorted = [...frames].sort((a, b) => a - b);
    return {
      median: +(sorted[Math.floor(sorted.length * 0.5)] ?? 0).toFixed(1),
      p95: +(sorted[Math.floor(sorted.length * 0.95)] ?? 0).toFixed(1),
      fps: +(1000 / (sorted[Math.floor(sorted.length * 0.5)] ?? 1)).toFixed(1),
      over50: frames.filter((f) => f > 50).length,
      elapsed: Math.round(elapsed),
    };
  });
  console.log(
    `${label.padEnd(24)} median ${String(r.median).padStart(6)}ms  p95 ${String(r.p95).padStart(7)}ms  ~${String(r.fps).padStart(5)}fps  >50ms:${String(r.over50).padStart(4)}  ${r.elapsed}ms`,
  );
  return r;
};

console.log('\nScroll-through attribution (1440x950, software raster)\n');
for (const [label, css] of Object.entries(VARIANTS)) {
  await measure(label, css);
}

await browser.close();
await server.close();
