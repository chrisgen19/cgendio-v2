import {cn} from '@/lib/cn';
import {stackIconPath} from '@/lib/stack-icons';

type StackLogoProps = {
  name: string;
  className?: string;
};

/** A tool's logo in currentColor. Tools without one (Builder.io) get a boxed monogram of the same size. Always decorative: the name sits beside it as text. */
export function StackLogo({name, className}: StackLogoProps) {
  const path = stackIconPath(name);
  if (!path) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-grid shrink-0 place-items-center rounded-[22%] border-[1.5px] border-current font-display leading-none font-extrabold',
          className,
        )}
      >
        <span className="text-[0.62em]">{name.charAt(0)}</span>
      </span>
    );
  }
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className={cn('shrink-0', className)}>
      <path d={path} />
    </svg>
  );
}
