import {type APIRequestContext, expect, type Page, type TestInfo} from '@playwright/test';
import {MOCK_RESEND_URL} from './test-env';

type Email = {from: string; to: string | string[]; subject: string; text: string; html?: string; reply_to?: string | string[]};

/**
 * The contact form allows three messages per IP every ten minutes. Each test sends a made-up x-real-ip (the header the
 * action reads first), so tests, projects and retries never share a limit.
 */
export const useOwnIp = async (page: Page, testInfo: TestInfo) => {
  await page.setExtraHTTPHeaders({'x-real-ip': `e2e:${testInfo.project.name}:${testInfo.testId}:${testInfo.retry}:${Date.now()}`});
};

/** A token to recognise this test's message among the emails other tests sent. */
export const uniqueToken = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** The contact form, on /contact or in the home page's contact section. */
export const contactForm = (page: Page) => page.locator('main #contact').getByRole('form', {name: 'Message me'});

/** Picks a topic, writes the message and fills in who to reply to, one step at a time, ready to send. */
export const fillContactForm = async (
  page: Page,
  {name, message, email = 'visitor@example.test'}: {name: string; message: string; email?: string},
) => {
  const form = contactForm(page);
  await form.locator('label', {hasText: 'Next.js & React'}).click();
  await form.getByRole('button', {name: 'Next'}).click();
  await form.getByLabel('Your message', {exact: true}).fill(message);
  await form.getByRole('button', {name: 'Next'}).click();
  await form.getByLabel('Your name', {exact: true}).fill(name);
  await form.getByLabel('Email for my reply', {exact: true}).fill(email);
};

export const sentEmails = async (request: APIRequestContext): Promise<Email[]> => {
  const response = await request.get(`${MOCK_RESEND_URL}/emails`);
  expect(response.ok()).toBe(true);
  return response.json();
};
