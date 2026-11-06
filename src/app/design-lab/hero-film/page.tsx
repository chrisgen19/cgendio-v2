import {ArrowUpRight} from 'lucide-react';
import Link from 'next/link';
import {directions, LAB_BASE_PATH} from '@/components/design-lab/hero-film/content';

export default function HeroFilmLab() {
  return (
    <main id="main" className="mx-auto max-w-site px-5 pt-24 pb-20 md:px-14">
      <h1 className="max-w-[16ch] font-display text-[clamp(40px,5vw,72px)] leading-[0.98] font-bold tracking-[-0.04em]">
        Five ways to open the home page
      </h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-[1.55] text-muted max-md:text-base">
        Each direction tells the story differently and moves differently. Every one runs on its own port, so you can keep them open side by side.
      </p>
      <ol className="mt-12 grid gap-4">
        {directions.map((direction) => (
          <li key={direction.slug}>
            <Link
              href={`${LAB_BASE_PATH}/${direction.slug}`}
              className="group grid gap-2 rounded-card border border-line bg-white p-6 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:grid-cols-[64px_1fr_auto] md:items-center md:gap-6"
            >
              <span className="font-display text-3xl font-bold text-muted tabular-nums">{direction.number}</span>
              <span>
                <span className="block font-display text-2xl font-bold tracking-[-0.02em]">{direction.title}</span>
                <span className="mt-1 block max-w-[70ch] text-muted">{direction.description}</span>
                <span className="mt-3 block text-sm text-muted">
                  {direction.brand}, {direction.format}, port {direction.port}
                </span>
              </span>
              <ArrowUpRight size={22} aria-hidden="true" className="text-muted group-hover:text-ink" />
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
