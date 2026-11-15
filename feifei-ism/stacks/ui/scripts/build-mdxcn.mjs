import fs from 'node:fs';
import path from 'node:path';
import { here, vendor, template, dataUri, write, tokens, font } from './ff.mjs';

const roles = {
  background: 'paper',
  foreground: 'ink',
  card: 's-raised',
  'card-foreground': 'ink',
  popover: 's-overlay',
  'popover-foreground': 'ink',
  primary: 'c',
  'primary-foreground': 'paper',
  secondary: 's-sunken',
  'secondary-foreground': 'ink',
  muted: 's-sunken',
  'muted-foreground': 'ink-3',
  accent: 's-sunken',
  'accent-foreground': 'ink',
  destructive: 'ink',
  border: 'line',
  input: 'line',
  ring: 'ink',
  'chart-1': 'c',
  'chart-2': 'ink',
  'chart-3': 'ink-2',
  'chart-4': 'ink-3',
  'chart-5': 'line',
  sidebar: 's-sunken',
  'sidebar-foreground': 'ink',
  'sidebar-primary': 'c',
  'sidebar-primary-foreground': 'paper',
  'sidebar-accent': 's-raised',
  'sidebar-accent-foreground': 'ink',
  'sidebar-border': 'line',
  'sidebar-ring': 'ink',
  'graph-accent': 'c',
  'graph-accent-2': 'ink-2',
  'graph-accent-3': 'ink-3',
  'graph-frame': 'ink-3',
  'graph-muted': 'ink-3',
  'graph-faint': 'line',
  stage: 's-sunken',
  'site-rail': 'line',
  'contrast-14': 'line',
  'contrast-23': 'line',
  'contrast-45': 'ink-3',
  'contrast-70': 'ink-2',
  'font-sans': 'f-b',
  'font-mono': 'f-m',
  'font-heading': 'f-t',
};

const vars = Object.entries(roles).map(([k, v]) => `--${k}:var(--${v})`).join(';');

const mono = font([tokens.FM[0], ...tokens.FB]);

const override = [
  template('tokens.css').trim(),
  `:root,:root.dark,:root[data-accent],:root.dark[data-accent]{${vars};--graph-surface:transparent;--radius:0;color-scheme:light}`,
  `html,.font-sans{font-family:var(--f-b)}`,
  `.font-mono{font-family:${mono}}`,
  `.font-heading{font-family:var(--f-t);font-weight:400}`,
  `.font-medium,.font-semibold,.font-bold,b,strong{font-weight:400}`,
  `body{background-color:var(--paper);background-image:url(${dataUri('paper/xuan_fiber.webp')}),url(${dataUri('paper/xuan_cloud.webp')});background-size:768px,1181px;background-blend-mode:multiply,multiply;color:var(--ink)}`,
  `@media print{body{background-image:none}}`,
  `.graph-frame{background-image:none}`,
  `figure[data-frame="box"]>span[aria-hidden="true"]{display:none}`,
  `.graph-title-ink{color:var(--ink);font-family:${mono}}`,
  `::selection{background:color-mix(in srgb,var(--c) 18%,transparent)}`,
].join('\n') + '\n';

write(path.join(here, 'mdxcn', 'feifei-mdxcn.css'), override);

const globals = fs
  .readFileSync(path.join(vendor, 'app', 'globals.css'), 'utf8')
  .replace(/^@import\s+"(tailwindcss|tw-animate-css|shadcn\/tailwind\.css)";\s*$/gm, '');
write(path.join(here, 'demo', '.gen', 'mdxcn-globals.css'), globals);
