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

`useScrollPaddingTop` lives in the same file and reserves the header's height on the scroll container, so clicking
"Work" lands the section below the header instead of behind it. It is set from script, not from `globals.css`, so it
stays tied to `HEADER_HEIGHT` — a header that changes height and a `scroll-padding-top` that does not is a bug nobody
notices until they click a nav link.

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
