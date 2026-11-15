import StyleDictionary from 'style-dictionary';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const templates = path.join(here, '..', 'templates') + path.sep;
const out = path.join(here, 'out') + path.sep;
const isMotion = (t) => ['t', 'e'].includes(t.path[0]);

StyleDictionary.registerFormat({
  name: 'feifei/root',
  format: ({ dictionary, options }) => {
    const body = dictionary.allTokens.map((t) => `--${t.name}:${t.$value ?? t.value}`).join(';');
    return `${options.head || ''}:root{${body}}\n`;
  },
});

const sd = new StyleDictionary({
  source: [path.join(here, 'feifei.tokens.json')],
  usesDtcg: true,
  log: { verbosity: 'default' },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: templates,
      files: [
        { destination: 'tokens.css', format: 'feifei/root', filter: (t) => !isMotion(t), options: { head: ':root{color-scheme:light}' } },
        { destination: 'tokens-motion.css', format: 'feifei/root', filter: isMotion },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: out,
      files: [
        { destination: 'tokens.mjs', format: 'javascript/es6' },
        { destination: 'tokens.flat.json', format: 'json/flat' },
      ],
    },
  },
});

await sd.buildAllPlatforms();
