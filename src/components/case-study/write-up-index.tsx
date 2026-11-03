'use client';

import {useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/cn';

export type WriteUpIndexItem = {id: string; label: string; group: 'write-up' | 'reasoning'};

/**
 * The write-up's chapter index: a sticky column of jump links on wide screens, a sticky chip row on phones. The link for
 * the chapter crossing the reading line carries aria-current; the accent fill beside it is CSS (a scroll timeline).
 */
export function WriteUpIndex({items}: {items: WriteUpIndexItem[]}) {
  const [active, setActive] = useState(items[0]?.id ?? null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const targets = items.map(({id}) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    // A thin band at about 30% of the viewport is the reading line: the chapter spanning it is the current one
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      {rootMargin: '-30% 0px -66% 0px'},
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [items]);

  // On phones the chip row scrolls sideways: keep the current chip in view without moving the page
  useEffect(() => {
    const list = listRef.current;
    const link = active ? list?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({left: link.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth'});
  }, [active]);

  return (
    <nav
      aria-label="Write-up sections"
      className="max-lg:sticky max-lg:top-0 max-lg:z-10 max-lg:border-b max-lg:border-line max-lg:bg-white/92 max-lg:backdrop-blur-[10px] max-md:-mx-5 md:max-lg:-mx-14"
    >
      <div className="relative">
        <ol
          ref={listRef}
          className="relative m-0 flex list-none gap-2 overflow-x-auto p-0 [scrollbar-width:none] max-md:px-5 max-lg:py-2.5 md:max-lg:px-14 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l-2 lg:border-line"
        >
          {items.map(({id, label, group}, index) => (
            <li key={id} className={cn('shrink-0', group === 'reasoning' && items[index - 1]?.group === 'write-up' && 'lg:mt-6')}>
              <a
                href={`#${id}`}
                aria-current={active === id ? 'true' : undefined}
                className={cn(
                  'relative flex min-h-11 items-center text-[15px] font-medium whitespace-nowrap text-muted no-underline hover:text-ink',
                  'max-lg:rounded-pill max-lg:border max-lg:border-line max-lg:bg-white max-lg:px-4 max-lg:text-sm',
                  'max-lg:aria-[current=true]:border-ink max-lg:aria-[current=true]:bg-ink max-lg:aria-[current=true]:text-white',
                  'lg:-ml-0.5 lg:pl-6 lg:aria-[current=true]:font-semibold lg:aria-[current=true]:text-ink',
                  'lg:before:absolute lg:before:inset-y-2 lg:before:left-0 lg:before:z-1 lg:before:w-0.5 lg:before:origin-center lg:before:scale-y-0 lg:before:bg-ink',
                  'lg:before:transition-transform lg:before:duration-300 lg:aria-[current=true]:before:scale-y-100 motion-reduce:before:transition-none',
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
        <span aria-hidden="true" className="write-up-rail-fill pointer-events-none absolute top-0 left-0 h-full w-0.5 origin-top bg-accent" />
        <span aria-hidden="true" className="write-up-bar-fill pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-accent" />
      </div>
    </nav>
  );
}
