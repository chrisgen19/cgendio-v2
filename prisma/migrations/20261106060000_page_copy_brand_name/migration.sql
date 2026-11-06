-- The brand is the name the previous site ranks on (#81 Phase A), so the displayed name follows it: "Chris Diomampo",
-- with "Christian Diomampo" kept as the Person schema's alternateName. This value shows on the About panel and the
-- contact card, and feeds the JSON-LD Person, the RSS dc:creator and article:author. A row only changes while it still
-- holds the old seed value, so a name edited in the admin is kept. src/server/page-copy-migration.test.ts checks it.

UPDATE "page_copy" SET "value" = 'Chris Diomampo', "updated_at" = CURRENT_TIMESTAMP WHERE "key" = 'about.name' AND "value" = 'Christian Diomampo';
