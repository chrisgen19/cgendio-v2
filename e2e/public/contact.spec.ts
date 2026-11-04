import {expect, type Page, test} from '@playwright/test';
import {contactForm, fillContactForm, sentEmails, uniqueToken, useOwnIp} from '../support/contact';
import {CONTACT_EMAIL} from '../support/test-env';

const thanks = (page: Page) => page.getByRole('heading', {name: "Thanks, I've got your message."});

test.beforeEach(async ({page}, testInfo) => {
  await useOwnIp(page, testInfo);
});

test.describe('on /contact', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/contact');
  });

  test('Next stops on an empty step, and Back keeps what was typed', async ({page}) => {
    const form = contactForm(page);
    await form.getByRole('button', {name: 'Next'}).click();
    await expect(form.getByText("Choose what it's about to carry on.")).toBeVisible();

    await form.locator('label', {hasText: 'Job opportunity'}).click();
    await expect(form.getByText("Choose what it's about to carry on.")).toBeHidden();
    await form.getByRole('button', {name: 'Next'}).click();
    await expect(form.getByRole('heading', {name: 'Tell me about it'})).toBeFocused();
    await expect(form.getByText('Step 2 of 3', {exact: true})).toBeVisible();

    await form.getByRole('button', {name: 'Next'}).click();
    await expect(form.getByText('Write your message first.')).toBeVisible();
    await form.getByLabel('Your message', {exact: true}).fill('A senior Next.js role on my team.');
    await form.getByRole('button', {name: 'Back'}).click();
    // The answered topic stays checked, and the message is still there on the way forward
    await expect(form.getByRole('radio', {name: 'Job opportunity'})).toBeChecked();
    await form.getByRole('button', {name: 'Next'}).click();
    await expect(form.getByLabel('Your message', {exact: true})).toHaveValue('A senior Next.js role on my team.');
  });

  test('a failed send goes back to the earliest step with an error', async ({page}) => {
    const form = contactForm(page);
    await form.locator('label', {hasText: 'Next.js & React'}).click();
    await form.getByRole('button', {name: 'Next'}).click();
    await form.getByLabel('Your message', {exact: true}).fill('Too short');
    await form.getByRole('button', {name: 'Next'}).click();
    await form.getByLabel('Email for my reply', {exact: true}).fill('not-an-email');
    await form.getByRole('button', {name: 'Send message'}).click();

    await expect(form.getByText('Before this can send, check your message, then your details.')).toBeVisible();
    const message = form.getByLabel('Your message', {exact: true});
    await expect(message).toBeFocused();
    await expect(message).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Add a few more details (at least 20 characters).')).toBeVisible();

    await form.getByRole('button', {name: 'Next'}).click();
    await expect(form.getByText('Tell me your name.')).toBeVisible();
    await expect(form.getByText('Enter a valid email address.')).toBeVisible();
    await expect(form.getByLabel('Email for my reply', {exact: true})).toHaveValue('not-an-email');
  });

  test('a filled honeypot looks like success but nothing is sent', async ({page, request}) => {
    const token = uniqueToken();
    await fillContactForm(page, {name: 'Spam Bot', message: `Buy cheap links now, honeypot ${token}`});
    await page.locator('input[name="website"]').fill('https://spam.example');
    await contactForm(page).getByRole('button', {name: 'Send message'}).click();

    await expect(thanks(page)).toBeVisible();
    // The email goes out right after a real submit; give it time to show up if it was wrongly sent
    await page.waitForTimeout(2_000);
    expect((await sentEmails(request)).some((email) => email.text.includes(token))).toBe(false);
  });

  test('a valid message is stored and emailed (Resend mocked)', async ({page, request}) => {
    const token = uniqueToken();
    const name = `Visitor ${token}`;
    await fillContactForm(page, {name, message: `We need a new marketing site. Reference ${token}.`});
    await contactForm(page).getByRole('button', {name: 'Send message'}).click();

    await expect(thanks(page)).toBeVisible();
    await expect(thanks(page)).toBeFocused();

    await expect
      .poll(async () => (await sentEmails(request)).find((email) => email.text.includes(token)) ?? null)
      .toMatchObject({
        to: CONTACT_EMAIL,
        subject: `New inquiry: Next.js & React from ${name}`,
      });
  });
});

test('the home page contact section sends a message', async ({page, request}) => {
  await page.goto('/');
  await page.locator('#contact').evaluate((el) => el.scrollIntoView({behavior: 'instant'}));
  const card = page.locator('main #contact');
  await expect(card.getByRole('heading', {level: 2, name: "Building something, or hiring? Let's talk."})).toBeVisible();
  await expect(card.getByRole('link', {name: CONTACT_EMAIL})).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);

  const token = uniqueToken();
  await fillContactForm(page, {name: `Home ${token}`, message: `Hiring a WordPress developer. Reference ${token}.`});
  await contactForm(page).getByRole('button', {name: 'Send message'}).click();

  await expect(thanks(page)).toBeFocused();
  await expect.poll(async () => (await sentEmails(request)).some((email) => email.text.includes(token))).toBe(true);
});
