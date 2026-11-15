import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const templates = path.join(skill, 'templates');
export const assets = path.join(skill, 'assets');

const expand = (code) =>
  code
    .replace(/\/\*@include:([\w.-]+)\*\//g, (_, f) => expand(fs.readFileSync(path.join(templates, f), 'utf8')))
    .replace(/__ASSET:([^_][^"')]*?)__/g, (_, p) => '../assets/' + p);

export function feifei() {
  return {
    name: 'feifei-templates',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];
      if (path.dirname(file) === templates && file.endsWith('.css')) return { code: expand(code), map: null };
      return null;
    },
  };
}
