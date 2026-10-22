# Cgdiomampo.dev — Hero Film (Remotion)

A ~30-second, ad-style motion film that fills the entire above-the-fold hero of
the Cgdiomampo.dev home page. It tells the studio's process as a story —
**Research → Design → Figma to Web → QA → Deploy to Vercel → Live** — with a
different 3D transition between every scene, then lands on the brand card
(what we do + what clients get) and **stops there**: no loop, just
**See my works** and **Replay the film**.

There are **two cuts** of the film, picked automatically from the hero's size:

| Cut | Used when | Length | Scenes |
|-----|-----------|--------|--------|
| Desktop | wider than 860px and not taller than wide | ~30s (905 frames) | landscape illustrations on a 1000×800 canvas, copy beside them |
| Mobile | under 860px wide, or any tall/portrait window | ~26s (782 frames) | phone-native illustrations on a 350×400 stage at true text size, copy above them |

Built with Remotion 4 (`remotion`, `@remotion/player`, `@remotion/transitions`,
`@remotion/google-fonts`). Type-checked under `strict` against Remotion 4.0.537
and render-tested at 1440×820, 390×844 and 360×640.

---

## 1. Install (Next.js 15/16 App Router, pnpm)

```bash
pnpm add remotion @remotion/player @remotion/transitions @remotion/google-fonts
# optional — Studio preview and MP4/poster export
pnpm add -D @remotion/cli
```

> All `remotion` / `@remotion/*` packages must be on the **exact same version**.
> Remove the `^` in `package.json` so they never drift apart.

Copy `src/components/hero-film/` into your project (same path keeps the
`@/components/hero-film/...` import working), and optionally `src/remotion/`.

## 2. Use it

```tsx
// app/page.tsx (server component)
import {HeroPlayer} from '@/components/hero-film/HeroPlayer';

export default function HomePage() {
  return (
    <main id="top">
      <HeroPlayer worksHref="#work" header={<SiteHeader />} />
      {/* …#work, #milestones, #timeline, #blog, #contact */}
    </main>
  );
}
```

A complete example with the header lives in `src/app/page.example.tsx`.
`HeroPlayer` uses Tailwind utility classes for its HUD and needs your usual
`sr-only` utility (Tailwind ships it).

## 3. File map

```
src/components/hero-film/
├─ HeroPlayer.tsx       'use client' — picks the cut, renders the Player + desktop or mobile HUD
├─ HeroFilm.tsx         desktop cut
├─ HeroFilmMobile.tsx   mobile cut
├─ FilmSeries.tsx       shared TransitionSeries renderer for either timeline
├─ timeline.ts          DESKTOP_TIMELINE + MOBILE_TIMELINE (durations, transitions, chapters)
├─ presentations.tsx    8 custom transitions: iris, flip, warp, slice, tilt, zoom, cube, cubeUp
├─ layout.tsx           responsive layout tokens, SceneShell, ProcessScene (desktop)
├─ primitives.tsx       Appear / Pop / SlideIn / Reveal / GrowX / GrowY / Mark …
├─ theme.ts             colours + fonts (Bricolage Grotesque, Geist, Geist Mono)
└─ scenes/              Intro, Research, Design, FigmaToWeb, QA, Deploy, Live, Brand
   └─ mobile/           MobileScene (350×400 stage) + the six phone-native process scenes
src/remotion/           Studio / CLI entry (Root.tsx, index.ts)
```

## 4. The storyboard

| # | Scene | Enters with | What happens |
|---|-------|-------------|--------------|
| 0 | Intro | — | "Great websites don't happen **by accident.**" — kinetic type, floating shapes |
| 1 | Research | **Iris** bloom | Search query types out, persona cards pop, audience bars grow, competitor audit ticks |
| 2 | Design | **Card flip** (3D, mid-air dip) | Wireframe draws in, crossfades to full colour; styles panel; a live "Christian" cursor |
| 3 | Figma → Web | **Warp** from deep Z | Figma frame with selection box → tokens stream across → JSX types into the editor |
| 4 | QA | **Diagonal blade** wipe | Desktop/tablet/phone scan lines, checklist ticks, four quality rings draw closed |
| 5 | Deploy | **Hinged drop** (rotateX + overshoot) | `git push` → Vercel build log → progress bar; edge nodes pulse on a globe |
| 6 | Live | **Crash zoom** | Browser at cgdiomampo.dev with a live pulse, toasts slide in, confetti |
| 7 | Brand | **Cube turn** | Studio line, 3 services, 4 benefits, **See my works** + **Replay** — holds |

The mobile cut tells the same story with phone-first staging: a cascading
persona deck, a phone artboard turning from wireframe to colour, tokens
dropping from the Figma frame into a code editor, a phone under test with a
5-point checklist, a full-width terminal, and iOS-style notifications dropping
over a phone browser. Brand enters with a vertical cube turn (`cubeUp`) that
reads like a swipe up. Intro and Brand are shared and adapt their own layout;
on short phones (under 720px tall) the brand card drops its paragraph and
benefits so the services and buttons always fit.

Every process scene also gets the signature **lime highlighter sweep** at its
start, the lime **marker swipe** under its key word, a giant outlined step
number drifting in the background, and a slow camera push/orbit on the
illustration.

## 5. How the player behaves

- **Fills the hero edge to edge.** The composition is sized to the section in
  CSS pixels (ResizeObserver), so it never letterboxes. On phones the hero is
  `100svh` tall (the small viewport, so the browser toolbar never covers the HUD).
- **Right cut for the screen.** `isPortrait()` in `timeline.ts` chooses the
  mobile cut under 860px wide or in any tall window; rotating a tablet swaps
  cuts and restarts the film.
- **Plays once.** `loop={false}` and `moveToBeginningWhenEnded={false}` keep it
  on the brand card at the end.
- **Desktop HUD.** Chapter chips (jump to any step), timecode, *Skip intro*,
  and pause/play — which becomes *Replay* when the film ends. 3px progress bar.
- **Mobile HUD.** Story-style segments, one per chapter, filling as each scene
  plays (tap one to jump); the current chapter name; *Skip*; and the same
  pause/play/replay button. All tap targets are at least 32px tall, the
  buttons 44px.
- **Pauses off-screen** (IntersectionObserver) and resumes when scrolled back —
  unless the visitor paused it themselves.
- **Reduced motion.** With `prefers-reduced-motion: reduce` the hero opens
  directly on the final brand card, paused.
- **Real buttons.** *See my works* is an `<a href>` and *Replay* a `<button>`,
  rendered inside the film, so they're keyboard- and screen-reader-reachable.

## 6. Customising

- **Timing:** edit `DESKTOP_TIMELINE` or `MOBILE_TIMELINE` in `timeline.ts`
  (frames at 30 fps). Chapters, skip target and both HUDs follow automatically.
- **Transition per scene:** change `enter` on a scene (`'iris' | 'flip' | 'warp' | 'slice' | 'tilt' | 'zoom' | 'cube' | 'cubeUp'`).
- **Breakpoint:** `isPortrait()` in `timeline.ts` (keep `useLayout()` using it).
- **Colours:** `theme.ts`. The HUD in `HeroPlayer.tsx` uses the same hexes.
- **Copy:** each scene file holds its own text.

## 7. Studio preview & exports

```bash
npx remotion studio src/remotion/index.ts           # scrub every frame
npx remotion render src/remotion/index.ts HeroFilm out/hero.mp4
npx remotion render src/remotion/index.ts HeroFilmMobile out/hero-mobile.mp4
npx remotion still  src/remotion/index.ts HeroFilm public/hero-poster.png --frame=900
```

Compositions: `HeroFilm` 1440×820, `HeroFilmMobile` 390×844, and
`HeroFilmMobileSmall` 360×640 (checks the compact short-phone layout). The
mobile MP4 is also a ready-made vertical clip for LinkedIn or Instagram
stories. A poster still makes a good Open Graph image.

## 8. Licence note

Remotion is free for individuals and companies of up to 3 people; larger
companies need a company licence. Cgdiomampo.dev as a personal studio site
fits the free tier. `acknowledgeRemotionLicense` on the Player just silences the
console notice — check https://remotion.dev/license if the studio grows.
