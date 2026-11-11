import {expect, type Page, test} from '@playwright/test';
import {gaEvents, gtagCalls, stubGtag, waitForGtag} from '../support/analytics';
import {contactForm, fillContactForm, uniqueToken, useOwnIp} from '../support/contact';
import {E2E_BASE_URL, GA_TEST_ID} from '../support/test-env';

const thanks = (page: Page) => page.getByRole('heading', {name: "Thanks, I've got your message."});

test.beforeEach(async ({page}, testInfo) => {
  await useOwnIp(page, testInfo);
  await stubGtag(page);
});

test.describe('the contact form', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/contact');
    await waitForGtag(page);
  });

  test('a sent message records one generate_lead with its topic and nothing the visitor typed', async ({page}) => {
    const token = uniqueToken();
    await fillContactForm(page, {name: `Visitor ${token}`, email: `visitor+${token}@example.test`, message: `A new site, ref ${token}.`});
    await contactForm(page).getByRole('button', {name: 'Send message'}).click();
    await expect(thanks(page)).toBeVisible();

    expect(await gaEvents(page, 'generate_lead')).toEqual([{form_topic: 'NEXTJS'}]);
    expect(JSON.stringify(await gtagCalls(page, 'event'))).not.toContain(token);
  });

  test('a filled honeypot records no generate_lead', async ({page}) => {
    await fillContactForm(page, {name: 'Spam Bot', message: `Buy cheap links now, honeypot ${uniqueToken()}`});
    await page.locator('input[name="website"]').fill('https://spam.example');
    await contactForm(page).getByRole('button', {name: 'Send message'}).click();
    await expect(thanks(page)).toBeVisible();

    expect(await gaEvents(page, 'generate_lead')).toEqual([]);
  });
});

test.describe('the contact card email', () => {
  test.beforeEach(async ({page}) => {
    // Keep the mailto: link from leaving the page; the click still reaches the tracking listener
    await page.addInitScript(() =>
      addEventListener('click', (event) => (event.target as Element).closest?.('a[href^="mailto:"]') && event.preventDefault(), true),
    );
    await page.goto('/contact');
    await waitForGtag(page);
  });

  test('clicking the address records contact_email by mailto', async ({page}) => {
    await page.locator('main a[href^="mailto:"]').first().click();
    expect(await gaEvents(page, 'contact_email')).toEqual([{method: 'mailto'}]);
  });

  test('copying the address records contact_email by copy', async ({page, context}) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {origin: E2E_BASE_URL});
    await page.locator('main').getByRole('button', {name: 'Copy email address'}).first().click();
    await expect.poll(() => gaEvents(page, 'contact_email')).toEqual([{method: 'copy'}]);
  });
});

test.describe('internal traffic', () => {
  const config = async (page: Page) => (await gtagCalls(page, 'config')).find(([, id]) => id === GA_TEST_ID);

  test('a visitor has no traffic type', async ({page}) => {
    await page.goto('/');
    await waitForGtag(page);
    expect(await config(page)).toEqual(['config', GA_TEST_ID, {}]);
  });

  test('the owner cookie marks every hit internal', async ({page, context}) => {
    await context.addCookies([{name: 'cg_internal', value: '1', url: E2E_BASE_URL}]);
    await page.goto('/');
    await waitForGtag(page);
    expect(await config(page)).toEqual(['config', GA_TEST_ID, {traffic_type: 'internal'}]);
  });
});
