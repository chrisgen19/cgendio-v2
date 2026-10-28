'use client';

import {ArrowLeft, ArrowRight, Grid2X2, RotateCcw} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {directions} from './content';
import styles from './preview-toolbar.module.css';

export function PreviewToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const index = directions.findIndex((direction) => pathname === `/design-lab/fresh-fruit/${direction.slug}`);
  if (index === -1) return null;
  const current = directions[index];
  const previous = directions[(index + directions.length - 1) % directions.length];
  const next = directions[(index + 1) % directions.length];

  return (
    <nav className={styles.toolbar} aria-label="Design preview controls">
      <Link href="/design-lab/fresh-fruit" className={styles.gallery} aria-label="All design directions">
        <Grid2X2 size={15} aria-hidden="true" />
        <span>All directions</span>
      </Link>
      <div className={styles.selectWrap}>
        <span className={styles.count}>{current.number} / 06</span>
        <select
          aria-label="Choose a design direction"
          value={current.slug}
          onChange={(event) => router.push(`/design-lab/fresh-fruit/${event.target.value}`)}
        >
          {directions.map((direction) => (
            <option value={direction.slug} key={direction.slug}>
              {direction.title}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => window.location.reload()} aria-label="Replay entrance animation" className={styles.replay}>
          <RotateCcw size={15} aria-hidden="true" />
          <span>Replay</span>
        </button>
        <Link href={`/design-lab/fresh-fruit/${previous.slug}`} aria-label={`Previous direction: ${previous.title}`}>
          <ArrowLeft size={17} aria-hidden="true" />
        </Link>
        <Link href={`/design-lab/fresh-fruit/${next.slug}`} aria-label={`Next direction: ${next.title}`}>
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
