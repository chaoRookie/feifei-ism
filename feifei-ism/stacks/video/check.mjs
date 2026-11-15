import fs from 'node:fs';
import path from 'node:path';
import { record } from './record.mjs';

const html = process.argv[2] || 'scene.html';
const man = process.argv[3] || 'out/sample.frames.json';
const base = fs.existsSync(man) ? JSON.parse(fs.readFileSync(man, 'utf8')) : null;
const o = { html, fps: base?.fps || 30, duration: base?.duration || 4 };
const a = await record(o), b = await record(o);
[a, b].forEach((r) => fs.rmSync(r.dir, { recursive: true, force: true }));
const diff = (x, y) => x.hashes.reduce((s, h, i) => s + (h !== y.hashes[i] ? 1 : 0), 0);
const out = {
  frames: a.frames,
  runA_vs_runB_mismatch: diff(a, b),
  runA_vs_manifest_mismatch: base ? diff(a, base) : null,
  sample: [0, Math.floor(a.frames / 2), a.frames - 1].map((i) => ({ frame: i, a: a.hashes[i].slice(0, 16), b: b.hashes[i].slice(0, 16), manifest: base?.hashes[i]?.slice(0, 16) ?? null })),
  distinct_frames: new Set(a.hashes).size,
  errors: [...a.errors, ...b.errors],
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.runA_vs_runB_mismatch === 0 && (base ? out.runA_vs_manifest_mismatch === 0 : true) ? 0 : 1);
