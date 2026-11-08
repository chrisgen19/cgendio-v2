'use client';

import {Grid2X2, X} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useId, useState} from 'react';
import {directions, findDirection} from './content';
import styles from './preview-toolbar.module.css';

/**
 * Lab controls. Collapsed to a tab on the right edge, because that is the one place none of the three directions
 * wants: one docks to the top, one docks to the bottom on phones, and the hero film's own HUD runs along the
 * bottom too. Deliberately plain — it is the instrument, not part of what is being judged.
 */
export function PreviewToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const slug = pathname.split('/')[3] ?? '';
  const current = findDirection(slug);
  if (!current) return null;
  const view = params.get('view') === 'article' ? 'article' : 'home';

  const go = (nextSlug: string, nextView: string) => router.push(`/design-lab/nav/${nextSlug}${nextView === 'article' ? '?view=article' : ''}`);

  return (
    <div className={styles.dock}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close the nav lab controls' : 'Open the nav lab controls'}
        onClick={() => setOpen((value) => !value)}
        className={styles.tab}
      >
        {open ? <X size={14} aria-hidden="true" /> : current.number}
      </button>
      <nav id={panelId} hidden={!open} className={styles.panel} aria-label="Nav lab controls">
        <Link href="/design-lab/nav" className={styles.gallery}>
          <Grid2X2 size={14} aria-hidden="true" />
          <span>All three</span>
        </Link>
        <span className={styles.count}>
          {current.title} · :{current.port}
        </span>
        <select aria-label="Choose a header direction" value={current.slug} onChange={(event) => go(event.target.value, view)}>
          {directions.map((direction) => (
            <option value={direction.slug} key={direction.slug}>
              {direction.title}
            </option>
          ))}
        </select>
        <select aria-label="Choose a preview page" value={view} onChange={(event) => go(current.slug, event.target.value)}>
          <option value="home">Home (over the film)</option>
          <option value="article">Reading (no film)</option>
        </select>
      </nav>
    </div>
  );
}
