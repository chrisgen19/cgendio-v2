-- Fresh Fruit and Veg Shop's site has moved to office deliveries, so its summary, label, tags and write-up say so. Each value matches the seed.
-- A database that only runs migrations gets them here, and each update only replaces the old seeded value, so it never overwrites an admin edit.
UPDATE "projects" SET "summary" = 'Office fruit deliveries for workplaces in Glasgow, on a WordPress and WooCommerce site.' WHERE "slug" = 'fresh-fruit-and-veg' AND "summary" = 'Weekly fruit and veg boxes for homes and offices in Glasgow, sold as WooCommerce subscriptions.';
UPDATE "projects" SET "kind_label" = 'CLIENT · OFFICE DELIVERIES' WHERE "slug" = 'fresh-fruit-and-veg' AND "kind_label" = 'CLIENT · SUBSCRIPTIONS';
UPDATE "projects" SET "tags" = ARRAY['WordPress', 'WooCommerce', 'Elementor', 'Astra']::text[] WHERE "slug" = 'fresh-fruit-and-veg' AND "tags" = ARRAY['WordPress', 'WooCommerce', 'Subscriptions', 'Elementor']::text[];
UPDATE "projects" SET "case_study" = '## Built

A WooCommerce shop for home and office deliveries, with boxes sold as monthly subscriptions and delivery slots picked at checkout.

## Since then

The site has since moved to office deliveries, with boxes and prices on one page and a form to get a quote.

## Billing

The first payment was taken up front, then WooCommerce Subscriptions charged on the first of each month.

## What it included

- Home and office delivery boxes
- Monthly subscriptions with WooCommerce Subscriptions
- Delivery slots chosen at checkout
- Discount rules for boxes and offers
- Custom Elementor widgets on an Astra child theme
- Product catalogue synced to Facebook
' WHERE "slug" = 'fresh-fruit-and-veg' AND "case_study" = '## Built

A WooCommerce shop for home and office deliveries, with boxes sold as monthly subscriptions and delivery slots picked at checkout.

## Billing

The first payment is taken up front, then WooCommerce Subscriptions charges on the first of each month.

## What''s in it

- Home and office delivery boxes
- Monthly subscriptions with WooCommerce Subscriptions
- Delivery slots chosen at checkout
- Discount rules for boxes and offers
- Custom Elementor widgets on an Astra child theme
- Product catalogue synced to Facebook
';
