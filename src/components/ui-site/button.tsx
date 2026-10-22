import type {AnchorHTMLAttributes, ButtonHTMLAttributes} from 'react';
import {cn} from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline';
type Size = 'md' | 'sm';

type BaseProps = {
  variant?: Variant;
  size?: Size;
};

type ButtonProps = BaseProps &
  (({href: string} & AnchorHTMLAttributes<HTMLAnchorElement>) | ({href?: undefined} & ButtonHTMLAttributes<HTMLButtonElement>));

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-pill border font-body leading-none font-semibold no-underline transition-[background-color,color,border-color,transform] duration-200 hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0';

// Each variant sets its own border colour: a shared border-transparent would win over theirs in Tailwind's ordering
const VARIANTS: Record<Variant, string> = {
  primary: 'border-transparent bg-ink text-white hover:bg-accent hover:text-white',
  secondary: 'border-line bg-white text-ink hover:border-ink hover:text-ink',
  // Secondary with an ink border, for coloured panels (the lime contact CTA)
  outline: 'border-ink bg-white text-ink hover:text-ink',
};

const SIZES: Record<Size, string> = {
  md: 'min-h-13 px-6 text-[15px]',
  sm: 'min-h-11 px-[18px] text-sm',
};

/** Pill button from the design. Renders an `<a>` when given `href`, otherwise a `<button type="button">`. */
export function Button({variant = 'primary', size = 'md', className, ...props}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (props.href !== undefined) {
    return <a {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes} />;
  }
  const {type = 'button', ...rest} = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button type={type} {...rest} className={classes} />;
}
