import type {Page} from '@playwright/test';

export const isAdminValidationInsight = (message: string) =>
  /could not validate|validat(?:e|ing|ion).*instant|instant.*(?:validat|insight)|blocking[- ](?:route|prerender)|while prerendering|uncached data.*suspense/i.test(
    message,
  );

export async function observeAdminDev(page: Page) {
  const observations = {errors: [] as string[], insights: [] as string[], protectedUi: false, overlay: false};
  page.on('pageerror', (error) => observations.errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') observations.errors.push(message.text());
    if (['error', 'warning'].includes(message.type()) && isAdminValidationInsight(message.text())) observations.insights.push(message.text());
  });
  // Bindings survive redirects, so transient protected UI or overlays cannot disappear before the assertion.
  await page.exposeFunction('__reportAdminDevViolation', (kind: 'protectedUi' | 'overlay') => {
    observations[kind] = true;
  });
  await page.addInitScript(() => {
    const reported = new Set<string>();
    const roots = new WeakSet<ShadowRoot>();
    const report = (kind: 'protectedUi' | 'overlay') => {
      if (reported.has(kind)) return;
      reported.add(kind);
      void (window as unknown as {__reportAdminDevViolation: (kind: string) => Promise<void>}).__reportAdminDevViolation(kind);
    };
    const scan = () => {
      if (document.querySelector('.admin-theme main, nav[aria-label="Admin"]')) report('protectedUi');
      for (const portal of document.querySelectorAll('nextjs-portal')) {
        const root = portal.shadowRoot;
        if (!root) continue;
        if (!roots.has(root)) {
          roots.add(root);
          observer.observe(root, {childList: true, subtree: true, attributes: true});
        }
        // data-nextjs-toast also wraps the healthy Next.js badge; only count actual error UI or issue buttons.
        const overlay = root.querySelector('[data-nextjs-dialog], [data-issues-open], [data-nextjs-error-overlay]');
        if (overlay instanceof HTMLElement && overlay.getClientRects().length && getComputedStyle(overlay).visibility !== 'hidden') report('overlay');
      }
    };
    const observer = new MutationObserver(scan);
    observer.observe(document, {childList: true, subtree: true, attributes: true});
    scan();
  });
  return observations;
}
