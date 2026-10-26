-- The About redesign (PR #48) replaced these page-copy keys, and nothing reads them since: the site only loads
-- PAGE_COPY_KEYS (src/server/content.ts). Remove the rows a database seeded before it still holds. A database that
-- never had them is unaffected. None of them may be a current key (src/server/page-copy-migration.test.ts checks).
DELETE FROM "page_copy" WHERE "key" IN (
  'about.statement',
  'about.role',
  'about.fact1.title',
  'about.fact1.body',
  'about.fact2.title',
  'about.fact2.body',
  'about.fact3.title',
  'about.fact3.body'
);
