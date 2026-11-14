-- The Contact section's two CV cuts now sit in one "Download CV" button's menu, so their labels become the menu rows'
-- names. Guarded: a label already changed in the admin keeps its wording. The values match prisma/seed-data/page-copy.ts;
-- src/server/page-copy-migration.test.ts checks them.

UPDATE "page_copy" SET "value" = 'A4 Format CV', "updated_at" = CURRENT_TIMESTAMP WHERE "key" = 'contact.cvLabelA4' AND "value" = 'Download CV (A4)';
UPDATE "page_copy" SET "value" = 'Letter Format CV', "updated_at" = CURRENT_TIMESTAMP WHERE "key" = 'contact.cvLabelLetter' AND "value" = 'Download CV (Letter)';
