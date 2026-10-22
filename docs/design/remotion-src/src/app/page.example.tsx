// app/page.tsx — how the hero slots into the Cgdiomampo.dev home page.
// HeroPlayer is a client component; the page itself stays a server component.

import Link from 'next/link';
import {HeroPlayer} from '@/components/hero-film/HeroPlayer';

function SiteHeader() {
  return (
    <nav aria-label="Main" className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-4 md:px-14 md:py-[22px]">
      <Link href="#top" className="inline-flex items-center gap-2.5 font-semibold text-[#0D0E12]">
        <b className="grid size-9 place-items-center rounded-[11px] bg-[#0D0E12] font-[family-name:var(--font-display)] text-base font-extrabold tracking-tight text-[#D7FF3D]">
          cg
        </b>
        cgdiomampo.dev
      </Link>

      <div className="hidden gap-0.5 rounded-full border border-[#E3E5EA] bg-white/80 p-1 backdrop-blur md:flex">
        {[
          ['Work', '#work'],
          ['Milestones', '#milestones'],
          ['Timeline', '#timeline'],
          ['Blog', '#blog'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium text-[#0D0E12] hover:bg-[#F5F6F8]">
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="#contact"
        className="inline-flex min-h-11 items-center rounded-full bg-[#0D0E12] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3B2BFF]"
      >
        Let&apos;s talk
      </Link>
    </nav>
  );
}

export default function HomePage() {
  return (
    <main id="top">
      <h1 className="sr-only">Cgdiomampo.dev — web design and development studio by Christian</h1>

      <HeroPlayer worksHref="#work" header={<SiteHeader />} />

      {/* Below the fold: stack strip, about, #work, #milestones, #timeline, #blog, #contact
          — see the Design canvas for layout and content. */}
    </main>
  );
}
