// Dev helper: screenshot the Contact section at desktop and phone widths.
// Usage: node docs/cv/shot.mjs <baseUrl> <outDir>
import {chromium} from '@playwright/test';

const [baseUrl = 'http://localhost:3300', outDir = '.'] = process.argv.slice(2);

const WIDTHS = [
  {name: 'contact-1440', width: 1440, height: 1200},
  {name: 'contact-390', width: 390, height: 1400},
];

const browser = await chromium.launch();
for (const {name, width, height} of WIDTHS) {
  const page = await browser.newPage({viewport: {width, height}});
  await page.goto(`${baseUrl}/contact`, {waitUntil: 'networkidle'});
  // The page scrolls smoothly, so jump instantly and let any reveal animation settle
  await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView({behavior: 'instant', block: 'start'}));
  await page.waitForTimeout(600);
  const cvs = await page.locator('main [data-track="cv_download"]').allTextContents();
  console.log(`${name}: ${cvs.length} CV button(s) -> ${JSON.stringify(cvs)}`);
  await page.locator('#contact').screenshot({path: `${outDir}/${name}.png`});
  await page.close();
}
await browser.close();
console.log('done');
