-- Premium Mobile Car Valeting Glasgow's site no longer runs AngularJS, so its tags and write-up say so. Each value matches the seed. A
-- database that only runs migrations gets them here, and each update only replaces the old seeded value, so it never overwrites an admin edit.
UPDATE "projects" SET "tags" = ARRAY['WordPress', 'WooCommerce', 'PayPal', 'Bootstrap']::text[] WHERE "slug" = 'premium-mobile-car-valeting' AND "tags" = ARRAY['WordPress', 'WooCommerce', 'PayPal', 'AngularJS']::text[];
UPDATE "projects" SET "case_study" = '## Built

Online booking and scheduling on WooCommerce, with PayPal payments, and services and prices the owner edits in WordPress.

## Since then

The site has since moved to a new theme, with a booking assistant that suggests a service and a postcode check before a date and time are picked.

## Marketing

Facebook Pixel tracking for targeted ad campaigns, and an AngularJS and Bootstrap front end that worked on phones.

## What it included

- Booking and scheduling through WooCommerce
- PayPal payments
- Services and prices edited in WordPress
- Facebook Pixel for retargeting campaigns
- Responsive Bootstrap layout
' WHERE "slug" = 'premium-mobile-car-valeting' AND "case_study" = '## Built

Online booking and scheduling on WooCommerce, with PayPal payments, and services and prices the owner edits in WordPress.

## Marketing

Facebook Pixel tracking for targeted ad campaigns, and an AngularJS and Bootstrap front end that works on phones.

## What''s in it

- Booking and scheduling through WooCommerce
- PayPal payments
- Services and prices edited in WordPress
- Facebook Pixel for retargeting campaigns
- Responsive Bootstrap layout
';
