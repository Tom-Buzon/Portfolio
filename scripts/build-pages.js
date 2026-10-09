import { spawnSync } from 'node:child_process';

// The workflow supplies the actual Pages path; local builds use the current repository name.
const env = { ...process.env, SITE_BASE: process.env.SITE_BASE || '/Portfolio/', VITE_STATIC_DEMO: 'true' };
for (const args of [['scripts/pages.js'], ['node_modules/vite/bin/vite.js', 'build'], ['scripts/prerender.js']]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
