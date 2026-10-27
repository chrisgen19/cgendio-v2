# Work cards in each client's brand tint

Date: 2026-10-27. Branch: `feature/work-brand-colours`. Status: design approved in chat, plan next.

## Why

The Selected work cards use the studio palette (ink, lime, tint, gray) in a fixed rotation. The design reference picked that rotation for cards that showed only a big glyph word (`docs/design/design-reference.dc.html:1354-1359`); the real cover screenshots came later. Against the covers, three cards work, two are so-so and Merthyr Village (lavender next to a muted teal site with warm photography) clashes.

Christian compared four options in browser mockups (current, solid brand, soft brand tint, deep brand shade, each at 1440px and 375px, light and dark page) and picked **B, soft brand tint**: a pale wash of the client's brand colour with ink text, the brand colour on the number, rule and button, and a dark wash on the dark page. The covers stay the loudest thing on the card; each card still reads as its client.

## Goals

- Every project can carry a brand colour and an optional tint colour, edited in the admin.
- The home page card and the case study page's top panel use the brand tint when a brand colour is set.
- All shades are derived from those two colours on the server, for the light and the dark page, and always pass WCAG 2.2 AA.
- Existing databases (dev, production) get the six colours from the migration, with no admin edits.

## Non-goals

- No change to the card layout, type, stacking animation or cover window.
- No new colour tokens in `@theme`: the colours are per project data, not part of the design system.
- No solid or deep brand variants (options A and C), and no per-project choice between styles.
- No new packages (no colour library, no colour-picker component).

## Anti-goals (a failure even if it works)

- Any text or label on a card under 4.5:1, or a button fill under 3:1 against its card, in either page theme.
- Two neighbouring cards that read as the same colour.
- A project without a brand colour looking broken: it must look exactly as it does today.
- Dark mode flashing the light palette on load.

## Decisions

### Data

Two nullable columns on `projects`, both `#rrggbb` text, stored lowercase:

| Prisma field | Column | Meaning |
| --- | --- | --- |
| `brandColor String?` | `brand_color` | The client's main brand colour. Drives the number, rule, glyph and button. When null the card uses its `theme` as today. |
| `brandTint String?` | `brand_tint` | The colour the card background is washed from. Optional, defaults to `brandColor`. Ignored while `brandColor` is null. |

`theme` stays (required, unchanged) as the fallback for projects without a brand colour. Nothing that reads it today breaks.

Why two fields: three of the six clients are red (Access Hire, Sunnybank, Premium). With one field, Premium becomes a third pink card, next to Sunnybank's. Premium's site is black and red, so its tint colour is a warm grey and its brand colour stays red, which reproduces the mockup.

### The six colours

Sampled from each cover screenshot:

| Slug | `brandColor` | `brandTint` | Source |
| --- | --- | --- | --- |
| `access-hire` | `#e31836` | null | top bar red |
| `myimprov` | `#005fe5` | null | headline blue |
| `merthyr-village` | `#415c5a` | null | nav teal |
| `experience-sunnybank` | `#aa0212` | null | search button red |
| `premium-mobile-car-valeting` | `#e53845` | `#6b6460` | top bar red; warm grey tint (gives the mockup's `#edecec` card) |
| `fresh-fruit-and-veg` | `#35b65a` | null | brand green |

### Palette maths (`src/lib/brand-palette.ts`)

A pure function, `brandPalette(brandColor, brandTint?)`, returns a light and a dark set, each `{background, accent, button, onButton}`. Colours mix in gamma sRGB, the same as CSS `color-mix(in srgb, ...)`, rounded to `#rrggbb`. Contrast is the WCAG 2.x relative-luminance ratio.

| Value | Light page | Dark page |
| --- | --- | --- |
| background | 12% tint into `#ffffff` (today's tint recipe) | 22% tint into `#15171d` (the dark `white` surface) |
| text | the `ink` token (`#0d0e12`), not computed | the `ink` token (`#f2f3f5`), not computed |
| accent (number, rule, glyph) | brand, stepped toward `#0d0e12` until >= 4.5:1 on the background | brand, stepped toward `#ffffff` until >= 4.5:1 |
| button | brand if >= 3:1 on the background, else the accent | same rule |
| onButton | `#ffffff` or `#0d0e12`, whichever contrasts more; if that is still under 4.5:1 the button steps toward ink (light) or white (dark) until it passes | same |

Body text always passes on these backgrounds (light about 15:1 and up, dark about 11:1 and up), so it uses the tokens rather than computed values. A prototype of these rules passed for every colour on a 16-level-per-channel sweep (8,192 light and dark palettes). The six real colours come out as:

| Project | Light bg | Light button | Dark bg | Dark button |
| --- | --- | --- | --- | --- |
| Access Hire | `#fce3e7` | `#e31836`, white | `#421723` | `#e31836`, white |
| MyImprov | `#e0ecfc` | `#005fe5`, white | `#102749` | `#4d8fed`, ink |
| Merthyr Village | `#e8ebeb` | `#415c5a`, white | `#1f262a` | `#7e908f`, ink |
| Sunnybank | `#f5e1e3` | `#aa0212`, white | `#36121b` | `#cc6771`, ink |
| Premium | `#edecec` | `#e53845`, ink | `#28282c` | `#e53845`, ink |
| Fresh Fruit and Veg | `#e7f6eb` | `#277d42`, white | `#1c3a2a` | `#35b65a`, ink |

Two differences from the mockup, both from the 3:1 button rule: Fresh's light button is the darker green `#277d42` (the mockup's `#35b65a` is 2.35:1 on its card), and the dark-page buttons for MyImprov, Merthyr and Sunnybank use the lighter accent shade (the brand fills are 2.1 to 2.7:1 there).

### Rendering and dark mode

The site's dark mode is token overrides under `:root[data-theme="dark"]:not(:has(.admin-theme))` (`src/app/globals.css:154`), with no Tailwind `dark:` variant, and the server sets `data-theme` from the cookie. The brand palette follows the same pattern, so there is no flash:

- A helper next to `PROJECT_THEMES` (`src/components/ui-site/project-theme.ts`) turns a palette into inline CSS variables: `--brand-bg-light`, `--brand-bg-dark`, `--brand-accent-light`, `--brand-accent-dark`, and the same for `button` and `on-button`.
- `globals.css` gets a `.brand-panel` rule that points `--brand-bg`, `--brand-accent`, `--brand-button` and `--brand-on-button` at the `-light` variables, and a dark rule (same selector as the token block) that points them at the `-dark` ones.
- Components use Tailwind's variable utilities: `bg-(--brand-bg)`, `text-(--brand-accent)`, `bg-(--brand-button) text-(--brand-on-button)`.

On the **home page card** (`src/components/sections/project-card.tsx`), when `brandColor` is set:

- Card: `brand-panel bg-(--brand-bg) text-ink`. It is not a light island (no `data-theme="light"`), so tags and the cover window follow the page theme as the tint and gray cards do today.
- The number and the rule take the accent (the rule at full opacity, as in the mockup); the kind label stays in the text colour.
- The glyph (shown when there is no cover) takes the accent.
- Button: `bg-(--brand-button) text-(--brand-on-button)`, turning `bg-ink text-white` on hover (ink and white swap in dark mode, so the hover works in both).
- The rings keep `currentColor` at 14% opacity, so they follow the text colour.

On the **case study panel** (`src/components/case-study/case-study-article.tsx:63-77`) the same applies: background and text as on the card, glyph in the accent. Without a brand colour, both keep `CARD_THEMES` / `PROJECT_THEMES` exactly as today.

### Admin

- `projectFormSchema` gets `brandColor` and `brandTint`: optional, empty becomes null, otherwise `^#[0-9a-fA-F]{6}$`, lowercased. Error: "Use a hex colour like #e31836".
- `ProjectForm` gets a `ColorField` (new, in `src/components/admin/form-fields.tsx`): a text `Input` with a live swatch beside it. Not a native `<input type="color">`, which always submits a value and so can't be left empty.
- Hints: brand colour "Number, rule and button. Empty uses the card theme"; tint colour "The card background is washed from this. Empty uses the brand colour".
- The theme select's label becomes "Card theme (when no brand colour)".
- `ProjectFormValues` gains both fields. The edit page (`src/server/admin/data.ts:20`) and the draft preview (`src/server/preview.ts:19`) already load the full row, and `saveProject` (`src/server/actions/projects.ts`) writes the parsed form data as is, so neither needs other changes.

### Migration

A hand-written migration `prisma/migrations/<timestamp>_project_brand_colours/migration.sql` (per the CLAUDE.md Prisma gotcha, SQL from `prisma migrate diff`, applied with `pnpm db:deploy`):

1. `ALTER TABLE "projects" ADD COLUMN "brand_color" TEXT, ADD COLUMN "brand_tint" TEXT;`
2. One `UPDATE` per slug from the table above, guarded with `AND "brand_color" IS NULL`, so it is safe to re-run and never overwrites an admin edit. A database without those slugs is unaffected.

The seed only inserts into an empty table (`createMany` with `skipDuplicates`, `prisma/seed.mts:50`), so `prisma/seed-data/projects.ts` and `prisma/seed.mts` carry the same colours for fresh databases.

### Tests

- `src/lib/brand-palette.test.ts`: the six projects' expected values; for a sweep of colours (16 levels per channel), light and dark, every accent and text pair >= 4.5:1, every button label >= 4.5:1 and every button fill >= 3:1 on its card; `brandTint` changes only the backgrounds.
- `src/server/admin/form-schemas.test.ts`: empty fields become null, valid hex is lowercased, `#fff`, `red` and `e31836` are rejected.
- `src/server/content-schema.test.ts` and `src/server/content.test.ts`: the new fields pass through and are hex-validated.
- e2e: the `work-desktop` and `work-mobile` visual baselines change (the e2e database is seeded, so it gets the colours). Regenerate through CI per the CLAUDE.md visual-baseline steps. `a11y.spec.ts` (axe) is an independent contrast check. There are no case study visual baselines.

## Constraints

- Quality gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`; UI checked at 1440px and 390px, light and dark.
- After the `globals.css` change, grep the built CSS for `.brand-panel` (Turbopack stale CSS gotcha); restart `next dev` after the migration (stale Prisma client).
- Biome style (single quotes, no bracket spacing, width 150); utilities are arrow functions with JSDoc; no em or en dashes in comments or copy.
- Production: the migration is additive and runs on the Coolify deploy. To revert, roll back the application and leave the columns in place: the previous code and Prisma schema never read them. Drop them only later, in a migration shipped with code whose schema no longer has them; dropping them while this version runs breaks every project query, since those load all columns. Confirm with Christian before merging.

## Left to the builder

- Exact variable names and where the style helper lives, within the shape above.
- The step size used when shifting a colour toward ink or white (the prototype used 50 steps).
- The `ColorField` swatch markup, within the admin's shadcn style.
- The migration timestamp.
