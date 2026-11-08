import Link from 'next/link';
import {directions} from '@/components/design-lab/nav/content';

export default function NavLabGallery() {
  return (
    <main id="main" className="min-h-svh bg-ground px-14 py-24 max-md:px-5 max-md:py-16">
      <div className="mx-auto flex max-w-site flex-col gap-14">
        <header className="flex flex-col gap-4">
          <p className="font-mono text-xs leading-none font-medium text-muted">Nav lab</p>
          <h1 className="max-w-[18ch] font-display text-[clamp(40px,5vw,72px)] leading-[0.98] font-bold tracking-[-0.04em] text-ink">
            Three headers, one page to carry them
          </h1>
          <p className="max-w-[62ch] text-lg leading-[1.55] text-muted">
            Each one overlays the hero film, takes a surface when the film ends, says which section you are in, and shows how far through the page you
            are. Open them on their own ports and put the windows side by side.
          </p>
        </header>

        <ul className="m-0 grid list-none grid-cols-3 gap-5 p-0 max-lg:grid-cols-1">
          {directions.map((direction) => (
            <li key={direction.slug}>
              <article className="flex h-full flex-col gap-5 rounded-card border border-line bg-white p-7 shadow-(--shadow-card)">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-[28px] leading-none font-bold tracking-[-0.03em] text-ink">
                    <Link href={`/design-lab/nav/${direction.slug}`} className="text-ink no-underline hover:text-accent">
                      {direction.title}
                    </Link>
                  </h2>
                  <span className="font-mono text-xs leading-none text-muted">localhost:{direction.port}</span>
                </div>
                <p className="text-[15px] leading-[1.6] text-muted">{direction.description}</p>
                <dl className="m-0 flex flex-col gap-3 border-t border-line pt-5 text-[14px] leading-[1.5]">
                  {[
                    ['When it sticks', direction.stuck],
                    ['Where you are', direction.position],
                    ['On a phone', direction.mobile],
                  ].map(([term, value]) => (
                    <div key={term} className="flex flex-col gap-1">
                      <dt className="font-mono text-[11px] leading-none text-muted">{term}</dt>
                      <dd className="m-0 text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/design-lab/nav/${direction.slug}`}
                    className="inline-flex min-h-11 items-center rounded-pill bg-ink px-[18px] text-sm font-semibold text-white no-underline hover:bg-accent hover:text-white"
                  >
                    Over the film
                  </Link>
                  <Link
                    href={`/design-lab/nav/${direction.slug}?view=article`}
                    className="inline-flex min-h-11 items-center rounded-pill border border-line bg-white px-[18px] text-sm font-semibold text-ink no-underline hover:border-ink hover:text-ink"
                  >
                    Reading view
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
