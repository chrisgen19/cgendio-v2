# GPT-6.2 Astra and Sol Post Implementation Plan

**Goal:** Add a researched developer guide to OpenAI's GPT-6.2 Astra and GPT-6.2 Sol as a seeded `DRAFT` post so Christian can review it in the admin preview before publishing.

**Architecture:** Content and test guards only. The post body lives at `prisma/seed-data/posts/gpt-6-2-astra-sol-developer-guide.md`, its `DRAFT` metadata entry lives in `prisma/seed-data/posts.ts`, and `src/server/post-seed-integrity.test.ts` guards house rules (zero em/en dashes, HTTPS-only links, draft metadata, body file existence). Nothing under `src/app/` or `src/components/` changes.

**Spec:** `docs/superpowers/specs/2026-11-23-gpt-6-2-astra-sol-post-design.md`

## Tasks

- [x] Sync branch `feature/gpt-6-2-astra-sol-post` off `origin/main` (PR #180) and align `node_modules` with `pnpm install --frozen-lockfile`.
- [x] Verify all primary sources directly (OpenAI launch post, Using GPT-6.2 guide, Astra & Sol model pages, pricing, Background mode guide, Artificial Analysis 5-effort tables, Models Engineering Index, SimpleBench, and HN threads `#50535230` and `#50588916`).
- [x] Capture 3 Playwright screenshots + render 1 custom site-token decision diagram as WebP under `docs/screenshots/` and upload all 4 to R2 (verified HTTP 200).
- [x] Type-check all 3 Next.js + OpenAI Responses API TypeScript examples in a scratchpad against `openai@7.62.0` and `zod@4.6.7` via `tsc --noEmit` (zero API calls).
- [x] Write `prisma/seed-data/posts/gpt-6-2-astra-sol-developer-guide.md`, add `DRAFT` metadata to `prisma/seed-data/posts.ts`, and add integrity tests in `src/server/post-seed-integrity.test.ts`.
- [x] Run automated URL 200 check, em/en dash check, verbatim quote check, and fresh accuracy audit.
- [x] Run full `CLAUDE.md` quality gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` (with `e2e/public/blog.spec.ts` unchanged to prove draft containment).
- [x] Verify admin preview at 1440px and 390px (light and dark themes, zero horizontal overflow) and confirm public 404 / absence from RSS, sitemap, and blog list.
- [ ] Pause for Christian's review before opening PR 1 or publishing.
