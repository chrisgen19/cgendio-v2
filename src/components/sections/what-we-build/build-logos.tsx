import {siNextdotjs, siWordpress} from 'simple-icons';
import {cn} from '@/lib/cn';
import type {BuildSideId} from './copy';

type BuildLogosProps = {
  className?: string;
};

/** A simple-icons path as a CSS mask image, so the print screen behind it shows only in the logo's shape. */
const logoMask = (path: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${path}'/></svg>`)}")`;

const HALVES: Record<BuildSideId, {half: string; screen: string; mask: string}> = {
  wp: {half: 'build-half-wp', screen: 'build-screen-dots', mask: logoMask(siWordpress.path)},
  next: {half: 'build-half-next', screen: 'build-screen-lines', mask: logoMask(siNextdotjs.path)},
};

/**
 * The split logos: WordPress and Next.js in the same spot, each through its own print screen (globals.css `.build-screen`)
 * and clipped to its side of the seam, so at rest they read as one disc. Decorative: both names are in the labels beside
 * it. Stacked (under lg) it's a square, capped at 440px so a tablet-wide stage doesn't make it a huge one.
 */
export function BuildLogos({className}: BuildLogosProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative aspect-[4/5] overflow-hidden max-lg:aspect-square max-lg:w-full max-lg:max-w-[440px]', className)}
    >
      <LogoHalf side="wp" />
      <LogoHalf side="next" />
      <span className="build-seam absolute" />
    </div>
  );
}

function LogoHalf({side}: {side: BuildSideId}) {
  const styles = HALVES[side];
  return (
    <div className={cn('absolute inset-0 grid place-items-center', styles.half)}>
      <div className={cn('build-screen aspect-square w-3/4', styles.screen)} style={{maskImage: styles.mask}} />
    </div>
  );
}
