import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import pptxgen from 'pptxgenjs';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const ism = path.resolve(here, '..', '..');
const out = path.join(here, 'out');
const prev = path.join(out, 'preview');
mkdirSync(prev, { recursive: true });

const t = JSON.parse(readFileSync(path.join(ism, 'tokens/out/tokens.flat.json'), 'utf8'));
const L = JSON.parse(readFileSync(path.join(here, 'slide.json'), 'utf8'));
const pxv = (v) => parseFloat(v) * (String(v).endsWith('rem') ? 16 : 1);
const [W, H, S, Title, Body, Min] = ['SlideW', 'SlideH', 'SlideSafe', 'SlideTitle', 'SlideBody', 'SlideMin'].map((k) => pxv(t[k]));
const Lh = t.SlideLh;

const py = process.env.FEIFEI_PY || path.join(os.homedir(), '.feifei-ism-venv', 'bin', 'python');
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const bin = (n) => path.join(here, 'node_modules', '.bin', n);

const qianName = { Jia: '甲', Yi: '乙', Bing: '丙', Ding: '丁', Wu: '戊', Ji: '己', Geng: '庚', Xin: '辛', Ren: '壬', Gui: '癸', Zi: '子', Chou: '丑' };
const qianKey = Object.keys(t).find((k) => k.startsWith('Sign') && t[k].toLowerCase() === t.C.toLowerCase());
const qian = qianKey ? qianName[qianKey.slice(4)] : '?';
const d = new Date();
const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fam = (a) => a.map((f) => (/\s/.test(f) && !f.includes('-') ? `'${f}'` : f)).join(', ');
const first = (a) => a[0];
const measure = +(pxv(t.Measure) / pxv(t.FsBody)).toFixed(2);
const gfam = (f, spec = '') => `family=${f.replace(/ /g, '+')}${spec}`;
const gfonts = `https://fonts.googleapis.com/css2?${[gfam(first(t.FT)), gfam(first(t.FB), ':wght@400;600'), gfam(first(t.FE), ':ital@1'), gfam(first(t.FM))].join('&')}&display=swap`;
const hex = (c) => c.replace('#', '').slice(0, 6).toUpperCase();
const inch = (px) => +(px / 96).toFixed(4);
const pt = (px) => +(px * 0.75).toFixed(2);

const pngSize = (p) => {
  const b = readFileSync(p);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

execFileSync(py, [path.join(here, 'prep.py'), out], { stdio: 'inherit' });
const A = (n) => path.join(out, 'assets', n);
const signW = Math.round((W - 2 * S) * L.SignW);
const sign = (n) => {
  const s = pngSize(A(n));
  return { w: signW, h: Math.round((signW * s.h) / s.w) };
};

const seal = Math.round((pxv(t.SealSize) * Body) / pxv(t.FsBody));
const theme = `/* @theme feifei */
@import url('${gfonts}');
section{width:${W}px;height:${H}px;box-sizing:border-box;padding:${S}px;background:${t.Paper} url('assets/paper.jpg') center/cover no-repeat;color:${t.Ink2};font-family:${fam(t.FB)};font-size:${Body}px;line-height:${Lh};display:block;position:relative}
section h1{font-family:${fam(t.FT)};font-weight:400;font-size:${Title}px;line-height:1.2;letter-spacing:.02em;color:${t.Ink};margin:0 0 ${Body * 1.5}px}
section h2,section h3{font-family:${fam(t.FT)};font-weight:400;color:${t.Ink};font-size:${Body}px;margin:0 0 ${Body}px}
section p{margin:0 0 ${Body}px;max-width:${measure}em}
section strong,section b{font-weight:400;color:${t.Ink}}
section em{font-family:${fam(t.FE)};font-style:italic;font-size:1.1em}
section code{font-family:${fam(t.FM)};font-size:${Min}px;color:${t.Ink2};background:none}
section a{color:inherit;text-decoration:underline 1px ${t.Line};text-underline-offset:.2em}
section ol,section ul{list-style:none;padding:0;margin:0;max-width:${measure}em;counter-reset:n}
section li{counter-increment:n;margin:0 0 ${Math.round(Body * 0.6)}px}
section li::before{content:counter(n,decimal-leading-zero);font-family:${fam(t.FM)};font-size:${Min}px;color:${t.Ink3};margin-right:${Min}px}
section img{position:absolute;right:${S}px;bottom:${S}px;width:${signW}px;height:auto}
section header{position:absolute;top:${S}px;left:${S}px;font-family:${fam([first(t.FM), ...t.FB])};font-size:${Min}px;letter-spacing:.04em;color:${t.Ink3}}
section footer{position:absolute;bottom:${S}px;left:${S}px;font-family:${fam([first(t.FM), ...t.FB])};font-size:${Min}px;color:${t.Ink3}}
section::after{position:absolute;inset:${S}px ${S}px auto auto;padding:0;margin:0;width:auto;height:auto;line-height:1;text-align:right;font-family:${fam(t.FM)};font-size:${Min}px;color:${t.Ink3}}
section.cover img{right:auto;bottom:auto;left:50%;top:50%;width:${W - 2 * S}px;transform:translate(-50%,-46%)}
section.end img{right:auto;left:${S}px;bottom:${S}px;width:${Math.round(signW * 0.8)}px}
section.end .k{position:absolute;right:${S}px;bottom:${S}px;display:flex;gap:${Math.round(Min * 0.6)}px;align-items:flex-end}
section.end .v{writing-mode:vertical-rl;font-size:${Min}px;letter-spacing:.3em;color:${t.Ink};font-family:${fam(t.FB)}}
section.end .seal{width:${seal}px;height:${seal}px;box-sizing:border-box;padding:${Math.round(seal * L.SealPad)}px;background:${t.C};color:${t.Paper};font-family:${fam(t.FT)};font-size:${Math.round(seal * t.SealChar)}px;line-height:1.05;display:grid;grid-template-columns:1fr 1fr;place-items:center;transform:rotate(${t.SealRotate}deg)}
`;
writeFileSync(path.join(out, 'theme-feifei.css'), theme);
writeFileSync(path.join(out, 'deck.md'), readFileSync(path.join(here, 'deck.md'), 'utf8').replaceAll('{{qian}}', qian).replaceAll('{{date}}', date));

const marp = (args) => execFileSync(bin('marp'), [path.join(out, 'deck.md'), '--theme', path.join(out, 'theme-feifei.css'), '--html', '--allow-local-files', ...args], { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chrome } });
marp(['-o', path.join(out, 'deck.html')]);
marp(['--pdf', '-o', path.join(out, 'deck.pdf')]);
marp(['--images', 'png', '-o', path.join(prev, 'deck.png')]);

const shared = {
  title: '换栈，不换规矩',
  body: '颜色、字体、字号只从一份 token 读；Marp 主题和 PPTX 母版都是生成的。',
  sign: 'sign_leave.png',
  alt: '一群人站在左边，戴礼帽的那一个独自往右走开，他用主色',
  page: 1,
};
const sg = sign(shared.sign);
const bodyY = S + Title * 1.2 + Body * 1.5;
const measurePx = measure * Body;

const p = new pptxgen();
p.defineLayout({ name: 'FEIFEI', width: inch(W), height: inch(H) });
p.layout = 'FEIFEI';
p.defineSlideMaster({
  title: 'FEIFEI',
  background: { path: A('paper.jpg') },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: inch(S), y: inch(S), w: inch(W - 2 * S), h: inch(Title * 1.2), fontFace: first(t.FT), fontSize: pt(Title), color: hex(t.Ink), bold: false, align: 'left', valign: 'top', margin: 0, charSpacing: 1 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: inch(S), y: inch(bodyY), w: inch(measurePx), h: inch(Body * Lh * 4), fontFace: first(t.FB), fontSize: pt(Body), color: hex(t.Ink2), bold: false, align: 'left', valign: 'top', margin: 0, lineSpacingMultiple: Lh }, text: '' } },
  ],
  slideNumber: { x: inch(W - S - Min * 4), y: inch(S), w: inch(Min * 4), h: inch(Min * 1.4), fontFace: first(t.FM), fontSize: pt(Min), color: hex(t.Ink3), margin: 0, align: 'right', valign: 'top' },
});
const s =p.addSlide({ masterName: 'FEIFEI' });
s.addText(shared.title, { placeholder: 'title' });
s.addText(shared.body, { placeholder: 'body' });
s.addImage({ path: A(shared.sign), x: inch(W - S - sg.w), y: inch(H - S - sg.h), w: inch(sg.w), h: inch(sg.h), altText: shared.alt });
await p.writeFile({ fileName: path.join(out, 'pptxgenjs.pptx') });

const domHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<link rel="stylesheet" href="${gfonts}" crossorigin="anonymous">
<style>
html,body{margin:0;background:${t.Paper}}
#s{position:relative;width:${W}px;height:${H}px;overflow:hidden;color:${t.Ink2};font-family:${fam(t.FB)};font-size:${Body}px;line-height:${Lh}}
#s .bg{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
#s h1{position:absolute;left:${S}px;top:${S}px;margin:0;font-family:${fam(t.FT)};font-weight:400;font-size:${Title}px;line-height:1.2;letter-spacing:.02em;color:${t.Ink}}
#s p{position:absolute;left:${S}px;top:${bodyY}px;margin:0;width:${measurePx}px}
#s .sign{position:absolute;left:${W - S - sg.w}px;top:${H - S - sg.h}px;width:${sg.w}px;height:${sg.h}px}
#s .pn{position:absolute;right:${S}px;top:${S}px;font-family:${fam(t.FM)};font-size:${Min}px;line-height:1;color:${t.Ink3}}
</style></head><body>
<div id="s">
<img class="bg" src="assets/paper.jpg" alt="">
<h1>${shared.title}</h1>
<p>${shared.body}</p>
<img class="sign" src="assets/${shared.sign}" alt="${shared.alt}">
<div class="pn">${shared.page}</div>
</div>
</body></html>`;
writeFileSync(path.join(out, 'dom-slide.html'), domHtml);

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files', '--no-first-run'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(out, 'dom-slide.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(prev, 'dom-slide-html.png'), clip: { x: 0, y: 0, width: W, height: H } });
await page.addScriptTag({ path: path.join(here, 'node_modules/dom-to-pptx/dist/dom-to-pptx.bundle.js') });
const b64 = await page.evaluate(async (w, h) => {
  const blob = await window.domToPptx.exportToPptx('#s', { skipDownload: true, width: w, height: h });
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}, inch(W), inch(H));
writeFileSync(path.join(out, 'dom-to-pptx.pptx'), Buffer.from(b64, 'base64'));
await browser.close();

for (const f of ['pptxgenjs.pptx', 'dom-to-pptx.pptx']) {
  try {
    execFileSync('qlmanage', ['-t', '-s', String(W), '-o', prev, path.join(out, f)], { stdio: 'pipe' });
  } catch (e) {
    console.log(`qlmanage ${f}: ${e.message.split('\n')[0]}`);
  }
}
console.log(`qian=${qian} date=${date} measure=${measure}em signW=${signW}`);
console.log(existsSync(path.join(out, 'deck.pdf')) ? 'ok' : 'pdf missing');
