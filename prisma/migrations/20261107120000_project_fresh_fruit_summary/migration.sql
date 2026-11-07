-- Fresh Fruit and Veg Shop's summary goes back to the previous site's, which #81 Phase A confirmed is correct. Only the summary:
-- the kind label, tags and write-up from 20261102170000_project_fresh_fruit_copy stay. The value matches the seed. A database
-- that only runs migrations gets it here, and the update only replaces the old seeded value, so it never overwrites an admin edit.
-- updated_at moves too, so the sitemap lastmod shows the page changed. On a fresh database (production's first deploy) this
-- matches no rows: migrations run before the seed, which then inserts the previous site's date.
UPDATE "projects" SET "summary" = 'Weekly fruit and veg boxes for homes and offices in Glasgow, sold as WooCommerce subscriptions.', "updated_at" = CURRENT_TIMESTAMP WHERE "slug" = 'fresh-fruit-and-veg' AND "summary" = 'Office fruit deliveries for workplaces in Glasgow, on a WordPress and WooCommerce site.';
