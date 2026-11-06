import {expect, test} from '@playwright/test';

/*
 * The SEO surface the previous site published, which this one has to keep through the cutover (#81 Phase C). These are
 * head tags and robots.txt lines, so one page of each kind is enough: the rest come from the same root metadata.
 */

const PAGES = ['/', '/writing', '/writing/wordpress-news-october-2026', '/projects/access-hire'];

const content = (html: string, selector: string) => html.match(new RegExp(`<meta[^>]*${selector}[^>]*>`))?.[0] ?? '';

for (const path of PAGES) {
  test(`${path} allows large image previews and untruncated snippets`, async ({page}) => {
    const response = await page.goto(path);
    const html = (await response?.text()) ?? '';
    const tag = content(html, 'name="robots"');
    expect(tag).toContain('max-image-preview:large');
    expect(tag).toContain('max-snippet:-1');
    expect(tag).toContain('max-video-preview:-1');
  });

  test(`${path} publishes og:locale en_US`, async ({page}) => {
    const response = await page.goto(path);
    expect(content((await response?.text()) ?? '', 'property="og:locale"')).toContain('content="en_US"');
  });
}

test('the home page carries the Search Console verification', async ({page}) => {
  const response = await page.goto('/');
  const tag = content((await response?.text()) ?? '', 'name="google-site-verification"');
  expect(tag).toContain('uRp-UbI0NWG6cjziZS9a40Y0BNqg2dFX-oVehIhyOUY');
});

test('the admin keeps its noindex instead of the site-wide robots meta', async ({page}) => {
  const response = await page.goto('/sign-in');
  const tag = content((await response?.text()) ?? '', 'name="robots"');
  expect(tag).toContain('noindex');
  expect(tag).not.toContain('max-image-preview');
});

test('robots.txt gives the AI crawlers their own group with the same rules', async ({request}) => {
  const body = await (await request.get('/robots.txt')).text();
  // A group is separated by a blank line, not by each User-Agent line: the AI group opens with 11 of them in a row
  const groups = body.split(/\n\s*\n/);
  const ai = groups.find((group) => group.includes('ClaudeBot'));
  expect(ai, 'no group names ClaudeBot').toBeDefined();
  for (const agent of [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
  ]) {
    expect(ai).toContain(`User-Agent: ${agent}`);
  }
  // Same access as everyone else: listing them is about being citable, not about giving them more of the site. The
  // wildcard group is checked too, so this cannot pass by the AI group alone while the wildcard loses its rules.
  const wildcard = groups.find((group) => group.includes('User-Agent: *'));
  expect(wildcard, 'no wildcard group').toBeDefined();
  for (const group of [wildcard, ai]) {
    for (const path of ['/admin', '/preview', '/api']) expect(group).toContain(`Disallow: ${path}`);
    expect(group).toContain('Allow: /');
  }
  expect(body).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
});

/** The one JSON-LD graph a page emits, as objects keyed by @type. */
const graph = async (html: string) => {
  const raw = html.match(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  const parsed = JSON.parse(raw.replaceAll('\\u003c', '<'));
  return (parsed['@graph'] ?? [parsed]) as Record<string, unknown>[];
};

const node = (nodes: Record<string, unknown>[], type: string) => nodes.find((n) => n['@type'] === type);

test('the home page describes the site, the profile and Christian in one graph', async ({page}) => {
  const nodes = await graph((await (await page.goto('/'))?.text()) ?? '');
  expect(nodes.map((n) => n['@type'])).toEqual(['WebSite', 'ProfilePage', 'Person']);

  const person = node(nodes, 'Person');
  expect(person?.name).toBe('Christian Diomampo');
  expect(person?.alternateName).toBe('Chris Diomampo');
  // knowsAbout is the stack strip, so the graph never claims a tool the site doesn't show
  expect(person?.knowsAbout).toEqual(expect.arrayContaining(['Next.js', 'WordPress', 'PostgreSQL']));

  // The WebSite and ProfilePage point at the Person by @id rather than repeating it
  const personId = person?.['@id'];
  expect(node(nodes, 'WebSite')?.publisher).toEqual({'@id': personId});
  expect(node(nodes, 'ProfilePage')?.mainEntity).toEqual({'@id': personId});
  expect(node(nodes, 'ProfilePage')?.isPartOf).toEqual({'@id': node(nodes, 'WebSite')?.['@id']});
});

test('the writing index is a Blog listing its posts', async ({page}) => {
  const nodes = await graph((await (await page.goto('/writing'))?.text()) ?? '');
  const blog = node(nodes, 'Blog');
  expect(blog).toBeDefined();
  expect((blog?.blogPost as unknown[]).length).toBeGreaterThan(0);
  expect(node(nodes, 'BreadcrumbList')).toBeDefined();
});

test('a post and a case study each carry a breadcrumb trail ending on themselves', async ({page}) => {
  const post = await graph((await (await page.goto('/writing/wordpress-news-october-2026'))?.text()) ?? '');
  const postTrail = (node(post, 'BreadcrumbList')?.itemListElement ?? []) as Record<string, unknown>[];
  expect(postTrail.map((step) => step.position)).toEqual([1, 2, 3]);
  expect(postTrail.at(-1)?.item).toMatch(/\/writing\/wordpress-news-october-2026$/);
  // The post hangs off the Blog node the index defines, by @id
  expect(node(post, 'BlogPosting')?.isPartOf).toEqual({'@id': expect.stringMatching(/\/writing#blog$/)});

  const project = await graph((await (await page.goto('/projects/access-hire'))?.text()) ?? '');
  const projectTrail = (node(project, 'BreadcrumbList')?.itemListElement ?? []) as Record<string, unknown>[];
  // Case studies have no index page of their own, so the trail is Home then the case study
  expect(projectTrail.map((step) => step.position)).toEqual([1, 2]);
  expect(projectTrail.at(-1)?.item).toMatch(/\/projects\/access-hire$/);
});

test('the feed declares dc, and carries a copyright, docs and stable guids', async ({request}) => {
  const body = await (await request.get('/feed.xml')).text();
  expect(body).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
  expect(body).toMatch(/<copyright>© \d{4} Christian Diomampo<\/copyright>/);
  expect(body).toContain('<docs>https://validator.w3.org/feed/docs/rss2.html</docs>');
  expect(body).toContain('<dc:creator>Christian Diomampo</dc:creator>');
  // A guid is an identity, not an address: isPermaLink stays false so a moved post is not re-delivered
  expect(body).toContain('<guid isPermaLink="false">');
  expect(body).not.toContain('isPermaLink="true"');
  // pubDate comes from the stored timestamp, so a post published at a real time keeps it
  expect(body).toMatch(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/);
});

test('every feed item carries its full body as HTML in a CDATA section', async ({request}) => {
  const body = await (await request.get('/feed.xml')).text();
  expect(body).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');

  const encoded = [...body.matchAll(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/g)].map((match) => match[1]);
  const items = body.match(/<item>/g)?.length ?? 0;
  expect(items).toBeGreaterThan(0);
  expect(encoded).toHaveLength(items);

  for (const html of encoded) {
    // The whole post, not the excerpt: the longest excerpt in the seed is a few hundred characters
    expect(html.length).toBeGreaterThan(2000);
    expect(html).toContain('<p>');
    // Semantic markup only. The site renderer's Tailwind classes and Shiki colours would bloat every item and are
    // stripped by readers anyway, so the feed uses its own pipeline (src/server/feed-markdown.ts)
    expect(html).not.toContain('<script');
    expect(html).not.toMatch(/style="/);
    for (const className of [...html.matchAll(/class="([^"]*)"/g)].map((match) => match[1])) {
      expect(className, 'only code-fence language classes belong in the feed').toMatch(/^language-/);
    }
  }
});

test('a post publishes full ISO article times, its author and its tags', async ({page}) => {
  const html = (await (await page.goto('/writing/wordpress-news-october-2026'))?.text()) ?? '';

  // A bare day ("2026-10-05") is what this used to send; the time matters for ordering in search and in readers
  const published = content(html, 'property="article:published_time"');
  expect(published).toMatch(/content="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);

  const modified = content(html, 'property="article:modified_time"');
  expect(modified).toMatch(/content="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);

  expect(content(html, 'property="article:author"')).toContain('Christian Diomampo');
  // One tag per post is the whole content model, so this is every tag rather than the first of several
  expect(html.match(/<meta property="article:tag"[^>]*>/g)).toHaveLength(1);
});

test('the writing index has its own share card', async ({page, request}) => {
  const html = (await (await page.goto('/writing'))?.text()) ?? '';
  const src = content(html, 'property="og:image"').match(/content="([^"]+)"/)?.[1];
  expect(src, 'no og:image on /writing').toBeDefined();

  const image = await request.get(src ?? '');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  expect(content(html, 'property="og:image:width"')).toContain('1200');
  expect(content(html, 'property="og:image:height"')).toContain('630');
});

/*
 * The brand is the person's name, not the domain (#81 Phase A). People search for a name, and the previous site ranks
 * on one, so these places have to agree.
 */
const BRAND = 'Chris Diomampo';

test('the brand is the name in the head, not the domain', async ({page}) => {
  const html = (await (await page.goto('/'))?.text()) ?? '';
  // Word for word the title the previous site ranks on, "Senior" included
  expect(html).toContain('<title>Chris Diomampo · Senior full-stack developer, Next.js and WordPress</title>');
  expect(content(html, 'property="og:site_name"')).toContain(`content="${BRAND}"`);
  expect(content(html, 'name="application-name"')).toContain(`content="${BRAND}"`);
});

test('the title suffix on an inner page is the name', async ({page}) => {
  const html = (await (await page.goto('/writing'))?.text()) ?? '';
  expect(html).toContain(`<title>Blog · ${BRAND}</title>`);
});

test('the header and footer carry the name', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('banner').getByRole('link', {name: BRAND})).toBeVisible();
  await expect(page.getByRole('contentinfo')).toContainText(`© 2026 ${BRAND} · Built with Next.js · Deployed on Coolify`);
});

test('the feed channel and the WebSite node carry the name, with the domain kept as an alternate', async ({page, request}) => {
  const feed = await (await request.get('/feed.xml')).text();
  expect(feed).toContain(`<title>${BRAND} · Blog</title>`);

  const nodes = await graph((await (await page.goto('/'))?.text()) ?? '');
  const site = node(nodes, 'WebSite');
  expect(site?.name).toBe(BRAND);
  // The domain stops being the brand, so it stays discoverable here instead
  expect(site?.alternateName).toBe('cgdiomampo.dev');
});
