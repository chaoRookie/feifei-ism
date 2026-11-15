import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { here, tokens } from './ff.mjs';

const lum = (rgb) => {
  const c = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

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
const note = (name, ok, detail) => {
  if (!ok) bad++;
  report.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function open(file, width = 1100, height = 900) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()} ${r.failure()?.errorText}`));
  await page.goto(pathToFileURL(path.join(here, 'demo', 'dist', file)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  return { page, errors };
}

{
  const { page, errors } = await open('buttons.html', 1100, 1300);
  await page.screenshot({ path: path.join(out, 'buttons.png'), fullPage: true });
  const second = page.locator('button.k2', { hasText: '二档' });
  await second.click();
  const picked = await second.getAttribute('aria-pressed');
  const toggle = page.locator('button.k5', { hasText: '开合' });
  await toggle.click();
  const toggled = await toggle.getAttribute('aria-pressed');
  const drawn = await toggle.evaluate((b) => b.classList.contains('ffdraw'));
  const k1 = page.locator('button.k1.p');
  const box = await k1.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const down = await k1.evaluate((b) => b.classList.contains('ffdown'));
  await page.mouse.up();
  const t0 = Date.now();
  await page.waitForFunction(() => !document.querySelector('button.k1.p').classList.contains('ffdown'));
  const held = Date.now() - t0;
  const seals = await page.locator('button.k6 > .ffh').count();
  const slashes = await page.locator('button:disabled > .ffslash').count();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(out, 'buttons-after-click.png'), fullPage: true });
  note('buttons: no console errors (file://)', errors.length === 0, errors.join(' | '));
  note('buttons: k2 group selection sets aria-pressed', picked === 'true');
  note('buttons: k5 toggle flips aria-pressed and redraws ring', toggled === 'true' && drawn);
  note('buttons: k1 pressed gets .ffdown and releases', down && held >= 0, `released after ~${held}ms`);
  note('buttons: k6 renders seal spans', seals === 4, `${seals}`);
  note('buttons: disabled buttons render slash', slashes === 6, `${slashes}`);
}

const shots = {};
for (const side of ['before', 'after']) {
  const { page, errors } = await open(`mdxcn-${side}.html`, 900);
  await page.screenshot({ path: path.join(out, `mdxcn-${side}.png`), fullPage: true });
  shots[side] = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const frame = document.querySelector('.graph-frame');
    const mono = document.querySelector('.font-mono');
    return {
      accent: s.getPropertyValue('--graph-accent').trim(),
      c: s.getPropertyValue('--c').trim(),
      background: getComputedStyle(document.body).backgroundColor,
      frameImage: frame ? getComputedStyle(frame).backgroundImage.slice(0, 40) : 'no .graph-frame',
      mono: mono ? getComputedStyle(mono).fontFamily : 'no .font-mono',
      link: (() => { const l = [...document.querySelectorAll('span')].find((e) => e.textContent === '│'); return l ? getComputedStyle(l).color : 'none'; })(),
      corners: document.querySelectorAll('figure[data-frame="box"]>span[aria-hidden="true"]').length,
      cornersShown: [...document.querySelectorAll('figure[data-frame="box"]>span[aria-hidden="true"]')].filter((e) => getComputedStyle(e).display !== 'none').length,
    };
  });
  note(`mdxcn ${side}: no console errors (file://)`, errors.length === 0, errors.join(' | '));
}
note('mdxcn after: --graph-accent follows --c', shots.after.accent === 'var(--c)' || shots.after.accent === shots.after.c, JSON.stringify(shots.after));
note('mdxcn after: dashed box frame removed', shots.after.frameImage === 'none', shots.before.frameImage + ' -> ' + shots.after.frameImage);
note('mdxcn after: mono is JetBrains Mono with serif CJK fallback', /JetBrains/.test(shots.after.mono) && /Noto Serif SC/.test(shots.after.mono), shots.before.mono + ' -> ' + shots.after.mono);

const link = (shots.after.link.match(/\d+/g) || []).slice(0, 3).map(Number);
const linkRatio = link.length === 3 ? ratio(link, hex(tokens.Paper)) : 0;
note('mdxcn after: timeline connector >= 3:1 on --paper', linkRatio >= 3, `${shots.before.link} -> ${shots.after.link}, ${linkRatio.toFixed(2)}:1 vs ${tokens.Paper}`);
note('mdxcn after: frame corner marks hidden', shots.after.corners > 0 && shots.after.cornersShown === 0, `${shots.after.cornersShown}/${shots.after.corners} shown`);

await browser.close();
console.log(`browser: ${chrome}`);
console.log(report.join('\n'));
fs.writeFileSync(path.join(out, 'verify.txt'), `${new Date().toISOString()}\n${chrome}\n${report.join('\n')}\n`);
process.exit(bad ? 1 : 0);
