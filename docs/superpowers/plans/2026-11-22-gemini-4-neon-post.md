# Gemini 4 Neon Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a researched developer guide to Gemini 4 Neon as a seeded DRAFT post, so Christian can read it in the admin preview before anything goes live.

**Architecture:** Content, not code. The body is Markdown at `prisma/seed-data/posts/gemini-4-neon-developer-guide.md`, its metadata is one entry in `prisma/seed-data/posts.ts`, and `prisma/seed.mts` joins them and computes reading time. Two new Vitest guards enforce the house rules on every seeded post body (no em or en dashes, https links only) so the rules are checked by machine rather than by eye. Nothing in `src/` changes.

**Tech Stack:** Markdown, TypeScript seed data, Zod (`src/server/content-schema.ts`), Vitest, Prisma + Postgres via Docker, Playwright for the quality gate, Chrome for screenshots.

**Spec:** `docs/superpowers/specs/2026-11-22-gemini-4-neon-post-design.md`

## Global Constraints

- Slug `gemini-4-neon-developer-guide`; the body filename must match the slug exactly, or `prisma/seed.mts:40` silently seeds `PLACEHOLDER_BODY`.
- Title, verbatim: `Gemini 4 Neon for developers: which Gemini 4 model to pick, and what it really costs`
- Tag: `AI workflow`. Status: `DRAFT`, with no `publishedAt`. Never publish in this plan.
- Excerpt, verbatim: `Google shipped four Gemini 4 models in six weeks. What Neon costs per task next to Hydrogen and Carbon, what changes in your code when you switch, what developers on Hacker News make of it, and which one I'd point a project at.`
- No em dashes or en dashes anywhere in anything new.
- The post speaks as "I", never "we", "us" or "our", outside a quoted source.
- Every figure, quote and API detail links to the source it came from. Anything that cannot be traced gets cut.
- Hacker News is the only community source. The intro says Reddit could not be reached.
- Dated "as of November 22, 2026".
- No calls to the Gemini API on any key, and no benchmark, timing or sample output of our own.
- No changes under `src/`, and no changes to styles or components.
- Re-read every source at write time. The figures in the spec are a starting point, not the citation.
- Length about 2,500 to 3,000 words.

## Review Focus

- **A cited URL that 404s or redirects.** A reader clicking a source should land on the page the claim came from. Task 5 adds the link check over the finished body; Vals' per-model page already 404s, so that class is real.
- **A misquoted Hacker News comment.** A quote with a changed word is a fabrication with a citation on it. Tasks 2 and 4 re-read each quoted comment on its permalink before pasting it.
- **A figure that moved since the research pass.** Artificial Analysis averages speed over five days, so its numbers drift. Task 2 re-reads the three model pages and uses what it finds, not the spec's table.
- **A wide table at phone width.** The comparison tables are the centre of the post and must not push the page sideways. Task 6 checks the preview at 390px for horizontal overflow.
- **A draft leaking into the public site or the RSS feed.** `e2e/public/blog.spec.ts:39-44` asserts the exact published list. Task 6 runs it unchanged to prove a DRAFT adds nothing.

---

### Task 1: Seed entry, body skeleton and the house-rule guards

**Files:**
- Create: `src/server/post-seed-integrity.test.ts`
- Create: `prisma/seed-data/posts/gemini-4-neon-developer-guide.md`
- Modify: `prisma/seed-data/posts.ts:14` (new first element of `posts`)

**Interfaces:**
- Consumes: `SeedPost` and `posts` from `prisma/seed-data/posts.ts`; `postSchema` from `src/server/content-schema.ts`.
- Produces: the body file at the slug path, which Tasks 2 to 5 fill in, and `NEON_SLUG = 'gemini-4-neon-developer-guide'` as the name the later tasks use.

- [ ] **Step 1: Write the failing tests**

```ts
import {readFileSync, existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {posts} from '../../prisma/seed-data/posts';

const NEON_SLUG = 'gemini-4-neon-developer-guide';
const bodyPath = (slug: string) => new URL(`../../prisma/seed-data/posts/${slug}.md`, import.meta.url);
const withBodies = posts.filter((post) => existsSync(bodyPath(post.slug)));

describe('seeded post bodies', () => {
  it('cover more than one post', () => {
    expect(withBodies.length).toBeGreaterThan(1);
  });

  describe.each(withBodies)('$slug', (post) => {
    const body = readFileSync(bodyPath(post.slug), 'utf8');

    it('uses no em or en dashes', () => {
      expect(body.match(/[\u2013\u2014]/g) ?? []).toEqual([]);
    });

    it('links only over https', () => {
      const links = [...body.matchAll(/\]\((?<url>[^)\s]+)/g)].map((match) => match.groups?.url ?? '');
      expect(links.filter((url) => !url.startsWith('https://'))).toEqual([]);
    });
  });
});

describe('the Gemini 4 Neon post', () => {
  const post = posts.find((candidate) => candidate.slug === NEON_SLUG);

  it('is seeded as a draft with no publish date', () => {
    expect(post?.status).toBe('DRAFT');
    expect(post).not.toHaveProperty('publishedAt');
  });

  it('carries the agreed title, tag and excerpt', () => {
    expect(post?.title).toBe('Gemini 4 Neon for developers: which Gemini 4 model to pick, and what it really costs');
    expect(post?.tag).toBe('AI workflow');
    expect(post?.excerpt).toMatch(/^Google shipped four Gemini 4 models in six weeks\./);
  });

  it('has a body file at its slug', () => {
    expect(existsSync(bodyPath(NEON_SLUG))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test post-seed-integrity`
Expected: FAIL. The draft tests fail because no post has that slug; the body-file test fails because the file does not exist.

- [ ] **Step 3: Add the seed entry**

In `prisma/seed-data/posts.ts`, add a `SeedPost` as the first element of `posts`, above `gemini-4-hydrogen-developer-guide`: `slug`, `title`, `tag`, `status: 'DRAFT'` and `excerpt` exactly as the Global Constraints give them. A `DRAFT` takes no `publishedAt` and `updatedAt` is optional, so leave both out and let the admin stamp the date when it is published.

- [ ] **Step 4: Create the body skeleton**

Create `prisma/seed-data/posts/gemini-4-neon-developer-guide.md` with the ten section headings from the spec's Outline, in order, and nothing else under them yet. The body carries no `# H1`: the page renders the title from the post record.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test post-seed-integrity`
Expected: PASS, including the dash and https guards over the four existing bodies.

- [ ] **Step 6: Commit**

```bash
git add src/server/post-seed-integrity.test.ts prisma/seed-data/posts.ts prisma/seed-data/posts/gemini-4-neon-developer-guide.md
git commit -m "test(blog): guard seeded post bodies, and stage the Gemini 4 Neon draft"
```

---

### Task 2: The argument and the numbers (sections 1 to 4)

**Files:**
- Modify: `prisma/seed-data/posts/gemini-4-neon-developer-guide.md` (intro, "What Neon is", "The family, side by side", "Cost per task, three ways")

**Interfaces:**
- Consumes: the skeleton headings from Task 1.
- Produces: the comparison tables that Task 4's "Which one I'd pick" section argues from, and the as-of date the whole post uses.

- [ ] **Step 1: Re-read the sources for these sections**

Re-read, and use what you find rather than the spec's copy: the launch post, the DeepMind model card, `https://aistudio.google.com/docs/pricing`, and the Artificial Analysis pages for Neon, Carbon and Hydrogen. Note the exact figures and the date you read them.

- [ ] **Step 2: Write the intro**

Two short paragraphs, then a `> **The short version.**` callout. The paragraphs must say, in Christian's voice: Neon shipped November 18, 2026, the fourth Gemini 4 model in six weeks; this is research, not a case study; no number was measured on his own key and every figure links out; and that it draws on Hacker News because Reddit could not be reached. The callout carries the verdict: Neon matches Carbon's intelligence score at matched thinking levels, runs roughly twice Carbon's throughput, costs less per task by every independent measure, but is dearer per token than Carbon until December 1 and is paid tier only.

- [ ] **Step 3: Write "What Neon is"**

Adapted from Carbon, March 2026 knowledge cutoff, `gemini-4-neon`, one unified 1M-token window, four thinking levels defaulting to `high`, text-only output, plus Google's own positioning sentence quoted. Then where it runs, as a bullet list, and one line on Argon. Leave a blank line where screenshot 1 goes; Task 5 fills it.

- [ ] **Step 4: Write "The family, side by side"**

One price table (Hydrogen, Neon, Carbon, Argon, Gemini 3.8 Flash, with the December 1 and January 1 changes) and one performance table (Artificial Analysis index, output tokens per second, time to first token and cost per index task, at matched thinking levels). Follow with the like-for-like caveat: only the top levels have a published per-task cost, Carbon has no `xhigh`, and AA's blended price per million is not a cost per task. Do not fill in a figure the source does not publish.

- [ ] **Step 5: Write "Cost per task, three ways"**

Google's "32% lower cost per task than Carbon" claim, then Artificial Analysis, Vals and the Models Engineering Index, each with its figure and its own caveat, and MEI's "not independently verified" warning quoted. Close on the point: the direction is consistent, the dollar figures are not, so measure your own workload. Use a secondary per-task figure only if you traced it to its original publisher; drop it otherwise. Leave a blank line for screenshot 2.

- [ ] **Step 6: Run the guards**

Run: `pnpm test post-seed-integrity`
Expected: PASS. A curly dash pasted from a source page fails here, which is the point.

- [ ] **Step 7: Commit**

```bash
git add prisma/seed-data/posts/gemini-4-neon-developer-guide.md
git commit -m "docs(blog): write the Neon intro, family comparison and cost per task"
```

---

### Task 3: What changes in your code, and the client-work section (sections 5 and 6)

**Files:**
- Modify: `prisma/seed-data/posts/gemini-4-neon-developer-guide.md` ("What changes in your code", "The parts that matter for client work")

**Interfaces:**
- Consumes: Task 2's sections and the as-of date.
- Produces: the migration checklists Task 4's "What I'd do this week" turns into actions.

- [ ] **Step 1: Re-read the sources for these sections**

`https://aistudio.google.com/docs/whats-new-gemini-4-neon`, the AI Studio model page, the changelog, the Google Cloud Agent Platform model page, `https://firebase.google.com/docs/ai-logic/models`, and the AI SDK Google provider page.

- [ ] **Step 2: Write "What changes in your code"**

Two short checklists and then a shared one, as the spec's outline sets out. From Hydrogen: the model ID, and that Google says the switch needs no request schema changes, plus paid tier only. From Carbon or Argon: the default thinking level moves from `medium` to `high`, which raises the bill unless set on purpose, and `xhigh` is new. Shared: no `temperature`, `top_p`, `top_k`; no explicit caching; implicit caching from 4,096 tokens at a 95% discount; one 1M window across input, thinking and output; the 65,536 default output cap and long decode via `background: true`; 15-minute client timeouts; thought signatures returned unchanged and never copied across parallel `functionCall` parts; declare tools or risk `MALFORMED_FUNCTION_CALL`; no Live API, no image or audio output. Each item gets its one-line fix.

- [ ] **Step 3: Write "The parts that matter for client work"**

Paid tier only and what that means for data use, the `generateContent` storage default since October 26, the Agent Platform Frontier Model terms with server-side storage and the 7-day TTL, Firebase's short-term availability footnote and its 45-day retirement wording, keeping the model ID in one config value, and the Search grounding cost with its 5,000-request shared monthly allowance. State plainly that Neon's Google Cloud page carries no "short-term GA" or retirement-notice wording, unlike Hydrogen's, so the 45-day risk is Firebase's framing.

- [ ] **Step 4: Add the one caveat about third-party pages**

One or two sentences: the AI SDK's explicit caching example uses a Gemini 4 model that does not support explicit caching, the AI Gateway advertises 1,000,000 max output tokens which only holds with background long decode, and OpenRouter advertises accepting `temperature` and `top_p` which Google ignores. Each with its link.

- [ ] **Step 5: Run the guards**

Run: `pnpm test post-seed-integrity`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add prisma/seed-data/posts/gemini-4-neon-developer-guide.md
git commit -m "docs(blog): write the Neon migration checklists and client-work notes"
```

---

### Task 4: Developer reaction, the pick, and sources (sections 7 to 10)

**Files:**
- Modify: `prisma/seed-data/posts/gemini-4-neon-developer-guide.md` ("What developers say", "Which one I'd pick", "What I'd do this week", "Sources")

**Interfaces:**
- Consumes: Tasks 2 and 3, for the figures the pick rests on and the checklist the week's actions come from.
- Produces: the finished prose body, and the Sources list the link check in Task 5 walks.

- [ ] **Step 1: Re-read every Hacker News comment you intend to quote**

Open each permalink from the spec's research section and copy the wording off the page. A quote whose wording you cannot confirm is cut, not paraphrased into quotation marks. Record each comment's username and id.

- [ ] **Step 2: Write "What developers say"**

Group the quotes under lineup confusion, per-token versus per-task, coding and Antigravity, scepticism, and access. Name the thread, its points and comment counts, and link every quote to its own permalink. Say that one quoted claim about Vals is a commenter citing a benchmark site, not their own measurement. Leave a blank line for screenshot 3.

- [ ] **Step 3: Write "Which one I'd pick"**

Three short paragraphs, labelled plainly as Christian's own call rather than a benchmark result: Hydrogen for high-volume and latency-sensitive work, Neon as the default for serious coding and agent work, Carbon for the hardest long-horizon jobs, and a note to re-run the maths after December 1. Leave a blank line for the diagram.

- [ ] **Step 4: Write "What I'd do this week"**

Seven numbered steps in the Hydrogen post's register: pin the model ID in one config value, set the thinking level on purpose when coming from Carbon, measure cost per task on real prompts rather than price per token, check the storage and TTL defaults before client data goes near it, plan for a 45-day retirement notice, try Neon as the planner over Hydrogen subagents, and re-check the price maths on December 1.

- [ ] **Step 5: Write "Sources"**

Grouped as the Hydrogen post groups them: Google, Docs, Independent tests, Hacker News. Every URL cited anywhere in the body appears here, and the Hacker News group lists the quoted comments by username with their permalinks.

- [ ] **Step 6: Check the length and the guards**

Run: `pnpm test post-seed-integrity`
Expected: PASS.
Run: `wc -w prisma/seed-data/posts/gemini-4-neon-developer-guide.md`
Expected: between 2,500 and 3,000 words. Outside that range, cut or expand before committing.

- [ ] **Step 7: Commit**

```bash
git add prisma/seed-data/posts/gemini-4-neon-developer-guide.md
git commit -m "docs(blog): write the Neon developer reaction, the pick and the sources"
```

---

### Task 5: Link check, images and the diagram

**Files:**
- Create: `/private/tmp/claude-501/-Users-chrisgen19-projects-cgendio-v2-next-upgrade/980a7ab1-99ae-4c0a-bbbd-b86e306e6e72/scratchpad/check-links.sh`
- Create: four images under `docs/screenshots/` named `neon-*.png` or `.webp`
- Modify: `prisma/seed-data/posts/gemini-4-neon-developer-guide.md` (image lines and captions)

**Interfaces:**
- Consumes: the finished body from Task 4.
- Produces: R2 URLs in the body, which Task 6's preview renders.

- [ ] **Step 1: Write the link checker**

A throwaway script in the scratchpad that extracts every `https://` URL from the body and requests each one, printing the status next to the URL. Use `curl -sS -o /dev/null -w '%{http_code}'` and follow redirects, and print the final URL so a redirect is visible.

- [ ] **Step 2: Run it and fix what it finds**

Run: `bash /private/tmp/claude-501/-Users-chrisgen19-projects-cgendio-v2-next-upgrade/980a7ab1-99ae-4c0a-bbbd-b86e306e6e72/scratchpad/check-links.sh`
Expected: every URL returns 200, or 403 for Hacker News and X if they refuse the request, which is the tool and not a dead link. A 404 or a redirect to a different page means the citation is wrong: fix the link or cut the claim.

- [ ] **Step 3: Capture the three screenshots**

In Chrome, in a new tab: the launch post header, the Models Engineering Index table, and the main Hacker News thread header. Crop each to the content, no Google brand art, and save under `docs/screenshots/`. Convert to webp before upload; R2 accepts jpg, png, webp and avif (`src/server/r2.ts:9`).

- [ ] **Step 4: Draw the diagram**

The three-way decision: Hydrogen for volume and latency, Neon as the default, Carbon for the hardest long-horizon work, with today's prices and the December 1 change marked. Same visual register as the Hydrogen post's diagram.

- [ ] **Step 5: Stop and ask before uploading**

R2 is the bucket the live site serves, so uploading is a production change. Show Christian the four images and ask for a go-ahead before any upload. Do not upload without it.

- [ ] **Step 6: Upload and insert**

After the go-ahead, upload each image through the admin and paste the returned URLs into the body as `![alt](url)`, each followed by its italic caption, at the four blank lines the earlier tasks left. Alt text describes what the image shows, not that it is a screenshot.

- [ ] **Step 7: Verify the image lines**

Run: `pnpm test post-seed-integrity`
Expected: PASS, with the https guard now covering the four image URLs.

- [ ] **Step 8: Commit**

```bash
git add prisma/seed-data/posts/gemini-4-neon-developer-guide.md docs/screenshots
git commit -m "docs(blog): add the Neon post screenshots and decision diagram"
```

---

### Task 6: Quality gate and the draft preview

**Files:**
- Modify: none expected. `e2e/public/blog.spec.ts` changes only if Step 4 fails.

**Interfaces:**
- Consumes: everything above.
- Produces: the preview link Christian reads, and a branch ready for his review.

- [ ] **Step 1: Seed the draft locally**

Run: `pnpm db:up && pnpm db:seed`
Expected: the seed reports the posts it inserted, including the new slug. `prisma/seed.mts:40` falls back to a placeholder body when the filename does not match the slug, so if the seeded body looks like a placeholder, the filename is wrong.

- [ ] **Step 2: Run the gate**

Run: `pnpm typecheck`, then `pnpm lint`, then `pnpm test`, then `pnpm build`, each on its own and none of them piped into anything.
Expected: all pass.

- [ ] **Step 3: Open the preview**

Run `pnpm dev`, sign in to the admin, open the new post and use its Preview button, which signs a one-hour link that renders drafts (`src/components/admin/preview-button.tsx`). Read the rendered post.

- [ ] **Step 4: Check it at both widths**

Check the preview at 1440px and 390px. At 390px, confirm the comparison tables do not push the page sideways and the callout and code spans wrap. A table that overflows gets its columns reduced in the body, not a style change: this plan touches no `src/`.

- [ ] **Step 5: Prove the draft stays off the public site**

Run: `pnpm test:e2e`
Expected: PASS with `e2e/public/blog.spec.ts` unchanged. Its RSS assertion lists the four published posts, so a passing run proves the DRAFT adds nothing to the feed, the list or the previous and next links. If it fails on the new slug, the post was seeded as PUBLISHED: fix the seed entry, do not edit the spec.

- [ ] **Step 6: Commit and hand over**

```bash
git add -A
git commit -m "chore(blog): verify the Gemini 4 Neon draft against the quality gate"
```

Then tell Christian the branch, the preview route and what was checked, and leave publishing to him.
