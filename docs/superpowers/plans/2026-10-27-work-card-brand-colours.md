# Work Card Brand Colours Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each project an optional brand colour and tint colour, and render the home page card and the case study panel as a soft brand tint that passes WCAG AA in light and dark mode.

**Architecture:** Two nullable hex columns on `projects`. A pure utility derives a light and a dark palette from them; the server renders both as inline CSS variables, and a `.brand-panel` rule in `globals.css` picks the set for the page theme (the same token-override pattern the site's dark mode uses). Projects without a brand colour keep their `theme` exactly as today.

**Tech Stack:** Next.js App Router (RSC), Prisma + PostgreSQL, Zod, Tailwind CSS v4, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-27-work-card-brand-colours-design.md`

## Global Constraints

- Branch `feature/work-brand-colours`; Conventional Commits; never commit to `main`.
- No new packages. No new `@theme` tokens.
- Biome style: single quotes, no bracket spacing, line width 150, semicolons, trailing commas. Utilities are arrow functions with JSDoc; components are `function` declarations; named exports.
- No em or en dashes in code comments, copy or commit messages.
- Colours are `#rrggbb`, stored lowercase.
- Light page: 12% tint into `#ffffff`, text `#0d0e12`. Dark page: 22% tint into `#15171d`, text `#f2f3f5`.
- Accent and button labels >= 4.5:1; button fills >= 3:1 against their card.
- `theme` stays required and unchanged; a null `brandColor` means today's rendering, pixel for pixel.
- Quality gate before done: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`; UI checked at 1440px and 390px, light and dark.

## Review Focus

1. **A theme-LIME project with a brand colour on the dark page** (MyImprov, Premium): the card must not keep `data-theme="light"`, or its text turns `#0d0e12` on a dark tint. Pinned by the e2e test in Task 4.
2. **Uppercase hex** typed in the admin (`#E31836`) or edited in Prisma Studio: saved and read as lowercase, never a page crash. Pinned in Task 2 (content schema) and Task 3 (form schema).
3. **`brandTint` set while `brandColor` is empty**: the card uses its theme; the tint is ignored. Pinned in Task 4 (`brandPanelStyle` test).
4. **Extreme colours** (`#ffffff`, `#000000`, `#0d0e12`, `#15171d`) as brand or tint: every pair still passes. Pinned in Task 1.
5. **The migration re-run, or run after an admin edit**: never overwrites a colour already set, and matches the seed. Pinned in Task 2 (migration test).

---

### Task 1: Brand palette utility

**Files:**
- Create: `src/lib/brand-palette.ts`
- Test: `src/lib/brand-palette.test.ts`

**Interfaces:**
- Produces:
  - `type BrandShades = {background: string; accent: string; button: string; onButton: string}`
  - `type BrandPalette = {light: BrandShades; dark: BrandShades}`
  - `mixHex(color: string, base: string, amount: number): string`: `amount` is the share of `color` (0 to 1), per-channel gamma sRGB mix, `Math.round`, lowercase `#rrggbb`.
  - `contrastRatio(a: string, b: string): number`: WCAG relative luminance (sRGB threshold `0.04045`), `(lighter + 0.05) / (darker + 0.05)`.
  - `brandPalette(brandColor: string, brandTint?: string | null): BrandPalette`

- [ ] **Step 1: Write the failing tests** in `src/lib/brand-palette.test.ts`

```ts
describe('mixHex', () => {
  it('mixes like color-mix in srgb', () => {
    expect(mixHex('#e31836', '#ffffff', 0.12)).toBe('#fce3e7');
    expect(mixHex('#e31836', '#15171d', 0.22)).toBe('#421723');
  });
});

describe('contrastRatio', () => {
  it('matches WCAG', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#e31836')).toBeCloseTo(4.72, 2);
  });
});

describe('brandPalette', () => {
  // The spec's table for the six projects
  it.each([
    ['#e31836', null, {background: '#fce3e7', accent: '#ce1732', button: '#e31836', onButton: '#ffffff'}, {background: '#421723', accent: '#eb5d72', button: '#e31836', onButton: '#ffffff'}],
    ['#005fe5', null, {background: '#e0ecfc', accent: '#005fe5', button: '#005fe5', onButton: '#ffffff'}, {background: '#102749', accent: '#4d8fed', button: '#4d8fed', onButton: '#0d0e12'}],
    ['#415c5a', null, {background: '#e8ebeb', accent: '#415c5a', button: '#415c5a', onButton: '#ffffff'}, {background: '#1f262a', accent: '#7e908f', button: '#7e908f', onButton: '#0d0e12'}],
    ['#aa0212', null, {background: '#f5e1e3', accent: '#aa0212', button: '#aa0212', onButton: '#ffffff'}, {background: '#36121b', accent: '#cc6771', button: '#cc6771', onButton: '#0d0e12'}],
    ['#e53845', '#6b6460', {background: '#edecec', accent: '#c7323e', button: '#e53845', onButton: '#0d0e12'}, {background: '#28282c', accent: '#eb646e', button: '#e53845', onButton: '#0d0e12'}],
    ['#35b65a', null, {background: '#e7f6eb', accent: '#277d42', button: '#277d42', onButton: '#ffffff'}, {background: '#1c3a2a', accent: '#35b65a', button: '#35b65a', onButton: '#0d0e12'}],
  ])('derives %s (tint %s)', (brand, tint, light, dark) => {
    expect(brandPalette(brand, tint)).toEqual({light, dark});
  });

  it('only changes the backgrounds when a tint is given', () => {
    const plain = brandPalette('#e53845');
    const tinted = brandPalette('#e53845', '#6b6460');
    expect(tinted.light.background).not.toBe(plain.light.background);
    expect(tinted.light.button).toBe(plain.light.button);
  });

  // Every colour on a 16-level grid, plus the extremes, as brand and as tint
  const LEVELS = Array.from({length: 16}, (_, n) => (n * 17).toString(16).padStart(2, '0'));
  const GRID = LEVELS.flatMap((r) => LEVELS.flatMap((g) => LEVELS.map((b) => `#${r}${g}${b}`)));
  const EXTREMES = ['#ffffff', '#000000', '#0d0e12', '#15171d', '#f2f3f5'];

  it('passes AA for every colour, light and dark', () => {
    const cases = [...GRID.map((c) => [c, null] as const), ...EXTREMES.flatMap((c) => EXTREMES.map((t) => [c, t] as const))];
    for (const [brand, tint] of cases) {
      const {light, dark} = brandPalette(brand, tint);
      for (const [shades, text] of [[light, '#0d0e12'], [dark, '#f2f3f5']] as const) {
        expect(contrastRatio(text, shades.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(shades.accent, shades.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(shades.button, shades.onButton)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(shades.button, shades.background)).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run src/lib/brand-palette.test.ts`
Expected: FAIL, cannot resolve `./brand-palette`.

- [ ] **Step 3: Implement `src/lib/brand-palette.ts`**

Constants: `LIGHT = {base: '#ffffff', amount: 0.12, toward: '#0d0e12'}`, `DARK = {base: '#15171d', amount: 0.22, toward: '#ffffff'}`, `STEPS = 50`, `INK = '#0d0e12'`, `WHITE = '#ffffff'`. The expected values above depend on this exact stepping, so follow it:

```ts
// One page theme's shades
const shades = (brand: string, tint: string, {base, amount, toward}: Mode): BrandShades => {
  const background = mixHex(tint, base, amount);
  // accent: the first of brand, then brand moved 1/STEPS at a time toward `toward`, that reaches 4.5:1
  let accent = brand;
  for (let s = 0; s <= STEPS && contrastRatio(accent, background) < 4.5; s++) accent = mixHex(toward, brand, s / STEPS);
  let button = contrastRatio(brand, background) >= 3 ? brand : accent;
  const label = (fill: string) => (contrastRatio(fill, WHITE) >= contrastRatio(fill, INK) ? WHITE : INK);
  for (let s = 0; s <= STEPS && contrastRatio(button, label(button)) < 4.5; s++) button = mixHex(toward, button, 1 / STEPS);
  return {background, accent, button, onButton: label(button)};
};
```

`brandPalette` lowercases its inputs, uses `brandTint ?? brandColor` as the tint, and returns `{light: shades(..., LIGHT), dark: shades(..., DARK)}`. JSDoc each export.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/lib/brand-palette.test.ts`
Expected: PASS. If a six-project value is off by one step, fix the stepping, not the expected value: those are the spec's values.

- [ ] **Step 5: Commit**

```bash
git add src/lib/brand-palette.ts src/lib/brand-palette.test.ts
git commit -m "feat(work): derive accessible brand tint palettes"
```

---

### Task 2: Brand colour columns, migration, content and seed

**Files:**
- Modify: `prisma/schema.prisma` (model `Project`)
- Create: `prisma/migrations/20261027120000_project_brand_colours/migration.sql`
- Modify: `src/server/content-schema.ts:13-26`, `src/server/content.ts:74-87`
- Modify: `prisma/seed-data/projects.ts`, `prisma/seed.mts:50-70`
- Test: `src/server/content-schema.test.ts`, `src/server/content.test.ts`, create `src/server/project-brand-migration.test.ts`

**Interfaces:**
- Produces:
  - Prisma `Project.brandColor: string | null` (`brand_color`), `Project.brandTint: string | null` (`brand_tint`).
  - `projectSchema` (and so `Project` / `ProjectDetail`) gains `brandColor: string | null` and `brandTint: string | null`, lowercase `#rrggbb`.
  - `hexColorSchema` exported from `content-schema.ts`: accepts `/^#[0-9a-fA-F]{6}$/`, outputs lowercase.

- [ ] **Step 1: Write the failing tests**

`content-schema.test.ts`: add `brandColor: null, brandTint: null` to the `project` fixture, then:

```ts
it('takes brand colours as lowercase hex', () => {
  expect(projectSchema.parse({...project, brandColor: '#E31836', brandTint: '#6b6460'})).toMatchObject({brandColor: '#e31836', brandTint: '#6b6460'});
  for (const bad of ['#fff', 'red', 'e31836', '#e3183'])
    expect(projectSchema.safeParse({...project, brandColor: bad}).success).toBe(false);
});
```

`content.test.ts`: add `brandColor: null, brandTint: null` to `projectRow`, and assert that a row with `brandColor: '#005fe5'` comes out of the projects query with `brandColor: '#005fe5', brandTint: null` (same style as the existing `theme: 'tint'` assertion near line 79).

`project-brand-migration.test.ts`, following `page-copy-migration.test.ts`: read `prisma/migrations/20261027120000_project_brand_colours/migration.sql` and, for every seed project with a `brandColor`, expect the SQL to contain its `UPDATE` setting the seed's `brand_color` and `brand_tint` (or `NULL`), with `WHERE "slug" = '<slug>' AND "brand_color" IS NULL`.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm exec vitest run src/server/content-schema.test.ts src/server/content.test.ts src/server/project-brand-migration.test.ts`
Expected: FAIL (unknown keys stripped or missing, migration file not found).

- [ ] **Step 3: Add the Prisma fields**

After `role` in `model Project`, with doc comments:

```prisma
  /// The client's brand colour (#rrggbb): the card's number, rule and button. Null uses `theme`
  brandColor    String?       @map("brand_color")
  /// The colour the card background is washed from; null uses brandColor
  brandTint     String?       @map("brand_tint")
```

- [ ] **Step 4: Write the migration**

Generate the DDL with `git show main:prisma/schema.prisma > <scratchpad>/schema-main.prisma`, then `pnpm exec prisma migrate diff --from-schema <scratchpad>/schema-main.prisma --to-schema prisma/schema.prisma --script`. Save it as the migration with a two-line comment header in the style of `20261027090000_drop_personal_projects`, then append one guarded backfill per project, values from the spec:

```sql
UPDATE "projects" SET "brand_color" = '#e31836' WHERE "slug" = 'access-hire' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#005fe5' WHERE "slug" = 'myimprov' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#415c5a' WHERE "slug" = 'merthyr-village' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#aa0212' WHERE "slug" = 'experience-sunnybank' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#e53845', "brand_tint" = '#6b6460' WHERE "slug" = 'premium-mobile-car-valeting' AND "brand_color" IS NULL;
UPDATE "projects" SET "brand_color" = '#35b65a' WHERE "slug" = 'fresh-fruit-and-veg' AND "brand_color" IS NULL;
```

Apply to the dev database: `pnpm db:deploy`, then `pnpm db:generate`. Expected: "1 migration applied"; the dev rows now have the colours (check with `docker exec cgendio-v2-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select slug, brand_color, brand_tint from projects order by \"order\";"'`).

- [ ] **Step 5: Wire the content layer and seed**

- `content-schema.ts`: `hexColorSchema` as in Interfaces; `brandColor: hexColorSchema.nullable()` and `brandTint: hexColorSchema.nullable()` in `projectSchema`.
- `content.ts` `projectFields`: pass `brandColor: row.brandColor`, `brandTint: row.brandTint`.
- `seed-data/projects.ts`: `brandColor` and `brandTint` on each of the six (lowercase, the spec's table; `brandTint: null` except Premium `'#6b6460'`).
- `seed.mts`: pass both fields in the `createMany` mapping.

- [ ] **Step 6: Run the tests and type-check**

Run: `pnpm exec vitest run src/server && pnpm typecheck`
Expected: PASS, no type errors (the seed's `SeedProject` type now requires both fields).

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20261027120000_project_brand_colours prisma/seed-data/projects.ts prisma/seed.mts src/server/content-schema.ts src/server/content.ts src/server/*.test.ts
git commit -m "feat(work): add brand colour and tint columns to projects"
```

Restart `next dev` after this task if it is running (it keeps the old Prisma client).

---

### Task 3: Admin brand colour fields

**Files:**
- Modify: `src/server/admin/form-schemas.ts:34-58`
- Modify: `src/components/admin/form-fields.tsx` (add `ColorField`)
- Modify: `src/components/admin/project-form.tsx:14-31,37-42,68-72`
- Test: `src/server/admin/form-schemas.test.ts`

**Interfaces:**
- Consumes: the Prisma fields from Task 2.
- Produces: `projectFormSchema` output gains `brandColor: string | null`, `brandTint: string | null`; `ColorField({name, label, hint, defaultValue, errors}: {name: string; label: string; hint?: string; defaultValue?: string | null; errors: FieldErrors})`.

- [ ] **Step 1: Write the failing tests**

Add `brandColor: '', brandTint: ''` to the `projectForm` fixture and `brandColor: null, brandTint: null` to the first test's expected object. Then:

```ts
it('lowercases brand colours and rejects anything but #rrggbb', () => {
  expect(projectFormSchema.parse({...projectForm, brandColor: ' #E31836 ', brandTint: '#6B6460'})).toMatchObject({brandColor: '#e31836', brandTint: '#6b6460'});
  const result = projectFormSchema.safeParse({...projectForm, brandColor: '#fff'});
  expect(result.success).toBe(false);
  expect(result.error?.issues[0]?.message).toBe('Use a hex colour like #e31836');
});

it('treats missing brand colours as none', () => {
  const {brandColor, brandTint, ...rest} = projectForm;
  expect(projectFormSchema.parse(rest)).toMatchObject({brandColor: null, brandTint: null});
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm exec vitest run src/server/admin/form-schemas.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement the schema field**

An `optionalHex` next to `optionalText`: `undefined` or a blank string becomes `null`; otherwise trim, match `/^#[0-9a-fA-F]{6}$/` with the error `'Use a hex colour like #e31836'`, lowercase. Add `brandColor: optionalHex, brandTint: optionalHex` to `projectFormSchema`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/server/admin/form-schemas.test.ts`
Expected: PASS.

- [ ] **Step 5: Add `ColorField` and the form fields**

- `ColorField` in `form-fields.tsx`: `FieldShell` around a flex row of a text `Input` (`placeholder="#e31836"`, `maxLength={7}`, `spellCheck={false}`, `autoComplete="off"`, `className="font-mono"`) and a `size-9 rounded-md border` swatch (`aria-hidden`). Local `useState` mirrors the input; the swatch fills with the value when it matches the hex pattern, otherwise shows an empty bordered square.
- `project-form.tsx`: add both fields to `ProjectFormValues`; change the theme label to `'Card theme (when no brand colour)'`; add a row below the Group/Theme grid:

```tsx
<div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
  <ColorField name="brandColor" label="Brand colour" hint="Number, rule and button. Empty uses the card theme" defaultValue={project?.brandColor} errors={errors} />
  <ColorField name="brandTint" label="Tint colour" hint="The card background is washed from this. Empty uses the brand colour" defaultValue={project?.brandTint} errors={errors} />
</div>
```

- [ ] **Step 6: Check it in the admin**

Run `pnpm typecheck && pnpm lint`, then with `next dev` running, open `/admin/projects/<access-hire id>`: the field shows `#e31836` with a red swatch; save `#E31836` and reload: it reads `#e31836`; save `#fff`: the field shows "Use a hex colour like #e31836". Clear the field, save, and confirm the home page card falls back to the ink theme after Task 4 (note it for Task 4's check), then restore `#e31836`.

- [ ] **Step 7: Commit**

```bash
git add src/server/admin/form-schemas.ts src/server/admin/form-schemas.test.ts src/components/admin/form-fields.tsx src/components/admin/project-form.tsx
git commit -m "feat(admin): edit a project's brand and tint colours"
```

---

### Task 4: Render the brand tint on the card and case study panel

**Files:**
- Modify: `src/components/ui-site/project-theme.ts`
- Create: `src/components/ui-site/project-theme.test.ts`
- Modify: `src/app/globals.css` (after the `.work-card` block, around line 530)
- Modify: `src/components/sections/project-card.tsx`
- Modify: `src/components/case-study/case-study-article.tsx:63-77`
- Create: `e2e/public/work-brand.spec.ts`

**Interfaces:**
- Consumes: `brandPalette` (Task 1); `project.brandColor`, `project.brandTint` (Task 2).
- Produces: `brandPanelStyle(brandColor: string | null, brandTint: string | null): CSSProperties | undefined` in `project-theme.ts`; the CSS classes `brand-panel` and variables `--brand-bg`, `--brand-accent`, `--brand-button`, `--brand-on-button` (each backed by `-light` and `-dark` inline variables).

- [ ] **Step 1: Write the failing unit test** in `project-theme.test.ts`

```ts
it('returns nothing without a brand colour, even with a tint', () => {
  expect(brandPanelStyle(null, null)).toBeUndefined();
  expect(brandPanelStyle(null, '#6b6460')).toBeUndefined();
});

it('sets the light and dark variables from the palette', () => {
  expect(brandPanelStyle('#005fe5', null)).toEqual({
    '--brand-bg-light': '#e0ecfc', '--brand-accent-light': '#005fe5', '--brand-button-light': '#005fe5', '--brand-on-button-light': '#ffffff',
    '--brand-bg-dark': '#102749', '--brand-accent-dark': '#4d8fed', '--brand-button-dark': '#4d8fed', '--brand-on-button-dark': '#0d0e12',
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec vitest run src/components/ui-site/project-theme.test.ts`
Expected: FAIL, `brandPanelStyle` is not exported.

- [ ] **Step 3: Implement `brandPanelStyle`** in `project-theme.ts` (JSDoc; maps `brandPalette(brandColor, brandTint)` onto the eight variables), and run the test again. Expected: PASS.

- [ ] **Step 4: Add the CSS** to `globals.css`

```css
/*
 * A project card or case study panel in its client's brand tint. brandPanelStyle() sets both palettes inline; this
 * picks the one for the page theme, so the server-rendered theme never flashes the other.
 */
.brand-panel {
  --brand-bg: var(--brand-bg-light);
  --brand-accent: var(--brand-accent-light);
  --brand-button: var(--brand-button-light);
  --brand-on-button: var(--brand-on-button-light);
}

:root[data-theme="dark"]:not(:has(.admin-theme)) .brand-panel {
  --brand-bg: var(--brand-bg-dark);
  --brand-accent: var(--brand-accent-dark);
  --brand-button: var(--brand-button-dark);
  --brand-on-button: var(--brand-on-button-dark);
}
```

- [ ] **Step 5: Use it in `project-card.tsx`**

With `const brand = brandPanelStyle(project.brandColor, project.brandTint)`:
- `<article>`: `data-theme` is `'light'` only when `!brand && project.theme === 'lime'`; `style={{...style, ...brand}}`; classes `brand ? 'brand-panel bg-(--brand-bg) text-ink' : CARD_THEMES[project.theme]`.
- The number and rule spans: add `text-(--brand-accent)` when `brand`, and the rule's `opacity-40` becomes `opacity-100` when `brand`.
- The link: `brand ? 'bg-(--brand-button) text-(--brand-on-button) hover:bg-ink hover:text-white' : LINK_THEMES[project.theme]`.
- `ProjectMedia`'s glyph: `text-(--brand-accent)` when `project.brandColor`, else today's `project.theme === 'tint' && 'text-accent'`.
- Update the `CARD_THEMES` comment to say the brand tint replaces these when a project has a brand colour.

- [ ] **Step 6: Use it in `case-study-article.tsx`**

The panel at lines 63-77: same `brandPanelStyle` call, `style={brand}`, `brand ? 'brand-panel bg-(--brand-bg) text-ink' : PROJECT_THEMES[project.theme]`, and the glyph span gets `text-(--brand-accent)` when `brand`.

- [ ] **Step 7: Write the e2e test** `e2e/public/work-brand.spec.ts`

Set up the dark cookie the way `a11y.spec.ts:20-21` does, load `/`, scope to the visible `main`, and for the MyImprov card (`article` containing the heading "MyImprov Online Traffic School"):

```ts
await expect(card).not.toHaveAttribute('data-theme');
await expect(card).toHaveCSS('background-color', 'rgb(16, 39, 73)'); // #102749
await expect(card.getByRole('heading', {level: 3})).toHaveCSS('color', 'rgb(242, 243, 245)'); // #f2f3f5
```

And in light mode the same card is `rgb(224, 236, 252)` (`#e0ecfc`) with an `rgb(13, 14, 18)` heading. Scroll with `behavior: 'instant'` if needed.

- [ ] **Step 8: Build and check the CSS shipped**

Run: `pnpm build`, then `grep -l "brand-panel" .next/static/chunks/*.css`.
Expected: build passes and a CSS file matches. If not, clear `.next` except `dev/` and rebuild (Turbopack stale CSS gotcha).

- [ ] **Step 9: Check by eye** at 1440px and 390px, light and dark, against the mockup's option B: `/` (all six cards), `/work/myimprov` and `/work/premium-mobile-car-valeting` (panel). Confirm the Fresh light button is the darker `#277d42` and the dark buttons of MyImprov, Merthyr and Sunnybank use the lighter shade (spec, Palette maths). Confirm a project with the brand colour cleared (Task 3, Step 6) looks exactly as before.

- [ ] **Step 10: Run the e2e test**

Run: `pnpm db:up && pnpm test:e2e:prepare && pnpm exec playwright test e2e/public/work-brand.spec.ts e2e/public/a11y.spec.ts`
Expected: PASS (axe finds no contrast issues in either theme).

- [ ] **Step 11: Commit**

```bash
git add src/components/ui-site/project-theme.ts src/components/ui-site/project-theme.test.ts src/app/globals.css src/components/sections/project-card.tsx src/components/case-study/case-study-article.tsx e2e/public/work-brand.spec.ts
git commit -m "feat(work): show project cards in their client's brand tint"
```

---

### Task 5: Visual baselines, quality gate and PR

**Files:**
- Modify: `e2e/public/__screenshots__/visual.spec.ts/work-desktop-linux.png`, `work-mobile-linux.png`, and the `-darwin` pair if they fail Playwright's comparator
- Possibly: other section images that fail only on a crop shift (see CLAUDE.md Visual baselines)

- [ ] **Step 1: Run the full gate locally**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e`
Expected: everything passes except `visual.spec.ts` `work-desktop` and `work-mobile` (intended change). If `e2e/admin/admin.spec.ts:31` fails locally only, check the WSL2 clock drift (CLAUDE.md) before the code.

- [ ] **Step 2: Refresh the local work baselines and inspect them**

Run: `pnpm exec playwright test e2e/public/visual.spec.ts -g work --update-snapshots=all`, then open both images: six tinted cards, in the spec's colours.

- [ ] **Step 3: Push the branch and get CI's images** (ask Christian before pushing)

`git push -u origin feature/work-brand-colours`, then `gh workflow run ci.yml --ref feature/work-brand-colours -f update_snapshots=true`, wait for it, and download `linux-snapshots` and `darwin-snapshots` into two empty scratchpad folders with `gh run download <run id> -n <artifact> -D <dir>`.

- [ ] **Step 4: Pick the images to commit**

Linux: the `work-*` images, plus any other section image whose test fails on the PR's own CI run and passes the 0px/1px offset check (`magick compare -metric AE -fuzz 2%`, under about 0.5%). macOS: only images whose old version (`git show main:<path>`) fails Playwright's comparator against the new one (the CLAUDE.md `node -e` snippet).

- [ ] **Step 5: Commit the baselines**

```bash
git add e2e/public/__screenshots__/visual.spec.ts/work-*.png
git commit -m "test(work): refresh the work baselines for brand tint cards"
```

- [ ] **Step 6: Open the PR** (with Christian's go-ahead)

Title `feat(work): show project cards in their client's brand tint`. Body: summary, the spec link, the migration note (additive columns plus a guarded backfill; runs on the Coolify deploy; revert by rolling back the app and keeping the columns, dropping them only with code that no longer reads them), and the 1440px/390px light/dark check. Confirm CI is green before asking to merge. After merging, restart `next dev` the CLAUDE.md way (the `globals.css` change).
