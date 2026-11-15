import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'previews');
fs.mkdirSync(out, { recursive: true });

const chrome = [
  process.env.CHROME,
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && fs.existsSync(p));

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const report = [];
let bad = 0;

async function open(file, { width = 1280, height = 860 } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()} ${r.failure()?.errorText}`));
  await page.goto(pathToFileURL(path.join(here, file)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600);
  return { page, errors };
}

function note(name, ok, detail) {
  if (!ok) bad++;
  report.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

{
  const { page, errors } = await open('react/dist/index.html');
  await page.screenshot({ path: path.join(out, 'react.png'), fullPage: true });
  const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c').trim());
  const btn = page.locator('button.k1.p');
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pressedClass = await btn.evaluate((b) => b.classList.contains('ffdown'));
  await page.mouse.up();
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c').trim());
  const count = await page.locator('.n').textContent();
  await page.screenshot({ path: path.join(out, 'react-after-click.png'), fullPage: true });
  note('react: no console errors (file://)', errors.length === 0, errors.join(' | '));
  note('react: button gets .ffdown while pressed', pressedClass);
  note('react: click changes --c and count', before !== after && count === '1', `${before} -> ${after}, count ${count}`);
  const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p2.goto(pathToFileURL(path.join(here, 'react/dist/index.html')).href);
  await p2.waitForTimeout(800);
  const scroll = await p2.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  await p2.screenshot({ path: path.join(out, 'react-390.png'), fullPage: true });
  note('react: 390px wide has no horizontal scroll', scroll);
}

{
  const { page, errors } = await open('astro/dist/index.html');
  await page.screenshot({ path: path.join(out, 'astro-index.png'), fullPage: true });
  await page.click('a[href="./notes.html"]');
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  const url = page.url();
  const seal = await page.locator('button.k6 .ffh').count();
  await page.screenshot({ path: path.join(out, 'astro-notes.png'), fullPage: true });
  note('astro: no console errors across both pages (file://)', errors.length === 0, errors.join(' | '));
  note('astro: relative link navigates on disk', url.startsWith('file://') && url.endsWith('/notes.html'), url);
  note('astro: motion.js adopted k6 buttons (seal spans)', seal === 2, `seal spans ${seal}`);
  const { errors: e2 } = await open('astro/dist/notes.html');
  note('astro: notes.html opened directly has no console errors', e2.length === 0, e2.join(' | '));
}

await browser.close();
console.log(`browser: ${chrome}`);
console.log(report.join('\n'));
fs.writeFileSync(path.join(out, 'verify.txt'), `${new Date().toISOString()}\n${chrome}\n${report.join('\n')}\n`);
process.exit(bad ? 1 : 0);
