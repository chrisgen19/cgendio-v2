# The header: why it is a ruler

Decision record. Three directions were built and compared in a design lab over the real home page; Christian chose
**the ruler**, and it now lives in `src/components/site/site-header.tsx` and `mobile-menu.tsx`. The lab and the other
two directions were deleted with the move — `git show 93a5019` has all three if one is ever wanted back.

## What was wrong with the old header

It was not sticky: `absolute` over the hero on the home page, `relative` everywhere else, so it scrolled away and
never came back. More to the point, it had no concept of position. All four links looked the same whether they jumped
within the home page (`/#work`) or left it (`/writing`), there was no active state, and so no `aria-current` either —
a screen reader got no orientation from it. Its blur and translucency did nothing, because the bar never sat over
scrolling content. The phone panel was hard-pinned at `top-[76px]`, matching the header's height by coincidence.

Making it sticky was the smallest of those four problems, which is why all three directions were built around a
position readout rather than around the link list.

## What the header does now

1. Overlays the hero film at scroll 0, then takes a surface once the film ends.
2. Says which section the reader is in, visually and with `aria-current`.
3. Shows reading progress on pages that have no sections to mark.

### The idea

The design borrows the vocabulary the About canvas already gave the site — hairlines, graduations, a mono readout,
the accent as the redline colour. The header is a **measuring rail** rather than a bar of links.

Over the film it carries almost nothing: the wordmark and a hairline with one small, undifferentiated tick per
section — the page's structure drawn as a plain measure. Leaving the film fills the rail in: it takes a surface, the
hairline runs the full width, and the graduations sort themselves into the long ones that are navigation and the
short ones that are only structure.

The move the design exists for: **the lime highlighter becomes the position indicator.** The site's signature under
one word of every section heading stops being decoration and starts doing a job — it rides the rail's baseline and
sits under the graduation the reader is on. Because it also lands on unlabelled graduations, the mono readout beside
the rail names the section: it is the value the instrument is reading.

Blog is the only nav item that leaves the page, so it has no position and gets no tick. It sits past the rail's end
divider with an arrow. That split is what `NavItem.kind` encodes in `nav-links.ts`.

On a phone the rail keeps the header's bottom edge as ticks only, and its readout becomes the button that opens the
sheet — so the control that opens the navigation is also the thing that says where you are. The sheet is the same
ruler turned on its side.

### What it dropped

The **"Open to projects" chip**. A header whose whole argument is precision cannot carry two unrelated readouts. The
`openToProjects` setting is unchanged and still drives the About panel and the contact CTA, which is where a visitor
looks for it.

## How it works

### `useHeaderState(offset)` — `src/components/site/use-header-state.ts`

Returns `{stuck, active, activeIndex, scrollingDown}`.

`stuck` is read from an `IntersectionObserver` on `[data-nav-sentinel]` — the marker `home-page.tsx` puts at the
bottom edge of the hero — and **not** from `@container scroll-state(stuck: top)`. Two reasons:

- A header that overlays the hero is already sitting at its sticky position on the first paint, so the CSS query
  reports it stuck at scroll 0. The question this header actually asks is "has the film ended", which only happens to
  have the same answer on an inner page.
- `container-type: scroll-state` is Chrome and Edge only. The stuck surface is what makes the nav legible over
  content, so it cannot be a progressive enhancement.

With no sentinel on the page, the hook plants a 1px one at the top of the document, so `stuck` degrades to "scrolled"
on inner pages.

`active` is a second observer over `SECTION_IDS` with a thin `-38% / -56%` band — whatever crosses the reading line.

Anchors are landed with `scroll-margin-top` on each target, not a `scroll-padding-top` on the root. `Section` sets
`--header-h` plus a gap, `main#main` the same for the skip link, and the case study chapters and blog headings carry
their own (larger, because the write-up index pins under the header on phones). A root padding would be added to all
of those rather than replace them, which pushed chapters far down the page and left `WriteUpIndex`'s reading line
pointing at the wrong chapter.

### `<ScrollProgress />` — `src/components/site/scroll-progress.tsx`

A bar that scales on its x axis: a scroll-driven CSS animation off the root scroller where the browser has one
(Chrome, Edge, Safari 26), a passive scroll listener writing `--nav-progress` where it does not (Firefox). Only
`transform` animates, so it stays on the compositor. It carries `aria-hidden` — it repeats what the scrollbar already
says, and an unnamed node in the reading order helps nobody.

The `.scroll-progress` rule is in `globals.css` (site components get no CSS files of their own) and uses animation
longhands rather than the `animation` shorthand: the production CSS build rewrites a shorthand with no name to
`animation: none`, which would lose the timing function and the fill mode.

### Positioning

The header is `sticky top-0 z-40`. Overlaying the hero without taking space in the flow is a negative bottom margin
equal to its own height:

```tsx
style={{'--header-h': `${HEADER_HEIGHT}px`, marginBottom: overlay ? 'calc(var(--header-h) * -1)' : undefined}}
```

`position: sticky` still works, because the element's flow position is `y = 0` and it never leaves it.

### Everything that offsets by `--header-h`

The header is sticky, so anything that pins near the top of the viewport, or that lands there from an anchor, has to
reserve its height. Three bugs on this branch were all the same shape: a base rule was given `--header-h`, and a
**narrower media query re-declared the same value without it**. If the header's height ever changes, or it stops
being sticky, this is the list to walk — and for each line, check whether a narrower query overrides it.

| What | Where | Offset |
| --- | --- | --- |
| The header itself | `site-header.tsx` | `sticky top-0`, `h-(--header-h)`, negative margin when it overlays the hero |
| Home sections | `ui-site/section.tsx` | `scroll-mt` |
| Skip-link target | `page-shell.tsx`, `home-page.tsx` | `scroll-mt` on `main#main` |
| Work card stack | `globals.css` `.work-card` | `--t0`, **and again under 860px** |
| Milestone panel | `globals.css` `.ms-track` | `--ms-pin-min`, feeding both `--ms-panel-h` (**again under 860px**) and `--ms-pin-top` |
| Walkthrough stage | `globals.css` `.walkthrough-stage` | `top`, and again at 1080px |
| Walkthrough path links | `walkthrough.tsx` | `scroll-mt`, which has to clear the **stage**, not just the header |
| Case study chapters | `write-up-markdown.tsx` | `scroll-mt`, clearing the chip row too under 1080px |
| Case study index | `write-up-index.tsx`, `write-up.tsx` | `top` |
| Blog aside | `post-article.tsx` | `top` |

Two that deliberately do not: `.tl-counter` pins at `45svh` and the contact CTA column at `lg:top-28`, both far
enough down that the header never reaches them. The milestone panel only pins at `min-height: 600px`, which is why
its overflow sat exactly at that threshold.

Anything measuring a reading line in JS is safe by construction: `useHeaderState`, the timeline counter and the
walkthrough stage all use viewport percentages, and `WriteUpIndex` and `milestone-stage` read the computed
`scroll-margin-top` and `top` rather than hard-coding them.

### `--color-header` and `--color-header-edge`

The header is the one element that floats over every other surface on the page, so its surface and its edge are their
own tokens rather than `white` and `line`. On the light page a `line` hairline separates it from anything underneath.
In dark mode it crosses the What I build stage — a deep indigo — where the header resolved to about `rgb(21,22,32)`
against the stage's `rgb(19,17,54)` and the `line` hairline all but disappeared. The dark values are therefore a more
opaque surface and an edge pitched lighter than the page's own borders.

## Against the design canvas

`docs/design/design-reference.dc.html` and `docs/design/dark-version/Main.dc.html` still show the old pill nav. **The
header is the one place where the canvas is out of date** — treat this document as the spec for it. Everything else
on the canvas still stands.
