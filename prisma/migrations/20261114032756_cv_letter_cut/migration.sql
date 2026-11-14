-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "cv_url_letter" TEXT;

-- The Contact section's two CV button labels. Both are required page copy keys, so a database that only runs
-- `prisma migrate deploy` needs them here as well as in the seed (see src/server/page-copy-migration.test.ts).
INSERT INTO "page_copy" ("key", "value", "updated_at") VALUES
  ('contact.cvLabelA4', 'Download CV (A4)', CURRENT_TIMESTAMP),
  ('contact.cvLabelLetter', 'Download CV (Letter)', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
