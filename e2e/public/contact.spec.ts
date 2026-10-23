import {expect, test} from '@playwright/test';
import {fillContactForm, sentEmails, uniqueToken, useOwnIp} from '../support/contact';
import {CONTACT_EMAIL} from '../support/test-env';

const thanks = (page: import('@playwright/test').Page) => page.getByRole('heading', {name: "Thanks, we've got your message."});

test.beforeEach(async ({page}, testInfo) => {
  await useOwnIp(page, testInfo);
  await page.goto('/contact');
});

test('shows an inline error for each invalid field', async ({page}) => {
  await page.getByLabel('Email', {exact: true}).fill('not-an-email');
  await page.getByLabel('Message', {exact: true}).fill('Too short');
  await page.getByRole('button', {name: 'Send message'}).click();

  await expect(page.getByText('Tell us your name.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText("Pick what it's about.")).toBeVisible();
  await expect(page.getByText('Add a few more details (at least 20 characters).')).toBeVisible();

  // Focus moves to the first invalid field, which is marked invalid and keeps what was typed elsewhere
  const name = page.getByLabel('Name', {exact: true});
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Email', {exact: true})).toHaveValue('not-an-email');
});

test('a filled honeypot looks like success but nothing is sent', async ({page, request}) => {
  const token = uniqueToken();
  await fillContactForm(page, {name: 'Spam Bot', message: `Buy cheap links now, honeypot ${token}`});
  await page.locator('input[name="website"]').fill('https://spam.example');
  await page.getByRole('button', {name: 'Send message'}).click();

  await expect(thanks(page)).toBeVisible();
  // The email goes out right after a real submit; give it time to show up if it was wrongly sent
  await page.waitForTimeout(2_000);
  expect((await sentEmails(request)).some((email) => email.text.includes(token))).toBe(false);
});

test('a valid message is stored and emailed (Resend mocked)', async ({page, request}) => {
  const token = uniqueToken();
  const name = `Visitor ${token}`;
  await fillContactForm(page, {name, message: `We need a new marketing site. Reference ${token}.`});
  await page.getByRole('button', {name: 'Send message'}).click();

  await expect(thanks(page)).toBeVisible();
  await expect(thanks(page)).toBeFocused();

  await expect
    .poll(async () => (await sentEmails(request)).find((email) => email.text.includes(token)) ?? null)
    .toMatchObject({
      to: CONTACT_EMAIL,
      subject: `New inquiry: Next.js & React from ${name}`,
    });
});
