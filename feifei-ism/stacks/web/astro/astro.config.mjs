import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { feifei, skill } from '../ff-vite.mjs';

export default defineConfig({
  integrations: [mdx()],
  outDir: './dist',
  build: { format: 'file', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  vite: {
    plugins: [feifei()],
    resolve: { alias: { '@ff': skill } },
    server: { fs: { allow: [skill] } },
    build: { assetsInlineLimit: () => true },
  },
});
