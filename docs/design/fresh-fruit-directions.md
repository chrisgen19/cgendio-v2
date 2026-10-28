# Fresh Fruit and Veg — six case-study directions

The audience is prospective clients, recruiters, and agencies. This is a developer portfolio case study. The primary action is to visit the actual project; the closing action is to contact the developer. Use only the published project facts: no invented dates, metrics, testimonials, or research claims. All six previews are isolated from the existing published case-study route.

## Research and recommendation

- [NN/g — 5 Steps to Creating a UX-Design Portfolio](https://www.nngroup.com/articles/ux-design-portfolios/): prioritize a scannable story, project context, your role, decisions, and evidence. Applies here to the developer's contribution and the live website; do not invent UX process that is not documented.
- [web.dev — high-performance CSS animations](https://web.dev/articles/animations-guide): favor transform and opacity; avoid layout work on every scroll frame.
- [web.dev — prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion): make all content usable in a static final state, retain native scrolling, and avoid forced parallax.
- ui-ux-pro-max search `portfolio editorial minimal` returned Minimalism & Swiss Style and a hero/features/CTA structure. The initial broad search returned a generic purple bento system with testimonial suggestions; this was rejected because it does not fit the food brand, the available evidence, or the frontend-skill's cardless direction. Retain the verified structural and accessibility recommendations, and use the project's green as the accent.

Recommended direction: **The editorial**. A warm paper surface, forest green, the actual website as the primary evidence, and a concise story give the project personality while keeping the developer's work clear.

## 01 — The editorial

- Visual thesis: warm paper, forest-green typography, and large project imagery create a confident independent-studio case study.
- Content plan: project title and website hero; role and stack; subscription and delivery story; actual website; contact and next project.
- Interaction thesis: staggered title entrance, image depth while scrolling, gentle section and link reveals.

## 02 — After hours

- Visual thesis: near-black space and immersive produce imagery turn a practical commerce project into a cinematic chaptered story.
- Content plan: full-bleed image and project name; concise brief; website evidence; billing and delivery chapters; contact.
- Interaction thesis: slow image entrance, restrained image depth, chapter fades.

## 03 — The index

- Visual thesis: a rigorous white grid, botanical green, and typographic precision present the work with clarity and confidence.
- Content plan: oversized project title and screenshot; structured facts; indexed implementation sections; live site and next project.
- Interaction thesis: typographic entrance, sticky in-page index, crisp link underline transitions.

## 04 — Field notes

- Visual thesis: warm paper, earthy green, and editorial serif type make the case study tactile and personal.
- Content plan: project title and market photograph; human brief; website proof; recurring delivery details; contact.
- Interaction thesis: softly revealed photography, layered native scroll, quiet hover details.

## 05 — Under the hood

- Visual thesis: deep forest surfaces, fine construction lines, and technical typography reveal the system behind the shop.
- Content plan: project title and website; system overview; subscription/billing/delivery flow; stack; contact.
- Interaction thesis: sequenced system entrance, a keyboard-accessible workflow explorer, restrained line and link feedback.

## 06 — Fresh perspective

- Visual thesis: acid green, black, giant typography, and assertive crops make a memorable graphic case study.
- Content plan: oversized project title; actual website showcase; bold numbered capabilities; contact and next project.
- Interaction thesis: kinetic headline entrance, scroll-linked typography, tactile hover/press states.

## Shared implementation contract

- Variant components live in `src/components/design-lab/fresh-fruit/<slug>.tsx` with their own `<slug>.module.css`.
- Exports: `Editorial`, `Cinematic`, `Swiss`, `Organic`, `Blueprint`, `Kinetic`; no required props.
- Import `freshFruit` from `./content` and optionally `Reveal` from `./reveal`.
- Available assets: `freshFruit.coverImage` is the original website screenshot; `marketImage` is a market produce photograph; `produceImage` is a second produce photograph. Photographs provide atmosphere; screenshot provides project evidence.
- Use existing Bricolage/Geist font variables or system Georgia. Limit each direction to two typefaces. Do not add dependencies or alter global CSS.
- Each direction owns its full visual surface and compact portfolio navigation. Use a `<main id="main">`, one h1, semantic sections, working `/#work`, `/contact`, `freshFruit.liveUrl`, and `/work/access-hire` links. The parent preview toolbar is 48px tall; account for it in hero sizing.
- Use `next/image` with explicit dimensions or fill, meaningful alt text and sizes. Local assets require no new remote image configuration.
- No unpausable infinite animations; no scroll hijacking; no fabricated results. Honor `prefers-reduced-motion`, keyboard focus, 44px interaction targets, and 375px layouts.

## Running the previews

Run `pnpm dev:design-lab`. It reuses a Next.js development server on port 3000 when available, or starts one, and exposes six lightweight preview ports with hot reload. One shared development runtime avoids six copies of the compiler and database pool. Stop the process with Ctrl+C.

- Comparison gallery: http://localhost:3000/design-lab/fresh-fruit
- Editorial: http://localhost:3001/design-lab/fresh-fruit/editorial
- Cinematic: http://localhost:3002/design-lab/fresh-fruit/cinematic
- Swiss: http://localhost:3003/design-lab/fresh-fruit/swiss
- Organic: http://localhost:3004/design-lab/fresh-fruit/organic
- Blueprint: http://localhost:3005/design-lab/fresh-fruit/blueprint
- Kinetic: http://localhost:3006/design-lab/fresh-fruit/kinetic

Each preview provides a direction picker, previous/next controls, a link to the gallery, and a replay button for its entrance motion. Portfolio links work normally on every port. The lab routes have noindex/nofollow metadata and are absent from the public sitemap.

## Integration notes

The existing Turbopack rule transformed every CSS file into plain `.css`, which discarded CSS module class exports. The rule now excludes `.module.css` so Next.js applies its native module processing, while the existing global Tailwind stylesheet retains its loader. No existing case-study component or published content was modified.

## Verification

- All six preview routes returned HTTP 200 and loaded their visual assets without unhandled browser errors.
- Browser checks at 375×812, 768×1024, 812×375, and 1440×960 found no horizontal document overflow.
- Reduced-motion checks found no running animations or hidden headings on the six directions.
- Blueprint's desktop vertical tabs respond to Up/Down and Home/End; mobile horizontal tabs respond to Left/Right while retaining native Up/Down scrolling.
- Direction picker, previous/next, gallery navigation, and the link back to the original case study were exercised.
- Automated axe WCAG A/AA/2.1 AA checks found no violations in the six previews or the gallery after fixes. This is an automated scan, not a complete manual accessibility audit.
- The comparison gallery returned HTTP 200, loaded all six static-imported preview images, and passed mobile overflow and browser-error checks.
- `pnpm typecheck`, `pnpm lint`, all 104 unit tests, the production build, and `git diff --check` passed.
