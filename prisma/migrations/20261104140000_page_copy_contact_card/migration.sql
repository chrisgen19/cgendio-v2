-- The contact section now pairs my business card with a step-by-step form, so its heading and lede change to match.
-- Unlike earlier copy migrations, these overwrite the rows whatever they hold (Christian asked for the new wording
-- everywhere). The values match prisma/seed-data/page-copy.ts; src/server/page-copy-migration.test.ts checks them.

UPDATE "page_copy" SET "value" = 'Building something, or hiring? Let''s [[talk]].', "updated_at" = CURRENT_TIMESTAMP WHERE "key" = 'contact.heading';
UPDATE "page_copy" SET "value" = 'Here''s my card. Email me directly, or tell me about it in the form and I''ll reply to you myself.', "updated_at" = CURRENT_TIMESTAMP WHERE "key" = 'contact.lede';
