# Mobile hero CTA and scroll cue

Short design. 2026-11-22.

## Intent and why

GA4 shows mobile engagement at 21.4% against desktop's 59.7%, with mobile sessions
averaging 13.2s and bouncing at 78.6%. The single most common phone viewport,
412x823, recorded **0% engagement across 14 sessions**.

The cause is in `src/lib/use-first-interaction.ts:7`. The hero film is gated on
`['scroll','wheel','pointerdown','pointermove','touchstart','keydown']`. On desktop
`pointermove` fires within a second of landing, so the film plays and the visitor
gets the thirty-second story the lede promises. Phones fire no `pointermove`, so the
film waits for a scroll or tap that the page gives no reason to make.

Meanwhile the one state a phone visitor reliably sees — `hero-static-frame.tsx` —
contains no interactive controls at all. Verified on production at 390px:

```json
{"scrollY":0, "controlsInHero":[], "filmMounted":false}
```

`See my work` exists only inside the film scenes (`hero-film/scenes/Brand.tsx:131`,
`Live.tsx:145`, `MobileLive.tsx:141`), all of which require the film to be mounted.
So the visitor reads a promise of a film, nothing happens, and there is nothing to
tap and no sign the page continues for another 16,000px.

## Goals

- A phone visitor who never triggers the film still has an obvious way into the work.
- A visitor who wants the film can start it deliberately rather than by accident.
- The page signals that it continues below the fold.

## Non-goals

- Changing when the film auto-starts on phones (considered as option B, deferred).
- Changing the hero's height on phones (considered as option C, deferred).
- Changing hero copy (considered as option D, deferred — CLAUDE.md requires sign-off).
- Any desktop-visible change.

## Anti-goals

- Shipping anything that adds main-thread work to the Android devices already at 0%
  engagement. This rules out starting the film automatically on phones as part of
  this change.
- Regressing the LCP element. The static frame is the server-rendered LCP content and
  stays server-rendered.

## Constraints

- `hero-static-frame.tsx` is a server component and must stay one, so the headline
  keeps painting as the LCP element without waiting for hydration.
- The static frame is rendered as `children` of `HeroStage` (a client component), so
  props cannot be passed into it from `HeroStage` directly.
- Buttons use the project's `Button` primitive: `min-h-13` (52px) primary, 44px
  minimum touch targets per CLAUDE.md.
- Tailwind utilities with existing tokens only; no new CSS files.
- Biome style: single quotes, no bracket spacing, width 150, JSX double quotes.
- The static frame fades to `opacity-0` and `aria-hidden` once the film has its
  first frame. Focusable children added to it must not stay in the tab order after
  that.

## Approaches considered

Four were mocked at 390px in the visual companion and compared side by side.

| | Approach | Why not |
| --- | --- | --- |
| **A** | CTA buttons + scroll cue in the static frame | **Chosen.** |
| B | Film auto-starts on phones when the hero is in view and the page is idle | The film's own comment puts playback at ~2s of main-thread work on a mid-range phone. That lands on exactly the Android devices already at 0%, so it risks making things worse. Worth revisiting with performance data. |
| C | A, plus hero drops to ~84svh so the next section peeks above the fold | Strongest scroll signal, but spends a decision CLAUDE.md records as deliberate (`h-svh` on phones) and needs Linux and macOS visual baselines regenerated. Deferred until A proves the diagnosis. |
| D | Different mobile copy leading with what Christian does; film becomes an opt-in link | Needs copy sign-off (CLAUDE.md: canvas copy word for word) and makes the hero say different things on different devices. |

Christian picked A, with C as the likely follow-up.

## The design

Three additions to `src/components/sections/hero-static-frame.tsx`:

1. **`See my work`** — primary `Button`, `href="#work"`. A real `<a>`, no JS, works
   before hydration and with JS off.
2. **`Play the film`** — secondary `Button`. Starts the film deliberately.
3. **Scroll cue** — eyebrow-styled `Scroll` label and a chevron, pinned near the
   bottom of the hero, `aria-hidden` (decorative; the buttons carry the real
   affordance).

### Wiring `Play the film`

`HeroStage` holds the `loadFilm` state but renders the static frame as opaque
`children`, so it cannot pass a callback in. Rather than restructure the component
tree, `HeroStage` provides a small context:

- `hero-stage.tsx` exports `HeroFilmContext` carrying `startFilm: () => void`, and
  wraps `children` in its provider. `useLoadFilm` gains a manual trigger OR'd with
  the existing interaction trigger.
- A new client component `play-film-button.tsx` consumes the context and calls
  `startFilm` on click.
- `hero-static-frame.tsx` stays a server component and renders `<PlayFilmButton />`
  as a child. A client provider wrapping server-rendered children works; the button
  is itself a client component nested inside, so it can consume the context.

This keeps the headline and lede server-rendered, and adds one small client
component rather than converting the frame.

### Focus handling

The overlay currently sets `aria-hidden` and `pointer-events-none` when the film is
ready. With no focusable children that was sufficient; with buttons it is not —
Tab would still reach them. The overlay gains `inert` when `ready` (React 19.3
supports it as a boolean prop), which removes the subtree from focus and the
accessibility tree together.

### Layout

The CTA row sits under the lede, following the frame's existing container-query
breakpoints (`@max-[860px]` and `portrait:`) for gap and spacing, so it tracks the
hero's width the same way the rest of the frame does. Buttons wrap and centre at
narrow widths.

## Left to the builder

- Exact gap values above the CTA row and the cue's distance from the bottom, within
  the frame's existing spacing scale.
- Chevron markup (inline SVG, `currentColor`).
- Whether the cue hides under `prefers-reduced-motion` (it is static, so it should
  stay; any motion on it must not).

## Verification

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and a visual check at
1440px and 390px. e2e visual baselines will need regenerating for the hero
(CI's `linux-snapshots` and `darwin-snapshots`).
