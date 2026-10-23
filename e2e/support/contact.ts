import {type APIRequestContext, expect, type Page, type TestInfo} from '@playwright/test';
import {MOCK_RESEND_URL} from './test-env';

type Email = {from: string; to: string | string[]; subject: string; text: string; reply_to?: string | string[]};

/**
 * The contact form allows three messages per IP every ten minutes. Each test sends a made-up x-real-ip (the header the
 * action reads first), so tests, projects and retries never share a limit.
 */
export const useOwnIp = async (page: Page, testInfo: TestInfo) => {
  await page.setExtraHTTPHeaders({'x-real-ip': `e2e:${testInfo.project.name}:${testInfo.testId}:${testInfo.retry}:${Date.now()}`});
};

/** A token to recognise this test's message among the emails other tests sent. */
export const uniqueToken = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const fillContactForm = async (page: Page, {name, message}: {name: string; message: string}) => {
  await page.getByLabel('Name', {exact: true}).fill(name);
  await page.getByLabel('Email', {exact: true}).fill('visitor@example.test');
  await page.getByLabel("What's it about?").selectOption({label: 'Next.js & React'});
  await page.getByLabel('Message', {exact: true}).fill(message);
};

export const sentEmails = async (request: APIRequestContext): Promise<Email[]> => {
  const response = await request.get(`${MOCK_RESEND_URL}/emails`);
  expect(response.ok()).toBe(true);
  return response.json();
};
