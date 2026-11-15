import { chromium } from 'playwright-core';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';

export async function record(o) {
  const fps = o.fps || 30, dur = o.duration || 4, W = o.width || 1920, H = o.height || 1080, k = o.scale || 2;
  const n = Math.round(dur * fps), step = 1000 / fps;
  const dir = o.frames || fs.mkdtempSync(path.join(os.tmpdir(), 'ffrec-'));
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', '--disable-gpu', '--mute-audio'],
  });
  const ctx = await browser.newContext({ viewport: { width: W / k, height: H / k }, deviceScaleFactor: k, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript({ path: path.join(here, 'clock.js') });
  await page.goto(pathToFileURL(path.resolve(o.html)).href, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const text = [...new Set(document.body.innerText.replace(/\s/g, ''))].join('');
    const faces = new Map([...document.fonts].map((f) => [`${f.style} ${f.weight} 16px "${f.family.replace(/"/g, '')}"`, 1]));
    await Promise.all([...faces.keys()].map((f) => document.fonts.load(f, text).catch(() => null)));
    await Promise.all([window.__sceneReady, document.fonts.ready]);
  });
  await page.waitForTimeout(300);
  const fonts = await page.evaluate(() => Object.fromEntries(['ZCOOL XiaoWei', 'Noto Serif SC', 'Cormorant Garamond', 'JetBrains Mono'].map((f) => [f, document.fonts.check(`16px "${f}"`, '走开记2026')])));
  const hashes = [];
  for (let i = 0; i < n; i++) {
    if (i) await page.evaluate((ms) => window.__vt.advance(ms), step);
    else await page.evaluate(() => window.__vt.advance(0));
    const buf = await page.screenshot({ type: 'png', animations: 'allow', caret: 'hide' });
    const f = path.join(dir, `f${String(i).padStart(5, '0')}.png`);
    fs.writeFileSync(f, buf);
    hashes.push(createHash('sha256').update(buf).digest('hex'));
  }
  const version = browser.version();
  await browser.close();
  const res = { html: path.resolve(o.html), fps, duration: dur, width: W, height: H, frames: n, chrome: version, fonts, errors, hashes, dir };
  if (o.out) {
    fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
    const r = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f%05d.png'),
      '-vf', 'scale=out_color_matrix=bt709:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', '-r', String(fps), path.resolve(o.out)], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('ffmpeg failed');
    const stem = path.join(path.dirname(path.resolve(o.out)), path.basename(o.out, path.extname(o.out)));
    res.stills = (o.stills || []).map((t) => {
      const i = Math.min(n - 1, Math.round(t * fps)), dst = `${stem}_${t.toFixed(1)}s.png`;
      fs.copyFileSync(path.join(dir, `f${String(i).padStart(5, '0')}.png`), dst);
      return dst;
    });
    const { dir: _, ...man } = res;
    fs.writeFileSync(`${stem}.frames.json`, JSON.stringify(man, null, 1));
    if (!o.frames) fs.rmSync(dir, { recursive: true, force: true });
  }
  return res;
}

function args(v) {
  const o = { html: null };
  for (let i = 0; i < v.length; i++) {
    const a = v[i];
    if (!a.startsWith('--')) { o.html = a; continue; }
    const key = a.slice(2), val = v[++i];
    o[key] = key === 'out' || key === 'frames' ? val : key === 'stills' ? val.split(',').map(Number) : Number(val);
  }
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const o = args(process.argv.slice(2));
  if (!o.html) {
    console.error('usage: node record.mjs scene.html --duration 4 --fps 30 --out out/sample.mp4 [--width 1920 --height 1080 --scale 2 --stills 0.9,2,3.9 --frames dir]');
    process.exit(2);
  }
  const r = await record(o);
  console.log(JSON.stringify({ out: o.out, frames: r.frames, chrome: r.chrome, fonts: r.fonts, stills: r.stills, errors: r.errors }, null, 1));
}
