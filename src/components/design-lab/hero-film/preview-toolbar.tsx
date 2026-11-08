'use client';

import {ArrowLeft, ArrowRight, ChevronsLeft, Grid2X2, Moon, Rabbit, RotateCcw, Smartphone, Sun, X} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {directions, LAB_BASE_PATH} from './content';
import {REPLAY_EVENT} from './replay-boundary';

type LabTheme = 'light' | 'dark';

const btn =
  'inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink hover:bg-ground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:bg-ink aria-pressed:text-white';

/**
 * Floating lab controls: switch direction, replay, light/dark, a 390px phone frame and simulated reduced motion.
 * Theme changes only touch this tab's <html data-theme> (no cookie), so the real site's choice is left alone.
 */
export function PreviewToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [phone, setPhone] = useState(false);
  const [theme, setTheme] = useState<LabTheme>('light');
  const [embed, setEmbed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('theme');
    const initial: LabTheme =
      fromUrl === 'dark' || fromUrl === 'light' ? fromUrl : document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
    setEmbed(params.get('embed') === '1');
    setReduced(params.get('rm') === '1');
  }, []);

  const index = directions.findIndex((direction) => pathname === `${LAB_BASE_PATH}/${direction.slug}`);
  if (index === -1 || embed) return null;
  const current = directions[index];
  const previous = directions[(index + directions.length - 1) % directions.length];
  const next = directions[(index + 1) % directions.length];

  const switchTheme = () => {
    const value: LabTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = value;
    setTheme(value);
  };

  const toggleReduced = () => {
    const url = new URL(window.location.href);
    if (reduced) url.searchParams.delete('rm');
    else url.searchParams.set('rm', '1');
    window.location.assign(url);
  };

  const phoneSrc = `${pathname}?embed=1&theme=${theme}${reduced ? '&rm=1' : ''}`;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 inline-grid size-11 place-items-center rounded-full border border-line bg-white text-ink shadow-(--shadow-card)"
        aria-label="Show lab controls"
      >
        <Grid2X2 size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <>
      <nav
        aria-label="Hero lab controls"
        className="fixed top-3 left-3 z-50 flex max-w-[calc(100vw-24px)] flex-wrap items-center gap-0.5 rounded-[26px] border border-line bg-white p-1 font-body shadow-(--shadow-card)"
      >
        <Link href={LAB_BASE_PATH} className={btn} aria-label="All directions">
          <Grid2X2 size={15} aria-hidden="true" />
        </Link>
        <label className="sr-only" htmlFor="hero-lab-direction">
          Choose a direction
        </label>
        <select
          id="hero-lab-direction"
          value={current.slug}
          onChange={(event) => router.push(`${LAB_BASE_PATH}/${event.target.value}`)}
          className="h-11 rounded-full bg-transparent px-2 text-[13px] font-medium text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          {directions.map((direction) => (
            <option value={direction.slug} key={direction.slug}>
              {direction.number} {direction.title}
            </option>
          ))}
        </select>
        <Link href={`${LAB_BASE_PATH}/${previous.slug}`} className={btn} aria-label={`Previous: ${previous.title}`}>
          <ArrowLeft size={16} aria-hidden="true" />
        </Link>
        <Link href={`${LAB_BASE_PATH}/${next.slug}`} className={btn} aria-label={`Next: ${next.title}`}>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <button type="button" className={btn} onClick={() => window.dispatchEvent(new Event(REPLAY_EVENT))}>
          <RotateCcw size={15} aria-hidden="true" /> Replay
        </button>
        <button type="button" className={btn} onClick={switchTheme} aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        </button>
        <button type="button" className={btn} aria-pressed={phone} onClick={() => setPhone((value) => !value)}>
          <Smartphone size={15} aria-hidden="true" /> 390
        </button>
        <button type="button" className={btn} aria-pressed={reduced} onClick={toggleReduced} aria-label="Simulate reduced motion">
          <Rabbit size={16} aria-hidden="true" />
        </button>
        <button type="button" className={btn} onClick={() => setOpen(false)} aria-label="Hide lab controls">
          <ChevronsLeft size={16} aria-hidden="true" />
        </button>
      </nav>

      {phone ? (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-auto bg-ink/60 p-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setPhone(false)}
              className="absolute -top-14 right-0 inline-grid size-11 place-items-center rounded-full bg-white text-ink"
              aria-label="Close phone preview"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <iframe
              key={phoneSrc}
              src={phoneSrc}
              title={`${current.title} at 390 by 844 pixels`}
              width={390}
              height={844}
              className="rounded-[36px] border-[10px] border-ink bg-white"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
