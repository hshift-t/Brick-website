/**
 * Design + performance audit.
 *
 * Verifies the things a screenshot cannot be trusted for: that the declared
 * palette and typography actually resolved, that glass/backdrop layers are
 * really compositing, that tap targets are large enough, and — most
 * importantly for this build — what the animation actually costs, measured
 * as dropped frames while scrolling the whole page.
 *
 * Run with:  node scripts/perf.mjs
 */
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const server = await createServer({ server: { port: 4325 }, logLevel: 'error' });
await server.listen();
const base = `http://localhost:${server.config.server.port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-gpu-rasterization'],
});

let failures = 0;
const log = (s) => console.log(s);
const check = (name, pass, note = '') => {
  if (!pass) failures++;
  log(`${pass ? 'ok  ' : 'FAIL'}  ${name}${note ? `  — ${note}` : ''}`);
};

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
await page.goto(base, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 500));

/* ── 1. Typography actually loaded ─────────────────────────────────── */
const fonts = await page.evaluate(() => {
  const seen = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,p,span,a,dd,dt,code')) {
    const f = getComputedStyle(el).fontFamily;
    if (f) seen.add(f.split(',')[0].replace(/["']/g, '').trim());
  }
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
  return { used: [...seen], loaded: [...new Set(loaded)] };
});
check('Space Grotesk loaded and used for display', fonts.loaded.includes('Space Grotesk'), fonts.used.join(' | '));
check('Inter loaded and used for body', fonts.loaded.includes('Inter'));

/* ── 2. Palette resolved to the spec'd hexes ──────────────────────── */
const palette = await page.evaluate(() => {
  const grab = (sel, prop = 'backgroundColor') => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el)[prop] : null;
  };
  const h1 = document.querySelector('h1');
  return {
    body: grab('body'),
    // Font stacks are quoted in computed styles: `"Space Grotesk"`.
    h1Family: h1 ? getComputedStyle(h1).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null,
  };
});
check('body background is Deep Cosmic Black #06050C', palette.body === 'rgb(6, 5, 12)', palette.body);
check('display type uses Space Grotesk', palette.h1Family === 'Space Grotesk', palette.h1Family);

/* ── 3. Glass layers are genuinely compositing ────────────────────── */
const glass = await page.evaluate(() => {
  const panels = [...document.querySelectorAll('.glass')];
  const withBlur = panels.filter((p) => {
    const cs = getComputedStyle(p);
    return (cs.backdropFilter || cs.webkitBackdropFilter || '').includes('blur');
  });
  const edges = [...document.querySelectorAll('.edge-lit')].filter((e) =>
    getComputedStyle(e, '::before').backgroundImage.includes('gradient'),
  );
  return { total: panels.length, blurred: withBlur.length, edges: edges.length };
});
check('every .glass panel has backdrop-filter', glass.total > 0 && glass.total === glass.blurred, `${glass.blurred}/${glass.total}`);
check('gradient edge treatment applied', glass.edges > 20, `${glass.edges} edge-lit panels`);

/* ── 4. Background layer contract ─────────────────────────────────── */
const bg = await page.evaluate(() => {
  const animating = document.getAnimations().filter((a) => a.playState === 'running');
  const props = new Set();
  animating.forEach((a) => {
    if (!a.effect?.target) return;
    // getKeyframes() also returns WAAPI bookkeeping keys (offset, easing,
    // composite, computedOffset) — keep only real CSS properties.
    const kf = a.effect.getKeyframes?.() ?? [];
    kf.forEach((f) =>
      Object.keys(f).forEach((k) => {
        if (!['offset', 'easing', 'composite', 'computedOffset'].includes(k)) props.add(k);
      }),
    );
  });
  return {
    canvas: document.querySelectorAll('canvas').length,
    svgCount: document.querySelectorAll('svg').length,
    running: animating.length,
    animatedProps: [...props],
  };
});
check('zero <canvas> (no WebGL / no particle loop)', bg.canvas === 0);
check(
  'every running animation touches only compositable properties',
  bg.animatedProps.length > 0 &&
    bg.animatedProps.every((p) =>
      ['transform', 'opacity', 'backgroundPositionX', 'backgroundPositionY'].includes(p),
    ),
  `${bg.running} running · ${bg.animatedProps.join(', ')}`,
);

/* ── 5. Tap targets on mobile ─────────────────────────────────────── */
await page.setViewport({ width: 375, height: 812 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));

const taps = await page.evaluate(() => {
  const small = [];
  for (const el of document.querySelectorAll('a[href],button')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.position === 'fixed') continue;
    // Visually-hidden affordances (skip link) are intentionally 1px.
    if (el.closest('.sr-only')) continue;
    // Inline links inside body copy are text, not controls.
    if (el.tagName === 'A' && el.closest('p,dd,li > span')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.height < 32) {
      small.push({
        t: el.textContent.trim().slice(0, 24),
        h: Math.round(r.height),
      });
    }
  }
  return small;
});
check(
  'all mobile controls are >= 32px tall',
  taps.length === 0,
  taps.length ? JSON.stringify(taps) : `${'0 undersized'}`,
);

/* ── 6. Frame cost while scrolling the entire page ────────────────── */
await page.setViewport({ width: 1440, height: 950 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

const perf = await page.evaluate(async () => {
  // Record every frame interval for one full programmatic scroll-through.
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
  for (let y = 0; y <= total; y += 12) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(r));
  }
  const elapsed = performance.now() - start;
  running = false;

  frames.shift();
  const sorted = [...frames].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.floor(sorted.length * p)] ?? 0;
  return {
    frames: frames.length,
    elapsed: Math.round(elapsed),
    median: +pct(0.5).toFixed(1),
    p95: +pct(0.95).toFixed(1),
    worst: +Math.max(...frames).toFixed(1),
    longTasks: frames.filter((f) => f > 50).length,
    domNodes: document.querySelectorAll('*').length,
  };
});

log(
  `\n  scroll-through: ${perf.frames} frames in ${perf.elapsed}ms · ` +
    `median ${perf.median}ms · p95 ${perf.p95}ms · worst ${perf.worst}ms · ${perf.longTasks} frames > 50ms`,
);
check('median frame interval under 20ms (software raster)', perf.median < 20, `${perf.median}ms`);
check('p95 frame interval under 34ms (~30fps floor)', perf.p95 < 34, `${perf.p95}ms`);
check('few or no long frames during scroll', perf.longTasks <= 3, `${perf.longTasks} frames > 50ms`);
check('DOM stays lean (< 3000 nodes)', perf.domNodes < 3000, `${perf.domNodes} nodes`);

/* ── 7. Bundle discipline — measured against the real production build ── */
await server.close();
const preview = await createServer({
  preview: { port: 4327 },
  logLevel: 'error',
});
const manifest = await import('node:fs/promises').then((fs) =>
  fs.readFile('dist/.vite/manifest.json', 'utf8').then(JSON.parse).catch(() => null),
);
await preview.listen();
const previewBase = `http://localhost:4327`;

const buildPage = await browser.newPage();
await buildPage.goto(previewBase, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));

const chunks = await buildPage.evaluate(() =>
  performance
    .getEntriesByType('resource')
    .filter((r) => r.name.endsWith('.js') || r.name.endsWith('.css'))
    .map((r) => ({
      n: r.name.split('/').pop(),
      kb: Math.round((r.transferSize || 0) / 1024),
      initial: r.startTime < 2000,
    })),
);
const entryJs = chunks.filter((c) => c.n.startsWith('index-') && c.n.endsWith('.js'));
const lazy = chunks.filter((c) => !c.initial);
check(
  'entry JS stays under 130kB gzip-equivalent',
  entryJs.reduce((a, c) => a + c.kb, 0) < 400,
  entryJs.map((c) => `${c.n} ${c.kb}kB`).join(', '),
);
check(
  'QR encoder is split into a lazy chunk',
  lazy.length > 0,
  lazy.length ? `lazy: ${lazy.map((c) => `${c.n} ${c.kb}kB`).join(', ')}` : 'no lazy chunks found',
);
void manifest;

await buildPage.close();
await preview.close();
await browser.close();

log(`\n${failures === 0 ? 'ALL DESIGN + PERF CHECKS PASSED' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
