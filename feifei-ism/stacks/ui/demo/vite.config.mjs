import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const vendor = path.resolve(here, '..', '..', '..', '..', 'vendor', 'mdxcn');
const entry = process.env.ENTRY || 'buttons';

export default defineConfig({
  root: here,
  base: './',
  plugins: [react(), tailwind(), viteSingleFile()],
  resolve: {
    dedupe: ['react', 'react-dom', 'motion', 'cn'],
    alias: [
      { find: /^@\/registry\//, replacement: path.join(vendor, 'registry') + '/' },
      { find: /^@\/lib\/utils$/, replacement: path.join(vendor, 'lib', 'utils.ts') },
      { find: /^cn$/, replacement: require.resolve('cn') },
    ],
  },
  build: {
    outDir: path.join(here, 'dist'),
    emptyOutDir: false,
    rollupOptions: { input: path.join(here, `${entry}.html`) },
  },
});
