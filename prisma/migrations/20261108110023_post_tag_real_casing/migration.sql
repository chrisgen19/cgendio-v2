-- Post tags are stored in their real casing now, with the uppercase moved into the styling (#112).
--
-- The stored label is also the metadata value: it reaches article:tag, the JSON-LD articleSection and keywords, the RSS
-- <category> and the Markdown export, so "WORDPRESS" was shouting at search engines and feed readers where the previous
-- site sent "WordPress". The chips still render uppercase, from a CSS utility.
--
-- Filter URLs are unaffected: slugify() lowercases before it strips (src/lib/slugify.ts), so "WORDPRESS" and "WordPress"
-- both give "wordpress", and "AI WORKFLOW" and "AI workflow" both give "ai-workflow". No ?tag= value changes.
--
-- Each update matches the old value, so it never overwrites a tag edited in the admin. The values match the seed.
--
-- updated_at is deliberately left alone, unlike 20261107120000_project_fresh_fruit_summary. This is a casing correction,
-- not a content change, and #81 Phase D is about the sitemap lastmod staying truthful through the cutover: bumping it
-- here would tell Google every post changed on cutover day.
--
-- On a fresh database (production's first deploy) this matches no rows: migrations run before the seed, which inserts
-- the corrected values directly.
UPDATE "posts" SET "tag" = 'WordPress'     WHERE "tag" = 'WORDPRESS';
UPDATE "posts" SET "tag" = 'Migration'     WHERE "tag" = 'MIGRATION';
UPDATE "posts" SET "tag" = 'Infrastructure' WHERE "tag" = 'INFRASTRUCTURE';
UPDATE "posts" SET "tag" = 'AI workflow'   WHERE "tag" = 'AI WORKFLOW';
