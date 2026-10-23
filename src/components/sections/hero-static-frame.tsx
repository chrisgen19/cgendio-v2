/**
 * The film's intro card in its settled state, as server-rendered HTML. It gives the hero real content and an LCP
 * element before the Remotion Player loads. Sizes mirror scenes/Intro.tsx and useLayout() in the hero film, using
 * container units so they follow the hero's width the same way the film does. It follows the theme, like the film.
 */
export function HeroStaticFrame() {
  return (
    <div className="dot-grid absolute inset-0 flex flex-col items-center justify-center gap-[26px] border-b border-line px-14 text-center @max-[1200px]:px-10 @max-[860px]:gap-[18px] @max-[860px]:px-5 portrait:gap-[18px] portrait:px-5">
      <span className="font-mono text-[13px] tracking-[0.14em] text-muted uppercase @max-[860px]:text-xs portrait:text-xs">
        Cgdiomampo.dev presents
      </span>
      <div className="max-w-[1100px] font-display text-[min(128px,8.5cqw)] leading-[0.95] font-bold tracking-[-0.04em] text-ink @max-[860px]:text-[min(52px,12cqw)] portrait:text-[min(52px,12cqw)]">
        <div>Great websites</div>
        <div>
          don&apos;t happen{' '}
          <span className="relative z-0 inline-block text-highlight-ink">
            by accident.
            <span aria-hidden="true" className="absolute -right-[0.06em] bottom-[0.07em] -left-[0.06em] -z-10 h-[0.36em] bg-highlight" />
          </span>
        </div>
      </div>
      <p className="m-0 max-w-[520px] font-body text-lg leading-[1.55] text-muted @max-[860px]:text-base portrait:text-base">
        Here&apos;s how we take an idea from first question to a live URL — in about thirty seconds.
      </p>
    </div>
  );
}
