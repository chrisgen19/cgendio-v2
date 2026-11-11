import {readFileSync} from 'node:fs';
import {isAdminValidationInsight} from './admin-dev-observer';
import {ADMIN_DEV_LOG} from './test-env';

export default function teardown() {
  const insights = readFileSync(ADMIN_DEV_LOG, 'utf8').split('\n').filter(isAdminValidationInsight);
  if (insights.length) throw new Error(`Development server reported validation insights:\n${insights.join('\n')}`);
}
