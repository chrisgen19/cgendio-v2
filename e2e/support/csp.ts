import {expect, type Page} from '@playwright/test';

/*
 * Catching what the Content-Security-Policy (src/lib/security-headers.ts, #99) blocks. The policy is static, so a
 * script, style, image or fetch the site adds later can be blocked in production without any test failing on its own:
 * the sweeps in e2e/public/csp.spec.ts and e2e/admin/csp.spec.ts walk the pages and fail on any violation.
 */

export type CspViolation = {directive: string; blockedUri: string; source: string};

declare global {
  interface Window {
    __cspViolations?: CspViolation[];
  }
}

/** Records every securitypolicyviolation event. Call it before the first navigation: each new document re-runs it. */
export const recordCspViolations = (page: Page) =>
  page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations?.push({
        directive: event.effectiveDirective || event.violatedDirective,
        blockedUri: event.blockedURI,
        source: `${event.sourceFile ?? document.location.pathname}:${event.lineNumber}`,
      });
    });
  });

/** The violations on the document currently loaded. A navigation starts a new document, so read before leaving a page. */
const cspViolations = (page: Page) => page.evaluate(() => window.__cspViolations ?? []);

/** Fails with the blocked directive and URI, which name exactly what the policy is missing. */
export const expectNoCspViolations = async (page: Page, where: string) => {
  expect(await cspViolations(page), `CSP violations on ${where}`).toEqual([]);
};
