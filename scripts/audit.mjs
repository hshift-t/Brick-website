/**
 * Responsive + overflow audit.
 *
 * Boots the built site in headless Chrome and, at every breakpoint from
 * 320px to 3840px, asserts that no element's box extends past the viewport
 * (the horizontal-scroll leak) and reports the offenders. Also smoke-tests
 * the interactive surfaces: simulator run, tab switching, FAQ, QR modal.
 *
 * Run with:  node scripts/audit.mjs
 */
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const CHROME =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const WIDTHS = [320, 360, 375, 390, 414, 480, 640, 768, 834, 1024, 1280, 1440, 1920, 2560, 3840];

const server = await createServer({ server: { port: 4319 }, logLevel: 'error' });
await server.listen();
const base = `http://localhost:${server.config.server.port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
});

const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));

let failures = 0;
const log = (s) => console.log(s);

/* ── 1. Overflow audit at every breakpoint ─────────────────────────── */
for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: 'networkidle0' });
  // Force every scroll-reveal into its final state so nothing is measured
  // mid-animation, and let fonts settle.
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll('main *').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
  });
  await new Promise((r) => setTimeout(r, 250));

  const report = await page.evaluate((vw) => {
    const docScrollW = document.documentElement.scrollWidth;
    const bodyScrollW = document.body.scrollWidth;

    /** True when some ancestor clips the element, so its box crossing the
     *  viewport edge cannot actually create a scrollbar. Decorative blooms
     *  are all `pointer-events-none` children of `overflow-hidden` panels. */
    const isClipped = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX !== 'visible' || cs.overflow !== 'visible') return true;
      }
      return false;
    };

    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      // Fixed layers are viewport-sized by design.
      if (cs.position === 'fixed') continue;
      // A horizontal scroll container is an intentional, contained bleed.
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
      if (el.closest('.no-bar')) continue;

      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      if (isClipped(el)) continue;

      offenders.push({
        sel:
          el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
            : ''),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
      });
    }

    return {
      docScrollW,
      bodyScrollW,
      clientW: document.documentElement.clientWidth,
      offenders: offenders.slice(0, 6),
      offenderCount: offenders.length,
    };
  }, w);

  // A leak is only a leak if the document actually scrolls horizontally.
  const leak = report.docScrollW > report.clientW + 1;
  const bad = leak || report.offenderCount > 0;
  if (bad) failures++;

  log(
    `${bad ? 'FAIL' : 'ok  '}  ${String(w).padStart(4)}px  scrollW=${report.docScrollW} clientW=${report.clientW}` +
      (report.offenderCount ? `  offenders=${report.offenderCount}` : ''),
  );
  report.offenders.forEach((o) => log(`        → ${o.sel}  [${o.left} → ${o.right}] w=${o.w}`));
}

/* ── 2. Interactive smoke test ─────────────────────────────────────── */
await page.setViewport({ width: 1440, height: 950 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));

const checks = [];
const check = (name, pass, note = '') => {
  checks.push({ name, pass, note });
  if (!pass) failures++;
  log(`${pass ? 'ok  ' : 'FAIL'}  ${name}${note ? `  — ${note}` : ''}`);
};

/** innerText honours `text-transform`, so the UI renders several strings
 *  uppercased. Assertions compare case-insensitively. */
const has = (page, needle) =>
  page.evaluate((n) => document.body.innerText.toLowerCase().includes(n.toLowerCase()), needle);

/** Wait for text rather than sleeping — frame timing under headless is
 *  variable, and a fixed sleep turns a real pass into a flaky failure. */
const waitForText = (page, needle, timeout = 8000) =>
  page
    .waitForFunction(
      (n) => document.body.innerText.toLowerCase().includes(n.toLowerCase()),
      { timeout, polling: 120 },
      needle,
    )
    .then(() => true)
    .catch(() => false);

// 2a. Engine simulator: run a sample, expect a result panel
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) =>
    x.textContent.includes('Instagram Reel'),
  );
  b?.click();
});
await new Promise((r) => setTimeout(r, 250));
check(
  'simulator enters running state',
  await page.evaluate(() => !!document.querySelector('.animate-scan-sweep')),
);
check('simulator resolves to format ladder', await waitForText(page, 'Extracted formats'));
check('simulator reports zero watermarks', await has(page, '0 watermarks'));
check(
  'simulator offers 4K / 1080p / MP3 rungs',
  (await has(page, '4K MP4')) && (await has(page, '1080p')) && (await has(page, 'High-Bitrate MP3')),
);

// 2b. App showcase tab switch
await page.evaluate(() => {
  const tabs = [...document.querySelectorAll('button')].filter((b) =>
    ['Queue', 'Extractor', 'Library'].includes(b.textContent.trim()),
  );
  tabs[1]?.click();
});
await new Promise((r) => setTimeout(r, 500));
check('app showcase switches to Extractor tab', await waitForText(page, 'Format ladder'));

// 2c. FAQ accordion open/close
const faqBefore = await page.evaluate(() => document.querySelectorAll('button[aria-expanded]').length);
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[aria-expanded]')].find((x) =>
    x.textContent.includes('Does it work without Root?'),
  );
  b?.click();
});
check(
  'FAQ accordion expands the chosen answer',
  await waitForText(page, 'supported configuration'),
);
check('accordion buttons are keyboard-addressable', faqBefore > 0, `${faqBefore} found`);

// 2d. Install guide brand tabs
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) =>
    x.textContent.trim() === 'Xiaomi / MIUI',
  );
  b?.click();
});
check('install guide swaps OEM instructions', await waitForText(page, 'Privacy protection'));

// 2e. QR modal
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) =>
    x.textContent.includes('Scan QR Code'),
  );
  b?.click();
});
await page
  .waitForSelector('[data-magnetarx="qr"] svg path', { timeout: 8000, polling: 120 })
  .catch(() => {});
const qr = await page.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) return { found: false };
  // The encoder emits a background rect path plus one module path. Module
  // count is the subpath count of the longer of the two; a version-3 code
  // (29×29) is 841 modules, so a real payload yields a long `d`.
  const svg = dlg.querySelector('[data-magnetarx="qr"] svg');
  const paths = [...(svg?.querySelectorAll('path') ?? [])].map((p) => p.getAttribute('d') ?? '');
  const longest = paths.sort((a, b) => b.length - a.length)[0] ?? '';
  return {
    found: true,
    hasSvg: !!svg,
    viewBox: svg?.getAttribute('viewBox'),
    pathLen: longest.length,
    rows: (longest.match(/M[\d.]+ [\d.]+h/g) ?? []).length,
    hasDirectLink: !!dlg.querySelector('a[download]'),
    focusInDialog: dlg.contains(document.activeElement),
  };
});
check(
  'QR modal renders a real scannable SVG',
  qr.found && qr.hasSvg && qr.rows > 20 && qr.viewBox?.startsWith('0 0'),
  `viewBox=${qr.viewBox} moduleRows=${qr.rows} pathLen=${qr.pathLen}`,
);
check('QR modal offers a direct fallback link', !!qr.hasDirectLink);
check('QR modal moves focus into the dialog', !!qr.focusInDialog);

// 2f. Mobile nav drawer at 375px
await page.setViewport({ width: 375, height: 812 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 300));
await page.evaluate(() => {
  document.querySelector('button[aria-label="Open menu"]')?.click();
});
await new Promise((r) => setTimeout(r, 500));
check(
  'mobile drawer opens with all nav links',
  (await waitForText(page, 'Download APK · v2.4.2')) && (await has(page, 'Supported Platforms')),
);

// 2g. Background layer is actually painting (not a blank void)
await page.setViewport({ width: 1440, height: 950 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 500));
const bgInfo = await page.evaluate(() => {
  const sheet = document.querySelector('.starfield__far');
  const nebula = document.querySelector('.nebula--a');
  const cs = sheet ? getComputedStyle(sheet) : null;
  return {
    // Count the `Npx Npx 0 0` shadow layers (colours contain commas, so
    // splitting the declaration string is not a reliable count).
    stars: cs ? (cs.boxShadow.match(/\d+px\s+\d+px\s+0px\s+0px/g) ?? []).length : 0,
    nebulaPos: nebula ? getComputedStyle(nebula).position : null,
    canvases: document.querySelectorAll('canvas').length,
  };
});
check('starfield is CSS-painted (not canvas)', bgInfo.stars > 50, `${bgInfo.stars} star shadows`);
check('nebula layer is composited', bgInfo.nebulaPos === 'fixed');
check('zero <canvas> elements on the page', bgInfo.canvases === 0);

// 2h. Reduced motion
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));
check(
  'page still renders under prefers-reduced-motion',
  await page.evaluate(() => document.body.innerText.length > 2000),
);

/* ── 3. Console hygiene ────────────────────────────────────────────── */
const realErrors = consoleErrors.filter((e) => !/favicon|net::ERR_/i.test(e));
check('no console errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

await browser.close();
await server.close();

log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
