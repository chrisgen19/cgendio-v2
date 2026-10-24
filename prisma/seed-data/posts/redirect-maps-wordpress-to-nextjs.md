## Why the redirect layer matters

Every page on an old WordPress site has an address that someone already depends on: a search result, a link from another site, a bookmark, an old email campaign. When the new Next.js site changes the URL structure, each of those addresses needs a permanent redirect to its new home. Miss one and it returns a 404, and search engines eventually drop it along with the ranking it earned.

On one site that is a careful afternoon. Across 20+ sites it needs a system: one map per site, one owner per redirect, and a test that runs before anything goes live.

## Build the map from real traffic

I start with three lists for each site and merge them into one sheet.

- Every URL in the sitemap. Core WordPress serves one at `/wp-sitemap.xml`, and Yoast publishes `/sitemap_index.xml`.
- The top landing pages from Search Console, so the pages that matter most get checked by hand.
- Pages with backlinks from an SEO tool such as SEMrush, because links from other sites are the hardest traffic to win back.

Each row gets a source path, a target path, a status code and an owner. A page with no direct replacement goes to its closest parent page. Sending everything to the homepage tends to be treated as a soft 404.

```text title="redirect-map.csv"
source,target,status,owner
/services/equipment-hire/,/hire,301,edge
/about-us/our-team/,/about,301,edge
/2023/05/new-depot-opening/,/news/new-depot-opening,308,app
/category/news/,/news/topic/news,308,app
```

## Split the work between edge and app

Redirects run in two places, depending on who owns them.

One-off legacy URLs go to **Cloudflare Bulk Redirects**. A Bulk Redirect List holds source and target URLs with a status code and options such as preserving the query string or matching subpaths, and a Bulk Redirect Rule switches the list on. These requests are answered at the edge before they reach Vercel, and the list can change without a deploy.

Patterns that follow the new site's structure live in `next.config.ts`, next to the routes they describe.

```ts title="next.config.ts"
import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [
      // WordPress date permalinks → flat news slugs
      {
        source: "/:year(\\d{4})/:month(\\d{2})/:slug",
        destination: "/news/:slug",
        permanent: true,
      },
      // Category archives → topic pages
      {
        source: "/category/:slug",
        destination: "/news/topic/:slug",
        permanent: true,
      },
    ];
  },
};

export default config;
```

With `permanent: true`, Next.js answers with a 308. Search engines treat 308 the same way as 301.

> **One hop, one owner.** Every old URL redirects once, and every redirect lives in exactly one place: the Cloudflare list or the Next.js config, never both.

## Test the whole map before DNS moves

Before cutover I run every source path against the new site and check two things: the response is a 301 or 308, and the `Location` header points at the expected target. Chains get flattened so each old URL takes one hop. In a second pass, every target gets a plain request to confirm it returns 200.

```ts title="check-redirects.ts"
type Row = { from: string; to: string };
type Failure = { from: string; status: number; location: string | null };

// Node 18+: redirect "manual" returns the 3xx response itself
export async function checkRedirects(origin: string, rows: Row[]) {
  const failures: Failure[] = [];

  for (const { from, to } of rows) {
    const res = await fetch(origin + from, { redirect: "manual" });
    const location = res.headers.get("location");
    const ok = [301, 308].includes(res.status) && location?.endsWith(to);
    if (!ok) failures.push({ from, status: res.status, location });
  }

  return failures;
}
```

The map is the source of truth for the whole move. Once it passes, DNS can switch, and the old site can retire knowing every address it served still leads somewhere useful.
