import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { here, tokens as t, template, font, write } from './ff.mjs';

const buttonsCss = ['tokens.css', 'motion.css', 'buttons.css', 'buttons-ring.css', 'buttons-slash.css'].map(template).join('\n');
write(path.join(here, 'registry/feifei/styles/feifei-buttons.css'), buttonsCss);

const roles = {
  background: t.Paper,
  foreground: t.Ink,
  card: t.SRaised,
  'card-foreground': t.Ink,
  popover: t.SOverlay,
  'popover-foreground': t.Ink,
  primary: t.C,
  'primary-foreground': t.Paper,
  secondary: t.SSunken,
  'secondary-foreground': t.Ink,
  muted: t.SSunken,
  'muted-foreground': t.Ink3,
  accent: t.SSunken,
  'accent-foreground': t.Ink,
  destructive: t.Ink,
  border: t.Line,
  input: t.Line,
  ring: t.Ink,
  'chart-1': t.C,
  'chart-2': t.Ink,
  'chart-3': t.Ink2,
  'chart-4': t.Ink3,
  'chart-5': t.Line,
  sidebar: t.SSunken,
  'sidebar-foreground': t.Ink,
  'sidebar-primary': t.C,
  'sidebar-primary-foreground': t.Paper,
  'sidebar-accent': t.SRaised,
  'sidebar-accent-foreground': t.Ink,
  'sidebar-border': t.Line,
  'sidebar-ring': t.Ink,
  paper: t.Paper,
  ink: t.Ink,
  'ink-2': t.Ink2,
  'ink-3': t.Ink3,
  line: t.Line,
  c: t.C,
  's-sunken': t.SSunken,
  's-raised': t.SRaised,
  's-overlay': t.SOverlay,
  scrim: t.Scrim,
  radius: '0rem',
};

const theme = {
  'font-sans': font(t.FB),
  'font-serif': font(t.FB),
  'font-heading': font(t.FT),
  'font-mono': font(t.FM),
};

const css = {
  '@layer base': {
    body: {
      'background-color': 'var(--paper)',
      color: 'var(--ink-2)',
      'font-family': 'var(--font-serif)',
      'font-size': t.FsBody,
      'line-height': String(t.LhBody),
    },
    'h1, h2, h3, h4': { 'font-family': 'var(--font-heading)', 'font-weight': '400', color: 'var(--ink)' },
    h1: { 'font-size': t.FsH1, 'letter-spacing': '0.02em', 'line-height': '1.2' },
    h2: { 'font-size': t.FsH2 },
    h3: { 'font-size': t.FsH3 },
    h4: { 'font-size': t.FsH4 },
    'b, strong': { 'font-weight': '400', color: 'var(--ink)' },
    a: { color: 'var(--ink)', 'text-decoration': 'none', 'border-bottom': '1px solid var(--ink-3)' },
  },
};

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'feifei-ism',
  homepage: 'https://github.com/chaoRookie/feifei-ism',
  items: [
    {
      name: 'feifei-ism',
      type: 'registry:style',
      title: '肥肥主义',
      description: '宣纸、墨、一个主色。颜色、字体、圆角全部由 tokens/feifei.tokens.json 生成。',
      extends: 'none',
      dependencies: [],
      registryDependencies: [],
      cssVars: { theme, light: roles, dark: roles },
      css,
    },
    {
      name: 'button',
      type: 'registry:ui',
      title: '肥肥主义按钮 k1–k6',
      description: '两类六套：刮字块、一笔托字、颜料字、点线、彩铅圈、印头。',
      dependencies: [],
      registryDependencies: [],
      files: [
        { path: 'registry/feifei/ui/button.tsx', type: 'registry:ui' },
        { path: 'registry/feifei/styles/feifei-buttons.css', type: 'registry:file', target: 'styles/feifei-buttons.css' },
      ],
      docs: '在根布局里引入 styles/feifei-buttons.css；它带着 token、按钮样式和颜料贴图。',
    },
  ],
};

write(path.join(here, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');

const bin = path.join(here, 'node_modules', '.bin', 'shadcn');
const r = spawnSync(bin, ['build', 'registry.json', '--output', 'public/r'], { cwd: here, stdio: 'inherit' });
if (r.status !== 0) {
  console.error('shadcn build failed with status', r.status);
  process.exit(r.status ?? 1);
}
