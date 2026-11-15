import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { here } from './ff.mjs';

const dist = path.join(here, 'demo', 'dist');
fs.rmSync(dist, { recursive: true, force: true });
const vite = path.join(here, 'node_modules', '.bin', 'vite');

for (const entry of ['buttons', 'mdxcn-before', 'mdxcn-after']) {
  const r = spawnSync(vite, ['build', '--config', 'demo/vite.config.mjs'], {
    cwd: here,
    stdio: 'inherit',
    env: { ...process.env, ENTRY: entry },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
