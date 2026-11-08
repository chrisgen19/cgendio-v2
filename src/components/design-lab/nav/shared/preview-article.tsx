import {Container} from '@/components/ui-site/container';
import type {Direction} from '../content';

const PARAGRAPHS = [
  'A header earns its place on the screen by answering a question the reader already has. On a single-page story the question is "how far in am I, and what am I looking at"; on a long article it is "how much is left". A link list answers neither, which is why all three directions in this lab are built around a position readout rather than around the links.',
  'The stuck state is read from an IntersectionObserver watching a marker at the bottom edge of the hero, not from the CSS scroll-state query. A header that overlays the hero is already sitting at its sticky position on the first paint, so the query would report it stuck before the reader has scrolled at all. The marker also moves the decision to a place that means something: the header changes when the film ends, not at an arbitrary pixel.',
  'Reading progress is a scroll-driven CSS animation where the browser has one, and a passive scroll listener where it does not. Only transform is animated, so the work stays on the compositor and the bar never forces layout. The element carries aria-hidden: it repeats what the scrollbar already says, and an unnamed node in the reading order helps nobody.',
  'The active-section indicator is the one piece that is specific to this site rather than to headers in general. The lime highlighter under a word in every section heading is already the strongest thing the design owns. Promoting it from decoration to a working indicator costs nothing and ties the navigation to the page it navigates.',
  'Hiding the header on the way down and bringing it back on the way up gives long reads their full height back. It is a trade: the navigation is no longer permanently in view, and a reader who wants it has to make a small upward gesture to ask. On a portfolio, where most of the scrolling is reading rather than hunting, that trade is usually worth taking. On a documentation site it usually is not.',
  'Every direction keeps a 44px minimum touch target, a visible focus ring, and a static presentation under prefers-reduced-motion. None of the three animates anything on load; the only motion is the response to a scroll or a tap, which is motion that shows what changed rather than motion that announces itself.',
  'What is left to decide is the character. The ruler is quiet and technical and reads as a tool. The dock is the most confident and the most conventional, and it commits to one strong moment. The transport is the most unusual and asks the most of the reader, and it is the only one that gives screen height back. Scroll each of them to the bottom and then back up before choosing.',
  'Scroll on. The rest of this page exists so the progress indicator has somewhere to go, and so the hide-and-return behaviour has enough runway to be judged fairly rather than from a single flick of the wheel.',
];

/**
 * A long reading page: the second preview each direction gets, where the header has no hero to overlay and the
 * reading progress has a real distance to measure.
 */
export function PreviewArticle({direction}: {direction: Direction}) {
  return (
    <main id="main" tabIndex={-1} className="bg-ground pt-14 pb-28 focus-visible:outline-none max-md:pt-10 max-md:pb-18">
      <Container>
        <article className="mx-auto flex max-w-[68ch] flex-col gap-6">
          <p className="font-mono text-xs leading-none font-medium text-muted">Nav lab · {direction.title}</p>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] leading-[0.98] font-bold tracking-[-0.04em] text-ink">
            Reading view, for the header that has no film to sit on
          </h1>
          <p className="text-lg leading-[1.55] text-muted">{direction.description}</p>
          {PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="text-[17px] leading-[1.7] text-ink">
              {paragraph}
            </p>
          ))}
          <h2 className="mt-8 font-display text-[clamp(28px,3.5vw,40px)] leading-[1.05] font-bold tracking-[-0.03em] text-ink">
            What this direction does when it sticks
          </h2>
          <p className="text-[17px] leading-[1.7] text-ink">{direction.stuck}</p>
          <p className="text-[17px] leading-[1.7] text-ink">{direction.position}</p>
          <p className="text-[17px] leading-[1.7] text-ink">{direction.mobile}</p>
          {PARAGRAPHS.map((paragraph) => (
            <p key={`${paragraph.slice(0, 16)}-again`} className="text-[17px] leading-[1.7] text-ink">
              {paragraph}
            </p>
          ))}
        </article>
      </Container>
    </main>
  );
}
