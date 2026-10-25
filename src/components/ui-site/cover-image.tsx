import Image from 'next/image';
import {cn} from '@/lib/cn';

type CoverImageProps = {
  src: string;
  className?: string;
  /** The post cover sits in the first viewport on desktop; case-study covers sit lower and load lazily. */
  aboveTheFold?: boolean;
};

/** Only covers on the R2 bucket go through the image optimizer (next.config.ts allows that host, nothing else). */
export const isOptimizableCover = (src: string) => {
  const r2 = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  return Boolean(r2 && src.startsWith(`${r2}/`));
};

/**
 * A 16:9 cover from the admin. Uploads on the R2 bucket go through the image optimizer (next.config.ts allows that
 * host); a cover pasted from any other host is shown as is, since the optimizer only fetches allowed hosts.
 */
export function CoverImage({src, className, aboveTheFold = false}: CoverImageProps) {
  return (
    <Image
      src={src}
      alt=""
      width={1600}
      height={900}
      sizes="(max-width: 860px) calc(100vw - 40px), 1208px"
      unoptimized={!isOptimizableCover(src)}
      fetchPriority={aboveTheFold ? 'high' : undefined}
      loading={aboveTheFold ? 'eager' : 'lazy'}
      className={cn('aspect-[16/9] h-auto w-full rounded-panel border border-line object-cover', className)}
    />
  );
}
