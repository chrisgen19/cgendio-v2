import Image from 'next/image';
import {cn} from '@/lib/cn';
import type {BuildSideId} from './copy';

export type BuildPhoto = {
  src: string;
  alt: string;
  /** Only R2 uploads go through the image optimizer, like CoverImage. */
  unoptimized: boolean;
};

type BuildPortraitProps = {
  photo: BuildPhoto | null;
  className?: string;
};

const HALVES: Record<BuildSideId, {half: string; screen: string; tint: string}> = {
  wp: {half: 'build-half-wp', screen: 'build-screen-dots', tint: 'bg-side-wp'},
  next: {half: 'build-half-next', screen: 'build-screen-lines', tint: 'bg-side-next'},
};

/**
 * The split portrait: two copies of the same photo, each through its own print screen (globals.css `.build-screen`),
 * clipped to its side of the seam. The browser fetches the photo once for both. Stacked (under lg) it's a square,
 * capped at 440px so a tablet-wide stage doesn't make it a huge one.
 */
export function BuildPortrait({photo, className}: BuildPortraitProps) {
  return (
    <div
      className={cn('relative isolate aspect-[4/5] overflow-hidden bg-ink-stage max-lg:aspect-square max-lg:w-full max-lg:max-w-[440px]', className)}
    >
      {photo ? (
        <>
          <PortraitHalf side="wp" photo={photo} />
          <PortraitHalf side="next" photo={photo} />
          <span aria-hidden="true" className="build-seam absolute" />
        </>
      ) : (
        <span className="absolute inset-0 grid place-items-center rounded-photo border border-dashed border-line font-mono text-[14px] text-accent">
          [YOUR PHOTO]
        </span>
      )}
    </div>
  );
}

function PortraitHalf({side, photo}: {side: BuildSideId; photo: BuildPhoto}) {
  const styles = HALVES[side];
  return (
    <div className={cn('build-half absolute inset-0', styles.half)}>
      <div className={cn('build-screen', styles.screen)}>
        {/* One description is enough: the second half is the same photo */}
        <Image
          src={photo.src}
          alt={side === 'wp' ? photo.alt : ''}
          fill
          sizes="(max-width: 1079px) min(440px, calc(100vw - 56px)), 420px"
          unoptimized={photo.unoptimized}
          className="object-cover"
        />
      </div>
      <span aria-hidden="true" className={cn('absolute inset-0 mix-blend-multiply', styles.tint)} />
    </div>
  );
}
