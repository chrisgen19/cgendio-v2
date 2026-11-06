import type {ReactNode} from 'react';
import {ReplayBoundary} from './replay-boundary';

/**
 * A direction's hero, at the production hero's size (src/components/sections/hero.tsx), followed by a stand-in for
 * the next section so the hand-off below the fold is visible. `stageClassName` sets the hero's background.
 */
export function DirectionStage({children, stageClassName = 'bg-film'}: {children: ReactNode; stageClassName?: string}) {
  return (
    <ReplayBoundary>
      <main id="main">
        <h1 className="sr-only">Christian Diomampo, web developer</h1>
        <div
          id="top"
          className={`@container relative h-[min(100svh,980px)] min-h-[640px] max-md:h-svh max-md:min-h-[600px] portrait:h-svh portrait:min-h-[600px] ${stageClassName}`}
        >
          {children}
        </div>
        <section id="work" aria-label="Next section (placeholder)" className="border-t border-line bg-ground px-5 py-18 md:px-14 md:py-28">
          <div className="mx-auto max-w-site">
            <p className="font-mono text-[13px] font-medium tracking-[0.08em] text-muted uppercase">Next section</p>
            <p className="mt-4 max-w-[28ch] font-display text-[clamp(32px,4vw,56px)] leading-[0.98] font-bold tracking-[-0.04em] text-ink">
              The rest of the home page starts here.
            </p>
            <div aria-hidden className="mt-10 grid gap-5 md:grid-cols-3">
              <div className="h-40 rounded-card border border-line bg-white" />
              <div className="h-40 rounded-card border border-line bg-white" />
              <div className="h-40 rounded-card border border-line bg-white" />
            </div>
          </div>
        </section>
      </main>
    </ReplayBoundary>
  );
}
