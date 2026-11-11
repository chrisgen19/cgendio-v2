import {spawn} from 'node:child_process';
import {appendFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {ADMIN_DEV_LOG} from './test-env.ts';

mkdirSync(dirname(ADMIN_DEV_LOG), {recursive: true});
writeFileSync(ADMIN_DEV_LOG, '');
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', 'localhost', '--port', process.argv[2]], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
});
// Retain server-side insights too: a redirect can replace the browser document before a console event arrives.
for (const [source, destination] of [
  [child.stdout, process.stdout],
  [child.stderr, process.stderr],
] as const) {
  source.on('data', (chunk: Buffer) => {
    appendFileSync(ADMIN_DEV_LOG, chunk);
    destination.write(chunk);
  });
}
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
