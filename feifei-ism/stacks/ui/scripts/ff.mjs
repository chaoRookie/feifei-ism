import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const skill = path.resolve(here, '..', '..');
export const templates = path.join(skill, 'templates');
export const assets = path.join(skill, 'assets');
export const vendor = path.join(skill, '..', 'vendor', 'mdxcn');
export const tokens = JSON.parse(fs.readFileSync(path.join(skill, 'tokens', 'out', 'tokens.flat.json'), 'utf8'));

const mime = { webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', jpg: 'image/jpeg' };

export const dataUri = (rel) => {
  const file = path.join(assets, rel);
  return `data:${mime[path.extname(file).slice(1)]};base64,${fs.readFileSync(file).toString('base64')}`;
};

export const expand = (code) =>
  code
    .replace(/\/\*@include:([\w.-]+)\*\//g, (_, f) => expand(fs.readFileSync(path.join(templates, f), 'utf8')))
    .replace(/__ASSET:([^_][^"')]*?)__/g, (_, p) => dataUri(p));

export const template = (name) => expand(fs.readFileSync(path.join(templates, name), 'utf8'));

export const font = (list) => list.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');

export const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log('wrote', path.relative(here, file), `${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`);
};
