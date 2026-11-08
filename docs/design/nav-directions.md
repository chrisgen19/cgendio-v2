# Nav lab — three sticky header directions

Comparison tool for choosing the site header, in the same shape as `fresh-fruit-directions.md`. Dev only: everything
under `/design-lab` answers 404 in a production build (`src/app/design-lab/layout.tsx`).

```sh
pnpm dev:nav-lab
```

| | URL |
| --- | --- |
| Compare all | <http://localhost:3000/design-lab/nav> |
| The ruler | <http://localhost:3001/design-lab/nav/ruler> |
| The dock | <http://localhost:3002/design-lab/nav/dock> |
| The transport | <http://localhost:3003/design-lab/nav/transport> |

The three ports proxy one `next dev` runtime, hot reload included, so three browser windows can sit side by side
without three compiles. Add `?view=article` to any direction for the reading view, or use the toolbar at the bottom
left. The toolbar is the instrument, not part of what is being judged.

## What every direction has to do

Agreed with Christian before the directions were drawn:

1. Overlay the hero film at scroll 0, then take a surface once the film ends.
2. Say which section the reader is in (and keep saying it on inner pages, where the answer is the page).
3. Show reading progress.
4. Stay inside the existing tokens — colours, radii, shadows and the three fonts. New structure, not a new palette.

## The shared mechanics

`src/components/design-lab/nav/shared/` holds everything the three directions have in common, so they answer to the
same signals and only their looks differ.

### `useHeaderState(offset)`

Returns `{stuck, active, activeIndex, scrollingDown}`.

`stuck` comes from an `IntersectionObserver` on `[data-nav-sentinel]` — a marker `PreviewHome` puts at the bottom edge
of the hero — and **not** from `@container scroll-state(stuck: top)`. Two reasons:

- A header that overlays the hero is already sitting at its sticky position on the first paint, so the CSS query
  reports it stuck at scroll 0. The question these headers are actually asking is "has the film ended", which is a
  different question that happens to have the same answer on an inner page.
- `container-type: scroll-state` is Chrome and Edge only. The stuck surface is what makes the nav legible over
  content, so it cannot be a progressive enhancement here.

With no sentinel on the page the hook plants a 1px one at the top of the document, so `stuck` degrades to "scrolled"
on inner pages. `offset` is the header's own height: the change happens when the hero's bottom edge reaches the
header's bottom edge, not at an arbitrary pixel.

`active` is a second observer over `SECTION_IDS` with a thin `-38% / -56%` band — whatever crosses the reading line.
Each direction must mirror it with `aria-current`, because a visual-only indicator says nothing to a screen reader.

### `<ScrollProgress />`

A bar that scales on its x axis: a scroll-driven CSS animation off the root scroller where the browser has one
(Chrome, Edge, Safari 26), a passive scroll listener writing `--nav-progress` where it does not (Firefox). Only
`transform` animates, so it stays on the compositor. It carries `aria-hidden` — it repeats what the scrollbar already
says, and an unnamed node in the reading order helps nobody.

The keyframes use animation longhands rather than the `animation` shorthand: the production CSS build rewrites a
shorthand with no name to `animation: none` (see the gotcha in `CLAUDE.md`), which would lose the timing function and
the fill mode.

### `NAV_ITEMS`

Split by `kind`: `section` items jump within the home page and can report a position, `route` items leave and cannot.
The current header treats both the same, which is why it has nothing to say about where you are. Each direction
expresses the split differently, but each one expresses it.

## Positioning contract

Every direction's root is a `<header>` that is `sticky top-0 z-40`. Overlaying the hero without taking space in the
flow is a negative bottom margin equal to the header's own height:

```tsx
style={{'--header-h': '72px', marginBottom: overlay ? 'calc(var(--header-h) * -1)' : undefined}}
```

`position: sticky` still works, because the element's flow position is `y = 0` and it never leaves it.

The other half of the contract is `scroll-padding-top`. A sticky header covers the top of whatever an in-page link
jumps to, so every direction has to reserve its own height on the scroll container — otherwise clicking "Work" lands
the reader under the bar. Each direction sets it for its own height; it is not in the shared layer because the
heights differ, and because one direction docks to the bottom on phones and needs `scroll-padding-bottom` instead.

## The directions

Each borrows from a world the site already has, so the header belongs to this site rather than to sticky headers in
general.

### 01 — The ruler

The design-tool vocabulary of the About canvas (`about-guides`, `about-inspect`, `about-pin`). The header is a
measuring rail carrying a tick per section. The lime highlighter — the site's strongest existing signature, swept
under one word in every section heading — is promoted from decoration to the position indicator and slides along the
rail. Reading progress is the rail itself.

### 02 — The dock

The extruded plates of the Stack section. Wide, airy and transparent over the film; then one orchestrated move into a
detached ink plate, inset from the edges and lifted on `--shadow-deep`. The most confident and the most conventional
of the three, so the transition is the thing that has to be excellent.

### 03 — The transport

The hero film's own transport bar. A mono counter reads the section the way a timecode reads a frame, so the loudest
element is a position rather than a link list. It hides on the way down and returns on the way up, giving long reads
their height back, with the progress rule pinned at the top of the viewport even while the bar is away. Docks to the
bottom edge on a phone, in reach of a thumb.

## Decision

Not made yet. Once one is chosen it moves into `src/components/site/site-header.tsx` and `mobile-menu.tsx`, the
shared hooks move to `src/lib/` or `src/components/site/`, and this lab can be deleted along with the other two
directions. The design canvas (`docs/design/design-reference.dc.html`) still shows the old pill nav and will be out
of date for the header; note that where the canvas is cited as the source of truth.
