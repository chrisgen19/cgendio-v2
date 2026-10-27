-- Project cards can show their client's brand tint. Add the brand and tint colours, then give the six client projects
-- the colours from the seed. Each update only fills an empty colour, so it never overwrites an admin edit.

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "brand_color" TEXT,
ADD COLUMN     "brand_tint" TEXT;

UPDATE "projects" SET "brand_color" = '#e31836' WHERE "slug" = 'access-hire' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#005fe5' WHERE "slug" = 'myimprov' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#415c5a' WHERE "slug" = 'merthyr-village' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#aa0212' WHERE "slug" = 'experience-sunnybank' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#e53845', "brand_tint" = '#6b6460' WHERE "slug" = 'premium-mobile-car-valeting' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#35b65a' WHERE "slug" = 'fresh-fruit-and-veg' AND "brand_color" IS NULL;
