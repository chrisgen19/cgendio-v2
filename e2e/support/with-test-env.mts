/**
 * Runs a command with the e2e environment from test-env.ts, e.g. `node e2e/support/with-test-env.mts pnpm build`.
 * CI builds this way, so the workflow doesn't repeat the variables.
 */
import {spawnSync} from 'node:child_process';
import {testEnv} from './test-env.ts';

const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('Usage: node e2e/support/with-test-env.mts <command> [...args]');

const result = spawnSync(command, args, {stdio: 'inherit', env: {...process.env, ...testEnv}});
process.exit(result.status ?? 1);
