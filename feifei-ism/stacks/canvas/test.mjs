import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = pathToFileURL(path.join(here, 'board.html')).href;
fs.mkdirSync(path.join(here, 'out'), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const result = { chrome: browser.version(), runs: {} };

async function open(hash, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url + hash, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__board && window.__board.tex && document.fonts.status === 'loaded');
  await page.waitForTimeout(400);
  return { page, errors };
}

const probe = () => {
  const c = document.createElement('canvas');
  c.setAttribute('content', 'drawable');
  return {
    canvasContent: c.content,
    drawElementImage: 'drawElementImage' in CanvasRenderingContext2D.prototype,
    requestPaint: 'requestPaint' in HTMLCanvasElement.prototype,
    layoutSubtree: 'layoutSubtree' in HTMLCanvasElement.prototype,
    drawElement: 'drawElement' in CanvasRenderingContext2D.prototype,
    rough: !!window.rough,
  };
};

const cardBox = (i) => {
  const c = window.__board.cards[i];
  return { x: c.x, y: c.y, w: c.el.offsetWidth, h: c.el.offsetHeight };
};

const inCanvas = (i) => {
  const cv = document.getElementById('cv'), k = cv.width / cv.clientWidth, x = cv.getContext('2d');
  const c = window.__board.cards[i], b = c.el.querySelector('button');
  const box = (X, Y, w, h) => x.getImageData(Math.round(X * k), Math.round(Y * k), Math.round(w * k), Math.round(h * k)).data;
  const p = c.el.querySelector('p');
  const d = box(c.x + p.offsetLeft, c.y + p.offsetTop, p.offsetWidth, p.offsetHeight);
  let dark = 0;
  for (let j = 0; j < d.length; j += 4) if (d[j] * .3 + d[j + 1] * .59 + d[j + 2] * .11 < 110) dark++;
  let main = 0;
  if (b) {
    const m = getComputedStyle(document.documentElement).getPropertyValue('--c').trim().replace('#', '');
    const rgb = [0, 2, 4].map((s) => parseInt(m.slice(s, s + 2), 16));
    const e = box(c.x + b.offsetLeft, c.y + b.offsetTop, b.offsetWidth, b.offsetHeight);
    for (let j = 0; j < e.length; j += 4) if (Math.abs(e[j] - rgb[0]) + Math.abs(e[j + 1] - rgb[1]) + Math.abs(e[j + 2] - rgb[2]) < 90) main++;
  }
  let exportOk = true;
  try { cv.toDataURL('image/png'); } catch (err) { exportOk = String(err); }
  return { textDarkPixelsInCanvas: dark, buttonMainColourPixelsInCanvas: main, toDataURL: exportOk };
};

async function stroke(page, pts) {
  await page.mouse.move(...pts[0]);
  await page.mouse.down();
  for (const p of pts.slice(1)) await page.mouse.move(...p, { steps: 4 });
  await page.mouse.up();
}

const wave = (x0, y0, x1, amp) => [...Array(16)].map((_, i) => [x0 + (x1 - x0) * i / 15, y0 + Math.sin(i / 15 * Math.PI * 2) * amp]);

for (const [name, hash] of [['auto', ''], ['fallback', '#fallback']]) {
  const { page, errors } = await open(hash, { width: 1280, height: 800 });
  const r = { probe: await page.evaluate(probe), mode: await page.evaluate(() => window.__board.mode) };
  const paints0 = await page.evaluate(() => window.__board.paints);
  await stroke(page, wave(150, 330, 560, 40));
  await page.getByRole('button', { name: '毛笔' }).click();
  await stroke(page, wave(560, 640, 1000, 30));
  r.strokes = await page.evaluate(() => window.__board.strokes.map((s) => s.pen));
  await page.getByRole('button', { name: '卡片' }).click();
  await page.mouse.click(930, 380);
  r.cardsAfterDrop = await page.evaluate(() => window.__board.cards.length);
  await page.waitForTimeout(200);
  await page.keyboard.type('新放的卡片');
  await page.getByRole('button', { name: '歪线' }).click();
  const c0 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c').trim());
  const bt = await page.evaluate(() => { const c = window.__board.cards[0], b = c.el.querySelector('button'); return [c.x + b.offsetLeft + b.offsetWidth / 2, c.y + b.offsetTop + b.offsetHeight / 2]; });
  await page.mouse.click(...bt);
  await page.waitForTimeout(500);
  const c1 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c').trim());
  r.buttonClickChangesSign = { before: c0, after: c1, hit: c0 !== c1, tag: await page.evaluate(() => document.getElementById('tag').textContent) };
  const before = await page.evaluate(cardBox, 1);
  await stroke(page, [[before.x + 24, before.y + 14], [before.x + 104, before.y + 64]]);
  const after = await page.evaluate(cardBox, 1);
  r.dragCard = { from: [before.x, before.y], to: [after.x, after.y], moved: after.x !== before.x };
  await page.waitForTimeout(300);
  r.canvasPixels = await page.evaluate(inCanvas, 0);
  r.paints = (await page.evaluate(() => window.__board.paints)) - paints0;
  r.typedCardText = await page.evaluate(() => window.__board.cards[2]?.el.textContent);
  await page.screenshot({ path: path.join(here, 'out', `preview_${name}.png`) });
  await page.getByRole('button', { name: '存图' }).click();
  await page.waitForTimeout(900);
  r.saveOverlay = await page.evaluate(async () => {
    const shot = document.getElementById('shot'), img = document.getElementById('shotimg');
    await img.decode().catch(() => null);
    const cv = document.getElementById('cv'), k = cv.width / cv.clientWidth, c = window.__board.cards[0], p = c.el.querySelector('p');
    const o = document.createElement('canvas');
    o.width = img.naturalWidth; o.height = img.naturalHeight;
    const g = o.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const dark = (X, Y, w, h) => { const d = g.getImageData(Math.round(X), Math.round(Y), Math.round(w), Math.round(h)).data; let n = 0; for (let j = 0; j < d.length; j += 4) if (d[j] * .3 + d[j + 1] * .59 + d[j + 2] * .11 < 110) n++; return n; };
    return {
      visible: !shot.hidden && getComputedStyle(shot).display !== 'none',
      src: img.src.slice(0, 22),
      size: [img.naturalWidth, img.naturalHeight],
      darkPixelsWholeImage: dark(0, 0, o.width, o.height),
      darkPixelsCard1Text: dark((c.x + p.offsetLeft) * k, (c.y + p.offsetTop) * k, p.offsetWidth * k, p.offsetHeight * k),
      focus: document.activeElement.id,
    };
  });
  await page.screenshot({ path: path.join(here, 'out', `preview_${name}_save.png`) });
  await page.getByRole('button', { name: '收起' }).click();
  r.saveOverlay.closed = await page.evaluate(() => document.getElementById('shot').hidden);
  r.errors = errors;
  result.runs[name] = r;
  await page.close();
}

const { page, errors } = await open('', { width: 390, height: 844 });
await page.screenshot({ path: path.join(here, 'out', 'preview_mobile.png') });
result.runs.mobile390 = { mode: await page.evaluate(() => window.__board.mode), horizontalScroll: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors };
await page.close();
await browser.close();
fs.writeFileSync(path.join(here, 'out', 'test-result.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
