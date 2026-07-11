import { spawnSync } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('@playwright/test/package.json');
const job = process.argv[2];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const e2ePort = process.env.E2E_PORT ?? String(randomInt(30_000, 60_000));
const args = [
  'workflow_dispatch',
  '-W',
  '.github/workflows/test.yml',
  '-P',
  `ubuntu-latest=${image}`,
  '--pull=false',
  '--env',
  `E2E_PORT=${e2ePort}`,
  '--env',
  `PORT=${e2ePort}`,
  '--container-options',
  '--ipc=host',
];

if (job) {
  args.push('-j', job);
}

const result = spawnSync('act', args, {
  stdio: 'inherit',
});

if (result.error) {
  console.error(
    `Failed to run act: ${result.error.message}. Install act and Docker before using this script.`
  );
}

process.exit(result.status ?? 1);
