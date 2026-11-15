import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { feifei, skill } from '../ff-vite.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  base: './',
  plugins: [feifei(), react(), viteSingleFile()],
  resolve: { dedupe: ['react', 'react-dom'], alias: { '@ff': skill } },
  server: { fs: { allow: [skill] } },
  build: { outDir: path.join(here, 'dist'), emptyOutDir: true },
});
