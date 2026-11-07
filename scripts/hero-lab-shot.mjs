/**
 * Screenshots a hero lab direction for review.
 *
 *   node scripts/hero-lab-shot.mjs <slug> <outDir> [--frames 0,90,240] [--scroll 0,0.5,1] [--theme light|dark] [--rm] [--base http://127.0.0.1:3100]
 *
 * Films: one shot per frame (`?f=<frame>` seeks and pauses). Scroll-driven directions: --scroll takes fractions of
 * the page's scrollable height. Each shot is taken at 1440x900 and 390x844, named <slug>-<desktop|phone>-<label>.png.
 * Needs the lab running (pnpm dev:hero-lab).
 */
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {chromium} from '@playwright/test';

const [slug, outDir, ...rest] = process.argv.slice(2);
if (!slug || !outDir) {
  console.error('Usage: node scripts/hero-lab-shot.mjs <slug> <outDir> [--frames 0,90] [--scroll 0,0.5] [--theme dark] [--rm]');
  process.exit(1);
}

const option = (name) => {
  const index = rest.indexOf(`--${name}`);
  return index === -1 ? undefined : rest[index + 1];
};
const frames = option('frames')?.split(',').map(Number);
const scrolls = option('scroll')?.split(',').map(Number);
const theme = option('theme') ?? 'light';
const reducedMotion = rest.includes('--rm');
const base = option('base') ?? 'http://127.0.0.1:3100';

const VIEWPORTS = [
  {name: 'desktop', width: 1440, height: 900},
  {name: 'phone', width: 390, height: 844},
];

mkdirSync(outDir, {recursive: true});
const browser = await chromium.launch();
const errors = [];

try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({viewport: {width: viewport.width, height: viewport.height}, deviceScaleFactor: 1});
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${viewport.name}: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${viewport.name}: ${message.text()}`);
    });

    const shoot = async (query, label, scroll) => {
      const params = new URLSearchParams({embed: '1', theme, ...query});
      if (reducedMotion) params.set('rm', '1');
      await page.goto(`${base}/design-lab/hero-film/${slug}?${params}`, {waitUntil: 'networkidle'});
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      if (scroll !== undefined) {
        await page.evaluate((fraction) => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({top: max * fraction, behavior: 'instant'});
        }, scroll);
      }
      // Let the lazy Player mount, seek and paint (or scroll-driven styles settle)
      await page.waitForTimeout(1500);
      const file = join(outDir, `${slug}-${viewport.name}-${label}${reducedMotion ? '-rm' : ''}${theme === 'dark' ? '-dark' : ''}.png`);
      await page.screenshot({path: file});
      console.log(file);
    };

    if (frames) for (const frame of frames) await shoot({f: String(frame)}, `f${frame}`);
    if (scrolls) for (const scroll of scrolls) await shoot({}, `s${Math.round(scroll * 100)}`, scroll);
    if (!frames && !scrolls) await shoot({}, 'load');
    await context.close();
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(`\nConsole errors:\n${[...new Set(errors)].join('\n')}`);
  process.exitCode = 1;
}
